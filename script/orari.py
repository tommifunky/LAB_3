import json, os
from collections import defaultdict
from datetime import datetime

# Percorsi
input_path = os.path.join("..", "Dati_lavorati", "Full_History_cleaned.json")
output_path = os.path.join("..", "Dati_lavorati", "orari.json")

# Carica i dati
with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Inizializza mappa ore
orari = defaultdict(lambda: {"ascolti": 0, "ms_played": 0})

# Cicla e raccoglie
for t in data:
    if t["ms_played"] < 10000:
        continue
    dt = datetime.fromisoformat(t["ts"].replace("Z", "+00:00"))
    ora = dt.strftime("%H")
    orari[ora]["ascolti"] += 1
    orari[ora]["ms_played"] += t["ms_played"]

# Converte i valori in minuti
output = {
    ora: {
        "ascolti": dati["ascolti"],
        "minuti": dati["ms_played"] // 60000
    }
    for ora, dati in sorted(orari.items())
}

# Salva file
with open(output_path, "w", encoding="utf-8") as f_out:
    json.dump(output, f_out, ensure_ascii=False, indent=2)

print("✅ orari.json salvato in:", output_path)
