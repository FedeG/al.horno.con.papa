"""
Basic Recipe Processor

This script enriches individual recipes with AI-generated data.
"""

import ollama
import json


def procesar_recetas(archivo_entrada, archivo_salida, modelo="llama3.2"):
    """
    Process recipes using local AI to standardize and enrich data.

    Args:
        archivo_entrada: Path to JSON recipes file
        archivo_salida: Path where to save result
        modelo: Ollama model to use (default: llama3.2)
    """
    with open(archivo_entrada, "r", encoding="utf-8") as f:
        datos = json.load(f)

    # Si es un solo objeto lo metemos en lista, si es lista seguimos
    recetas = datos if isinstance(datos, list) else [datos]
    resultados = []

    prompt_template = """
    Actúa como un experto en gastronomía y nutrición. 
    Analiza la siguiente receta y devuelve un objeto JSON estrictamente con esta estructura:
    {
      "ingredientes_estandarizados": ["cantidad unidad ingrediente"],
      "tags_salud": ["vegano", "sin gluten", "bajo en calorías", etc],
      "dificultad": "Fácil/Media/Difícil",
      "tiempo_preparacion": "minutos aproximados",
      "sugerencia_maridaje": "bebida sugerida",
      "categoria_cocina": "tipo de cocina (italiana, mexicana, etc)"
    }

    Receta:
    Nombre: {name}
    Ingredientes: {ingredients}
    Instrucciones: {instructions}
    """

    total = len(recetas)
    for idx, r in enumerate(recetas, 1):
        print(f"[{idx}/{total}] Procesando: {r.get('name')}")

        response = ollama.generate(
            model=modelo,
            prompt=prompt_template.format(
                name=r.get("name", ""),
                ingredients=r.get("ingredients", ""),
                instructions=r.get("instructions", ""),
            ),
            options={
                "temperature": 0.3,  # Más preciso, menos creativo
                "num_predict": 500,  # Límite de tokens en la respuesta
            },
        )

        try:
            # Limpiamos la respuesta por si la IA agrega texto extra
            clean_res = response["response"].strip()
            # Extraemos solo el JSON
            start = clean_res.find("{")
            end = clean_res.rfind("}") + 1

            if start != -1 and end > start:
                data_extraida = json.loads(clean_res[start:end])
                r.update(data_extraida)
                print("  ✓ Procesada exitosamente")
            else:
                print("  ✗ No se encontró JSON válido en la respuesta")

        except json.JSONDecodeError as e:
            print(f"  ✗ Error al parsear JSON: {e}")
        except Exception as e:
            print(f"  ✗ Error inesperado: {e}")

        resultados.append(r)

    # Guardamos con encoding UTF-8 para caracteres especiales
    with open(archivo_salida, "w", encoding="utf-8") as f:
        json.dump(resultados, f, indent=2, ensure_ascii=False)

    print(
        f"\n✓ Proceso completado. {len(resultados)} recetas guardadas en {archivo_salida}"
    )


# Ejecución
if __name__ == "__main__":
    procesar_recetas(
        "src/data/recipes.json", "src/data/recipes_enriquecidas.json", modelo="llama3.2"
    )
