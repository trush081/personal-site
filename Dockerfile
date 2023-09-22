FROM node:14.21.3 AS builder

RUN mkdir /usr/app
WORKDIR /usr/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production && mv node_modules ../
COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /usr/app/build .
ENTRYPOINT ["nginx", "-g", "daemon off;"]