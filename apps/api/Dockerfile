FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
COPY test ./test
USER node
EXPOSE 4000
CMD ["sh","-c","node src/db/migrate.js && node src/db/seed.js && node src/server.js"]
