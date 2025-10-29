FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8070

CMD ["node", "server/server.js"]

