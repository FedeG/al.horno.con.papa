"""
Base de los adapters de Instagram.

AdapterBase define el contrato (strategy pattern): cada adapter trae datos
de una fuente distinta (instaloader, apify, ...) pero expone la misma
interfaz, de forma que InstagramService es transparente a la fuente usada.

get_posts es un template method: el filtrado común (tipos soportados,
posts pinned, PINNED_MEDIAIDS, max_date) vive acá y lo único que cambia
por adapter es cómo se obtiene el iterator crudo (_iter_raw_posts) y cómo
se normaliza cada post (_to_post).
"""

import random
import sys
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterator

import requests

# Agregar el directorio scripts al path para importar constants
sys.path.insert(0, str(Path(__file__).parent.parent))
import constants
from constants import IMAGES_DIR, PINNED_MEDIAIDS

from .dto import InstagramPost


@dataclass
class AdapterConfig:
    """Parámetros de entrada comunes a cualquier adapter de Instagram.

    username: Cuenta a consultar.
    login_username/login_password: Credenciales opcionales para cuentas
        privadas o cuando la fuente exige sesión.
    force_login: Si True, saltea el intento anónimo.
    """

    username: str
    login_username: str | None = None
    login_password: str | None = None
    force_login: bool = False


class AdapterBase(ABC):
    """Contrato abstracto que debe cumplir todo adapter de Instagram.

    Todos los adapters producen el mismo resultado final: posts normalizados
    (InstagramPost) e imágenes guardadas en <raíz>/<IMAGES_DIR>.
    """

    # Tipos de post soportados (taxonomía común para todos los adapters)
    SUPPORTED_TYPES = ("GraphImage", "GraphSidecar", "GraphVideo")
    # Heurística: los primeros N posts se tratan como pinned
    PINNED_DELTA = 5

    def __init__(self, config: AdapterConfig):
        self.config = config
        self.logged_in = False
        # Directorio de imágenes: común para todos los adapters
        repo_root = Path(constants.__file__).resolve().parent.parent
        self.images_path = repo_root / IMAGES_DIR
        self.images_path.mkdir(parents=True, exist_ok=True)

    @abstractmethod
    def login(self) -> bool:
        """Autentica contra la fuente (sesión guardada o credenciales).

        Returns:
            True si quedó autenticado, False si no (se continúa anónimo).
        """

    @abstractmethod
    def _iter_raw_posts(self) -> Iterator:
        """Obtiene el iterator crudo de posts. Lo único que cambia por adapter."""

    @abstractmethod
    def _to_post(self, raw_post) -> InstagramPost:
        """Convierte un post crudo de la fuente a un InstagramPost normalizado."""

    def get_posts(self, max_date: datetime | None = None) -> Iterator[InstagramPost]:
        """Template method: itera posts con el filtrado común a todos los adapters.

        Args:
            max_date: Si se setea, corta en el primer post no pinned más
                antiguo que esa fecha.

        Returns:
            Iterator de InstagramPost (excluye PINNED_MEDIAIDS).
        """
        print(f"📸 Obteniendo posts de @{self.config.username}...")
        if max_date:
            print(
                f"📅 Buscando posts hasta fecha: {max_date.strftime('%Y-%m-%d %H:%M:%S')}"
            )

        count = 0
        try:
            for i, raw_post in enumerate(self._iter_raw_posts()):
                post = self._to_post(raw_post)
                # Incluir fotos, carruseles y reels
                print(
                    f"  🔍 Revisando post {i + 1}: {post.shortcode} "
                    f"({post.date_local.strftime('%Y-%m-%d')})"
                )

                if post.typename not in self.SUPPORTED_TYPES:
                    print(
                        f"    ⚠️  Tipo de post no soportado: {post.typename}, saltando"
                    )
                    continue

                pinned = post.is_pinned or i < self.PINNED_DELTA
                # Si encontramos un post más antiguo que nuestra fecha máxima, paramos
                if not pinned and max_date and post.date_local < max_date:
                    print(
                        f"⏹️  Post {post.shortcode} es más antiguo "
                        f"({post.date_local.strftime('%Y-%m-%d')}), deteniendo búsqueda"
                    )
                    print(
                        "📌 Se encontró un post no pinned más antiguo que la fecha máxima"
                    )
                    break

                if post.mediaid not in PINNED_MEDIAIDS:
                    count += 1
                    yield post

                # Pequeño jitter entre posts: los requests a Instagram son
                # espaciados para no llamar la atención
                time.sleep(1 + (random.random() * 2))

        except Exception as e:
            print(f"📦 Deteniendo búsqueda con {count} posts encontrados")
            print(f"❌ Error obteniendo posts: {e}")
            print("💡 Tip: Si es cuenta privada, configurá login en .env:")
            print("   INSTAGRAM_LOGIN_USERNAME=tu_usuario")
            print("   INSTAGRAM_LOGIN_PASSWORD=tu_password")

        print(f"✅ Encontrados {count} posts")

    def download_image(self, url: str, shortcode: str) -> str:
        """Descarga la imagen y la guarda localmente.

        Método genérico para todos los adapters (HTTP puro). Un adapter puede
        sobreescribirlo solo si su fuente lo requiere.

        Args:
            url: URL de la imagen
            shortcode: Shortcode del post de Instagram

        Returns:
            str: Path relativo de la imagen guardada o URL original si falla
        """
        try:
            filename = f"{shortcode}.jpg"
            filepath = self.images_path / filename

            # Si ya existe, no descargar de nuevo
            if filepath.exists():
                return f"{Path(IMAGES_DIR).name}/{filename}"

            print(f"  ⬇️  Descargando imagen {shortcode}...")
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            filepath.write_bytes(response.content)
            print(f"  ✅ Imagen guardada: {filename}")
            return f"{Path(IMAGES_DIR).name}/{filename}"

        except Exception as e:
            print(f"  ⚠️  Error descargando imagen: {e}")
            return url  # Fallback a la URL original