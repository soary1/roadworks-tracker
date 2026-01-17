FROM node:25

RUN npm install -g @ionic/cli native-run cordova-res

WORKDIR /usr/src/app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm install

CMD ["ionic", "serve", "--external", "--host=0.0.0.0", "--port=8100"]
