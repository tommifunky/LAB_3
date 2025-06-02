import json
import os

# Percorsi
input_path = os.path.join("..", "Dati_lavorati", "Full_History.json")
output_path = os.path.join("..", "Dati_lavorati", "Full_History_cleaned.json")

# Campi da rimuovere
campi_da_rimuovere = [
    "platform",
    "conn_country",
    "ip_addr",
    "episode_name",
    "episode_show_name",
    "spotify_episode_uri",
    "audiobook_title",
    "audiobook_uri",
    "audiobook_chapter_uri",
    "audiobook_chapter_title",
    "reason_start",
    "reason_end",
    "offline",
    "offline_timestamp",
    "incognito_mode"
]

# Carica i dati
with open(input_path, "r", encoding="utf-8") as f:
    dati = json.load(f)

# Pulisce ogni entry
dati_puliti = []
for entry in dati:
    pulito = {k: v for k, v in entry.items() if k not in campi_da_rimuovere}
    dati_puliti.append(pulito)

# Salva il nuovo file
with open(output_path, "w", encoding="utf-8") as f_out:
    json.dump(dati_puliti, f_out, ensure_ascii=False, indent=2)

print(f"✅ File pulito salvato in: {output_path}")
