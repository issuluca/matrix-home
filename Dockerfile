FROM node:20-alpine

# Metadata
LABEL maintainer="issuluca"
LABEL description="A Matrix-style homepage to manage your personal links"
LABEL version="1.0.0"

WORKDIR /app

# Copia i file di configurazione
COPY package.json ./

# Installa le dipendenze
RUN npm install --production

# Copia i file dell'applicazione
COPY server.js ./
COPY public ./public

# Crea la directory data se non esiste (sarà usata come volume)
RUN mkdir -p data

# Espone la porta
EXPOSE 8070

# Variabili d'ambiente di default
ENV PORT=8070

# Healthcheck per monitorare lo stato del container
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8070/check-setup', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Avvia l'applicazione
CMD ["node", "server.js"]