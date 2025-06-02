const years = {
      2016: { color: '#ff0000', height: '4.11' },
      2017: { color: '#ff8700', height: '5.6' },
      2018: { color: '#ffd300', height: '8.4' },
      2019: { color: '#deff0a', height: '10.2' },
      2020: { color: '#a1ff0a', height: '12.5' },
      2021: { color: '#0aff99', height: '13.8' },
      2022: { color: '#0aefff', height: '15.2' },
      2023: { color: '#147df5', height: '13.19' },
      2024: { color: '#580aff', height: '9.5' },
      2025: { color: '#be0aff', height: '7.5' }
    };

    const months = 12;
    const canvasWidth = 2800;
    const canvasHeight = 15000;
    const marginX = -51;
    const marginY = 20;
    const rightPadding = 120;
    const cachedData = {};
    let tracks = [];
    
    
    

    const container = document.getElementById('canvas-container');

    async function preloadAllData() {
      const promises = Object.keys(years).map(year =>
        fetch(`dataset/spotify_${year}.json`)
          .then(res => res.json())
          .then(data => cachedData[year] = data)
          .catch(err => console.error(`Errore ${year}:`, err))
      );
      await Promise.all(promises);
      tracks = Object.values(cachedData).flat();
    }

    function map(val, inMin, inMax, outMin, outMax) {
      return ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
    
    function createTrackElements() {
  const usableWidth = canvasWidth - marginX * 2 - rightPadding;

  tracks.forEach(track => {
    const [trackName, artist, album, spotifyUrl, timestamp] = track;
    const date = new Date(timestamp);
    const year = date.getUTCFullYear().toString();
    const month = date.getUTCMonth();
    
    const x = (month + 0.5) * (usableWidth / months) + marginX + 20;
    const y = map(date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440, 1, 31, marginY, canvasHeight - marginY);

    const div = document.createElement('div');
    div.className = 'track';
    div.textContent = trackName;
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.color = years[year]?.color || '#ffffff';
    div.dataset.year = year;
    div.dataset.timestamp = timestamp;
    div.style.opacity = '0.05';
    div.style.pointerEvents = 'auto'; // Modificato da 'none' a 'auto'

    div.addEventListener('click', () => {
      const existingModal = document.querySelector('.track-modal');
      if (existingModal) existingModal.remove();

      // Controlla se ci sono anni attivi
      const activeYears = document.querySelectorAll('.year-button.active');
      if (activeYears.length > 0) {
        const isYearActive = Array.from(activeYears).some(btn => 
          btn.dataset.year === year
        );
        if (!isYearActive) return;
      }

      const modal = document.createElement('div');
      modal.className = 'track-modal';
      
      const formattedDate = date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

      modal.innerHTML = `
        <button class="close-button">&times;</button>
  <p><strong>Traccia:</strong> ${trackName}</p>
  <p><strong>Artista:</strong> ${artist}</p>
  <p><strong>Album:</strong> ${album}</p>
  <p><strong>Giorno:</strong> ${formattedDate}</p>
  <p><strong>Ora:</strong> ${time}</p>
  <a href="${spotifyUrl}" target="_blank" class="spotify-button">Ascolta su Spotify</a>
      `;

      document.body.appendChild(modal);

      const closeButton = modal.querySelector('.close-button');
      closeButton.addEventListener('click', () => {
        modal.remove();
      });
    });

    container.appendChild(div);
  });
}

   function createYearButtons() {
  const sidebar = document.getElementById('sidebar');
  
  for (let year in years) {
    const btn = document.createElement('button');
    btn.className = 'year-button';
    btn.style.setProperty('--year-color', years[year].color);
    btn.style.flex = 'none';
    btn.style.height = `${years[year].height}%`;
    btn.dataset.year = year;

    const yearText = document.createElement('span');
    yearText.textContent = year;
    yearText.style.color = years[year].color;
    yearText.style.fontSize = '12px';
    yearText.style.position = 'absolute';
    yearText.style.left = '4px';
    yearText.style.top = '2px';
    yearText.style.pointerEvents = 'none';
    btn.appendChild(yearText);

    btn.addEventListener('click', () => {
      // Ottieni tutti i pulsanti anno
      const allYearButtons = document.querySelectorAll('.year-button');
      
      // Se il pulsante cliccato è già attivo, disattivalo
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        document.getElementById('year-stats-box').style.display = 'none';
        
        // Ripristina l'opacità delle tracce dell'anno
        const sliderValue = document.getElementById('opacitySlider').value / 100;
        document.querySelectorAll(`.track[data-year="${year}"]`)
          .forEach(track => track.style.opacity = sliderValue.toString());
      } else {
        // Disattiva tutti gli altri pulsanti
        allYearButtons.forEach(yearBtn => {
          if (yearBtn !== btn && yearBtn.classList.contains('active')) {
            yearBtn.classList.remove('active');
            // Ripristina l'opacità delle tracce degli altri anni
            const otherYear = yearBtn.dataset.year;
            const sliderValue = document.getElementById('opacitySlider').value / 100;
            document.querySelectorAll(`.track[data-year="${otherYear}"]`)
              .forEach(track => track.style.opacity = sliderValue.toString());
          }
        });
        
        // Attiva il pulsante cliccato
        btn.classList.add('active');
        showYearStats(year);
        
        // Imposta l'opacità massima per le tracce dell'anno selezionato
        document.querySelectorAll(`.track[data-year="${year}"]`)
          .forEach(track => track.style.opacity = '1');
      }
    });

    sidebar.appendChild(btn);
  }
}

