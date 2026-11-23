FROM node:22-alpine
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
RUN npm run build
EXPOSE 3000
CMD ["npm","start"]
