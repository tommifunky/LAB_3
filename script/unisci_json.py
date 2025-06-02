import json
import os

# Lista dei file in ordine cronologico
file_list = [
    "Streaming_History_Audio_2015-2016_0.json",
    "Streaming_History_Audio_2016-2017_1.json",
    "Streaming_History_Audio_2017-2018_2.json",
    "Streaming_History_Audio_2018_3.json",
    "Streaming_History_Audio_2018-2019_4.json",
    "Streaming_History_Audio_2019_5.json",
    "Streaming_History_Audio_2019-2020_6.json",
    "Streaming_History_Audio_2020_7.json",
    "Streaming_History_Audio_2020-2021_8.json",
    "Streaming_History_Audio_2021_9.json",
    "Streaming_History_Audio_2021-2022_10.json",
    "Streaming_History_Audio_2022_11.json",
    "Streaming_History_Audio_2022-2023_12.json",
    "Streaming_History_Audio_2023_13.json",
    "Streaming_History_Audio_2023-2024_14.json",
    "Streaming_History_Audio_2024-2025_15.json"
]

# Percorsi relativi (dallo script)
cartella_dati = "../Spotify Extended Streaming History"
cartella_output = "../Dati_lavorati"
nome_file_output = "Full_History.json"

# Unifica i dati
dati_unificati = []

for nome_file in file_list:
    percorso_file = os.path.join(cartella_dati, nome_file)
    try:
        with open(percorso_file, "r", encoding="utf-8") as f:
            dati = json.load(f)
            dati_unificati.extend(dati)
            print(f"Aggiunto: {nome_file} ({len(dati)} righe)")
    except Exception as e:
        print(f"Errore con {nome_file}: {e}")

# Salva il file nella cartella "Dati_lavorati"
percorso_output = os.path.join(cartella_output, nome_file_output)
with open(percorso_output, "w", encoding="utf-8") as f_out:
    json.dump(dati_unificati, f_out, ensure_ascii=False, indent=2)

print(f"\n✅ File salvato in: {percorso_output}")
