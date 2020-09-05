const marked = require('marked');
const hljs = require('highlightjs');

let articleTitle = '';
let tags = '';
let summary = '';
const extractTags = (text) => {
  const i = text.indexOf('[');
  const j = text.indexOf(']');
  console.error(i, j);
  return text.substring(i + 1, j);
};
// Custom Renderer
const renderer = {
  paragraph: (text) => {
    if (text.includes('@tags:')) {
      let tagsText = extractTags(text);
      const localTags = tagsText.split(',');
      tags = localTags.map((t) => t.trim());
      return '';
    }
    if (summary.length <= 90) {
      summary += text;
    }
    return `<p>${text}</p>`;
  },
  heading: (text, level) => {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    if (level == 1) {
      articleTitle = text;
    }
    return `<h${level}>
  <a name="${escapedText}" href="#${escapedText}">
    ${text}
  </a>
</h${level}>
`;
  },
};

const metadata = (title) => `<head>
  <meta charset=utf-8>
  <title>${title}</title>
  <meta name=viewport content="width=device-width,initial-scale=1">
  <meta name=description content=bokken.io>
  <link rel="shortcut icon" href=img/favicon.ico>

  <!-- Google
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-83287008-4"></script>
  <script> window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'UA-83287008-4'); </script>
  -->


  <link rel=stylesheet type=text/css href=css/main.css>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.1.2/styles/default.min.css">
</head>
`;

const header = `<header>
  <a href=index.html ><h1>bokken.io</h1></a>
  <nav>
    <ul>
      <li><a href="https://negi-works.hatenablog.com">Blog</a></li>
      <li><a href=career.html>Career</a></li>
      <li><a href=experiment.html>exp</a></li>
    </ul>
  </nav>
</header>
`;

const footer = `<footer>
  Copyright &copy; 2018 bokken. All Rights Reserved.
</footer>
`;

const article = (text) => `<main>
  <article>
    ${text}
  </article>
</main>
`;

class BMarkdown2HTML {
  constructor(data) {
    marked.use({ renderer });
    marked.setOptions({
      highlight: function (code, lang) {
        return hljs.highlightAuto(code, [lang]).value;
      },
    });
    this.data = data;
    this.title = ' | blog.bokken.io';
    this.h1 = '';
    this.summary = '';
  }
  toString() {
    const mainText = article(marked(this.data));
    this.h1 = articleTitle;
    this.tags = tags;
    this.summary = summary;
    let text = '<!DOCTYPE html>';
    text += '<html lang="ja">';
    text += metadata(articleTitle + this.title);
    text += '<body>';
    text += header;
    text += mainText;
    text += footer;
    text += '</body>';
    text += '</html>';
    return text;
  }
}

module.exports = { BMarkdown2HTML };
