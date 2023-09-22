FROM node:14 AS build
WORKDIR /app
COPY . .
RUN npm install
COPY . .
RUN npm run-script build

FROM nginx:latest
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]