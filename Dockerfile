FROM node:14.21.3 AS builder

RUN mkdir /usr/app
WORKDIR /usr/app
COPY . .
RUN yarn
RUN yarn build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /usr/app/build .
ENTRYPOINT ["nginx", "-g", "daemon off;"]