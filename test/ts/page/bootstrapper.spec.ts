import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {Bootstrapper} from '@src/page/bootstrapper';
import {IContentPage} from '@src/page/content-page';
import {useSinonChai} from '@test/test-initializers';
import {noop, tick} from '@test/test-utils';
import * as $ from 'jquery';
import {SinonStub, spy, stub} from 'sinon';

const expect = useSinonChai();

describe('bootstrapper', () => {
  const fixture = Bootstrapper;
  let contentPage: DummyContentPage;

  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
  });

  context('when the content page should be loaded', () => {
    beforeEach(() => {
      contentPage = new DummyContentPage(true);
    });

    it('should bootstrap the content page when the id tag is not in the DOM', async () => {
      fixture.bootstrap(contentPage);
      verifyIdTagAddedToDOM();
      await tick();
      expect(contentPage.load).to.have.been.calledOnce;
    });

    context('when the id tag is in the DOM', () => {
      let stubSendToExtension: SinonStub;

      beforeEach(() => {
        stubSendToExtension = stub(ContentPageMessenger, 'sendToExtension');
        document.body.innerHTML = `<body><div id="${getTagId()}"></div></body>`;
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
          .calledWithExactly(new RequestContentPageReloadMessage(contentPage.type));
      });
    });
  });

  context('when the content page should not be loaded', () => {
    beforeEach(() => {
      contentPage = new DummyContentPage(false);
    });

    it('should remove the id tag', () => {
      document.body.innerHTML = `<body><div id="${getTagId()}"></div></body>`;
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

  function getTagId() {
    return `zc-${contentPage.type}-content-page-id`;
  }

  function verifyIdTagAddedToDOM() {
    expect($(`#${getTagId()}`).length).to.be.equal(1);
  }

  function verifyIdTagRemovedFromDOM() {
    expect($(`#${getTagId()}`).length).to.be.equal(0);
  }

  function removeIdTagFromDOM() {
    $(`#${getTagId()}`).remove();
  }
});

class DummyContentPage implements IContentPage {
  public type = 'dummy';
  public load = spy();
  public unload = spy();
  public reload = noop;

  constructor(public shouldLoad: boolean) {
  }

  public test(): boolean {
    return this.shouldLoad;
  }
}
