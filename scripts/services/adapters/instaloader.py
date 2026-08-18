"""
Adapter de instaloader para Instagram.

Encapsula toda la lógica específica de instaloader (sesión, login, profile)
y normaliza sus Post a InstagramPost. Es la fuente default de InstagramService.
"""

import instaloader

from .base import AdapterBase, AdapterConfig
from .dto import InstagramPost


class ConservativeRateController(instaloader.RateController):
    """Rate controller acorde a los límites actuales de Instagram (2024+).

    Anónimo: ~1 request cada 30s. Con sesión el techo es más alto pero se
    mantiene prudente para no llamar la atención.
    """

    # Requests permitidos por ventana deslizante de 11 minutos.
    def count_per_sliding_window(self, query_type: str) -> int:
        if self._context.is_logged_in:
            return 100
        return 22  # ~1 request cada 30s

    def query_waittime(self, query_type, current_time, untracked_queries=False):
        wait = super().query_waittime(query_type, current_time, untracked_queries)
        min_wait = 5.0 if self._context.is_logged_in else 30.0
        return max(wait, min_wait)


class InstaloaderAdapter(AdapterBase):
    """Adapter que trae posts de Instagram usando instaloader."""

    def __init__(self, config: AdapterConfig):
        super().__init__(config)
        self.loader = instaloader.Instaloader(
            sleep=True,
            rate_controller=lambda ctx: ConservativeRateController(ctx),
        )
        # Evita reintentar login en bucle dentro de una misma corrida
        self._login_attempted = False

    def login(self) -> bool:
        """Login seguro: reutiliza la sesión guardada si existe; solo hace
        login fresco con contraseña si no hay sesión. Nunca login fresco en
        cada corrida: es el patrón que Instagram marca como comportamiento
        raro.

        Returns:
            True si quedó autenticado, False si no.
        """
        self._login_attempted = True

        # 1) Reutilizar sesión guardada (preferido, no genera alertas)
        try:
            self.loader.load_session_from_file(self.config.login_username)
            self.logged_in = True
            print(f"✅ Sesión reutilizada para @{self.config.login_username}")
            return True
        except FileNotFoundError:
            pass
        except Exception as e:
            print(f"⚠️  Sesión inválida o expirada ({e}), intentando login fresco...")

        # 2) Login fresco (solo si no hay sesión) y guardarla para futuras corridas
        try:
            self.loader.login(self.config.login_username, self.config.login_password)
            self.loader.save_session_to_file()
            self.logged_in = True
            print(
                f"✅ Login exitoso como @{self.config.login_username} (sesión guardada)"
            )
            return True
        except instaloader.exceptions.TwoFactorAuthRequiredException:
            print("❌ La cuenta exige 2FA. No se puede completar en forma headless.")
            print("   Ejecutá una vez en forma interactiva y guardá la sesión:")
            print("   python -c \"import instaloader; L=instaloader.Instaloader();"
                  " L.interactive_login('TU_USUARIO'); L.save_session_to_file()\"")
            return False
        except Exception as e:
            print(f"❌ Error de login: {e}")
            print("⚠️  Continuando sin autenticación (datos limitados)")
            return False

    def _fetch_profile(self):
        """Obtiene el perfil de Instagram.

        Con force_login=True saltea el intento anónimo y va directo a la
        sesión guardada del usuario configurado (o login fresco si no hay
        sesión previa). Si el perfil es público, lo intenta de forma ANÓNIMA
        y solo hace login si Instagram rechaza el acceso anónimo y hay
        credenciales configuradas.

        Returns:
            Profile o None si no se pudo obtener (el error ya se imprimió)
        """
        config = self.config
        if config.force_login:
            if not (config.login_username and config.login_password):
                print("❌ --force-login requiere INSTAGRAM_LOGIN_USERNAME y "
                      "INSTAGRAM_LOGIN_PASSWORD en .env")
                return None
            print("🔐 --force-login: salteando acceso anónimo, usando sesión/login...")
            self.login()
            if not self.logged_in:
                print("❌ No se pudo autenticar: sin sesión previa ni login exitoso")
                return None

        try:
            return instaloader.Profile.from_username(self.loader.context, config.username)
        except instaloader.exceptions.QueryReturnedNotFoundException:
            print(f"❌ El perfil @{config.username} no existe")
            return None
        except Exception as e:
            if not self.logged_in and not self._login_attempted and (
                config.login_username and config.login_password
            ):
                print(f"⚠️  Acceso anónimo rechazado ({e}), reintentando con sesión...")
                self.login()
                if not self.logged_in:
                    print("❌ No se pudo autenticar: sin sesión previa ni login exitoso")
                    return None
                try:
                    return instaloader.Profile.from_username(
                        self.loader.context, config.username
                    )
                except Exception as e2:
                    print(f"❌ No se pudo obtener el perfil @{config.username}: {e2}")
                    return None
            print(f"❌ No se pudo obtener el perfil @{config.username}: {e}")
            return None

    def _iter_raw_posts(self):
        """Obtiene el iterator crudo de posts de instaloader."""
        profile = self._fetch_profile()
        if profile is None:
            return iter([])

        if profile.is_private and not self.logged_in:
            if (
                self.config.login_username
                and self.config.login_password
                and not self._login_attempted
            ):
                print("🔒 Perfil privado, intentando autenticación...")
                self.login()
                profile = instaloader.Profile.from_username(
                    self.loader.context, self.config.username
                )
            else:
                print(f"🔒 @{self.config.username} es privado: se necesita login.")
                print("   Configurá INSTAGRAM_LOGIN_USERNAME/INSTAGRAM_LOGIN_PASSWORD en .env")
                return iter([])

        return profile.get_posts()

    def _to_post(self, raw_post) -> InstagramPost:
        """Convierte un instaloader.Post a InstagramPost normalizado."""
        return InstagramPost(
            mediaid=raw_post.mediaid,
            shortcode=raw_post.shortcode,
            url=raw_post.url,
            date_local=raw_post.date_local,
            caption=raw_post.caption,
            caption_hashtags=raw_post.caption_hashtags,
            is_video=raw_post.is_video,
            is_pinned=raw_post.is_pinned,
            typename=raw_post.typename,
        )