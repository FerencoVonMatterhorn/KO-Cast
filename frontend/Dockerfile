FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY . .

RUN ng build --configuration=production

FROM nginx:1.27-alpine AS production

COPY --from=builder app/dist/frontend /usr/share/nginx/html

EXPOSE 80
