
let path = require('path');
let checkFile = require('check-ecmascript-version-compatibility');

describe('ECMAScript version', function () {
  xit('markdown-it-link-attributes.js only uses ES5 for browser compatibility', function (done) {
    let jsPath = path.resolve(__dirname, '..', 'dist', 'markdownItLinkAttr.js');

    this.slow(1000);
    this.timeout(2000);

    checkFile(jsPath, done);
  });
});
