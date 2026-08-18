"""
Adapters de Instagram (strategy pattern).

Cada adapter trae datos de una fuente distinta (instaloader, apify, ...)
pero expone la misma interfaz definida por AdapterBase.
"""

from .apify import ApifyAdapter
from .base import AdapterBase, AdapterConfig
from .dto import InstagramPost
from .instaloader import InstaloaderAdapter

__all__ = [
    "AdapterBase",
    "AdapterConfig",
    "InstagramPost",
    "InstaloaderAdapter",
    "ApifyAdapter",
]