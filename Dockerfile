# hive-mcp-gateway Dockerfile
FROM node:20-alpine
WORKDIR /app

# Install dependencies first for layer caching
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy app source
COPY gateway.js ./
COPY servers ./servers

EXPOSE 3000
ENV PORT=3000
CMD ["node", "gateway.js"]
