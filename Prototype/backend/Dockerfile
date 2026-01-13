FROM node:20-alpine

WORKDIR /app

# Copy package files AND prisma schema (needed for postinstall)
COPY package*.json ./
COPY prisma ./prisma/

# Install deps (postinstall will run prisma generate)
RUN npm ci

# Copy rest of source
COPY . .

EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]
