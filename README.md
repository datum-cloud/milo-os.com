<p align="center">
  <img width="60px" src="docs/assets/logo.png">
  
  <h1 align="center">Milo OS</h1>
</p>

# Milo OS

This repository contains Docker configurations for both development and production environments of the Astro Pure Theme.

> This project uses [Astro Pure Theme](https://astro-pure.js.org), a minimal, elegant theme for Astro powered websites.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/datum-cloud/milo-os.com
cd milo-os.com
```

## Development Environment

The development environment includes:

- Hot-reloading
- Source code watching
- Automatic rebuilds on package changes
- Full development tooling

### Start Development Server

```bash
# Start the development environment
docker compose up dev

# Or run in detached mode
docker compose up dev -d
```

### Watch for Changes

```bash
# Enable file watching for automatic updates
docker compose watch
```

The development server will be available at `http://localhost:3000`

### Development Features

- Source code is mounted as volumes for live updates
- Changes to `src` and `public` directories are synced immediately
- Changes to `package.json` or `bun.lock` trigger automatic rebuilds
- Full access to development tools and dependencies

## Production Environment

The production environment is optimized for performance and security:

- Minimized image size
- Production-only dependencies
- Automatic restart capability

### Start Production Server

```bash
# Build and start the production environment
docker compose up prod -d

# View logs
docker compose logs -f prod
```

The production server will be available at `http://localhost:3000`

## Docker Configuration Details

### Development Configuration

- Uses the `builder` stage from Dockerfile
- Mounts local source code into container
- Provides hot-reloading and live updates
- Includes all development dependencies

### Production Configuration

- Uses the `production` stage from Dockerfile
- Optimized for size and security
- Automatic crash recovery

## Common Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f [service]

# Stop services
docker compose down

# Rebuild images
docker compose build

# Remove all containers and volumes
docker compose down -v
```

## Environment Variables

Default environment variables are set in the `compose.yml` file:

Development:

```yaml
NODE_ENV=development
HOST=0.0.0.0
PORT=3000
```

Production:

```yaml
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
```

To override these variables, create a `.env` file in the project root.

## Troubleshooting

1. **Container won't start:**

   - Check logs: `docker compose logs [service]`
   - Verify port availability: `lsof -i :3000`

2. **Changes not reflecting:**

   - Ensure watch mode is active: `docker compose watch`
   - Rebuild container: `docker compose up -d --build [service]`

3. **Performance issues:**

   - Check container resources: `docker stats`
   - Monitor health status: `docker compose ps`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test in development environment
4. Submit a pull request
