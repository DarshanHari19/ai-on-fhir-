# frontend/Dockerfile
FROM node:22-alpine AS build
WORKDIR /app

# 1. install deps
COPY package*.json ./
RUN npm ci

# 2. copy the rest of the frontend source
COPY . /app
RUN npm run build            # Next.js build

# ---- runtime image ----
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]
