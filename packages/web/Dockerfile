# Use official Node.js image as the base
FROM node:22-alpine AS deps

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package.json ./
COPY package-lock.json ./

RUN npm install --frozen-lockfile --ignore-scripts

FROM node:22-alpine AS builder

WORKDIR /app

COPY tsconfig.json ./
COPY vite.config.docker.ts ./
COPY postcss.config.mjs ./
COPY panda.config.ts ./

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/package-lock.json ./

# Copy source files
COPY src ./src
COPY public ./public

RUN npm run prepare
# Build the application
RUN npm run build:docker

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Copy built assets and necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

COPY --from=builder /app/.output ./.output

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["npm", "run", "start"]