async function showYearStats(year) {
  const response = await fetch(`dataset/recap_${year}.json`);
  const data = await response.json();

  // Funzione helper per troncare il testo
  const truncate = (text, limit) => {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  // Funzioni helper per creare i link di ricerca Spotify
  const createSpotifyArtistLink = (artist) => {
    return `https://open.spotify.com/search/${encodeURIComponent(artist)}/artists`;
  };

  const createSpotifyAlbumLink = (album) => {
    return `https://open.spotify.com/search/${encodeURIComponent(album)}/albums`;
  };

  // Funzione helper per formattare la data in italiano
  const formatDateItalian = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                   'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const box = document.getElementById('year-stats-box');
  box.innerHTML = `
    <h3>Statistiche ${year}</h3>
    
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Ascolti totali</span>
        <span class="stat-value">${data.ascolti_totali}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Minuti totali</span>
        <span class="stat-value">${data.minuti_totali}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Artisti unici</span>
        <span class="stat-value">${data.artisti_unici}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Giorno più attivo</span>
        <span class="stat-value">${formatDateItalian(data.giorno_piu_ascolti.data)}</span>
      </div>
    </div>

    <div class="stats-lists">
      <div class="stats-list">
        <div class="stats-list-title">Top 10 tracce</div>
        <ul>
          ${data.top_10_canzoni.map(t => `
            <li>
              <a href="${t.link}" target="_blank">${truncate(t.track, 20)}</a>
              <div style="color: #888888">
                <a href="${createSpotifyArtistLink(t.artist)}" target="_blank" style="color: #888888">${truncate(t.artist, 15)}</a> • ${t.plays}×
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="stats-list">
        <div class="stats-list-title">Top 10 artisti</div>
        <ul>
          ${data.top_10_artisti.map(a => `
            <li>
              <a href="${createSpotifyArtistLink(a.artist)}" target="_blank">${truncate(a.artist, 20)}</a>
              <div style="color: #888888">${a.minuti} min</div>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="stats-list">
        <div class="stats-list-title">Top 10 album</div>
        <ul>
          ${data.top_10_album.map(a => `
            <li>
              <a href="${createSpotifyAlbumLink(a.album)}" target="_blank">${truncate(a.album, 20)}</a>
              <div style="color: #888888">
                <a href="${createSpotifyArtistLink(a.artist)}" target="_blank" style="color: #888888">${truncate(a.artist, 15)}</a> • ${a.minuti} min
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;

  box.style.display = 'block';
}

    

      function createMonthButtons() {
  const monthsContainer = document.getElementById('months-container');
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const usableWidth = canvasWidth - marginX * 2 - rightPadding;

  monthNames.forEach((month, index) => {
    const btn = document.createElement('button');
    btn.className = 'month-button';
    btn.textContent = month;
    
    monthsContainer.appendChild(btn);

    // Usiamo la stessa formula di posizionamento X delle tracce
    const x = (index + 0.5) * (usableWidth / months) + marginX + 20;
    btn.style.left = `${x}px`;
    btn.dataset.originalX = x;
  });

  const container = document.getElementById('canvas-container');
  container.addEventListener('scroll', () => {
    const scrollLeft = container.scrollLeft;
    document.querySelectorAll('.month-button').forEach(btn => {
      const originalX = parseFloat(btn.dataset.originalX);
      btn.style.left = `${originalX - scrollLeft}px`;
    });
  });
}



function setupMonthFiltering() {
  const monthButtons = document.querySelectorAll('.month-button');
  const tracks = document.querySelectorAll('.track');
  const yearsOrder = Object.keys(years).sort();
  const usableWidth = canvasWidth - marginX * 2 - rightPadding;
  const sidebar = document.getElementById('sidebar');
  const opacityControl = document.querySelector('.opacity-control');
  const heatmapButton = document.getElementById('heatmapToggle');
  let selectedMonth = null;

  const yearLabelsContainer = document.createElement('div');
  yearLabelsContainer.id = 'year-labels-container';
  document.body.appendChild(yearLabelsContainer);

  yearsOrder.forEach((year, index) => {
    const label = document.createElement('div');
    label.className = 'year-label';
    label.textContent = year;
    label.style.color = years[year].color;
    yearLabelsContainer.appendChild(label);
  });

  monthButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      if (selectedMonth === index) {
        // Ritorna alla visualizzazione iniziale
        document.getElementById('canvas-container').classList.remove('month-view');
        sidebar.style.opacity = '1';
        sidebar.style.pointerEvents = 'auto';
        opacityControl.style.opacity = '1';
        opacityControl.style.pointerEvents = 'auto';
        heatmapButton.style.opacity = '1';
        heatmapButton.style.pointerEvents = 'auto';

        // Ripristina tutti i pulsanti dei mesi
        monthButtons.forEach((btn) => {
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          btn.style.left = btn.dataset.originalX + 'px';
          btn.classList.remove('fixed');
        });

        // Nascondi le etichette degli anni
        document.querySelectorAll('.year-label').forEach(label => {
          label.style.opacity = '0';
        });

        // Ripristina la posizione originale delle tracce
        tracks.forEach(track => {
          const date = new Date(track.dataset.timestamp);
          const month = date.getUTCMonth();
          const x = (month + 0.5) * (usableWidth / months) + marginX + 20;
          
          track.style.transition = 'left 0.8s ease, transform 0.8s ease, top 0.8s ease';
          track.style.left = `${x}px`;
          track.style.top = track.dataset.originalTop;
          track.style.opacity = '0.05';
          track.style.pointerEvents = 'none';
        });

        selectedMonth = null;

      } else {
        // Attiva la visualizzazione del mese
        selectedMonth = index;
        document.getElementById('canvas-container').classList.add('month-view');
        sidebar.style.opacity = '0';
        sidebar.style.pointerEvents = 'none';
        opacityControl.style.opacity = '0';
        opacityControl.style.pointerEvents = 'none';
        heatmapButton.style.opacity = '0';
        heatmapButton.style.pointerEvents = 'none';

        // Posiziona il pulsante del mese cliccato
        monthButtons.forEach((btn, idx) => {
          if (idx === index) {
            btn.style.left = `${marginX + 20}px`;
            btn.style.transition = 'left 0.8s ease';
            btn.classList.add('fixed');
          } else {
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
          }
        });

        // Mostra e posiziona le etichette degli anni
        const yearLabels = document.querySelectorAll('.year-label');
        yearLabels.forEach((label, idx) => {
          const columnWidth = usableWidth / yearsOrder.length * 0.5;
          const labelX = marginX + 118 + (idx + 0.5) * columnWidth;
          
          label.style.left = `${labelX}px`;
          label.style.top = '13px';
          label.style.opacity = '1';
          
          requestAnimationFrame(() => {
            const adjustment = label.offsetWidth / 2;
            label.style.left = `${labelX - adjustment}px`;
          });
        });

        // Gestisci le tracce
        tracks.forEach(track => {
          const trackDate = new Date(track.dataset.timestamp);
          const trackMonth = trackDate.getUTCMonth();
          const trackYear = trackDate.getUTCFullYear().toString();

          if (trackMonth === selectedMonth) {
            track.style.opacity = '1';
            track.style.pointerEvents = 'auto';

            const yearIndex = yearsOrder.indexOf(trackYear);
            const columnWidth = usableWidth / yearsOrder.length * 0.5;
            const newX = marginX + 100 + (yearIndex + 0.5) * columnWidth;
            const currentY = parseFloat(track.style.top);
            const newY = currentY * 2.5;

            track.style.transition = 'left 0.8s ease, transform 0.8s ease, top 0.8s ease';
            track.style.left = `${newX}px`;
            track.style.top = `${newY}px`;
            track.style.transform = 'translateX(0)';
          } else {
            track.style.opacity = '0';
            track.style.pointerEvents = 'none';
          }
        });
      }
    });
  });
}









