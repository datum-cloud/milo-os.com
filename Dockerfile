# Stage 1: Dependencies
FROM oven/bun:1.2-slim as deps

WORKDIR /app

# Copy package manager files to leverage Docker cache
COPY package.json bun.lock ./

# Install all dependencies using the lockfile for a reproducible build
RUN bun install --frozen-lockfile

# Stage 2: Builder (for production build)
FROM deps as builder

# Copy the rest of the source files
COPY . .

# Build the application
RUN bun run build

# Stage 3: Development (for local development)
FROM deps as development

# Copy the rest of the source files
COPY . .

# Install curl (if needed for healthchecks or debugging)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set development environment
ENV NODE_ENV=development
ENV HOST=0.0.0.0
# The port is set via the `dev` script in package.json

# Expose the application port
EXPOSE 4321

# Start development server (command is inherited from base image, but we override)
CMD ["bun", "run", "dev"]

# Stage 4: Production
FROM oven/bun:1.2-slim as production

WORKDIR /app

# Install curl (if needed for healthchecks or debugging)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy build artifacts and production dependencies from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies using the lockfile
RUN bun install --production --frozen-lockfile

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Expose the application port
EXPOSE 4321

# Start the application
CMD ["node", "./dist/server/entry.mjs"] 