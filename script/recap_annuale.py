import json, os
from collections import defaultdict, Counter
from datetime import datetime

# Percorsi
input_path = os.path.join("..", "Dati_lavorati", "Full_History_cleaned.json")
output_dir = os.path.join("..", "Dati_lavorati")

# Carica dati
with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Filtra ascolti validi (≥10s)
valid = [t for t in data if t["ms_played"] >= 10000 and t.get("master_metadata_track_name") and t.get("master_metadata_album_artist_name")]

# Raggruppa per anno
dati_per_anno = defaultdict(list)
for t in valid:
    anno = datetime.fromisoformat(t["ts"].replace("Z", "+00:00")).year
    dati_per_anno[anno].append(t)

# Crea recap per ogni anno
for anno, tracks in dati_per_anno.items():
    giorni = defaultdict(int)
    artisti = Counter()
    canzoni = defaultdict(lambda: {"plays": 0, "ms_played": 0, "uri": ""})
    album = Counter()
    totale_ms = 0

    for t in tracks:
        nome = t["master_metadata_track_name"]
        artista = t["master_metadata_album_artist_name"]
        album_nome = t.get("master_metadata_album_album_name", "")
        ms = t["ms_played"]
        dt = datetime.fromisoformat(t["ts"].replace("Z", "+00:00"))
        giorno = dt.date().isoformat()
        uri = t.get("spotify_track_uri", "")

        totale_ms += ms
        giorni[giorno] += ms
        artisti[artista] += ms

        key = (nome, artista)
        canzoni[key]["plays"] += 1
        canzoni[key]["ms_played"] += ms
        canzoni[key]["uri"] = uri

        album[(album_nome, artista)] += ms

    # Top 10 canzoni
    top_canzoni = sorted(canzoni.items(), key=lambda x: x[1]["ms_played"], reverse=True)[:10]
    top_canzoni_list = [
        {
            "track": nome,
            "artist": artista,
            "plays": dati["plays"],
            "minuti": dati["ms_played"] // 60000,
            "link": f"https://open.spotify.com/track/{dati['uri'].split(':')[-1]}" if dati["uri"] else ""
        }
        for (nome, artista), dati in top_canzoni
    ]

    # Top 10 artisti
    top_artisti = artisti.most_common(10)
    top_artisti_list = [
        {"artist": artista, "minuti": ms // 60000}
        for artista, ms in top_artisti
    ]

    # Top 10 album
    top_album = album.most_common(10)
    top_album_list = [
        {"album": album_nome, "artist": artista, "minuti": ms // 60000}
        for (album_nome, artista), ms in top_album
    ]

    # Giorno con più ascolti
    giorno_top = max(giorni.items(), key=lambda x: x[1])

    output = {
        "anno": anno,
        "ascolti_totali": len(tracks),
        "minuti_totali": totale_ms // 60000,
        "artisti_unici": len(set(t["master_metadata_album_artist_name"] for t in tracks)),
        "top_10_canzoni": top_canzoni_list,
        "top_10_artisti": top_artisti_list,
        "top_10_album": top_album_list,
        "giorno_piu_ascolti": {
            "data": giorno_top[0],
            "minuti": giorno_top[1] // 60000
        }
    }

    # Salva il file
    output_path = os.path.join(output_dir, f"recap_{anno}.json")
    with open(output_path, "w", encoding="utf-8") as f_out:
        json.dump(output, f_out, ensure_ascii=False, indent=2)

    print(f"✅ Salvato: {output_path}")
