FROM node:20-alpine AS build

WORKDIR /opt/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache vips-dev

WORKDIR /opt/app

ENV NODE_ENV=production

# Copy built application
COPY --from=build /opt/app ./

EXPOSE 1337

CMD ["npm", "run", "start"]
