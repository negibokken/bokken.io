const marked = require('marked');
const ejs = require('ejs');
const hljs = require('highlightjs');
const hash = require('crypto').createHash;

const SUMMARY_LENGTH = 300;
const HTML_TAG_REGEXP = RegExp('<.+?>', 'g');

let articleTitle = '';
let tags = '';
let summary = '';
let descriptionExist = false;
let dates = [];
let isInIndex = false;
let isInColumn = false;
let paragraphNumber = 1;

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

function serialize(value) {
    return value
        .toLowerCase()
        .trim()
        // remove html tags
        .replace(/<[!\/a-z].*?>/ig, '')
        // remove unwanted chars
        .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&*+,./:;<=>?@[\]^`{|}~]/g, '')
        .replace(/\s/g, '-');
}

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
        } else if (text.includes("@description:")) {
            descriptionExist = true;
            summary = text;
            return '';
        }

        if (!isInIndex) {
            const copiedText = text.slice().replaceAll(HTML_TAG_REGEXP, '').replaceAll("\n", "");
            const t = copiedText.slice(0, Math.max(SUMMARY_LENGTH - summary.length + 1, 0));
            summary += t;
        }

        const id = `paragraph-${paragraphNumber}`;
        paragraphNumber += 1;
        return `<p id="${id}" class="paragraph">${text}<a href="#${id}" class="paragraph-anchor">¶</a></p>`;
    },
    heading: (text, level) => {
        const escapedText = serialize(text.slice());
        if (level == 1) {
            articleTitle = text;
        }
        const h = `<h${level}>
                      <a name="${escapedText}" href="#${escapedText}" id="${escapedText}">
                        ${text}
                      </a>
                    </h${level}>`;
        if (isInIndex) {
            isInIndex = false;
            return `</details>${h}`;
        }
        if (isInColumn) {
            isInColumn = false;
            return `</div></details>${h}`;
        }
        if (text === '目次' || text == 'もくじ') {
            isInIndex = true;
            return `<h${level}>${text}</h${level}><details class="index"><summary class="index">(click で開く)</summary>`;
        }
        if (text.includes("コラム:")) {
            isInColumn = true;
            return `<details class="column"><summary class="column">${text}</summary><div class="column-content">`;
        }

        return h;
    },
    link: (href, title, text) => {
        return `<a ${isInIndex ? "" : 'target="_blank" rel="noopener"'} href="${href}" >${text}</a>`;
    },
    image: (src) => {
        return `<a href="${src}" rel="noopener"><img src="${src}" /></a>`;
    },
    listitem: (text) => {
        if (!isInIndex) {
            const copiedText = text.slice().replaceAll(HTML_TAG_REGEXP, '').replaceAll("\n", "");
            const t = copiedText.slice(0, Math.max(SUMMARY_LENGTH - summary.length + 1, 0));
            summary += t;
        }
        return `<li>${text}</li>`;
    }
};

class BMarkdown2HTML {
    constructor(markdown, template, option = {}) {
        marked.use({ renderer });
        marked.setOptions({
            highlight: function(code, lang) {
                return hljs.highlightAuto(code, [lang]).value;
            },
        });
        this.self = this;
        this.markdown = markdown;
        this.template = template;
        this.content = marked(this.markdown);
        this.title = articleTitle;
        this.summary = summary;
        this.tags = tags;
        this.dates = dates;
        this.url = option.url;
        this.data = {
            article: {
                url: this.url,
                title: this.title,
                tags: this.tags,
                summary: this.summary,
                content: this.content,
                createdAt: dates[0],
                updatedAt: dates[1],
                prev: option ? option.prev : undefined,
                next: option ? option.next : undefined,
            },
        };
    }
    async init() {
        try {
            if (!this.template) return;
            this.content = await ejs.renderFile(this.template, this.data);

            articleTitle = '';
            tags = '';
            summary = '';
            descriptionExist = false;
            dates = [];
            isInIndex = false;
            paragraphNumber = 1;

        } catch (e) {
            console.error(e);
            process.exit(1);
        }
        return this.self;
    }
    toString() {
        return this.content;
    }
}

module.exports = { BMarkdown2HTML };
