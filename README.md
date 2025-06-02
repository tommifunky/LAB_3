# Spotify Memory Map - LAB III

Questo progetto è nato come idea per un libro stampato, parte del modulo LAB III (CV415.01) alla SUPSI nel 2024-2025. L'obiettivo iniziale era trasformare la mia cronologia Spotify dal 2016 al 2024 in un racconto visivo astratto e sperimentale. Tuttavia, durante le revisioni e l’evoluzione del progetto, ho deciso di spostarmi verso un sito web interattivo, più in linea con la mia passione per il digitale e l’innovazione visiva.

Il risultato finale è **Spotify Memory Map**, una piattaforma web che esplora 10 anni di ascolti su Spotify, combinando data visualization e interazione in tempo reale.

## Struttura della repository

- **index.html**  
  La pagina principale del sito web, con tutto il markup e la logica di interazione.

- **assets/**  
  Contiene i file CSS e JavaScript per lo styling e le funzionalità aggiuntive.

- **dataset/**  
  Qui si trovano i vari file JSON utilizzati per popolare la visualizzazione. Ogni file rappresenta un anno diverso di ascolti (`spotify_2016.json`, `spotify_2017.json`, …) e le statistiche annuali (`recap_2016.json`, …).  
  Inoltre ci sono file come `orari.json` e `tempi_medi.json` che raccolgono le statistiche complessive.

- **dati_iniziali/**  
  Contiene un file JSON pesante con l’intera cronologia, usato come dataset di partenza per generare i file più leggeri e segmentati.

- **script/**  
  Qui si trovano i vari script Python 3 che ho scritto per elaborare, pulire e segmentare i dati di ascolto. Questa parte mi ha permesso di approfondire la programmazione e la gestione dei dati, arricchendo il progetto con un tocco tecnico e personalizzato.
  
## Il sito web

Il sito web rappresenta visivamente i miei ascolti musicali con un approccio sperimentale:

- Ogni punto sulla mappa è una canzone ascoltata, posizionata in base al mese (orizzontale) e all’ora del giorno (verticale).
- La barra laterale a sinistra permette di attivare/disattivare anni specifici e di esplorare statistiche dettagliate.
- I bottoni in basso a sinistra permettono di:
  - Regolare l’opacità dei punti.
  - Attivare la heatmap per evidenziare le aree più “dense”.
  - Esportare un’immagine PNG della visualizzazione.
  - Aprire un pannello per personalizzare i colori associati a ciascun anno.
- Ogni anno è rappresentato con un colore personalizzabile e un’altezza diversa nella sidebar.
- Cliccando su un mese si passa a una vista dettagliata con i dati degli anni disposti verticalmente.
- Tutto il sito è costruito in **HTML**, **CSS** e **JavaScript** vanilla, con un grande lavoro di interazione e performance.

## Origine del progetto

Come spiegato nel documento PDF allegato, l’idea è nata dall’esigenza di raccontare graficamente la mia storia musicale, iniziata come un libro sperimentale con rilegatura svizzera. Ma, durante lo sviluppo, ho deciso di virare sul web, dove posso sfruttare al massimo le mie competenze in HTML, CSS e JavaScript (e imparare tanto di nuovo!).  
Ho anche approfondito Python e la manipolazione dei dati, parte fondamentale per ottenere i JSON più leggeri e strutturati che popolano il sito.

> ✍️ Progetto realizzato da **Tommaso Stanga (CV2, SUPSI)** – 2024-2025

## Licenza

Puoi utilizzare e modificare liberamente questo progetto, ma ti chiedo di citare la fonte se lo condividi o lo modifichi pubblicamente.

