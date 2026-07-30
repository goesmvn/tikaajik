FROM node:22-alpine AS builder
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist
EXPOSE 8787
ENV PORT=8787
CMD ["sh", "-c", "mkdir -p server/data && node server/index.js"]
