#!/usr/bin/env python3
"""
Extract Field - Extrae un campo de todas las recetas y lo guarda en un archivo txt
"""

import json
import argparse
from pathlib import Path
from constants import RECIPES_FILE


def extract_field(field_name, unique=False, unsort=False):
    """
    Extrae un campo de todas las recetas y lo guarda en un archivo txt
    
    Args:
        field_name: Nombre del campo a extraer
        unique: Si True, elimina duplicados (default: False)
    """
    # Leer recipes.json
    recipes_path = Path(__file__).parent.parent / RECIPES_FILE
    
    if not recipes_path.exists():
        print(f"❌ No se encontró el archivo: {recipes_path}")
        return
    
    with recipes_path.open("r", encoding="utf-8") as f:
        recipes = json.load(f)
    
    print(f"📚 Total de recetas: {len(recipes)}")
    print(f"🔍 Extrayendo campo: {field_name}")
    
    # Extraer valores
    values = []
    for recipe in recipes:
        field_value = recipe.get(field_name)
        
        if field_value is None:
            continue
        
        # Si es una lista, agregar cada elemento por separado
        if isinstance(field_value, list):
            values.extend(field_value)
        else:
            values.append(str(field_value))
    
    # Aplicar trim (strip), eliminar duplicados (unique) y ordenar (sort a-Z)
    values = [str(v).strip() for v in values if str(v).strip()]  # Trim y filtrar vacíos
    if unique:
        seen = set()
        unique_values = []
        for v in values:
            if v not in seen:
                seen.add(v)
                unique_values.append(v)
        values = unique_values  # Unique manteniendo orden
    if not unsort:
        values = sorted(values) # sort
    
    # Guardar en archivo
    output_path = Path(__file__).parent.parent / "src" / "data" / f"{field_name}.txt"
    
    with output_path.open("w", encoding="utf-8") as f:
        for value in values:
            f.write(f"{value}\n")
    
    print(f"✅ Archivo generado: {output_path}")
    print(f"📊 Total de elementos: {len(values)}")


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description="Extrae un campo de todas las recetas y lo guarda en un archivo txt"
    )
    parser.add_argument(
        "field",
        type=str,
        help="Nombre del campo a extraer (ej: name, ingredients, tags, cleaned_ingredientes)"
    )
    parser.add_argument(
        "--unique",
        action="store_true",
        help="Eliminar duplicados y mantener solo valores únicos"
    )
    parser.add_argument(
        "--unsort",
        action="store_true",
        help="No ordenar los valores extraídos"
    )
    
    args = parser.parse_args()
    extract_field(args.field, unique=args.unique, unsort=args.unsort)


if __name__ == "__main__":
    main()
