import json, os
from collections import defaultdict
from datetime import datetime

input_path = os.path.join("..", "Dati_lavorati", "Full_History_cleaned.json")
output_path = os.path.join("..", "Dati_lavorati", "top_tracks_annuali.json")

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

per_anno = defaultdict(lambda: defaultdict(lambda: {"plays": 0, "ms_played": 0}))

for t in data:
    if t["ms_played"] < 10000: continue
    year = datetime.fromisoformat(t["ts"].replace("Z", "+00:00")).year
    key = (t["master_metadata_track_name"], t["master_metadata_album_artist_name"])
    per_anno[year][key]["plays"] += 1
    per_anno[year][key]["ms_played"] += t["ms_played"]

output = {}
for year, tracks in per_anno.items():
    output[str(year)] = [
        {"track": k[0], "artist": k[1], "plays": v["plays"], "ms_played": v["ms_played"]}
        for k, v in sorted(tracks.items(), key=lambda x: x[1]["ms_played"], reverse=True)
    ]

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("✅ Salvato:", output_path)
