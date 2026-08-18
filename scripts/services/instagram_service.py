#!/usr/bin/env python3
"""
Instagram Service
Maneja todo lo relacionado con Instagram: sesión, descarga de posts, imágenes, etc.

Fachada sobre un adapter (strategy pattern): el adapter se inyecta por
constructor y toda la lógica de la fuente (instaloader, apify, ...) vive en
services/adapters/. El servicio es transparente a la fuente usada.

Estrategia de acceso (para minimizar riesgo de bloqueo de cuenta):
- Perfiles públicos: acceso ANÓNIMO por defecto. No se toca ninguna cuenta.
- Login SOLO si es imprescindible (perfil privado o Instagram exige sesión),
  y SIEMPRE reutilizando el session file (load_session_from_file) antes que
  un login fresco con contraseña. El login fresco con contraseña en cada
  corrida es lo que Instagram marca como "comportamiento raro".
- Ritmo conservador: ~1 request/30s anónimo. Desde fines de 2024 Instagram
  bajó el límite anónimo a ~1-2 requests/30s.
"""

import sys
from pathlib import Path

# Agregar el directorio scripts al path para importar constants
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import constants

from .adapters.apify import ApifyAdapter
from .adapters.base import AdapterConfig
from .adapters.instaloader import (
    ConservativeRateController,  # re-export para compatibilidad (fix_reel_urls.py)
    InstaloaderAdapter,
)

# Mapeo nombre de adapter (desde INSTAGRAM_ADAPTER en .env) → clase concreta
_ADAPTERS = {
    "instaloader": InstaloaderAdapter,
    "apify": ApifyAdapter,
}


def _resolve_adapter_cls(adapter_cls=None):
    """Devuelve la clase adapter a usar.

    Si se pasa adapter_cls explícito, se usa ese. Si no, se resuelve desde
    INSTAGRAM_ADAPTER del .env ("instaloader" o "apify").
    """
    if adapter_cls is not None:
        return adapter_cls
    name = constants.INSTAGRAM_ADAPTER.strip().lower()
    if name not in _ADAPTERS:
        raise ValueError(
            f"INSTAGRAM_ADAPTER desconocido: {name!r}. "
            f"Valores válidos: {', '.join(_ADAPTERS)}"
        )
    return _ADAPTERS[name]


class InstagramService:
    """Servicio para interactuar con Instagram (fachada sobre un adapter)."""

    def __init__(self, username, adapter_cls=None,
                 login_username=None, login_password=None, force_login=False):
        """
        Inicializa el servicio de Instagram

        Args:
            username: Usuario de Instagram a consultar (debe ser público para
                funcionar sin login)
            adapter_cls: Clase adapter a usar (strategy). Si es None (default),
                se resuelve desde INSTAGRAM_ADAPTER del .env: "instaloader"
                o "apify".
            login_username: Opcional. Solo se usa si el perfil es privado o
                Instagram exige sesión. Si se provee, se reutiliza el session
                file antes de hacer login fresco.
            login_password: Opcional. Contraseña para login fresco (solo si no
                hay sesión guardada válida).
            force_login: Si True, saltea el intento anónimo y va directo a la
                sesión guardada del usuario configurado; si no hay sesión
                previa, hace login fresco con las credenciales.
        """
        config = AdapterConfig(
            username=username,
            login_username=login_username,
            login_password=login_password,
            force_login=force_login,
        )
        self.adapter = _resolve_adapter_cls(adapter_cls)(config)

    def login(self, username, password):
        """
        Login seguro: reutiliza la sesión guardada si existe; solo hace login
        fresco con contraseña si no hay sesión.

        Args:
            username: Usuario de Instagram
            password: Contraseña

        Returns:
            bool: True si el login fue exitoso
        """
        self.adapter.config.login_username = username
        self.adapter.config.login_password = password
        return self.adapter.login()

    def get_posts(self, max_date=None):
        """
        Obtiene posts de Instagram hasta encontrar uno no pinned más antiguo que max_date

        Args:
            max_date: Fecha máxima (datetime object). Si es None, obtiene todos los posts.

        Returns:
            list: Lista de InstagramPost normalizados
        """
        return list(self.adapter.get_posts(max_date))

    def download_image(self, url, shortcode):
        """
        Descarga la imagen y la guarda localmente

        Args:
            url: URL de la imagen
            shortcode: Shortcode del post de Instagram

        Returns:
            str: Path relativo de la imagen guardada o URL original si falla
        """
        return self.adapter.download_image(url, shortcode)