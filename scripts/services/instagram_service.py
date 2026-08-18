#!/usr/bin/env python3
"""
Instagram Service
Maneja todo lo relacionado con Instagram: sesión, descarga de posts, imágenes, etc.

Estrategia de acceso (para minimizar riesgo de bloqueo de cuenta):
- Perfiles públicos: acceso ANÓNIMO por defecto. No se toca ninguna cuenta.
- Login SOLO si es imprescindible (perfil privado o Instagram exige sesión),
  y SIEMPRE reutilizando el session file (load_session_from_file) antes que
  un login fresco con contraseña. El login fresco con contraseña en cada
  corrida es lo que Instagram marca como "comportamiento raro".
- Ritmo conservador: ~1 request/30s anónimo. Desde fines de 2024 Instagram
  bajó el límite anónimo a ~1-2 requests/30s.
"""

import random
import sys
import time
from datetime import datetime
from pathlib import Path

import instaloader

# Agregar el directorio padre al path para importar constants
sys.path.insert(0, str(Path(__file__).parent.parent))
from constants import PINNED_MEDIAIDS


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


class InstagramService:
    """Servicio para interactuar con Instagram"""

    def __init__(self, username, images_dir="public/images",
                 login_username=None, login_password=None, force_login=False):
        """
        Inicializa el servicio de Instagram

        Args:
            username: Usuario de Instagram a consultar (debe ser público para
                funcionar sin login)
            images_dir: Directorio donde guardar las imágenes
            login_username: Opcional. Solo se usa si el perfil es privado o
                Instagram exige sesión. Si se provee, se reutiliza el session
                file antes de hacer login fresco.
            login_password: Opcional. Contraseña para login fresco (solo si no
                hay sesión guardada válida).
            force_login: Si True, saltea el intento anónimo y va directo a la
                sesión guardada del usuario configurado; si no hay sesión
                previa, hace login fresco con las credenciales.
        """
        self.username = username
        self.images_dir = images_dir
        self.login_username = login_username
        self.login_password = login_password
        self.force_login = force_login
        self.logged_in = False
        # Evita reintentar login en bucle dentro de una misma corrida
        self._login_attempted = False
        self.loader = instaloader.Instaloader(
            sleep=True,
            rate_controller=lambda ctx: ConservativeRateController(ctx),
        )

        # Crear directorio de imágenes si no existe
        self.images_path = Path(__file__).parent.parent.parent / self.images_dir
        self.images_path.mkdir(parents=True, exist_ok=True)

    def login(self, username, password):
        """
        Login seguro: reutiliza la sesión guardada si existe; solo hace login
        fresco con contraseña si no hay sesión. Nunca login fresco en cada
        corrida: es el patrón que Instagram marca como comportamiento raro.
        """
        self.login_username = username
        self.login_password = password
        self._login_attempted = True

        # 1) Reutilizar sesión guardada (preferido, no genera alertas)
        try:
            self.loader.load_session_from_file(username)
            self.logged_in = True
            print(f"✅ Sesión reutilizada para @{username}")
            return True
        except FileNotFoundError:
            pass
        except Exception as e:
            print(f"⚠️  Sesión inválida o expirada ({e}), intentando login fresco...")

        # 2) Login fresco (solo si no hay sesión) y guardarla para futuras corridas
        try:
            self.loader.login(username, password)
            self.loader.save_session_to_file()
            self.logged_in = True
            print(f"✅ Login exitoso como @{username} (sesión guardada)")
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
        """
        Obtiene el perfil de Instagram.

        Con force_login=True saltea el intento anónimo y va directo a la
        sesión guardada del usuario configurado (o login fresco si no hay
        sesión previa). Si el perfil es público, lo intenta de forma ANÓNIMA
        y solo hace login si Instagram rechaza el acceso anónimo y hay
        credenciales configuradas.

        Returns:
            Profile o None si no se pudo obtener (el error ya se imprimió)
        """
        if self.force_login:
            if not (self.login_username and self.login_password):
                print("❌ --force-login requiere INSTAGRAM_LOGIN_USERNAME y "
                      "INSTAGRAM_LOGIN_PASSWORD en .env")
                return None
            print("🔐 --force-login: salteando acceso anónimo, usando sesión/login...")
            self.login(self.login_username, self.login_password)
            if not self.logged_in:
                print("❌ No se pudo autenticar: sin sesión previa ni login exitoso")
                return None

        try:
            return instaloader.Profile.from_username(self.loader.context, self.username)
        except instaloader.exceptions.QueryReturnedNotFoundException:
            print(f"❌ El perfil @{self.username} no existe")
            return None
        except Exception as e:
            if not self.logged_in and not self._login_attempted and (
                self.login_username and self.login_password
            ):
                print(f"⚠️  Acceso anónimo rechazado ({e}), reintentando con sesión...")
                self.login(self.login_username, self.login_password)
                if not self.logged_in:
                    print("❌ No se pudo autenticar: sin sesión previa ni login exitoso")
                    return None
                try:
                    return instaloader.Profile.from_username(
                        self.loader.context, self.username
                    )
                except Exception as e2:
                    print(f"❌ No se pudo obtener el perfil @{self.username}: {e2}")
                    return None
            print(f"❌ No se pudo obtener el perfil @{self.username}: {e}")
            return None

    def get_posts(self, max_date=None):
        """
        Obtiene posts de Instagram hasta encontrar uno no pinned más antiguo que max_date

        Args:
            max_date: Fecha máxima (datetime object). Si es None, obtiene todos los posts.

        Returns:
            list: Lista de posts de Instagram
        """
        print(f"📸 Obteniendo posts de @{self.username}...")
        if max_date:
            print(
                f"📅 Buscando posts hasta fecha: {max_date.strftime('%Y-%m-%d %H:%M:%S')}"
            )

        profile = self._fetch_profile()
        if profile is None:
            return []

        if profile.is_private and not self.logged_in:
            if self.login_username and self.login_password and not self._login_attempted:
                print("🔒 Perfil privado, intentando autenticación...")
                self.login(self.login_username, self.login_password)
                profile = instaloader.Profile.from_username(
                    self.loader.context, self.username
                )
            else:
                print(f"🔒 @{self.username} es privado: se necesita login.")
                print("   Configurá INSTAGRAM_LOGIN_USERNAME/INSTAGRAM_LOGIN_PASSWORD en .env")
                return []

        posts = []
        pinned_delta = 5

        try:
            for i, post in enumerate(profile.get_posts()):
                # Incluir fotos, carruseles y reels
                print(
                    f"  🔍 Revisando post {i + 1}: {post.shortcode} ({post.date_local.strftime('%Y-%m-%d')})"
                )

                if post.typename not in ["GraphImage", "GraphSidecar", "GraphVideo"]:
                    print(
                        f"    ⚠️  Tipo de post no soportado: {post.typename}, saltando"
                    )
                    continue

                pinned = post.is_pinned or i < pinned_delta
                # Si encontramos un post más antiguo que nuestra fecha máxima, paramos
                if not pinned and max_date and post.date_local < max_date:
                    print(
                        f"⏹️  Post {post.shortcode} es más antiguo ({post.date_local.strftime('%Y-%m-%d')}), deteniendo búsqueda"
                    )
                    print(
                        "📌 Se encontró un post no pinned más antiguo que la fecha máxima"
                    )
                    break

                new_post = post.mediaid not in PINNED_MEDIAIDS
                if new_post:
                    posts.append(post)

                # Pequeño jitter entre posts: los requests a Instagram son
                # espaciados por el ConservativeRateController
                time.sleep(1 + (random.random() * 2))

        except Exception as e:
            print(f"📦 Deteniendo búsqueda con {len(posts)} posts encontrados")
            print(f"❌ Error obteniendo posts: {e}")
            print("💡 Tip: Si es cuenta privada, configurá login en .env:")
            print("   INSTAGRAM_LOGIN_USERNAME=tu_usuario")
            print("   INSTAGRAM_LOGIN_PASSWORD=tu_password")

        print(f"✅ Encontrados {len(posts)} posts")
        return posts

    def download_image(self, url, shortcode):
        """
        Descarga la imagen y la guarda localmente

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
                return f"images/{filename}"

            print(f"  ⬇️  Descargando imagen {shortcode}...")
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            filepath.write_bytes(response.content)
            print(f"  ✅ Imagen guardada: {filename}")
            return f"images/{filename}"

        except Exception as e:
            print(f"  ⚠️  Error descargando imagen: {e}")
            return url  # Fallback a la URL original