function calculateDensity(tracks) {
  const densityMap = new Map();
  const gridSize = 10; // Ridotto da 30 a 10 per avere celle più piccole
  
  tracks.forEach(track => {
    if (track.style.opacity !== '0') {
      const x = Math.floor(parseFloat(track.style.left));
      const y = Math.floor(parseFloat(track.style.top) / gridSize);
      const month = new Date(track.dataset.timestamp).getMonth();
      const key = `${month}-${x}-${y}`;
      densityMap.set(key, (densityMap.get(key) || 0) + 1);
    }
  });
  
  // Normalizza i valori di densità
  const densities = Array.from(densityMap.values());
  const maxDensity = Math.max(...densities);
  const minDensity = Math.min(...densities);
  
  // Crea una nuova mappa con valori normalizzati
  const normalizedMap = new Map();
  densityMap.forEach((value, key) => {
    // Usa una scala logaritmica per evidenziare meglio le differenze
    const normalized = Math.log(value + 1) / Math.log(maxDensity + 1);
    normalizedMap.set(key, normalized);
  });
  
  return { densityMap: normalizedMap, maxDensity: 1 };
}

function getHeatmapColor(density, maxDensity) {
  // Manteniamo il rosso sempre al massimo (255)
  const red = 255;
  // Il verde varia da 0 (rosso) a 255 (giallo)
  const green = Math.floor((1 - density) * 255);
  // Il blu rimane a 0 per mantenere la scala rosso-giallo
  const blue = 0;
  
  return `rgb(${red}, ${green}, ${blue})`;
}

