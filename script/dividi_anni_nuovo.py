import json
from datetime import datetime
from collections import defaultdict
import os

# === CONFIG ===
input_path = "../Dati_lavorati/Full_History.json"
output_dir = "../Dati_lavorati/ByYear_Minified_nuovo"
output_prefix = "spotify_"

# === CREA LA CARTELLA DI OUTPUT SE NON ESISTE ===
os.makedirs(output_dir, exist_ok=True)

# === LEGGI IL FILE COMPLETO ===
with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# === GRUPPA PER ANNO E FILTRA TRACCE < 30s ===
tracks_by_year = defaultdict(list)
duration_by_year = defaultdict(int)
total_duration = 0

for entry in data:
    try:
        ms = entry.get("ms_played", 0)
        if ms < 30000:
            continue  # ignora se ascoltata < 30s

        ts = entry["ts"]
        year = datetime.fromisoformat(ts.replace("Z", "+00:00")).year

        track_name = entry.get("master_metadata_track_name")
        artist = entry.get("master_metadata_album_artist_name")
        album_name = entry.get("master_metadata_album_album_name")
        track_url = entry.get("spotify_track_uri")

        if not track_name or not artist:
            continue  # ignora se mancano dati essenziali

        # Salva in formato leggero (ora con album e URL)
        tracks_by_year[year].append([track_name, artist, album_name, track_url, ts])

        duration_by_year[year] += ms
        total_duration += ms

    except Exception as e:
        print(f"❌ Errore con entry: {entry.get('ts', 'N/A')} → {e}")

# === SCRIVI UN FILE PER ANNO ===
for year, tracks in tracks_by_year.items():
    output_filename = f"{output_prefix}{year}.json"
    output_path = os.path.join(output_dir, output_filename)

    with open(output_path, 'w', encoding='utf-8') as f_out:
        json.dump(tracks, f_out, ensure_ascii=False)

    print(f"✅ Salvato: {output_filename} ({len(tracks)} tracce valide)")
