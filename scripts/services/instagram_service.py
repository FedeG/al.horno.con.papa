#!/usr/bin/env python3
"""
Instagram Service
Maneja todo lo relacionado con Instagram: login, descarga de posts, imágenes, etc.
"""

import random
import time
import instaloader
import requests
from pathlib import Path
import sys

# Agregar el directorio padre al path para importar constants
sys.path.insert(0, str(Path(__file__).parent.parent))
from constants import PINNED_MEDIAIDS


class InstagramService:
    """Servicio para interactuar con Instagram"""

    def __init__(self, username, images_dir="public/images"):
        """
        Inicializa el servicio de Instagram

        Args:
            username: Usuario de Instagram a consultar
            images_dir: Directorio donde guardar las imágenes
        """
        self.username = username
        self.images_dir = images_dir
        self.loader = instaloader.Instaloader()
        self.logged_in = False

        # Crear directorio de imágenes si no existe
        self.images_path = Path(__file__).parent.parent.parent / self.images_dir
        self.images_path.mkdir(parents=True, exist_ok=True)

    def login(self, username, password):
        """
        Inicia sesión en Instagram

        Args:
            username: Usuario para login
            password: Contraseña

        Returns:
            bool: True si el login fue exitoso
        """
        try:
            self.loader.login(username, password)
            self.logged_in = True
            print(f"✅ Login exitoso como @{username}")
            return True
        except instaloader.exceptions.TwoFactorAuthRequiredException:
            # Si requiere 2FA, solicitar el código
            two_factor_code = input(
                "Ingresa el código de verificación de dos factores: "
            )
            try:
                self.loader.two_factor_login(two_factor_code)
                self.logged_in = True
                print(f"✅ Login exitoso con 2FA como @{username}")
                return True
            except Exception as e:
                print(f"❌ Error con 2FA: {e}")
                return False
        except Exception as e:
            print(f"❌ Error de login: {e}")
            print("⚠️  Continuando sin autenticación (datos limitados)")
            return False

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

        profile = instaloader.Profile.from_username(self.loader.context, self.username)
        posts = []
        pinned_delta = 5

        try:
            for i, post in enumerate(profile.get_posts()):
                # Incluir fotos, carruseles y reels
                print(
                    f"  🔍 Revisando post {i + 1}: {post.shortcode} ({post.date_local.strftime('%Y-%m-%d')})"
                )

                if post.typename not in ["GraphImage", "GraphSidecar", "GraphVideo"]:
                    print(f"    ⚠️  Tipo de post no soportado: {post.typename}, saltando")
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

                # Pausa de medio segundo a un segundo para evitar rate limiting
                time.sleep(0.5 + (random.random() * 0.5))

        except Exception as e:
            print(f"📦 Deteniendo búsqueda con {len(posts)} posts encontrados")
            print(f"❌ Error obteniendo posts: {e}")
            print("💡 Tip: Si es cuenta privada, necesitas login:")
            print("   service.login('tu_usuario', 'tu_password')")

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
