FROM node:13-alpine

WORKDIR /work

COPY package.json package-lock.json /work/

RUN npm i

COPY tsconfig.json nest-cli.json .eslintrc.js jest.config.json /work/
COPY ./src /work/src
