FROM node:18-alpine 

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev --silent

COPY --chown=node:node . .

RUN npm run build > /dev/null

EXPOSE 3000

USER node

CMD [ "npm", "start" ]