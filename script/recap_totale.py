import json, os
from collections import defaultdict, Counter
from datetime import datetime

# Percorsi
input_path = os.path.join("..", "Dati_lavorati", "Full_History_cleaned.json")
output_path = os.path.join("..", "Dati_lavorati", "recap_totale.json")

# Carica i dati
with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Filtra brani validi
valid = []
anni_set = set()
ascolti_per_giorno = defaultdict(int)
ascolti_per_anno = defaultdict(int)
artisti = Counter()
tracce = defaultdict(lambda: {"plays": 0, "ms_played": 0})
album = Counter()

for t in data:
    if t["ms_played"] < 10000: continue
    nome = t["master_metadata_track_name"]
    artista = t["master_metadata_album_artist_name"]
    album_nome = t.get("master_metadata_album_album_name", "")
    ms = t["ms_played"]
    dt = datetime.fromisoformat(t["ts"].replace("Z", "+00:00"))
    giorno = dt.date().isoformat()
    anno = str(dt.year)

    valid.append(t)
    anni_set.add(anno)
    ascolti_per_giorno[giorno] += ms
    ascolti_per_anno[anno] += ms
    artisti[artista] += ms
    tracce[(nome, artista)]["plays"] += 1
    tracce[(nome, artista)]["ms_played"] += ms
    album[(album_nome, artista)] += ms

# Estrazioni
minuti_totali = sum(t["ms_played"] for t in valid) // 60000
ascolti_totali = len(valid)
artisti_unici = len(set(t["master_metadata_album_artist_name"] for t in valid))

canzone_piu_ascoltata = max(tracce.items(), key=lambda x: x[1]["ms_played"])
artista_top = artisti.most_common(1)[0]
album_top = album.most_common(1)[0]
giorno_top_data, giorno_top_ms = max(ascolti_per_giorno.items(), key=lambda x: x[1])
anno_top_data, anno_top_ms = max(ascolti_per_anno.items(), key=lambda x: x[1])

# Output finale
recap = {
    "anni_di_ascolto": len(anni_set),
    "ascolti_totali": ascolti_totali,
    "minuti_totali": minuti_totali,
    "artisti_unici": artisti_unici,
    "canzone_piu_ascoltata": {
        "track": canzone_piu_ascoltata[0][0],
        "artist": canzone_piu_ascoltata[0][1],
        "plays": canzone_piu_ascoltata[1]["plays"],
        "minuti": canzone_piu_ascoltata[1]["ms_played"] // 60000
    },
    "artista_piu_ascoltato": {
        "artist": artista_top[0],
        "minuti": artista_top[1] // 60000
    },
    "album_piu_ascoltato": {
        "album": album_top[0][0],
        "artist": album_top[0][1],
        "minuti": album_top[1] // 60000
    },
    "giorno_piu_ascolti": {
        "data": giorno_top_data,
        "minuti": giorno_top_ms // 60000
    },
    "anno_piu_intenso": {
        "anno": anno_top_data,
        "minuti": anno_top_ms // 60000
    }
}

# Salva
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(recap, f, ensure_ascii=False, indent=2)

print("✅ recap_totale.json salvato con successo!")
