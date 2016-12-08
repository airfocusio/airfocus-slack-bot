FROM node:7.2.0-alpine
MAINTAINER Christian Hoffmeister <mail@choffmeister.de>

WORKDIR /opt/airfocus-slack-bot
COPY . .
RUN npm install --production --quiet && rm -rf /root/.npm /tmp/*

EXPOSE 8080
CMD ["node", "index.js"]
