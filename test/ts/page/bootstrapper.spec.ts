import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {Bootstrapper, TAG_ID} from '@src/page/bootstrapper';
import {ContentPage} from '@src/page/content-page';
import {useSinonChai} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import * as $ from 'jquery';
import {SinonStub, SinonStubbedInstance, stub} from 'sinon';

const expect = useSinonChai();

describe('bootstrapper', () => {
  const fixture = Bootstrapper;
  let contentPage: ContentPage;
  let contentPageStub: SinonStubbedInstance<ContentPage>;

  beforeEach(() => {
    contentPage = new ContentPage();
    contentPageStub = stub(contentPage);
  });

  context('when the id tag is in the DOM', () => {
    let stubSendToExtension: SinonStub;

    beforeEach(() => {
      document.body.innerHTML = `<body><div id="${TAG_ID}"></div></body>`;
      stubSendToExtension = stub(ContentPageMessenger, 'sendToExtension');
    });

    afterEach(() => {
      stubSendToExtension.restore();
    });

    it('should send request content page reload message to extension', () => {
      fixture.bootstrap(contentPage);
      expect(stubSendToExtension).to.have.been.calledOnce.calledWithExactly(new RequestContentPageReloadMessage());
    });

    it('should not load the content page', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      expect(contentPageStub.load).to.not.have.been.called;
    });

    it('should not add another id tag to the DOM', () => {
      fixture.bootstrap(contentPage);
      verifyIdTagsInDOM(1);
    });
  });

  context('when the id tag is not in the DOM', () => {
    beforeEach(() => {
      document.body.innerHTML = '<body></body>';
    });

    it('should add the id tag to the DOM', () => {
      fixture.bootstrap(contentPage);
      verifyIdTagsInDOM(1);
    });

    it('should load the content page', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      expect(contentPageStub.load).to.have.been.calledOnce;
    });

    it('should not unload the content page when id tag is not removed from the DOM', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      expect(contentPageStub.unload).to.not.have.been.called;
    });

    it('should unload the content page when id tag is removed from the DOM', async () => {
      fixture.bootstrap(contentPage);
      removeIdTagFromDOM();
      await tick();
      verifyIdTagsInDOM(0);
      expect(contentPageStub.unload).to.have.been.calledOnce;
    });
  });

  function verifyIdTagsInDOM(numberOfIdTags: number) {
    expect($(`#${TAG_ID}`).length).to.be.equal(numberOfIdTags);
  }

  function removeIdTagFromDOM() {
    $(`#${TAG_ID}`).remove();
  }
});
