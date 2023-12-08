FROM node:18

RUN mkdir -p /home/app

WORKDIR  /home/app

COPY . .

RUN npm install

RUN npm run build

WORKDIR /home/app/deploy

RUN npm install

EXPOSE 5000

CMD ["npm","start"]