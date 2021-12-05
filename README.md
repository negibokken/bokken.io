# bokken.io

## Operation

### Initial operation

Execute `./scripts/init` to start `nginx` with docker

### Update

Execute `./scripts/update` to update your `www` contents.

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

- Execute `./scripts/start-local`
- Access to `https://bokken.io`
  - if you see warning page, then type `thisisunsafe` to proceed accessing to the website
- Now you can see website
