FROM node:20-alpine AS build

ARG STRAPI_URL
ARG STRAPI_TOKEN

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV STRAPI_URL=${STRAPI_URL}
ENV STRAPI_TOKEN=${STRAPI_TOKEN}

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
