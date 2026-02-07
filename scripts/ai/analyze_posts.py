"""
Instagram Posts Processor (Engagement)

Analyzes Instagram post content using AI to extract marketing information.
"""

import ollama
import json


def analizar_post_instagram(texto_post, modelo="llama3.2"):
    """
    Analyze Instagram post content using AI.

    Args:
        texto_post: Instagram post caption text
        modelo: Ollama model to use

    Returns:
        Dictionary with analysis results
    """
    prompt_instagram = f"""
    Analiza el siguiente pie de foto de Instagram:
    "{texto_post}"

    Devuelve un JSON con:
    {{
      "sentimiento": "Positivo/Neutro/Negativo/Inspirador",
      "call_to_action": "¿Qué le pide al usuario hacer?",
      "hashtags_sugeridos": ["5 hashtags relevantes sin #"],
      "resumen_corto": "10 palabras máximo",
      "temas_principales": ["tema1", "tema2"]
    }}
    """

    response = ollama.generate(
        model=modelo, prompt=prompt_instagram, options={"temperature": 0.2}
    )

    try:
        clean_res = response["response"].strip()
        start = clean_res.find("{")
        end = clean_res.rfind("}") + 1
        return json.loads(clean_res[start:end])
    except Exception:
        return None


# Ejemplo de uso
if __name__ == "__main__":
    post = "¡Probá esta increíble receta de brownies! 🍫 Link en bio para la receta completa"
    resultado = analizar_post_instagram(post)
    print(json.dumps(resultado, indent=2, ensure_ascii=False))
