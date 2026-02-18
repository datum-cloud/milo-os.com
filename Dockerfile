FROM oven/bun:1.3-slim AS dependencies
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install

# Build stage
FROM dependencies AS build
COPY . .
RUN bun run build

# Development stage
FROM dependencies AS development
COPY . .
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["bun", "run", "dev"]

# Production stage
FROM oven/bun:1.3-slim AS production
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/bun.lock ./
COPY --from=build /app/package.json ./
COPY --from=build /app/server.mjs ./server.mjs

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321
CMD ["bun", "run", "./server.mjs"]
