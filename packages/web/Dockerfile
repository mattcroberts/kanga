FROM node:22-alpine AS pruned

WORKDIR /app

RUN npm install --global corepack@latest
RUN corepack enable
RUN corepack prepare pnpm@latest-10 --activate

COPY . .
RUN pnpx turbo prune @kanga/web --docker

FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@latest-10 --activate

COPY --from=pruned /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruned /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm install --prefer-offline --frozen-lockfile
RUN pnpm --filter @kanga/web build:docker

# Production image
FROM gcr.io/distroless/nodejs22-debian12 AS runner

WORKDIR /app

COPY --from=builder /app/packages/web/.output ./.output

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD [".output/server/index.mjs"]
