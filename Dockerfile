FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm install --save-dev -g ts-node

CMD ["npm", "run", "dev"]
