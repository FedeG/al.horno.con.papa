"""
DTOs normalizados para los adapters de Instagram.

Definen la estructura de respuesta y los parámetros de entrada con los que
trabajan todos los adapters. El código que consume InstagramService solo
conoce estos DTOs: los atributos replican la interfaz de instaloader.Post
para que main.py y ParserService sigan funcionando sin cambios.
"""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class InstagramPost:
    """Post de Instagram normalizado, independiente de la fuente.

    Cualquier adapter (instaloader, apify, ...) debe convertir sus datos
    crudos a esta estructura antes de devolverlos.
    """

    mediaid: int
    shortcode: str
    url: str  # display URL de la imagen
    date_local: datetime  # datetime con timezone local
    caption: str | None = None
    caption_hashtags: list[str] = field(default_factory=list)
    is_video: bool = False
    is_pinned: bool = False
    typename: str = "GraphImage"