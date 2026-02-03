# Article Migration Script

This script migrates existing blog articles from the Markdown format to Strapi CMS.

## Prerequisites

1. Strapi must be running and accessible
2. You need a Strapi API token with write permissions

## Setup

```bash
cd scripts/migration
npm install
```

## Usage

```bash
# Set environment variables
export STRAPI_URL=http://localhost:1337
export STRAPI_TOKEN=your-api-token-here

# Run migration
npm run migrate
```

## What the script does

1. Reads all articles from `sites/blog.bokken.io/articles/`
2. Parses the custom markdown format (@tags, @date metadata)
3. Uploads images from each article's `img/` directory
4. Creates or retrieves tags
5. Creates articles in Strapi with all metadata

## Getting a Strapi API Token

1. Log in to Strapi admin panel (http://localhost:1337/admin)
2. Go to Settings > API Tokens
3. Create a new token with "Full access" permissions
4. Copy the token and use it as `STRAPI_TOKEN`

## Notes

- Articles are created with their original publish dates
- Images are uploaded to Strapi's media library
- The script is idempotent - running it multiple times may create duplicates
