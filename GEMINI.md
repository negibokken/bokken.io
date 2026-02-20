# Project Overview

This is a monorepo project primarily focused on managing the `bokken.io` website and its associated subdomains. It utilizes `pnpm` for efficient package management and `Astro` for building the `blog.bokken.io` section. The entire project is containerized using Docker, with `docker-compose` orchestrating various services. These services include an `https-portal` acting as a reverse proxy for SSL termination and intelligent routing, the main `bokken.io` site, and a separate `app.bokken.io` application.

## Main Technologies

*   **Frontend**: Astro (for `blog.bokken.io`)
*   **Package Manager**: pnpm
*   **Containerization**: Docker, Docker Compose
*   **Web Server/Proxy**: Nginx (orchestrated via the `https-portal` Docker image)

## Building and Running

### Initial Setup

1.  **Configure Host Entries**: Add the following entries to your `/etc/hosts` file to enable local resolution of subdomains:
    ```text
    127.0.0.1 bokken.io
    127.0.0.1 www.bokken.io
    127.0.0.1 career.bokken.io
    127.0.0.1 lab.bokken.io
    127.0.0.1 blog.bokken.io
    127.0.0.1 x.bokken.io
    ```
2.  **Initialize Project**: Execute the initial setup script:
    ```bash
    ./scripts/init
    ```
    This script will:
    *   Build Docker images for `bokken.io` and `app.bokken.io`.
    *   Start the Docker Compose services defined in `docker-compose.dev.yml`, bringing up the local development environment.

### Local Development

1.  **Start Development Environment**: Ensure your host entries are configured as described above, then run:
    ```bash
    ./scripts/start-local
    ```
    This command will rebuild the necessary Docker images and launch the development environment.
2.  **Access Website**: Open your web browser and navigate to `https://bokken.io`. If you encounter a certificate warning (common for local HTTPS setups), you may need to type `thisisunsafe` (in Chrome/Edge) or follow your browser's instructions to proceed.
3.  **Astro Blog Development (Optional)**: For specific development on the Astro blog, you can run Astro's development server directly from the project root:
    ```bash
    pnpm --filter astro dev
    ```
    Note that the `./scripts/start-local` command typically provides the full integrated environment.

### Building Astro Blog

To build the static files for the Astro blog (outputting to `dist/blog.bokken.io`):
```bash
pnpm --filter astro build
```

### Preview Astro Blog

To preview the built Astro blog locally:
```bash
pnpm --filter astro preview
```

## Development Conventions

*   **Code Formatting**: The project enforces code formatting using `Prettier`. The `astro/package.json` includes `prettier` and `prettier-plugin-astro`, and formatting is applied during the build process (e.g., `prettier --write --no-error-on-unmatched-pattern dist/**/*.{html,js,css,xml}`).
*   **Image Synchronization**: Image assets are managed and synchronized as part of the Astro development and build workflows, indicated by the `node scripts/sync-images.mjs` command in Astro's scripts.
*   **Content Management**: Markdown/MDX is used for content, particularly for the blog. The `astro.config.mjs` shows integration with `rehype-slug` and `rehype-autolink-headings` for advanced markdown processing, including automatic slug generation and heading linking.