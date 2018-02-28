import * as chai from 'chai';
import {expect} from 'chai';
import * as $ from 'jquery';
import {SinonSpy, spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {IContentPage} from '../../src/page/content-page';
import {BootstrapService} from '../../src/service/bootstrap-service';

describe('bootstrap service', () => {
  chai.use(sinonChai);

  const fixture = BootstrapService;
  let contentPage: DummyContentPage;
  let spyLoad: SinonSpy;
  let spyUnload: SinonSpy;

  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
  });

  it('should bootstrap the content page when test passes and id tag is not in DOM', (done) => {
    initContentPage(true);
    fixture.bootstrap(contentPage);
    verifyIdTagAddedToDOM();
    setTimeout(() => {
      expect(spyLoad).to.have.been.calledOnce;
      done();
    }, this.timeout);
  });

  it('should not bootstrap the content page when test passes and id tag is in DOM', () => {
    initContentPage(true);
    document.body.innerHTML = `<body><div id="${contentPage.id}"></div></body>`;
    fixture.bootstrap(contentPage);
    expect(spyLoad).to.not.have.been.called;
  });

  it('should remove the id tag when test fails', () => {
    initContentPage(false);
    document.body.innerHTML = `<body><div id="${contentPage.id}"></div></body>`;
    fixture.bootstrap(contentPage);
    verifyIdTagRemovedFromDOM();
  });

  it('should unload the content page when the id tag is removed from the DOM after bootstrapping', (done) => {
    initContentPage(true);
    fixture.bootstrap(contentPage);
    removeIdTagFromDOM();
    setTimeout(() => {
      expect(spyUnload).to.have.been.calledOnce;
      done();
    }, this.timeout);
  });

  function initContentPage(testValue: boolean): DummyContentPage {
    contentPage = new DummyContentPage(testValue);
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
