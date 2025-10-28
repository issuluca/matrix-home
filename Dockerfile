FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production

COPY . .

# create data dir and set permissions
RUN mkdir -p /app/data && chown -R node:node /app/data

USER node

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
