import pdfplumber
import pandas as pd

PDF_PATH = "Catálogo Valiente Distribuidora 2024.pdf"

all_tables = []

with pdfplumber.open(PDF_PATH) as pdf:
    for i, page in enumerate(pdf.pages):
        print(f"\n===== TEXTO DE LA PÁGINA {i+1} =====\n")
        print(page.extract_text())
        tables = page.extract_tables()
        for table in tables:
            df = pd.DataFrame(table)
            print(f"\nTabla detectada en página {i+1}:\n", df, "\n")
            all_tables.append(df)

# Si quieres guardar todas las tablas en un solo archivo CSV:
if all_tables:
    combined = pd.concat(all_tables, ignore_index=True)
    combined.to_csv("catalogo_valiente_extraido.csv", index=False)
    print("Tablas exportadas a catalogo_valiente_extraido.csv")
else:
    print("No se encontraron tablas en el PDF.")