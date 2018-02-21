import * as chai from 'chai';
import {expect} from 'chai';
import * as $ from 'jquery';
import {SinonSpy, spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {bootstrap} from './bootstrap';
import {IContentPage} from './content-page';

/* tslint:disable:no-unused-expression */
describe('bootstrap function', () => {
  chai.use(sinonChai);
  let contentPage: DummyContentPage;
  let spyLoad: SinonSpy;
  let spyUnload: SinonSpy;

  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
  });

  it('should load the content page when test passes', () => {
    initContentPage(true);
    bootstrap(contentPage);
    verifyIdTagAddedToDOM();
    expect(spyLoad).to.have.been.calledOnce;
  });

  it('should not load the content page when it is already loaded and test passes', () => {
    initContentPage(true);
    document.body.innerHTML = `<body><div id="${contentPage.id}"></div></body>`;
    bootstrap(contentPage);
    expect(spyLoad).to.not.have.been.called;
  });

  it('should unload the content page when test fails', () => {
    initContentPage(false);
    document.body.innerHTML = `<body><div id="${contentPage.id}"></div></body>`;
    bootstrap(contentPage);
    verifyIdTagRemovedFromDOM();
    expect(spyUnload).to.have.been.calledOnce;
  });

  it('should not unload the content page when it is already unloaded and test fails', () => {
    initContentPage(false);
    bootstrap(contentPage);
    expect(spyUnload).to.not.have.been.called;
  });

  it('should unload the content page when the id tag is removed from the DOM', (done) => {
    initContentPage(true);
    bootstrap(contentPage);
    removeIdTagFromDOM();
    setTimeout(() => {
      expect(spyUnload).to.have.been.calledOnce;
      done();
    }, this.timeout);
  });

  function initContentPage(shouldLoad: boolean): DummyContentPage {
    contentPage = new DummyContentPage(shouldLoad);
    spyLoad = spy(contentPage, 'load');
    spyUnload = spy(contentPage, 'unload');
    return contentPage;
  }

  function verifyIdTagAddedToDOM() {
    expect($(`#${contentPage.id}`).length).to.be.equal(1);
  }

  function verifyIdTagRemovedFromDOM() {
    expect($(`#${contentPage.id}`).length).to.be.equal(0);
  }

  function removeIdTagFromDOM() {
    $(`#${contentPage.id}`).remove();
  }
});

class DummyContentPage implements IContentPage {
  public id: string = 'id';

  constructor(public testValue: boolean) {
  }

  public test(): boolean {
    return this.testValue;
  }

  public load: () => void = () => undefined;
  public unload: () => void = () => undefined;
}
