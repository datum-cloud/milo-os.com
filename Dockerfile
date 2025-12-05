FROM oven/bun:1.3-slim AS base
ENV HOST=0.0.0.0
ENV PORT=4321
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY . .
RUN bun run build

FROM base AS development
ENV NODE_ENV=development
COPY . .
RUN chmod -R 755 src/pages

EXPOSE 4321
CMD ["bun", "run", "dev"]

FROM oven/bun:1.3-slim AS production
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lock ./

EXPOSE 4321
CMD ["bun", "./dist/server/entry.mjs"]
