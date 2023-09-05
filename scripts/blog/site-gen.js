const fs = require('fs');
const ejs = require('ejs');
const { format } = require('prettier');

const templates = [
    {
        template: './scripts/blog/templates/www.ejs',
        path: './sites/www.bokken.io/index.html',
    },
    {
        template: './scripts/blog/templates/privacy-policy.ejs',
        path: './sites/www.bokken.io/privacy-policy.html',
    },
    {
        template: './scripts/blog/templates/x.ejs',
        path: './sites/x.bokken.io/index.html',
    },
];

(async () => {
    for (const template of templates) {
        const text = await ejs.renderFile(template.template);
        fs.writeFileSync(template.path, format(text, { parser: 'html' }));
    }
})();
