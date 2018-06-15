import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {Bootstrapper, TAG_ID} from '@src/page/bootstrapper';
import {ContentPage} from '@src/page/content-page';
import {useSinonChai} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import * as $ from 'jquery';
import {mock, SinonMock, SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('bootstrapper', () => {
  const fixture = Bootstrapper;
  let contentPage: ContentPage;
  let contentPageMock: SinonMock;

  beforeEach(() => {
    contentPage = new ContentPage();
    contentPageMock = mock(contentPage);
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
      contentPageMock.expects('load').never();
      fixture.bootstrap(contentPage);
      await tick();

      contentPageMock.verify();
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
      contentPageMock.expects('load').once();
      fixture.bootstrap(contentPage);
      await tick();

      contentPageMock.verify();
    });

    it('should unload the content page when id tag is removed from the DOM', async () => {
      fixture.bootstrap(contentPage);
      contentPageMock.expects('unload').once();
      removeIdTagFromDOM();
      await tick();

      verifyIdTagsInDOM(0);
      contentPageMock.verify();
    });
  });

  function verifyIdTagsInDOM(numberOfIdTags: number) {
    expect($(`#${TAG_ID}`).length).to.be.equal(numberOfIdTags);
  }

  function removeIdTagFromDOM() {
    $(`#${TAG_ID}`).remove();
  }
});
