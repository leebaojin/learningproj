FROM node:16
#Install app dependency
# COPY package*.json ./
# RUN npm install

COPY . .
EXPOSE 8080
CMD [ "node", "app.js" ]