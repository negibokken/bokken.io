const marked = require('marked');
const ejs = require('ejs');
const hljs = require('highlightjs');

let articleTitle = '';
let tags = '';
let summary = '';
let dates = [];
const extractTags = (text) => {
  const i = text.indexOf('[');
  const j = text.indexOf(']');
  return text.substring(i + 1, j);
};
const extractDate = (text) => {
  const i = text.indexOf('[');
  const j = text.indexOf(']');
  let localDates = text.substring(i + 1, j).split(',');
  return localDates.map((d) => d.trim());
};
// Custom Renderer
const renderer = {
  paragraph: (text) => {
    if (text.includes('@tags:')) {
      let tagsText = extractTags(text);
      const localTags = tagsText.split(',');
      tags = localTags.map((t) => t.trim());
      return '';
    } else if (text.includes('@date:')) {
      dates = extractDate(text);
      return '';
    }
    if (summary.length <= 90) {
      summary += text;
    }
    return `<p>${text}</p>`;
  },
  heading: (text, level) => {
    // const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    const escapedText = text;
    if (level == 1) {
      articleTitle = text;
    }
    return `<h${level}>
  <a name="${escapedText}" href="#${escapedText}" id="${escapedText}">
    ${text}
  </a>
</h${level}>
`;
  },
};

class BMarkdown2HTML {
  constructor(markdown, template, option) {
    marked.use({ renderer });
    marked.setOptions({
      highlight: function (code, lang) {
        return hljs.highlightAuto(code, [lang]).value;
      },
    });
    this.markdown = markdown;
    this.template = template;
    this.content = marked(this.markdown);
    this.title = articleTitle;
    this.summary = summary;
    this.tags = tags;
    this.dates = dates;
    this.url = option.url;
    const data = {
      article: {
        url: this.url,
        title: this.title,
        summary: this.summary,
        content: this.content,
        createdAt: dates[0],
        updatedAt: dates[1],
      },
    };
    try {
      if (!template) return;
      this.content = ejs.render(template, data);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
  toString() {
    return this.content;
  }
}

module.exports = { BMarkdown2HTML };