function toggleHeatmap() {
  const button = document.getElementById('heatmapToggle');
  const opacityControl = document.querySelector('.opacity-control');
  const trackElements = document.querySelectorAll('.track');
  const isHeatmapActive = button.classList.toggle('active');
  
  if (isHeatmapActive) {
    button.textContent = 'Disattiva heatmap';
    opacityControl.classList.add('shifted');
    colorConfigToggle.classList.add('shifted');
    colorConfigBox.classList.add('shifted');
    document.querySelector('.save-button').classList.add('shifted');
    document.querySelector('.about-button').classList.add('shifted');
    document.querySelector('.import-button').classList.add('shifted');
    
    const { densityMap, maxDensity } = calculateDensity(Array.from(trackElements));
    
    trackElements.forEach(track => {
      if (track.style.opacity !== '0') {
        const x = Math.floor(parseFloat(track.style.left));
        const y = Math.floor(parseFloat(track.style.top) / 30);
        const month = new Date(track.dataset.timestamp).getMonth();
        const key = `${month}-${x}-${y}`;
        const density = densityMap.get(key) || 1;
        track.style.color = getHeatmapColor(density, maxDensity);
      }
    });
  } else {
    button.textContent = 'Attiva heatmap';
    opacityControl.classList.remove('shifted');
    colorConfigToggle.classList.remove('shifted');
    colorConfigBox.classList.remove('shifted');
    document.querySelector('.save-button').classList.remove('shifted');
    document.querySelector('.about-button').classList.remove('shifted');
    document.querySelector('.import-button').classList.remove('shifted');
    
    trackElements.forEach(track => {
      const year = track.dataset.year;
      track.style.color = years[year]?.color || '#ffffff';
    });
  }
}


