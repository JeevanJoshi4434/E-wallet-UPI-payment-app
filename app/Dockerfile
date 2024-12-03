FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npm install -g next
COPY . .

RUN npm run build



EXPOSE 3000

CMD [ "npm", "run", "start" ] 
