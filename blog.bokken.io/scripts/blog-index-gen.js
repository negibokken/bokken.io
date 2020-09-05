const fs = require('fs');
const ejs = require('ejs');

(async () => {
  try {
    // 走査
    // タイトル、タグ取得
    // テンプレートに下記を流し込み
    // 1. タイトル
    // 2. タグ
    // 3. 作成日
    const dirname = process.argv[2];
    const arr = ['hey', 'hey', 'ho'];
    // console.log('heyhey: ', dirname);
    const template = fs.readFileSync('./templates/blog-index.ejs').toString();
    const html = ejs.render(template, {
      articles: [
        {
          filepath: 'articles/2020-09-05/test-page.html',
          date: '2020-09-05',
          title: 'テストのやつ3',
          tags: ['test', 'html', 'ejs'],
        },
        {
          filepath: 'articles/2020-09-04/test-page.html',
          date: '2020-09-04',
          title: 'テスト2',
          tags: ['test', 'html', 'ejs'],
        },

        {
          filepath: 'articles/2019-08-07/test-page.html',
          date: '2019-08-07',
          title: 'テストのやつ1',
          tags: ['test', 'html', 'ejs'],
        },
      ],
    });
    console.log(html);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
