# ruff: noqa
# fmt: off
"""
Constants - Configuración centralizada del proyecto
"""

# Configuración de Instagram
INSTAGRAM_USERNAME = "al.horno.con.papa"
LOGIN_USERNAME = "al.horno.con.papa"
LOGIN_PASSWORD = "xxxxxxxxxxxxxx"

# Rutas de archivos
RECIPES_FILE = "src/data/recipes.json"
IMAGES_DIR = "public/images"

# Tags a omitir durante el procesamiento
TAGS_TO_SKIP = [
    # Redes y Marketing
    "alhornoconpapa", "instagram", "instagood", "food", "foodie", "comida", 
    "reels", "instafood", "instareels", "reelsinstagram", "instagramreels",
    "comidarica", "recetadeldía", "delicioso", "momentosgourmet", "gourmet",
    "caseroesmejor", "sabor", "sabores", "anushcuidarte", "pruebencocinando",
    "recetadeliciosa", "comidareal", "realfood", "telefe", "masterchef",
    "bakeoff", "bakeoffargentina", "sharktank",
    "instayummy", "instaeats", "instamood", "instalike", "love", "follow",
    "chef", "cheflife", "homechef", "cookpad", "cookpadrecetas",
    "quarantinecooking", "quarantinebaking", "pandemiccooking",
    "tendenciasgastronomicas", "gastronomia", "gastronomiareal",
    "cocinaencasa", "comidabendecida", "cocinarencasa", "cocinscasera",
    
    # Genéricos de cocina (No ayudan a filtrar)
    "recetas", "recipe", "recipes", "cocinacasera", "comidacasera", "casero",
    "hechoencasa", "cocina", "tipsdecocina", "receta", "cocinasaludable",
    "saludable", "recetassaludables", "recetasricas", 
    "cocinaenfamilia", "familia", "family", "saborcasero", "saborencasa",
    "recetasfamiliares", "cocinaconsabor", "cocinafresca", "aprendiendoacocinar",
    "recetacasera", "recetascaseras", "recetasclásicas", "alimentacionreal",
    "natural", "hogar", "horno", "comidasaludable",
    "comidasana", "delicias", "deliciab", "delicia", "comidasdeliciosas",
    "horneando", "cocinado", "cocinasemanal", "planificadoracocina",
    "recetasparaproteína", "calentar", "calentarcomida",
    "almuerzo", "almuerzos", "cena", "cenas", "comidassanas", "comidavegetariana",
    "comidaparaantesydespués", "comidastradicionales", "cocinafácil",
    "platoprincipal", "platos", "plato", "entrada", "entradas",
    "acompañamiento", "acompañamientos", "guarnición", "guarniciones",
    "picada", "picadas", "picnik", "picnic", "brunch", "snack", "snacks",
    "antojo", "antojos", "comfortfood", "foodlover",
    "comidabalanceada", "recetasconhistoria", "comidatradicional",
    "cocinasaludable", "recetasfáciles", "recetasfaciles",
    
    # Meta-datos o Institucionales
    "ingenieriaensistemas", "modelodenegocio", "proyectosuniversitarios", 
    "utn", "facultad", "emprendimiento",

    # Otros
    "agroecologico", "recetadeemergencia",
    "frases", "frasesinstagram", "reflexión", "reflexiones",
    "feliz", "celebración", "concurso", "ganador", "premio",
    "amor", "enamorado", "corazón", "corazon"
]

EASY_TAG = "facil"

