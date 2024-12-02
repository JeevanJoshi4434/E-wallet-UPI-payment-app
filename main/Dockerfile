FROM node:latest

WORKDIR /usr/src/main

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]
