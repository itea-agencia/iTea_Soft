import os

def patch_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
        
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {path}")
    else:
        print(f"No changes in {path}")

# 1. backend/src/controllers/sales.controller.js
b_path = r"C:\Users\graci\Desktop\Projects\db_nexus\ITEA\iTea_Soft\backend\src\controllers\sales.controller.js"
b_repl = [
    (
        "renta_vehiculos: 'Renta de Auto',",
        "renta_vehiculos: 'Renta de Auto',\n          viajes_terrestres: 'Viaje Terrestre',"
    ),
    (
        "carRentalData: resultMap.renta_vehiculos || [],",
        "carRentalData: resultMap.renta_vehiculos || [],\n      landTravelData: resultMap.viajes_terrestres || [],"
    )
]
patch_file(b_path, b_repl)
