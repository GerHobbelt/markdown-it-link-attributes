
/* eslint-env mocha, es6 */
/* eslint-disable no-unused-expressions */

let chai = require('chai');
let sinon = require('sinon');
let expect = chai.expect;
let MarkdownIt = require('@gerhobbelt/markdown-it');
let linkAttributes = require('../');

chai.use(require('sinon-chai'));

describe('markdown-it-link-attributes', function () {
  beforeEach(function () {
    this.md = MarkdownIt();
  });

  it('adds attribues to link', function () {
    this.md.use(linkAttributes, { target: '_blank' });

    let result = this.md.render('[link](https://google.com)');

    expect(result).to.contain('<a href="https://google.com" target="_blank">link</a>');
  });

  it('can pass in multiple attributes', function () {
    this.md.use(linkAttributes, {
      target: '_blank',
      rel: 'noopener',
      foo: 'bar'
    });

    let result = this.md.render('[link](https://google.com)');

    expect(result).to.contain('<a href="https://google.com" target="_blank" rel="noopener" foo="bar">link</a>');
  });

  it('retains the original attr of a previous plugin that alters the attrs', function () {
    this.md.use(linkAttributes, {
      keep: 'keep',
      overwrite: 'original'
    });

    let original = this.md.render('[link](https://google.com)');

    expect(original).to.contain('<a href="https://google.com" keep="keep" overwrite="original">link</a>');

    this.md.use(linkAttributes, {
      overwrite: 'new',
      newattr: 'new'
    });

    let result = this.md.render('[link](https://google.com)');

    expect(result).to.contain('<a href="https://google.com" overwrite="original" newattr="new" keep="keep">link</a>');
  });

  it('works on plain urls when linkify is set to true', function () {
    let md = new MarkdownIt({
      linkify: true
    });
    md.use(linkAttributes, { target: '_blank' });

    let result = md.render('foo https://google.com bar');

    expect(result).to.contain('<a href="https://google.com" target="_blank">https://google.com</a>');
  });

  it('calls link_open function if provided', function () {
    let spy = this.md.renderer.rules.link_open = sinon.spy();
    this.md.use(linkAttributes);

    this.md.render('[link](https://google.com)');

    expect(spy).to.be.calledOnce;
  });

  it('calls default render if link_open rule is not defined', function () {
    let spy = sinon.spy(linkAttributes, 'defaultRender');
    this.md.use(linkAttributes);

    this.md.render('[link](https://google.com)');

    expect(spy).to.be.calledOnce;
  });
});
