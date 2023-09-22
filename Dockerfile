FROM node:14.21.3 AS builder

RUN mkdir /usr/app
WORKDIR /usr/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
ENV PATH /usr/src/app/node/modules/.bin:$PATH
RUN npm run build --production

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /usr/app/build .
ENTRYPOINT ["nginx", "-g", "daemon off;"]