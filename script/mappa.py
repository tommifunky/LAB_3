import json, os
from collections import defaultdict
from datetime import datetime

# Percorsi
input_path = os.path.join("..", "Dati_lavorati", "Full_History_cleaned.json")
output_path = os.path.join("..", "Dati_lavorati", "heatmap.json")

# Carica dati
with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Raggruppa per giorno
giorni = defaultdict(int)

for t in data:
    if t["ms_played"] < 10000:
        continue
    dt = datetime.fromisoformat(t["ts"].replace("Z", "+00:00"))
    giorno = dt.date().isoformat()
    giorni[giorno] += t["ms_played"]

# Converte in lista ordinata
output = [
    {"date": g, "minuti": ms // 60000}
    for g, ms in sorted(giorni.items())
]

# Salva file
with open(output_path, "w", encoding="utf-8") as f_out:
    json.dump(output, f_out, ensure_ascii=False, indent=2)

print("✅ heatmap.json salvato in:", output_path)
