import json
import os
from collections import defaultdict, Counter
from datetime import datetime

# Percorsi
input_path = os.path.join("..", "Dati_lavorati", "Full_History_cleaned.json")
output_path = os.path.join("..", "Dati_lavorati", "giornaliero.json")

# Carica i dati
with open(input_path, "r", encoding="utf-8") as f:
    dati = json.load(f)

# Gruppo per giorno
timeline = defaultdict(list)

for track in dati:
    # Filtra: dati validi e durata minima 10 secondi
    if not track.get("master_metadata_track_name") or not track.get("master_metadata_album_artist_name"):
        continue
    if track["ms_played"] < 10000:
        continue

    ts = track["ts"]
    dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    date_str = dt.date().isoformat()
    hour_str = dt.strftime("%H")

    timeline[date_str].append({
        "ms_played": track["ms_played"],
        "artist": track["master_metadata_album_artist_name"],
        "track": track["master_metadata_track_name"],
        "skipped": track.get("skipped", False),
        "hour": hour_str
    })

# Costruisce il JSON finale
output = []

for date, tracks in timeline.items():
    total_ms = sum(t["ms_played"] for t in tracks)
    total_tracks = len(tracks)
    skipped_tracks = sum(1 for t in tracks if t["skipped"])
    artist_counter = Counter(t["artist"] for t in tracks)
    top_artist = artist_counter.most_common(1)[0][0] if artist_counter else None
    top_track = max(tracks, key=lambda x: x["ms_played"])["track"] if tracks else None
    unique_artists = len(artist_counter)
    
    hour_distribution = defaultdict(int)
    for t in tracks:
        hour_distribution[t["hour"]] += 1

    output.append({
        "date": date,
        "total_ms_played": total_ms,
        "total_tracks": total_tracks,
        "skipped_tracks": skipped_tracks,
        "top_artist": top_artist,
        "top_track": top_track,
        "unique_artists": unique_artists,
        "hour_distribution": dict(hour_distribution)
    })

# Ordina per data
output.sort(key=lambda x: x["date"])

# Salva il file
with open(output_path, "w", encoding="utf-8") as f_out:
    json.dump(output, f_out, ensure_ascii=False, indent=2)

print(f"✅ giornaliero.json generato con {len(output)} giorni (solo tracce ≥10s).")
