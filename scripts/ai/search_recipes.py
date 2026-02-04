"""
Recipe Search with AI

Allows searches in natural language using local AI models.
Examples: "Cena rápida sin gluten", "Postre vegano fácil"
"""

import ollama
import json


def buscar_recetas(consulta, archivo_recetas="src/data/recipes_enriquecidas.json"):
    """
    Search recipes using natural language.
    Example: "Cena rápida sin gluten" or "Postre vegano fácil"
    
    Args:
        consulta: Search query in natural language
        archivo_recetas: Path to enriched recipes JSON file
        
    Returns:
        List of matching recipes
    """
    with open(archivo_recetas, "r", encoding="utf-8") as f:
        recetas = json.load(f)

    # Crear un resumen de todas las recetas
    resumen_recetas = []
    for idx, r in enumerate(recetas):
        resumen_recetas.append(
            {
                "id": idx,
                "nombre": r.get("name"),
                "tags": r.get("tags_salud", []),
                "dificultad": r.get("dificultad"),
                "tiempo": r.get("tiempo_preparacion"),
            }
        )

    prompt = f"""
    Tengo estas recetas:
    {json.dumps(resumen_recetas[:20], ensure_ascii=False)}
    
    El usuario busca: "{consulta}"
    
    Devuelve un JSON con el array "ids" de las 5 recetas más relevantes:
    {{"ids": [0, 5, 12, ...]}}
    """

    response = ollama.generate(
        model="llama3.2", prompt=prompt, options={"temperature": 0}
    )

    try:
        clean_res = response["response"].strip()
        resultado = json.loads(
            clean_res[clean_res.find("{") : clean_res.rfind("}") + 1]
        )
        ids = resultado.get("ids", [])

        # Retornar las recetas completas
        return [recetas[i] for i in ids if i < len(recetas)]
    except:
        return []


# Ejemplo de uso
if __name__ == "__main__":
    resultados = buscar_recetas("Cena rápida sin gluten")
    for r in resultados:
        print(f"- {r['name']} ({r.get('tiempo_preparacion', '?')} min)")
