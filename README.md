# bokken.io

## Architecture

- **Frontend**: Astro (Static Site Generation)
- **CMS**: Strapi (Headless CMS)
- **Database**: PostgreSQL
- **Server**: Nginx + Docker

## Operation

### Initial operation

Execute `./scripts/init` to start `nginx` with docker

### Update

Execute `./scripts/update` to update your `www` contents.

### Production Deployment

1. Set up environment variables on the server (copy `.env.example` to `.env` and fill in values)
2. Run `./scripts/build` to build all Docker images
3. Run `docker-compose up -d` to start services

## Local Development

### Prerequisites

- Docker
- Node.js 20+

### Setup

1. Add the following to `/etc/hosts`:

   ```text
   127.0.0.1 bokken.io
   127.0.0.1 www.bokken.io
   127.0.0.1 career.bokken.io
   127.0.0.1 lab.bokken.io
   127.0.0.1 blog.bokken.io
   127.0.0.1 x.bokken.io
   127.0.0.1 cms.bokken.io
   ```

2. Start the development environment:

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. Access the services:
   - Website: `https://bokken.io` (type `thisisunsafe` if you see a warning)
   - Strapi Admin: `http://localhost:1337/admin`

### Strapi Setup (First Time)

1. Wait for Strapi to start
2. Go to `http://localhost:1337/admin`
3. Create your admin account
4. Create an API token for the Astro frontend

### Astro Development

```bash
cd astro-blog
npm install
npm run dev
```

### Article Migration

To migrate existing articles to Strapi:

```bash
cd scripts/migration
npm install
STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=your-token npm run migrate
```

## Project Structure

```
bokken.io/
├── astro-blog/          # Astro frontend (blog.bokken.io)
├── strapi/              # Strapi CMS (cms.bokken.io)
├── sites/               # Static sites
│   ├── blog.bokken.io/  # Legacy blog (to be migrated)
│   ├── www.bokken.io/   # Main website
│   └── x.bokken.io/     # Demo/experiments
├── scripts/
│   ├── blog/            # Legacy blog build scripts
│   └── migration/       # Article migration script
└── docker-compose.yml   # Production config
```
