"""
Shared AI Service for all project scripts.

Provides common functions to interact with Ollama and process responses.
"""

import ollama
import json
from typing import Dict, Any, Optional, List


class AIService:
    """Service to manage AI operations with Ollama"""

    def __init__(self, modelo: str = "llama3.2"):
        """
        Initialize AI service.

        Args:
            modelo: Name of Ollama model to use
        """
        self.modelo = modelo

    def generar_respuesta(
        self, prompt: str, temperatura: float = 0.3, max_tokens: int = 500
    ) -> str:
        """
        Generate response using AI model.

        Args:
            prompt: Prompt to send to model
            temperatura: Controls creativity (0=precise, 1=creative)
            max_tokens: Token limit in response

        Returns:
            Generated response as string
        """
        response = ollama.generate(
            model=self.modelo,
            prompt=prompt,
            options={"temperature": temperatura, "num_predict": max_tokens},
        )
        return response["response"]

    def extraer_json(self, texto: str) -> Optional[Dict[str, Any]]:
        """
        Extract JSON object from text that may contain additional content.

        Args:
            texto: Text containing JSON

        Returns:
            Dictionary with parsed JSON or None if fails
        """
        try:
            texto = texto.strip()
            start = texto.find("{")
            end = texto.rfind("}") + 1

            if start != -1 and end > start:
                return json.loads(texto[start:end])
            return None
        except json.JSONDecodeError:
            return None

    def generar_json(
        self, prompt: str, temperatura: float = 0.3, max_tokens: int = 500
    ) -> Optional[Dict[str, Any]]:
        """
        Generate response in JSON format.

        Args:
            prompt: Prompt to send to model
            temperatura: Controls creativity
            max_tokens: Token limit

        Returns:
            Dictionary with parsed JSON or None if fails
        """
        respuesta = self.generar_respuesta(prompt, temperatura, max_tokens)
        return self.extraer_json(respuesta)

    def verificar_modelo_disponible(self) -> bool:
        """
        Verify if model is available in Ollama.

        Returns:
            True if model is available, False otherwise
        """
        try:
            modelos = ollama.list()
            modelos_disponibles = [m["model"] for m in modelos.get("models", [])]
            # Check if model exists with or without :latest tag
            return any(
                self.modelo == m or self.modelo == m.split(':')[0] 
                for m in modelos_disponibles
            )
        except:
            return False

    def listar_modelos_disponibles(self) -> List[str]:
        """
        List all available models in Ollama.

        Returns:
            List of available model names
        """
        try:
            modelos = ollama.list()
            return [m["model"] for m in modelos.get("models", [])]
        except:
            return []


# Convenience function to create service instance
def crear_servicio_ia(modelo: str = "llama3.2") -> AIService:
    """
    Create AI service instance.

    Args:
        modelo: Model name to use

    Returns:
        Configured AIService instance
    """
    return AIService(modelo)