# Sinónimos de tags (key: [sinónimos])
# Si aparece cualquier sinónimo, se reemplaza por la key
TAG_SYNONYMS = {
    # Dietas especiales
    "vegano": [
        "vegan", "vegano", "vegana", "veganfood", "proteinavegana", 
        "recetasveganas", "cocinavegana", "comidavegana", "plantbased", "veganesa"
    ],
    "vegetariano": ["vegetariano", "vegetarian", "veggie", "veggiefood", "recetasveggie", "vegfood", "vegetariano"],
    "sin_gluten": ["sintacc", "glutenfree", "singluten", "singlúten", "sinharina", "libredecereales", "sintacc"],
    "sin_lactosa": ["sinlactosa", "lactosefree", "dlactosa"],
    "keto": ["keto", "cetogénica", "cetogenico", "lowcarb", "bajosencarbohidratos"],
    "sin_azúcar": ["sinazúcar", "sinazucar", "sugarfree", "azucarlibre"],
    
    # Categorías de platos
    "postres": [
        "postre", "postres", "dessert", "desserts", "postrescaseros", 
        "postrecasero", "postreslatinos", "postresnavideños"
    ],
    "dulce": [
        "dulces", "momentosdulces"
    ],
    "torta": [
        "torta", "tortas", "cake", "cakes", "tortacasera", "tortachocolate", 
        "tortafrutal", "bizcochuelo", "bizcochuelos", "tortademanzana", 
        "tortalimón", "tortadecoco", "tortadericota", "tortahelada", 
        "tortainglesa", "budín", "budin", "budines", "bizcocho", "bizcochitos",
        "marmolado", "marron", "brownie", "cheesecake", "tiramisú", "tiramisu",
        "marquise", "crumble", "mousse"
    ],
    "galletitas": [
        "galletitas", "cookiescaseras", "galletas", "galletasdecoradas", 
        "galletasnavideñas", "biscochitos", "biscochos", "cookies", "cookie"
    ],
    "tartas": [
        "tarta", "tartas", "quiche", "quiches", "tartafruta", 
        "tartalimón", "tartadecoco", "tartademanzana", "tartafrancesa",
        "tartalima", "tarta Ricota"
    ],
    "empanadas": [
        "empanada", "empanadas", "empanadasalhorno", "empanadasfritas", 
        "pastafrola", "pastafrolla", "cacetitos", "tequeños", "pasteles",
        "empanadasargentinas", "empanadas de carne", "empanadas de verdura"
    ],
    "pizza": ["pizza", "pizzas", "pizzamargarita", "pizzanapolitana", "pizzaexpress", "pizzacase", "fainá", "faina"],
    "sándwiches": [
        "sanguche", "sanguches", "sándwich", "sándwiches", "sandwich", 
        "sandwiches", "burgers", "hamburguesa", "hamburguesas", "hotdog", 
        "hotdogs", "medallón", "medallones", "dinoquesadilla", "quesadilla"
    ],
    "sopas": [
        "sopa", "sopas", "caldo", "caldos", "consome", "consomé", 
        "cremas", "crema", "velouté", "sopacondientes", "sopadecebolla", 
        "sopadepollo", "crema de calabaza", "crema de zapallo",
        "estofado", "guiso", "caldoso"
    ],
    "pasta": [
        "pasta", "pastas", "pastacasera", "pastalovers", "fideos", 
        "sorrentinos", "lasagna", "lasagña", "ñoquis", "gnocchi", "ravioles", 
        "ravioli", "canelones", "tallarines", "cacio", "carbonara",
        "tallarines", "fideos", "ramen", "yakisoba", "pastarellena"
    ],
    "huevos": [
        "huevos", "huevo", "huevosrevueltos", "revuelto", "revueltos", 
        "huevofrito", "omelette", "tortillafrancesa", "huevospoché", 
        "huevococido", "tortilla", "huevoRevuelto", "huevosrevueltos"
    ],
    
    # Ingredientes principales
    "pollo": [
        "pollo", "pechugadepollo", "pollojugoso", "pollopicante", 
        "alitasdepollo", "alitas", "nuggetsdepollo", "milanesadepollo", 
        "milanesa", "supremas", "pechuga", "muslo", "pierna de pollo"
    ],
    "carne": [
        "carne", "carnes", "carneacuchillo", "carnesrojas", "peceto", 
        "bifes", "vacío", "entraña", "tira de asado", "asado", "matambre", 
        "costilla", "costillitas", "riñón", "rinon", "mollejas", "hígado",
        "higado", "bife", "solomillo", "lomo"
    ],
    "cerdo": [
        "cerdo", "bondiola", "panceta", "prosciutto", "jamón", "jamón york",
        "tocino", "lardo", "carne de cerdo", "costillitas de cerdo"
    ],
    "verduras": [
        "verdura", "verduras", "verduleria", "verdurasfrescas", "vegetales", 
        "vegetal", "verdulería", "verduler", "acelga", "acelgas", "espinaca",
        "espinacas", "brócoli", "brocoli", "coliflor", "coles de bruselas",
        "lechuga", "repollo", "choclo", "morrón", "morrones", "pimiento",
        "pimientos", "berenjena", "berenjenas", "zucchini", "zapallito",
        "zapallitos", "rúcula", "rucula", "radicha", "nabo", "rabanito"
    ],
    "legumbres": [
        "legumbres", "lentejas", "garbanzos", "porotos", "judias", 
        "lenteja", "garbanzo", "poroto", "judio", "habas", "haba",
        "guiso de lentejas", "guiso de garbanzos"
    ],
    "arroz": [
        "arroz", "arrozconleche", "risotto", "arrozblanco", "arrozfrito", 
        "paella", "arrozcaldoso", "arroz con pollo", "aroz"
    ],
    "zapallo": [
        "zapallo", "zapallito", "zapallitos", "calabaza", "cabutia", 
        "sopadezapallo", "cremadelezapallo", "zapalloalhorno", "calabaza",
        "zapallo-core"
    ],
    "papa": [
        "papa", "papas", "papafrita", "papasfritas", "papaalhorno", 
        "pure", "puré", "puredepapa", "papines", "papa nube"
    ],
    "cebolla": ["cebolla", "cebollas", "cebollaamarilla", "cebolladeverdeo", "verdeo", "cebolla morada"],
    "tomate": ["tomate", "tomates", "jitomate", "tomatescherry", "tomatecherry", "tomate cherry"],
    "frutas": [
        "fruta", "frutas", "frutal", "frutillas", "frutilla", 
        "manzana", "manzanas", "banana", "bananas", "banano", 
        "naranja", "naranjas", "limón", "limon", "limones", 
        "uva", "uvas", "pera", "peras", "mango", "kiwi", 
        "anana", "ananá", "piña", "coco", "palta", "avocado",
        "arándano", "arandano", "arandanos", "cereza", "cerezas",
        "damasco", "ciruela", "granada", "higo", "membrillo",
        "pomelo", "sandia", "melón", "melon"
    ],
    "hongos": ["hongos", "hongo", "gírgolas", "girgolas", "champiñones", "champiñon", "porcini", "shiitake"],
    "quesos": ["queso", "quesos", "muzzarella", "muzza", "mozzarella", "parmesano", "parmigiano", "ricota", "queso crema", "cream cheese", "gouda", "cheddar", "brie", "gruyere", "provolone", "sardo", "quesillo"],
    "semillas": ["semillas", "semilla", "chia", "lino", "sésamo", "sesamo", "girasol", "zapallo", "almendra", "almendras", "nuez", "nueces", "maní", "mani", "pistacho", "coco rallado"],
    "hierbas": ["hierbas", "hierba", "albahaca", "orégano", "oregano", "tomillo", "romero", "laurel", "perejil", "cilantro", "cebolla de verdeo", "ají", "aji", "pimentón", "pimienta"],
    
    # Panadería y masas
    "panadería": [
        "pan", "pancasero", "panes", "panaderia", "panadero", "amasar", 
        "masa", "pandepapa", "naan", "pannaan", "naanbread", "pancake", 
        "pancakes", "pancakemonday", "waffles", "waffle", "crepes", 
        "tortilla", "panespecial", "panmas", "panintegral", "panmasa", 
        "panfermentacion", "panarabe", "panrallado", "panmolde", "brioche", 
        "masa madre", "masamadre", "fermentación", "levadura", "premezcla", 
        "harina", "harinas", "rebanada", "rebabas", "bolillo", " baguete",
        "pan francés", "figacitas"
    ],
    "masas": [
        "masa", "masas", "masa básica", "masa de tarta", "masa quebrada",
        "masa brisa", "hojaldre", "pasta sfoglia"
    ],
    
    # Bebidas y licuados
    "bebida": [
        "bebida", "bebidas", "bebidasfrias", "cerveza", "trago", 
        "tragos", "cocteleria", "café", "cafe", "gaseosa"
    ],
    "licuado": [
        "licuado", "licuados", "smoothie", "smoothies", "batido", 
        "batidos", "jugo", "jugos", "jugosnaturales", "zumo", "zumos",
        "agua", "aguafresca"
    ],
    
    # Preparaciones
    "al horno": [
        "al horno", "alhorno", "horneado", "hornear", "asado al horno",
        "al horno", "recetasalhorno", "alajó"
    ],
    "frito": ["frito", "frita", "fritos", "fritas", "fritura", "freír", "freir", "deep fry"],
    "salteado": ["salteado", "salteada", "saltear", "wok", "salteados", "stir fry"],
    "a la plancha": ["a la plancha", "plancha", "grillado", "grill"],
    "a la parrilla": ["a la parrilla", "parrilla", " BBQ", "bbq", "barbacoa"],
    "hervido": ["hervido", "hervida", "hervidos", "cocido", "cocida", "cocción lenta", "slow cook"],
    "microondas": ["microondas", "microONDAS", "micro-ondas"],
    "sin cocinar": ["sin cocinar", "sin horno", "frío", "frio", "crudo", "cruda"],
    
    # Estacional / Festividades
    "navidad": [
        "navidad", "christmas", "navideño", "mesanavideña", 
        "recetanavideña", "fiestas", "findeaño", "navideña", "navideñas"
    ],
    "cumpleaños": [
        "cumpleaños", "cumple", "pasteldecorado", "tortacumple", 
        "tortasdecoradas", "globos", "decoración", "decoracion", "fiesta"
    ],
    "día de la madre": ["díadelamadre", "diadelamadre", "madre", "mamá", "mama"],
    "verano": ["verano", "summer", "calor", "fresco", "refrescante"],
    "invierno": ["invierno", "winter", "frío", "frio", "helado", "caliente", "calentar"],
    "otoño": ["otoño", "otonio", "fall", "primavera", "primaveral"],
    
    # Nacionalidades / Internacional
    "argentina": [
        "argentina", "argentinian", "argento", "argentinafood", "cocinaargentina", 
        "9dejulio", "recetasargentinas", "argentinacocina", "asadoargentino", 
        "cocinargentina", "saboresargentinos", "guisoargentino", "matesargentino", 
        "comidatradicional", "locro", "empanadasargentinas", "tiradito",
        "dulce de leche", "dulcedeleche", "quienesaburrido"
    ],
    "italiana": [
        "italiana", "italiano", "italianfood", "cocinaitaliana", "italian", 
        "italianrecipes", "recetasitalianas", "cucina", "cucinaitaliana", 
        "cocinaritaliano", "italia"
    ],
    "japonesa": [
        "japonesas", "japonesa", "japanfood", "recetasjaponesas", "ramen", 
        "sushi", "tonkatsu", "donburi", "cocinajaponesa", "yakitori",
        "tempura", "teriyaki", "miso", "edamame", "onigiri", "tamago",
        "gyoza", "yakisoba", "katsu", "curryjapones", "nikujaga"
    ],
    "mexicana": [
        "mexicana", "mexicano", "mexicanfood", "cocinamexicana", "mexican", 
        "tacos", "burritos", "fajitas", "quesadillas", "nachos", "enchiladas",
        "guacamole", "salsa mexicana", "texmex"
    ],
    "india": [
        "india", "indio", "indianfood", "cocinaindia", "curry", 
        "tikka", "masala", "tandoori", "naan", "samosa", "biryani"
    ],
    "china": [
        "china", "chino", "chinesefood", "cocinachina", "cocina china",
        "dim sum", "bao", "dumplings", "rollitos", "pad thai"
    ],
    "internacional": [
        "comidainternacional", "internationalfood", "worldcuisine", 
        "recetasinternacionales", "saboresdelmundo", "asia", "aleman", 
        "alemana", "griega", "griego", "corea", "coreano", "francesa",
        "francés", "española", "espanol", "rusa", "turca", "mediterránea",
        "thai", "tailandesa", "brasilera", "coreana", "árabe", "arabe",
        "venezolana", "venezuela", "paraguaya", "paraguay", "boliviana",
        "bolivia", "peruana", "peru", "colombiana", "colombia", "cubana",
        "caribeña", "caribena"
    ],
    
    # Técnicas y tips
    EASY_TAG: [
        "facil", "fácil", "easy", "simple", "rapido", "recetarapida", 
        "recetasfaciles", "cocinafacil", "recetafacil", "recetasrapidas", 
        "recetasfáciles", "recetarápida", "cocinasimple", "cocinarapido",
        "fácil", "3 ingredientes", "3ingredientes", "2 ingredientes", "2ingredientes",
        "5 minutos", "5minutos", "10 minutos", "10minutos", "15 minutos"
    ],
    "tips": [
        "tipsdecocina", "consejosdecocina", "trucosdecocina", "cocinasaludable", 
        "cocinaconsciente", "teoria", "concepto", "conceptos", "conceptoscocina",
        "truco", "secretos", "consejo", "consejos", "técnica", "tecnica"
    ],
    "blw": [
        "blw", "babyledweaning", "alimentacioncomplementaria", 
        "alimentacioninfantil", "comidaparabebes", "bliss", "bebés", "bebes",
        "niños", "ninos", "infantil", "kids"
    ],
    "salud o seguridad": [
        "sanitización", "seguridadalimentaria", "bromatologia", 
        "higienealimentaria", "esterilización", "esteriliza", "conservacion", 
        "cuidados", "congelar", "congelacion", "freezer", "conservar"
    ],
    "desayuno y merienda": [
        "desayuno", "merienda", "breakfast", "mate", "yerba", "curadodemate",
        "tarde", "medias tarde", "mediasnoches", "coffe"
    ],
    
    # Ingredientes sabor
    "chocolate": [
        "chocolate", "chocolatoso", "chocolatelovers", "chocolatedulce", 
        "chocolate amargo", "cacao", "cacaoenpolvo", "choco", "cocoa"
    ],
    "dulce de leche": [
        "dulce de leche", "dulcedeleche", "cajeta", "leche quemada"
    ],
    "vainilla": [
        "vainilla", "vainillla", "vaina", "esencia de vainilla", "extracto de vainilla"
    ],
    "café": ["café", "cafe", "cafecito", "expreso", "capuccino", "moccachino"],
    "caramelo": ["caramelo", "toffee", "butterscotch", "azúcar caramelizada"],
    "miel": ["miel", "maple", "sirope", "jarabe"],
    
    # Salsas y aderezos
    "salsas": [
        "salsa", "salsas", "salsita", "salsitas", "salsadeajo", 
        "salsacasera", "aderezo", "dip", "guasacaca", "chimichurri", 
        "pesto", "mayonesa", "ketchup", "mostaza", "bbq", "salsa brava",
        "salsa verde", "salsa roja", "salsa blanca", "bechamel", "bolognesa",
        "pomodoro", "napolitana", "filetti", "salsa deancho", "tartara"
    ],
    
    # Otros
    "helado": ["helado", "helados", "ice cream", "gelato", "sorbete", "sorbetes"],
    "mermelada": ["mermelada", "mermeladas", "confitura", "confituras", "dulce"],
    "golosinas": ["golosinas", "golosina", "caramelo", "caramelos", "chicle", "candy"],
    "yerra": ["yogur", "yogurt", "yoghurt", "yogur casero", "yogurtcasero"],
    "fermentados": ["fermentados", "fermentado", "probióticos", "probioticos", "kefir", "kombucha"],
    "curado": ["curado", "curada", "curar", "curado de tablas", "curadodetablas", "tabla"],
    "proteína": ["proteína", "proteina", "proteinas", "musculo", "gym", "fit"],
    "frozen": ["congelado", "congelada", "freezer friendly", "freezerfriendly", "freezertesting"],
}

