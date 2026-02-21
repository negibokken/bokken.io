# bokken.io

## Operation

### Initial operation

Execute `./scripts/init` to build the Docker images and start the local development environment using `docker-compose`.

## local development

- Write below configurations into `/etc/hosts`.

  ```text
  127.0.0.1 bokken.io
  127.0.0.1 www.bokken.io
  127.0.0.1 career.bokken.io
  127.0.0.1 lab.bokken.io
  127.0.0.1 blog.bokken.io
  127.0.0.1 x.bokken.io
  ```

- Execute `./scripts/start-local` to build the Docker images and start the local development environment using `docker-compose`. This command provides the full multi-site environment.
- Access `https://bokken.io` in your browser. If a security warning appears (common for self-signed certificates in local development), you can typically bypass it by typing `thisisunsafe` (in Chromium-based browsers) or following equivalent prompts.
- **Astro Blog Development (Optional)**: If you only need to work on the Astro blog and don't require the full Docker environment, you can navigate to the `astro/` directory and run `pnpm dev`.
