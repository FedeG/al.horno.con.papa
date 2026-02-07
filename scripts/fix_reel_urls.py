#!/usr/bin/env python3
"""
Fix Reel URLs - Actualiza las URLs de Instagram de /p/ a /reel/ cuando corresponde
"""

import json
import time
import random
import instaloader
from pathlib import Path
from constants import LOGIN_USERNAME, LOGIN_PASSWORD, RECIPES_FILE


def fix_reel_urls():
    """
    Lee recipes.json, se loguea en Instagram y actualiza las URLs de /p/ a /reel/
    cuando el post es un video (reel)
    """

    # Cargar recipes.json
    recipes_path = Path(__file__).parent.parent / RECIPES_FILE
    print(f"📖 Leyendo recetas de {recipes_path}")

    try:
        with open(recipes_path, "r", encoding="utf-8") as f:
            recipes = json.load(f)
    except Exception as e:
        print(f"❌ Error leyendo recipes.json: {e}")
        return

    if not recipes:
        print("⚠️  No hay recetas para procesar")
        return

    print(f"✅ Encontradas {len(recipes)} recetas")

    # Inicializar Instaloader y hacer login
    loader = instaloader.Instaloader()

    print(f"🔐 Intentando login como @{LOGIN_USERNAME}...")
    try:
        loader.login(LOGIN_USERNAME, LOGIN_PASSWORD)
        print("✅ Login exitoso")
    except instaloader.exceptions.TwoFactorAuthRequiredException:
        two_factor_code = input("Ingresa el código de verificación de dos factores: ")
        try:
            loader.two_factor_login(two_factor_code)
            print("✅ Login exitoso con 2FA")
        except Exception as e:
            print(f"❌ Error con 2FA: {e}")
            return
    except Exception as e:
        print(f"❌ Error de login: {e}")
        return

    # Procesar cada receta
    updated_count = 0

    for i, recipe in enumerate(recipes):
        instagram_url = recipe.get("instagramUrl", "")

        if not instagram_url:
            continue

        # Extraer el shortcode de la URL
        if "/p/" in instagram_url:
            shortcode = instagram_url.split("/p/")[1].rstrip("/")
        elif "/reel/" in instagram_url:
            print(
                f"  ⏭️  [{i + 1}/{len(recipes)}] {recipe['name']}: Ya es reel, omitiendo"
            )
            continue
        else:
            print(f"  ⚠️  [{i + 1}/{len(recipes)}] {recipe['name']}: URL no reconocida")
            continue

        print(
            f"  🔍 [{i + 1}/{len(recipes)}] Verificando {recipe['name']} ({shortcode})..."
        )

        try:
            # Obtener el post de Instagram
            post = instaloader.Post.from_shortcode(loader.context, shortcode)

            # Verificar si es video (reel)
            if post.is_video:
                # Actualizar la URL de /p/ a /reel/
                new_url = instagram_url.replace("/p/", "/reel/")
                recipe["instagramUrl"] = new_url
                updated_count += 1
                print(f"  ✅ Actualizado a /reel/: {new_url}")
            else:
                print("  ℹ️  Es un post de imagen, no se modifica")

            # Pausa para evitar rate limiting
            time.sleep(1 + (random.random() * 1))

        except Exception as e:
            print(f"  ❌ Error procesando {shortcode}: {e}")
            continue

    # Guardar el archivo actualizado
    if updated_count > 0:
        print(f"\n💾 Guardando cambios ({updated_count} recetas actualizadas)...")
        try:
            with open(recipes_path, "w", encoding="utf-8") as f:
                json.dump(recipes, f, ensure_ascii=False, indent=2)
            print("✅ Archivo guardado exitosamente")
        except Exception as e:
            print(f"❌ Error guardando archivo: {e}")
    else:
        print("\n✨ No se encontraron URLs para actualizar")


if __name__ == "__main__":
    print("🚀 Iniciando corrección de URLs de reels...\n")
    fix_reel_urls()
    print("\n✅ Proceso completado")
