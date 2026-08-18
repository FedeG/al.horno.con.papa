"""
Adapter de Apify para Instagram.

Usa el actor apify/instagram-scraper para traer posts y los normaliza a
InstagramPost. Es una alternativa a instaloader (evita los bloqueos 429 de
Instagram) y cumple el mismo contrato de AdapterBase, de forma que
InstagramService no cambia según la fuente usada.
"""

from datetime import datetime

import constants
from apify_client import ApifyClient

from .base import AdapterBase, AdapterConfig
from .dto import InstagramPost


class ApifyAdapter(AdapterBase):
    """Adapter que trae posts de Instagram usando el actor de Apify."""

    # Actor de Apify usado y límite de posts por corrida (desde .env)
    ACTOR_ID = "apify/instagram-scraper"
    RESULTS_LIMIT = constants.APIFY_RESULTS_LIMIT

    # Mapeo del campo "type" de Apify a la taxonomía común de Instagram
    _TYPE_MAP = {
        "Image": "GraphImage",
        "Video": "GraphVideo",
        "Sidecar": "GraphSidecar",
        "Carousel": "GraphSidecar",
    }

    def __init__(self, config: AdapterConfig):
        super().__init__(config)
        self._token = constants.APIFY_TOKEN
        self.client = ApifyClient(self._token)

    def login(self) -> bool:
        """Apify no tiene login interactivo: la autenticación es el token.

        Returns:
            True si hay token configurado, False si no.
        """
        self.logged_in = bool(self._token)
        if self.logged_in:
            print("🔑 Autenticado con token de Apify")
        else:
            print("❌ APIFY_TOKEN no configurado en .env")
        return self.logged_in

    def _iter_raw_posts(self):
        """Ejecuta el actor de Apify y devuelve el iterator crudo del dataset.

        El delay entre posts lo maneja el jitter del template method
        (AdapterBase.get_posts), igual que con instaloader.
        """
        if not self._token:
            raise RuntimeError("APIFY_TOKEN no configurado en .env")

        run_input = {
            "directUrls": [f"https://www.instagram.com/{self.config.username}/"],
            "resultsType": "posts",
            "resultsLimit": self.RESULTS_LIMIT,
            "searchType": "user",
        }
        print(
            f"🚀 Ejecutando scraper de Apify para @{self.config.username} "
            f"(límite: {self.RESULTS_LIMIT} posts)..."
        )

        # logger=None desactiva la propagación de logs del run (evita ruido en stdout)
        run = self.client.actor(self.ACTOR_ID).call(run_input=run_input, logger=None)
        if run is None or run.status != "SUCCEEDED":
            raise RuntimeError(f"El actor de Apify falló: {run}")

        dataset_items = self.client.dataset(run.default_dataset_id).iterate_items()
        # El actor NO devuelve los posts ordenados por fecha. El template method
        # corta en el primer post no pinned más antiguo que max_date, así que
        # ordenamos de más nuevo a más viejo (timestamps ISO 8601 ordenan
        # lexicográficamente = cronológicamente).
        return iter(
            sorted(
                dataset_items,
                key=lambda item: item.get("timestamp", ""),
                reverse=True,
            )
        )

    def _to_post(self, raw_item) -> InstagramPost:
        """Convierte un item crudo del dataset de Apify a InstagramPost.

        Valida los campos requeridos: si alguno viene vacío o con un tipo no
        soportado, corta la búsqueda (el template method detiene la iteración).
        """
        required = {
            "id": "mediaid",
            "shortCode": "shortcode",
            "displayUrl": "url",
            "timestamp": "date_local",
        }
        missing = [
            label for field, label in required.items() if not raw_item.get(field)
        ]
        if missing:
            raise ValueError(
                f"Post de Apify sin datos completos, faltan: {', '.join(missing)}"
            )

        post_type = raw_item.get("type")
        typename = self._TYPE_MAP.get(post_type)
        if typename is None:
            raise ValueError(f"Tipo de post de Apify no soportado: {post_type!r}")

        return InstagramPost(
            mediaid=int(raw_item["id"]),
            shortcode=raw_item["shortCode"],
            url=raw_item["displayUrl"],
            date_local=datetime.fromisoformat(
                raw_item["timestamp"].replace("Z", "+00:00")
            ).astimezone(),
            caption=raw_item.get("caption"),
            caption_hashtags=list(raw_item.get("hashtags") or []),
            is_video=post_type == "Video",
            is_pinned=bool(raw_item.get("isPinned", False)),
            typename=typename,
        )