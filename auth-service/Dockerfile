FROM node:20-alpine
WORKDIR /app

# root package.json is shared by all 3 services (single package.json decision)
COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY auth-service ./auth-service

EXPOSE 3001
CMD ["node", "auth-service/src/server.js"]
