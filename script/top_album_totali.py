import json, os
from collections import defaultdict

input_path = os.path.join("..", "Dati_lavorati", "Full_History_cleaned.json")
output_path = os.path.join("..", "Dati_lavorati", "top_album_totali.json")

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

album = defaultdict(lambda: {"plays": 0, "ms_played": 0})

for t in data:
    if t["ms_played"] < 10000: continue
    key = (t["master_metadata_album_album_name"], t["master_metadata_album_artist_name"])
    album[key]["plays"] += 1
    album[key]["ms_played"] += t["ms_played"]

output = [
    {"album": k[0], "artist": k[1], "plays": v["plays"], "ms_played": v["ms_played"]}
    for k, v in sorted(album.items(), key=lambda x: x[1]["ms_played"], reverse=True)
]

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("✅ Salvato:", output_path)
