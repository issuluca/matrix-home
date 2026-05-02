#!/bin/sh
# Fix permessi volume montato dall'host
chown -R node:node /app/data
# Switcha a utente node ed esegui il server
exec su-exec node npm start
