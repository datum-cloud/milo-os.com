FROM oven/bun:1.3-slim AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY . .
RUN bun run build

FROM base AS development
COPY . .

ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=4321
RUN chmod -R 755 src/pages

EXPOSE 4321
CMD ["bun", "run", "dev"]

FROM oven/bun:1.3-slim AS production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lock ./
# COPY --from=build /app/src/pages ./src/pages
# RUN chmod -R 755 src/pages
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

CMD ["bun", "./dist/server/entry.mjs"]
