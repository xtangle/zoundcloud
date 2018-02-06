import * as chai from 'chai';
import {expect} from 'chai';
import * as $ from 'jquery';
import {JSDOM} from 'jsdom';
import 'jsdom-global';
import 'mocha';
import {spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {bootstrapContentScript} from './bootstrap';

// See: https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2

/* tslint:disable:no-unused-expression */
describe('bootstrap', () => {
  chai.use(sinonChai);
  const scriptId = 'script-id';
  let onScriptLoad: () => void;

  beforeEach(() => {
    initializeDom('<body></body>');
    onScriptLoad = spy();
  });

  it('should add script id tag to page and load script when script should be loaded', () => {
    bootstrapContentScript(scriptId, () => true, onScriptLoad);

    expect($(`#${scriptId}`).length).to.be.equal(1);
    expect(onScriptLoad).to.have.been.calledOnce;
  });

  it('should not do anything when script should be loaded but is already loaded', () => {
    bootstrapContentScript(scriptId, () => true, onScriptLoad);

    expect(onScriptLoad).to.not.have.been.called;
  });

  it('should remove script id tag from page and unload script when script should not be loaded', () => {
    initializeDom(`<body><div id="${scriptId}"></div></body>`);
    const onScriptUnload = spy();
    bootstrapContentScript(scriptId, () => false, onScriptLoad, onScriptUnload);

    expect($(`#${scriptId}`).length).to.equal(0);
    expect(onScriptUnload).to.have.been.calledOnce;
  });

  function initializeDom(html: string) {
    const dom = new JSDOM(html);
    window = dom.window;
    document = dom.window.document;
  }
});
