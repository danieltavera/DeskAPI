FROM node:20-alpine
WORKDIR /app

# root package.json is shared by all 3 services (single package.json decision)
COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY reservation-service ./reservation-service

EXPOSE 3002
CMD ["node", "reservation-service/src/server.js"]
