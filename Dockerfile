FROM node:20-alpine

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

# Avvia l'applicazione
CMD ["node", "server.js"]