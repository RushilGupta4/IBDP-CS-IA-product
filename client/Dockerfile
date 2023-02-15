FROM node:18-alpine
WORKDIR .
COPY . .

RUN yarn install
RUN yarn build
RUN apk update && apk add bash
