import json, os
from collections import defaultdict

input_path = os.path.join("..", "Dati_lavorati", "Full_History_cleaned.json")
output_path = os.path.join("..", "Dati_lavorati", "top_artisti_totali.json")

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

artisti = defaultdict(lambda: {"plays": 0, "ms_played": 0})

for t in data:
    if t["ms_played"] < 10000: continue
    artista = t["master_metadata_album_artist_name"]
    artisti[artista]["plays"] += 1
    artisti[artista]["ms_played"] += t["ms_played"]

output = [
    {"artist": k, "plays": v["plays"], "ms_played": v["ms_played"]}
    for k, v in sorted(artisti.items(), key=lambda x: x[1]["ms_played"], reverse=True)
]

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("✅ Salvato:", output_path)
