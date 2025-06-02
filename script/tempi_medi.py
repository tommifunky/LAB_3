import json, os
from collections import defaultdict
from datetime import datetime

# Percorsi
input_path = os.path.join("..", "Dati_lavorati", "Full_History_cleaned.json")
output_path = os.path.join("..", "Dati_lavorati", "tempi_medi.json")

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

valid = []
brani_totali = 0
durata_totale = 0
ascolti_per_giorno = defaultdict(lambda: {"ms": 0, "count": 0})

for t in data:
    if t["ms_played"] < 10000:
        continue
    brani_totali += 1
    durata_totale += t["ms_played"]
    dt = datetime.fromisoformat(t["ts"].replace("Z", "+00:00"))
    giorno = dt.date().isoformat()
    ascolti_per_giorno[giorno]["ms"] += t["ms_played"]
    ascolti_per_giorno[giorno]["count"] += 1

giorni_totali = len(ascolti_per_giorno)
media_durata = durata_totale // brani_totali if brani_totali else 0
media_minuti_giorno = (durata_totale // 60000) // giorni_totali if giorni_totali else 0
media_brani_giorno = brani_totali // giorni_totali if giorni_totali else 0

output = {
    "durata_media_brano": media_durata // 1000,  # in secondi
    "minuti_medi_giornalieri": media_minuti_giorno,
    "brani_medi_giornalieri": media_brani_giorno,
    "giorni_totali_ascoltati": giorni_totali
}

with open(output_path, "w", encoding="utf-8") as f_out:
    json.dump(output, f_out, ensure_ascii=False, indent=2)

print("✅ tempi_medi.json salvato in:", output_path)
