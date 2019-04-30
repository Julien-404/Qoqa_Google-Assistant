FROM node:latest
COPY . /app
RUN cd /app && npm install
CMD node index.js

EXPOSE 3000