# Marcadores de fin de sección al parsear ingredientes
SECTION_END_MARKERS = ["👣", "🔪", "👨‍🍳", "📝", "🍽️", "⏰", "💡", "pasos", "Pasos"]

# Post pineados
PINNED_MEDIAIDS = [3283787029367823611, 3280944293224657232]

# ===== CONSTANTES PARA LIMPIEZA DE INGREDIENTES =====

# Unidades de medida para limpiar ingredientes
UNIDADES_MEDIDA = [
    "g", "gr", "gramo", "gramos",
    "kg", "kilo", "kilos", "kilogramo", "kilogramos",
    "ml", "mililitro", "mililitros",
    "l", "litro", "litros",
    "cc",
    "cucharada", "cucharadas", "cda", "cdas",
    "cucharadita", "cucharaditas", "cdita", "cditas",
    "taza", "tazas",
    "pizca", "pizcas",
    "unidad", "unidades", "u",
    "diente", "dientes",  # diente de ajo
    "jugo", "jugos",  # jugo de limón
    "tapita", "tapitas",  # tapita de vinagre
    "hoja", "hojas",  # hoja de laurel
    "rama", "ramas",  # rama de perejil
    "rodaja", "rodajas",  # rodaja de limón
]

# Artículos y preposiciones para limpiar ingredientes
ARTICULOS_PREPOSICIONES = [
    "de", "del", "la", "el", "los", "las",
    "al", "a", "con", "en", "un", "una", "unos", "unas"
]

