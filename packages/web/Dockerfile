# Use official Node.js image as the base
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY postcss.config.mjs ./
COPY .prettierignore ./
COPY .gitignore ./

# Copy source files
COPY src ./src
COPY public ./public

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

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