FROM node:18.12.1-buster-slim AS builder

RUN mkdir /usr/app
WORKDIR /usr/app
COPY . /usr/app
RUN yarn
ENV PATH /usr/src/app/node/modules/.bin:$PATH
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=buider /usr/app/build .
ENTRYPOINT ["nginx", "-g", "daemon off;"]