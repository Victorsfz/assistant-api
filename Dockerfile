FROM node:16.15.1-alpine3.16 as script
WORKDIR /usr/src/app
COPY package*.json  ./
RUN npm install --prod
COPY . .
CMD [ "npm", "start" ]