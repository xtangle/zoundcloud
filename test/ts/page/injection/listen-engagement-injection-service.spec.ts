import {ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_MEDIUM_CLASS} from '@src/constants';
import {DownloadButtonFactory} from '@src/page/injection/download-button-factory';
import {InjectionSignalFactory} from '@src/page/injection/injection-signal-factory';
import {ListenEngagementInjectionService} from '@src/page/injection/listen-engagement-injection-service';
import {UrlService} from '@src/util/url-service';
import {useSinonChai} from '@test/test-initializers';
import * as $ from 'jquery';
import {EMPTY, of, Subscription} from 'rxjs';
import {restore, SinonSpy, SinonStub, spy, stub} from 'sinon';

const expect = useSinonChai();

describe('listen engagement injection service', () => {
  const fixture = ListenEngagementInjectionService;
  const currentUrl = 'current-url-of-page';
  let subscriptions: Subscription;

  let stubCreateInjectionSignal$: SinonStub;
  let stubGetCurrentUrl: SinonStub;
  let spyCreateDownloadButton: SinonSpy;

  let listenEngagement: JQuery<HTMLElement>;
  let buttonGroup: JQuery<HTMLElement>;

  beforeEach(() => {
    subscriptions = new Subscription();
    document.body.innerHTML = `
      <body>
        <div id="listenEngagement" class="listenEngagement sc-clearfix">
          <div class="listenEngagement__footer sc-clearfix">
            <div class="soundActions sc-button-toolbar soundActions__medium">
              <div id="buttonGroup" class="sc-button-group sc-button-group-medium">
              </div>
            </div>
          </div>
        </div>
      </body>
    `;
    listenEngagement = $('#listenEngagement');
    buttonGroup = $('#buttonGroup');

    stubCreateInjectionSignal$ = stub(InjectionSignalFactory, 'create$');
    stubCreateInjectionSignal$.returns(of(listenEngagement));

    stubGetCurrentUrl = stub(UrlService, 'getCurrentUrl');
    stubGetCurrentUrl.returns(currentUrl);

    spyCreateDownloadButton = spy(DownloadButtonFactory, 'create');
  });

  afterEach(() => {
    subscriptions.unsubscribe();
    restore();
  });

  describe('injecting download buttons', () => {
    it('should inject the download button', () => {
      fixture.injectDownloadButtons(subscriptions);
      expect(getDownloadButton().length).to.be.equal(1);
    });

    it('should not inject when injection signal did not emit', () => {
      stubCreateInjectionSignal$.returns(EMPTY);
      fixture.injectDownloadButtons(subscriptions);
      expect(getDownloadButton().length).to.be.equal(0);
    });

    it('should create an injection signal with a selector that matches the listen engagement element', () => {
      fixture.injectDownloadButtons(subscriptions);
      expect(stubCreateInjectionSignal$).to.have.been.calledOnce.calledWithMatch(
        (selector: string) => listenEngagement.is(selector) && $(selector).is(listenEngagement));
    });

    it('should use subscriptions and the current page url to create the download button', () => {
      fixture.injectDownloadButtons(subscriptions);
      expect(spyCreateDownloadButton).to.have.been.calledOnce.calledWithExactly(subscriptions, currentUrl);
    });

    it('should add classes to the download button to indicate a medium-sized button', () => {
      fixture.injectDownloadButtons(subscriptions);
      const downloadButton = getDownloadButton();
      expect(downloadButton.hasClass('sc-button-medium')).to.be.true;
      expect(downloadButton.hasClass(ZC_DL_BUTTON_MEDIUM_CLASS)).to.be.true;
    });

    it('should add the download button to the button group', () => {
      fixture.injectDownloadButtons(subscriptions);
      expect($.contains(buttonGroup[0], getDownloadButton()[0])).to.be.true;
    });
  });

  function getDownloadButton(): JQuery<HTMLElement> {
    return $(`.${ZC_DL_BUTTON_CLASS}`);
  }
});