function updateCoordinates(e) {
  const container = document.getElementById('canvas-container');
  const box = document.getElementById('coordinatesBox');
  const rect = container.getBoundingClientRect();
  
  const mouseX = e.clientX + container.scrollLeft - rect.left;
  const mouseY = e.clientY + container.scrollTop - rect.top;
  
  // Trova la traccia più vicina al mouse
  const tracks = document.querySelectorAll('.track');
  let closestTrack = null;
  let minDistance = Infinity;
  
  tracks.forEach(track => {
    if (track.style.opacity !== '0') {
      const trackX = parseFloat(track.style.left);
      const trackY = parseFloat(track.style.top);
      const distance = Math.sqrt(
        Math.pow(mouseX - trackX, 2) + 
        Math.pow(mouseY - trackY, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestTrack = track;
      }
    }
  });
  
  // Mostra sempre la traccia più vicina
  if (closestTrack) {
    const timestamp = closestTrack.dataset.timestamp;
    const date = new Date(timestamp);
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate();
    
    const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                       'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
    const month = monthNames[date.getMonth()];
    
    box.textContent = `${closestTrack.textContent} • ${hours}:${minutes} • ${day} ${month}`;
  } else {
    // Questo caso si verifica solo se non ci sono tracce visibili
    box.textContent = 'Nessuna traccia visibile';
  }
}






function setupOpacityControl() {
  const slider = document.getElementById('opacitySlider');
  const value = document.getElementById('opacityValue');
  
  function updateOpacity() {
    const opacity = slider.value / 100;
    value.textContent = `${slider.value}%`;
    
    // Aggiorna solo le tracce degli anni non attivi
    document.querySelectorAll('.track').forEach(track => {
      const yearButton = document.querySelector(`.year-button[data-year="${track.dataset.year}"]`);
      const isYearActive = yearButton && yearButton.classList.contains('active');
      
      if (isYearActive) {
        track.style.opacity = '1'; // Forza opacità 1 per gli anni attivi
      } else {
        track.style.opacity = opacity.toString();
      }
    });
  }
  
  slider.addEventListener('input', updateOpacity);
  return updateOpacity;
}



// Aggiungi dopo le altre funzioni
function setupColorConfiguration() {
  const toggle = document.getElementById('colorConfigToggle');
  const box = document.getElementById('colorConfigBox');
  const inputsContainer = document.getElementById('colorInputs');
  const updateButton = document.getElementById('updateColors');


  Object.entries(years).forEach(([year, data]) => {
    const group = document.createElement('div');
    group.className = 'color-input-group';
    
    const label = document.createElement('label');
    label.textContent = year;
    
    const inputWrapper = document.createElement('div');
    inputWrapper.style.display = 'flex';
    inputWrapper.style.alignItems = 'center';
    inputWrapper.style.gap = '4px';
    
    const hashSymbol = document.createElement('span');
    hashSymbol.textContent = '#';
    hashSymbol.style.color = '#ffffff';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = data.color.substring(1);
    input.dataset.year = year;
    input.maxLength = 6;
    input.style.width = '60px';
    
    // Aggiungi il color picker
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = data.color;
    colorPicker.className = 'color-picker';
    colorPicker.style.width = '20px';
    colorPicker.style.height = '20px';
    colorPicker.style.padding = '0';
    colorPicker.style.border = '0.2px solid #ffffff';
    colorPicker.style.backgroundColor = 'black';
    colorPicker.style.cursor = 'pointer';
    
    // Sincronizza il color picker con l'input text
    colorPicker.addEventListener('input', (e) => {
      input.value = e.target.value.substring(1).toUpperCase();
    });
    
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9a-fA-F]/g, '');
      if (e.target.value.length === 6) {
        colorPicker.value = '#' + e.target.value;
      }
    });
    
    inputWrapper.appendChild(hashSymbol);
    inputWrapper.appendChild(input);
    inputWrapper.appendChild(colorPicker);
    group.appendChild(label);
    group.appendChild(inputWrapper);
    inputsContainer.appendChild(group);
  });

  // Toggle visibilità
  toggle.addEventListener('click', () => {
    const isVisible = box.style.display === 'none';
    box.style.display = isVisible ? 'block' : 'none';
    toggle.classList.toggle('active'); // Aggiunge/rimuove la classe active
  });

  // Aggiorna colori
  updateButton.addEventListener('click', () => {
    const inputs = box.querySelectorAll('input');
    inputs.forEach(input => {
      const year = input.dataset.year;
      const newColor = '#' + input.value; // Aggiungi # al valore
      
      // Verifica che il colore sia valido (6 caratteri esadecimali)
      if (/^#[0-9a-fA-F]{6}$/.test(newColor)) {
        // Aggiorna l'oggetto years
        years[year].color = newColor;
        
        // Aggiorna i colori delle tracce
        document.querySelectorAll(`.track[data-year="${year}"]`)
          .forEach(track => {
            if (!document.getElementById('heatmapToggle').classList.contains('active')) {
              track.style.color = newColor;
            }
          });
        
        // Aggiorna il colore del pulsante anno
        const yearButton = document.querySelector(`.year-button[data-year="${year}"]`);
        yearButton.style.setProperty('--year-color', newColor);
        const yearText = yearButton.querySelector('span');
        yearText.style.color = newColor;
      }
    });
  });
}