# Tamaños y cualidades a remover
TAMANOS_CUALIDADES = [
    "grande", "grandes", "chico", "chicos", "chica", "chicas",
    "mediano", "medianos", "mediana", "medianas",
    "pequeño", "pequeños", "pequeña", "pequeñas",
    "fresco", "frescos", "fresca", "frescas",
    "maduro", "maduros", "madura", "maduras"
]

# Fracciones en texto
FRACCIONES_TEXTO = [
    "medio", "media", "un cuarto", "un tercio", "dos tercios",
    "tres cuartos", "y medio", "y media"
]

# Fracciones unicode a remover
FRACCIONES_UNICODE = r'[½¼¾⅓⅔⅛⅜⅝⅞]'

# Patrones regex para remover al final del ingrediente (orden importa)
PATRONES_FINAL = [
    (r',\s*cantidad\s+necesaria.*$', 'IGNORECASE'),  # ", cantidad necesaria"
    (r'\s+para\s+\w+.*$', 'IGNORECASE'),  # "para freír", "para hornear"
    (r'\s+a\s+gusto.*$', 'IGNORECASE'),    # "a gusto"
    (r'\s+al\s+gusto.*$', 'IGNORECASE'),   # "al gusto"
    (r'\s+c/n.*$', 'IGNORECASE'),          # "c/n" (cantidad necesaria)
    (r'\s*\(opcional\).*$', 'IGNORECASE'), # "(opcional)" con posible texto después
    (r'\s+opcional.*$', 'IGNORECASE'),     # "opcional" al final
    (r'\s+a\s+elección.*$', 'IGNORECASE')  # "a elección"
]

# Patrones regex para remover al principio del ingrediente
PATRONES_INICIO = [
    (r'^\(opcional\)\s*', 'IGNORECASE'),   # "(opcional)" al inicio
    (r'^opcional\s+', 'IGNORECASE'),       # "opcional" al inicio
]

# URL del sitio para indexación
SITE_URL = "https://alhornoconpapa.com.ar/"

# Archivo de credenciales de Google Cloud
JSON_KEY_FILE = 'credentials/al-horno-con-papa-xxxxxxxxx.json'

# Reemplaza con tu API key de Bing
BING_API_KEY = "xxxxxxxx"
