# Usa l'ultimissima versione Node 22 su base Alpine
FROM node:22-alpine

# su-exec è il modo corretto su Alpine per cambiare utente nell'entrypoint
RUN apk add --no-cache su-exec

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file delle dipendenze
COPY package*.json ./

# Installa solo le dipendenze di produzione
RUN npm install --production

# Copia tutto il codice
COPY . .

# Crea la cartella data e assegna i permessi all'utente 'node'
RUN mkdir -p /app/data && chown -R node:node /app

# Copia e rendi eseguibile l'entrypoint (gira come root per fixare i permessi del volume)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Espone la porta 8070
EXPOSE 8070

# Entrypoint: fixa permessi volume poi switcha a utente node
ENTRYPOINT ["/entrypoint.sh"]