function setupSaveButton() {
  const saveButton = document.getElementById('saveButton');
  
  saveButton.addEventListener('click', async () => {
    // Nascondi temporaneamente i controlli
    const elementsToHide = document.querySelectorAll('.opacity-control, .coordinates-box, .color-config-toggle, .save-button, .heatmap-toggle');
    elementsToHide.forEach(el => el.style.display = 'none');

    try {
      // Cattura solo la parte visibile del canvas
      const container = document.getElementById('canvas-container');
      const canvas = await html2canvas(container, {
        backgroundColor: '#000000',
        scale: 1, // Scala ridotta per performance
        logging: false,
        width: container.clientWidth,
        height: container.clientHeight,
        windowWidth: container.clientWidth,
        windowHeight: container.clientHeight
      });

      // Crea il link di download
      const link = document.createElement('a');
      link.download = `spotify-map-${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    } finally {
      // Ripristina i controlli
      elementsToHide.forEach(el => el.style.display = '');
    }
  });
}


function showAboutModal() {
  // Crea l'overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  // Aggiungi uno stile più forte all'overlay per bloccare le interazioni
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(0.1px);
    z-index: 1999;
    pointer-events: auto;
  `;

  // Crea il modal
  const modal = document.createElement('div');
  modal.className = 'about-modal';
  
  modal.innerHTML = `
  <h2>Spotify Memory Map [LAB III]</h2>
  <p>
    Questa visualizzazione interattiva rappresenta il mio viaggio musicale su Spotify dal 2016 al 2025.
    Ogni punto sulla mappa è una canzone ascoltata, posizionata in base al mese (orizzontalmente) 
    e all'ora del giorno (verticalmente), con colori distintivi per ogni anno.
  </p>
  <p>
    <strong>Esplora i dati:</strong>
    <br>• Seleziona un anno dalla barra laterale per vedere statistiche dettagliate
    <br>• Clicca su un mese per una vista espansa degli ascolti di quel periodo
    <br>• Interagisci con i punti per vedere dettagli sulla traccia
    <br>• Consulta il box "Set di dati" per statistiche globali e grafici orari
  </p>
  <p>
    <strong>Personalizza la visualizzazione:</strong>
    <br>• Regola l'opacità dei punti con lo slider
    <br>• Attiva la heatmap per vedere le zone di ascolto più intense
    <br>• Modifica i colori degli anni dalla paletta cromatica
    <br>• Salva un'immagine della tua visualizzazione
  </p>
  <p>
    Un progetto di data visualization che trasforma 10 anni di ascolti musicali in una mappa della memoria,
    sviluppato da Tommaso Stanga per il corso Lab III presso SUPSI.
  </p>
  <button class="github-button" onclick="window.open('https://github.com/tommifunky/LAB_3', '_blank')">
    Visita la repository
  </button>
  <button class="close-button">Chiudi</button>
`;

  // Aggiungi i componenti al DOM
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Gestisci la chiusura del modal
  const closeButton = modal.querySelector('.close-button');
  const closeModal = () => {
    modal.remove();
    overlay.remove();
    document.getElementById('aboutButton').classList.remove('active');
    
  };

  closeButton.addEventListener('click', closeModal);
}


// Modifica la funzione setupAboutButton
function setupAboutButton() {
  const aboutButton = document.getElementById('aboutButton');
  
  // Mostra l'about modal all'avvio
  aboutButton.classList.add('active');
  showAboutModal();

  aboutButton.addEventListener('click', () => {
    const existingModal = document.querySelector('.about-modal');
    
    if (existingModal) {
      existingModal.remove();
      document.querySelector('.modal-overlay')?.remove();
      aboutButton.classList.remove('active');
    } else {
      aboutButton.classList.add('active');
      showAboutModal();
    }
  });
}

function createClockChart(container, orariData, startHour, endHour, title) {
  const chartWrapper = document.createElement('div');
  chartWrapper.style.textAlign = 'center';
  
  const titleDiv = document.createElement('div');
  titleDiv.className = 'chart-title';
  titleDiv.textContent = title;
  chartWrapper.appendChild(titleDiv);

  const clockChart = document.createElement('div');
  clockChart.className = 'clock-chart';
  
  // Crea il cerchio di base
  const circle = document.createElement('div');
  circle.className = 'clock-circle';
  clockChart.appendChild(circle);
  
  // Filtra i dati per le ore specificate
  const relevantHours = Object.entries(orariData)
    .filter(([hour]) => {
      const h = parseInt(hour);
      return h >= startHour && h < endHour;
    });
  
  const maxAscolti = Math.max(...relevantHours.map(([_, data]) => data.ascolti));
  
  // Crea le barre per ogni ora
  for (let i = startHour; i < endHour; i++) {
    const hourData = orariData[i] || { ascolti: 0 };
    const normalizedHour = i - startHour;
    const angle = (normalizedHour * (360 / (endHour - startHour))) - 90;
    
    // Crea la barra degli ascolti
    const hourBar = document.createElement('div');
    hourBar.className = 'hour-bar';
    const height = (hourData.ascolti / maxAscolti) * 50; // 50px altezza massima
    hourBar.style.height = `${height}px`;
    hourBar.style.transform = `rotate(${angle}deg) translateY(-50%)`;
    hourBar.title = `${i}:00 - ${hourData.ascolti.toLocaleString()} ascolti`;
    clockChart.appendChild(hourBar);

    // Aggiungi le etichette delle ore
    const label = document.createElement('div');
    label.className = 'hour-label';
    label.textContent = i.toString().padStart(2, '0');
    const labelAngle = angle + 90;
    const labelRadius = 65;
    label.style.left = `${50 + labelRadius * Math.cos(angle * Math.PI / 180)}%`;
    label.style.top = `${50 + labelRadius * Math.sin(angle * Math.PI / 180)}%`;
    label.style.transform = 'translate(-50%, -50%)';
    clockChart.appendChild(label);
  }

  chartWrapper.appendChild(clockChart);
  container.appendChild(chartWrapper);
}


function showDatasetInfo() {
  Promise.all([
    fetch('dataset/orari.json').then(res => res.json()),
    fetch('dataset/tempi_medi.json').then(res => res.json())
  ]).then(([orariData, tempiMediData]) => {
    const metadataBoxes = document.createElement('div');
    metadataBoxes.className = 'metadata-boxes';

    // Calcola le statistiche
    const totaleAscolti = Object.values(orariData).reduce((acc, curr) => acc + curr.ascolti, 0);
    const totaleMinuti = Object.values(orariData).reduce((acc, curr) => acc + curr.minuti, 0);
    const oreMusicaGiorno = (tempiMediData.minuti_medi_giornalieri / 60).toFixed(1);
    const maxAscolti = Math.max(...Object.values(orariData).map(d => d.ascolti));
    const oraPiuAttiva = Object.entries(orariData)
      .reduce((acc, [ora, data]) => data.ascolti > acc.ascolti ? {ora, ascolti: data.ascolti} : acc, {ascolti: 0});

    // Crea un unico box che contiene tutte le informazioni
    const datasetBox = document.createElement('div');
    datasetBox.className = 'metadata-box';
    datasetBox.innerHTML = `
      <h4>La storia degli ascolti di Tommifunky</h4>
      <p style="color: #ffffff; margin: 8px 0; line-height: 1.4;">
        Questa visualizzazione rappresenta ${totaleAscolti.toLocaleString()} ascolti registrati 
        su Spotify nell'arco di ${tempiMediData.giorni_totali_ascoltati} giorni, 
        per un totale di ${Math.floor(totaleMinuti/60).toLocaleString()} ore di musica.
      </p>
      <div class="metadata-stat">
        <span>Ore di musica al giorno</span>
        <span>${oreMusicaGiorno}h</span>
      </div>
      <div class="metadata-stat">
        <span>Brani ascoltati al giorno</span>
        <span>${tempiMediData.brani_medi_giornalieri}</span>
      </div>
      <div class="metadata-stat">
        <span>Durata media brano</span>
        <span>${Math.floor(tempiMediData.durata_media_brano / 60)}:${(tempiMediData.durata_media_brano % 60).toString().padStart(2, '0')}</span>
      </div>
      
      <h4 style="margin-top: 16px;">Distribuzione oraria degli ascolti</h4>
      
      <div style="display: flex; gap: 20px; margin-top: 16px;">
        <!-- Grafico mattina -->
        <div style="flex: 1;">
          <h4 style="color: #ffffff; font-size: 12px; margin-bottom: 8px;">Mattina (00:00 - 11:00)</h4>
          <div class="metadata-chart">
            ${Object.entries(orariData)
              .filter(([ora]) => parseInt(ora) < 12)
              .map(([ora, data]) => `
                <div class="chart-column">
                  <div class="metadata-bar" 
                       style="height: ${(data.ascolti / maxAscolti * 100)}px" 
                       title="${ora}:00 - ${data.ascolti.toLocaleString()} ascolti"></div>
                  <span class="hour-label" style="color: #888; font-size: 10px;">${ora}</span>
                </div>
              `).join('')}
          </div>
        </div>
        
        <!-- Grafico sera -->
        <div style="flex: 1;">
          <h4 style="color: #ffffff; font-size: 12px; margin-bottom: 8px;">Sera (12:00 - 23:00)</h4>
          <div class="metadata-chart">
            ${Object.entries(orariData)
              .filter(([ora]) => parseInt(ora) >= 12)
              .map(([ora, data]) => `
                <div class="chart-column">
                  <div class="metadata-bar" 
                       style="height: ${(data.ascolti / maxAscolti * 100)}px" 
                       title="${ora}:00 - ${data.ascolti.toLocaleString()} ascolti"></div>
                  <span class="hour-label" style="color: #888; font-size: 10px;">${ora}</span>
                </div>
              `).join('')}
          </div>
        </div>
      </div>
    `;

    metadataBoxes.appendChild(datasetBox);
    document.body.appendChild(metadataBoxes);
  });
}

// Aggiungi l'event listener per il pulsante dataset
document.getElementById('datasetButton').addEventListener('click', () => {
  const button = document.getElementById('datasetButton');
  const existingBox = document.querySelector('.metadata-boxes');
  
  if (existingBox) {
    existingBox.remove();
    button.classList.remove('active');
  } else {
    button.classList.add('active');
    showDatasetInfo();
  }
});



function setupImportButton() {
  const importButton = document.getElementById('importButton');
  
  importButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true;
    input.style.display = 'none';
    
    input.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      
      for (const file of files) {
        try {
          const content = await file.text();
          const data = JSON.parse(content);
          const year = file.name.match(/\d{4}/)?.[0]; // Estrae l'anno dal nome del file
          
          if (year && data) {
            cachedData[year] = data;
            console.log(`Importato file per l'anno ${year}`);
          }
        } catch (error) {
          console.error(`Errore nell'importazione del file ${file.name}:`, error);
        }
      }
      
      // Aggiorna le tracce e ridisegna la visualizzazione
      tracks = Object.values(cachedData).flat();
      document.querySelectorAll('.track').forEach(track => track.remove());
      createTrackElements();
    });
    
    input.click();
  });
}


// Modifica l'event listener del DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  await preloadAllData();
  createYearButtons();
  createTrackElements();
  createMonthButtons();
  setupMonthFiltering();
  setupColorConfiguration();
  setupSaveButton();
  setupImportButton();

  
  const updateOpacity = setupOpacityControl();
  
  document.getElementById('heatmapToggle').addEventListener('click', toggleHeatmap);
  document.getElementById('canvas-container').addEventListener('mousemove', updateCoordinates);
  
  // Mostra l'about all'avvio come ultima cosa
  setupAboutButton();
});
