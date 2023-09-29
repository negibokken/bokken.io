const watch = require('node-watch');
const { exec } = require('node:child_process');
const fs = require('fs');

const articlesPath = 'sites/blog.bokken.io/articles';

watch(articlesPath, { recursive: true, filter: /\.md/ }, function (evt, name) {
    exec(
        `yarn --silent build:blog:article:dev ${name} ${name} ${name}`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                return;
            }
            if (stdout) {
                fs.writeFileSync(name.replace('.md', '.html'), stdout);
                console.log(
                    `evt: ${evt}, name: ${name
                        .replace('.md', '.html')
                        .replace('sites/', 'https://')}`
                );
                return;
            }
            if (stderr) {
                console.error(stderr);
                return;
            }
        }
    );
});
