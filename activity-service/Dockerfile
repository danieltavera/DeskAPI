FROM node:20-alpine
WORKDIR /app

# root package.json is shared by all 3 services (single package.json decision)
COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY activity-service ./activity-service

EXPOSE 3003
CMD ["node", "activity-service/src/server.js"]
