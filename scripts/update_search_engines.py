"""
Script para actualizar índices de Google y Bing
Ejecutar como: python update_search_engines.py
"""

import httplib2
import json
import requests
from pathlib import Path
from time import sleep
from random import random
from xml.etree import ElementTree
from oauth2client.service_account import ServiceAccountCredentials

from constants import BING_API_KEY, BING_BULK_SIZE, JSON_KEY_FILE, SITE_URL


# ============= CONFIGURACIÓN =============
SCRIPT_DIR = Path(__file__).resolve().parent
SITEMAP_PATH = SCRIPT_DIR.parent / "public" / "sitemap.xml"


# ============= FUNCIONES =============


def extraer_urls_del_sitemap(sitemap_path):
    """
    Extrae todas las URLs del archivo sitemap.xml.

    Args:
        sitemap_path (str | Path): Ruta al archivo sitemap.xml

    Returns:
        list: Lista de URLs extraídas del sitemap
    """
    try:
        tree = ElementTree.parse(sitemap_path)
        root = tree.getroot()

        # Namespace del sitemap
        namespace = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}

        urls = []
        for url_elem in root.findall("ns:url", namespace):
            loc = url_elem.find("ns:loc", namespace)
            if loc is not None and loc.text:
                urls.append(loc.text)

        return urls

    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo {sitemap_path}")
        return []
    except ElementTree.ParseError as e:
        print(f"❌ Error al parsear XML: {str(e)}")
        return []


def step_delay():
    """
    Aplica un delay aleatorio entre requests para evitar rate limiting.
    """
    sleep(int(random() * 5))


def solicitar_indexacion_google(url_list):
    """
    Actualiza el índice de Google para una lista de URLs.

    Args:
        url_list (list): Lista de URLs a indexar
    """
    SCOPE = "https://www.googleapis.com/auth/indexing"
    ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"

    try:
        # Autenticación
        credentials = ServiceAccountCredentials.from_json_keyfile_name(
            JSON_KEY_FILE, SCOPE
        )
        http = credentials.authorize(httplib2.Http())

        print("📍 Enviando URLs a Google...")
        for idx, url in enumerate(url_list, 1):
            payload = json.dumps({"url": url, "type": "URL_UPDATED"})
            headers = {"Content-Type": "application/json"}

            response, _ = http.request(
                ENDPOINT, method="POST", body=payload, headers=headers
            )
            status_symbol = "✅" if response.status == 200 else "❌"
            print(
                f"  {status_symbol} [{idx}/{len(url_list)}] {url} - Status: {response.status}"
            )

            # Si falla una URL, cortar el proceso
            if response.status != 200:
                print("\n⚠️  Deteniendo Google Indexing por error en URL.\n")
                break

            step_delay()

        print("✅ Google Indexing completado\n")

    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo {JSON_KEY_FILE}")
        print("   Por favor, descarga tu JSON key de Google Cloud Console\n")
    except Exception as e:
        print(f"❌ Error al conectar con Google: {str(e)}\n")


def enviar_a_bing(url_list, api_key):
    """
    Envía una lista de URLs al índice de Bing en bulks (máximo {BING_BULK_SIZE} URLs por request).
    Maneja timeout de quota diaria automáticamente.

    Args:
        url_list (list): Lista de URLs a enviar
        api_key (str): API key de Bing Webmaster Tools
    """
    url_api = "https://www.bing.com/webmaster/api.svc/json/SubmitUrlbatch"
    params = {"apikey": api_key}
    urls_enviadas = 0

    try:
        print(f"📍 Enviando URLs a Bing en bulks de {BING_BULK_SIZE}...")

        # Dividir URLs en bulks de BING_BULK_SIZE
        for bulk_idx, i in enumerate(range(0, len(url_list), BING_BULK_SIZE), 1):
            bulk_urls = url_list[i : i + BING_BULK_SIZE]

            payload = {"siteUrl": SITE_URL, "urlList": bulk_urls}
            response = requests.post(
                url_api, params=params, json=payload, timeout=(5, 10)
            )

            if response.status_code == 200:
                urls_enviadas += len(bulk_urls)
                print(
                    f"  ✅ Bulk {bulk_idx} [{urls_enviadas}/{len(url_list)}] - {len(bulk_urls)} URLs enviadas"
                )
                step_delay()

            else:
                # Intentar parsear error de quota
                try:
                    error_data = response.json()
                    if error_data.get("ErrorCode") == 2:  # Quota error
                        error_msg = error_data.get("Message", "")
                        # Parsear "Quota remaining for today: XX, Submitted: YY"
                        if "Quota remaining for today:" in error_msg:
                            parts = error_msg.split("Quota remaining for today:")
                            if len(parts) > 1:
                                quota_str = parts[1].split(",")[0].strip()
                                try:
                                    quota_restante = int(quota_str)
                                    print(f"\n⚠️  Error de Quota Bing: {error_msg}")
                                    print(
                                        f"📊 Se enviaron {urls_enviadas} URLs antes de alcanzar límite diario, restantes {quota_restante}\n"
                                    )
                                    break
                                except ValueError:
                                    pass
                except Exception:
                    pass

                print(
                    f"  ❌ Error Bulk {bulk_idx}: {response.status_code} - {response.text}"
                )

        print(f"✅ Bing Indexing completado ({urls_enviadas}/{len(url_list)} URLs)\n")

    except requests.exceptions.RequestException as e:
        print(f"❌ Error al conectar con Bing: {str(e)}\n")


def submit_urls_to_indexnow(urls: list[str], api_key: str) -> dict:
    """
    Envía una lista de URLs a IndexNow (distribuye a Bing, Yandex y otros).
    
    Args:
        urls: Lista de URLs a indexar
        api_key: Tu key de Bing Webmaster (es la misma para IndexNow)
    
    Returns:
        dict con status_code y respuesta
    """
    endpoint = "https://api.indexnow.org/indexnow"
    payload = {
        "host": 'alhornoconpapa.com.ar',
        "key": api_key,
        "urlList": urls
    }
    
    response = requests.post(
        endpoint,
        headers={"Content-Type": "application/json; charset=utf-8"},
        data=json.dumps(payload)
    )

    message = {
            200: "✅ URLs enviadas correctamente",
            202: "✅ URLs aceptadas (procesando)",
            400: "❌ Request inválido — revisá el formato de las URLs",
            403: "❌ Key inválida o keyLocation no accesible",
            422: "❌ URLs no pertenecen al host indicado",
            429: "⚠️ Demasiadas requests — esperá antes de reintentar",
        }.get(response.status_code, f"⚠️ Respuesta inesperada: {response.text}")

    print(f"📍 Enviando URLs a IndexNow... Status: {response.status_code} - {message}\n")
    return {
        "status_code": response.status_code,
        "message": message
    }


def main():
    """
    Función principal que ejecuta la actualización de ambos buscadores.
    """
    print("\n" + "=" * 50)
    print("🔄 ACTUALIZADOR DE ÍNDICES - Google & Bing")
    print("=" * 50 + "\n")

    # Extraer URLs del sitemap
    urls = extraer_urls_del_sitemap(SITEMAP_PATH)

    if not urls:
        print("❌ No se pudieron extraer URLs del sitemap. Abortando...")
        return

    print(f"📊 Se encontraron {len(urls)} URLs en el sitemap\n")

    # Ejecutar actualizaciones
    solicitar_indexacion_google(urls)
    enviar_a_bing(urls, BING_API_KEY)
    submit_urls_to_indexnow(urls, BING_API_KEY)

    print("=" * 50)
    print("✅ Proceso completado")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    main()
