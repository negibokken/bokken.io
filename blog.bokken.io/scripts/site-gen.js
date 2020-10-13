const fs = require('fs');
const ejs = require('ejs');
const {format} = require('prettier');

const templates = [
  {
    template: '../templates/www.ejs',
    path: '../www.bokken.io/index.html',
  },
  {
    template: '../templates/privacy-policy.ejs',
    path: '../www.bokken.io/privacy-policy.html',
  },
  {
    template: '../templates/x.ejs',
    path: '../x.bokken.io/index.html',
  },
];

(async () => {
  for (const template of templates) {
    const text = await ejs.renderFile(template.template);
    fs.writeFileSync(template.path, format(text, {parser: 'html'}));
  }
})();
