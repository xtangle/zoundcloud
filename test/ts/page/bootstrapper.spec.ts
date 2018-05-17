import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {Bootstrapper} from '@src/page/bootstrapper';
import {IContentPage} from '@src/page/content-page';
import {useSinonChai} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import * as $ from 'jquery';
import {SinonStub, spy, stub} from 'sinon';

const expect = useSinonChai();

describe('bootstrapper', () => {
  const fixture = Bootstrapper;
  let contentPage: DummyContentPage;

  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
  });

  context('when the content page should be loaded and the id tag is not in the DOM', () => {
    it('should bootstrap the content page', async () => {
      contentPage = new DummyContentPage(true);
      fixture.bootstrap(contentPage);
      verifyIdTagAddedToDOM();
      await tick();
      expect(contentPage.load).to.have.been.calledOnce;
    });
  });

  context('when the content page should be loaded and the id tag is in the DOM', () => {
    let stubSendToExtension: SinonStub;

    beforeEach(() => {
      contentPage = new DummyContentPage(true);
      stubSendToExtension = stub(ContentPageMessenger, 'sendToExtension');
      document.body.innerHTML = `<body><div id="${contentPage.id}"></div></body>`;
    });

    afterEach(() => {
      stubSendToExtension.restore();
    });

    it('should not bootstrap the content page', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      expect(contentPage.load).to.not.have.been.called;
    });

    it('should send a message to the background script to reload the content page', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      expect(stubSendToExtension).to.have.been.calledOnce
        .calledWithExactly(new RequestContentPageReloadMessage(contentPage.id));
    });
  });

  context('when the content page should not be loaded', () => {
    it('should remove the id tag', () => {
      contentPage = new DummyContentPage(false);
      document.body.innerHTML = `<body><div id="${contentPage.id}"></div></body>`;
      fixture.bootstrap(contentPage);
      verifyIdTagRemovedFromDOM();
    });
  });

  it('should unload the content page when the id tag is removed from the DOM after bootstrapping', async () => {
    contentPage = new DummyContentPage(true);
    fixture.bootstrap(contentPage);
    removeIdTagFromDOM();
    await tick();
    expect(contentPage.unload).to.have.been.calledOnce;
  });

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
  public id = 'some-id';
  public load = spy();
  public unload = spy();

  constructor(public shouldLoad: boolean) {
  }

  public test(): boolean {
    return this.shouldLoad;
  }
}
