import {Bootstrapper} from '@src/page/bootstrapper';
import {IContentPage} from '@src/page/content-page';
import {useSinonChai, useSinonChrome} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import * as $ from 'jquery';
import {SinonSpy, spy} from 'sinon';

const expect = useSinonChai();

describe('bootstrapper', () => {
  const sinonChrome = useSinonChrome.call(this);
  const fixture = Bootstrapper;
  let contentPage: DummyContentPage;
  let spyLoad: SinonSpy;
  let spyUnload: SinonSpy;

  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
  });

  it('should bootstrap the content page when test passes and id tag is not in DOM', async () => {
    initContentPage(true);
    fixture.bootstrap(contentPage);
    verifyIdTagAddedToDOM();
    await tick();
    expect(spyLoad).to.have.been.calledOnce;
  });

  it('should not bootstrap the content page when test passes and id tag is in DOM', async () => {
    initContentPage(true);
    document.body.innerHTML = `<body><div id="${contentPage.id}"></div></body>`;
    fixture.bootstrap(contentPage);
    await tick();
    expect(spyLoad).to.not.have.been.called;
  });

  it('should remove the id tag when test fails', () => {
    initContentPage(false);
    document.body.innerHTML = `<body><div id="${contentPage.id}"></div></body>`;
    fixture.bootstrap(contentPage);
    verifyIdTagRemovedFromDOM();
  });

  it('should unload the content page when the id tag is removed from the DOM after bootstrapping', async () => {
    initContentPage(true);
    fixture.bootstrap(contentPage);
    removeIdTagFromDOM();
    await tick();
    expect(spyUnload).to.have.been.calledOnce;
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
