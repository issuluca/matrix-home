# Matrix Home

Una homepage in stile Matrix per gestire i tuoi link personali con autenticazione sicura.

![Matrix Home](https://img.shields.io/badge/version-1.0.0-green) ![Docker](https://img.shields.io/badge/docker-ready-blue)

## ✨ Caratteristiche

- 🎨 Interfaccia in stile Matrix con effetto pioggia di caratteri
- 🔐 Sistema di autenticazione sicuro con password hashate
- 📝 Gestione completa dei link (Aggiungi, Modifica, Elimina)
- 🔍 Ricerca in tempo reale
- 📱 Design responsive per mobile e desktop
- 💾 Persistenza dei dati tramite volume Docker
- ⚡ Auto-login per 24 ore

## 🚀 Avvio Rapido

### Docker Run

```bash
docker run -d \
  -p 8070:8070 \
  -v matrix-home-data:/app/data \
  --name matrix-home \
  issuluca/matrix-home:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  matrix-home:
    image: issuluca/matrix-home:latest
    container_name: matrix-home
    ports:
      - "8070:8070"
    volumes:
      - matrix-home-data:/app/data
    restart: unless-stopped

volumes:
  matrix-home-data:
```

## 📋 Primo Avvio

1. Avvia il container
2. Visita `http://localhost:8070`
3. Crea il tuo account amministratore (username e password)
4. Inizia a gestire i tuoi link!

## 🔧 Configurazione

### Porta Personalizzata

```bash
docker run -d \
  -p 3000:8070 \
  -v matrix-home-data:/app/data \
  --name matrix-home \
  issuluca/matrix-home:latest
```

### Variabili d'Ambiente

- `PORT`: Porta interna del server (default: 8070)

## 📁 Struttura Dati

I dati sono salvati nel volume Docker in `/app/data`:
- `credentials.json`: Credenziali hashate dell'amministratore
- `links.json`: Database dei link

### Formato Link

```json
{
  "SITO": "NOME SITO",
  "GROUP": "CATEGORIA",
  "LOCAL": "http://link-locale",
  "CLOUD": "http://link-cloud"
}
```

## 🛠️ Build Locale

```bash
# Clone repository
git clone https://github.com/issuluca/matrix-home.git
cd matrix-home

# Build immagine
docker build -t matrix-home .

# Run
docker run -d -p 8070:8070 -v matrix-home-data:/app/data matrix-home
```

## 📦 Backup and Restore

### Using the Web Interface (Recommended)

**Export:**
1. Click the 💾 **Export** button
2. A JSON file will be downloaded with your links
3. Save it in a safe location

**Import:**
1. Click the 📥 **Import** button
2. Select your backup JSON file
3. Confirm to replace all current links

### Using Docker Commands

**Backup:**
```bash
docker cp matrix-home:/app/data ./backup
```

**Restore:**
```bash
docker cp ./backup/. matrix-home:/app/data/
docker restart matrix-home
```

## 🔒 Sicurezza

- Password hashate con SHA-256
- Sessioni con cookie sicuri
- Auto-logout dopo 24 ore di inattività
- Nessuna password in chiaro nel database

## 🐛 Troubleshooting

### Reset Password

Se hai dimenticato la password:

```bash
docker exec matrix-home rm /app/data/credentials.json
docker restart matrix-home
```

Poi visita l'applicazione e riconfigura le credenziali.

## 📝 Licenza

MIT License - Sentiti libero di usare e modificare!

## 🤝 Contributi

Contributi, issues e feature requests sono benvenuti!

## 🙏 Grazie

Questo proggetto è stato realizzato con il contibuto di ChatGpt e Claude Ai.
 
## 📧 Contatti

Per domande o supporto, apri una issue su GitHub.

---

Made with 💚 and Matrix vibes