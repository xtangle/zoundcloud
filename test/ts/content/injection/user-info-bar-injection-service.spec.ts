import * as $ from 'jquery';
import {EMPTY, of, Subject} from 'rxjs';
import {restore, SinonSpy, SinonStub, spy, stub} from 'sinon';
import {ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_MEDIUM_CLASS} from 'src/ts/constants';
import {DownloadButtonFactory} from 'src/ts/content/injection/download-button-factory';
import {InjectionSignalFactory} from 'src/ts/content/injection/injection-signal-factory';
import {UserInfoBarInjectionService} from 'src/ts/content/injection/user-info-bar-injection-service';
import {UrlService} from 'src/ts/util/url-service';
import {matchesElements} from 'test/ts/sinon-matchers';
import {configureChai} from 'test/ts/test-initializers';

const expect = configureChai();

describe('user info bar injection service', () => {
  const fixture = UserInfoBarInjectionService;
  const currentUrl = 'https://soundcloud.com/some-user/tracks?some-query=123';
  let onUnload$: Subject<any>;

  let stubCreateInjectionSignal$: SinonStub;
  let stubGetCurrentUrl: SinonStub;
  let spyCreateDownloadButton: SinonSpy;

  let userInfoBar: JQuery<HTMLElement>;
  let buttonGroup: JQuery<HTMLElement>;

  beforeEach(() => {
    onUnload$ = new Subject();
    document.body.innerHTML = `
      <body>
        <div id="userInfoBarTestId" class="userInfoBar">
          <div class="userInfoBar__tabs"></div>
          <div class="userInfoBar__buttons">
            <div id="buttonGroupTestId" class="sc-button-group"></div>
          </div>
        </div>
      </body>
    `;
    userInfoBar = $('#userInfoBarTestId');
    buttonGroup = $('#buttonGroupTestId');

    stubCreateInjectionSignal$ = stub(InjectionSignalFactory, 'create$');
    stubCreateInjectionSignal$.returns(of(userInfoBar));

    stubGetCurrentUrl = stub(UrlService, 'getCurrentUrl');
    stubGetCurrentUrl.returns(currentUrl);

    spyCreateDownloadButton = spy(DownloadButtonFactory, 'create');
  });

  afterEach(() => {
    onUnload$.complete();
    restore();
  });

  describe('injecting download buttons', () => {
    it('should inject the download button', () => {
      fixture.injectDownloadButtons(onUnload$);
      expect(getDownloadButton().length).to.be.equal(1);
    });

    it('should not inject when injection signal did not emit', () => {
      stubCreateInjectionSignal$.returns(EMPTY);
      fixture.injectDownloadButtons(onUnload$);
      expect(getDownloadButton().length).to.be.equal(0);
    });

    it('should stop injecting when unloaded', () => {
      fixture.injectDownloadButtons(of(true));
      expect(getDownloadButton().length).to.be.equal(0);
    });

    it('should create an injection signal with a selector that matches the user info bar element', () => {
      fixture.injectDownloadButtons(onUnload$);
      expect(stubCreateInjectionSignal$).to.have.been.calledOnce
        .calledWithMatch(matchesElements(userInfoBar));
    });

    it('should create the download button with the correct parameters', () => {
      const expectedUrl = 'https://soundcloud.com/some-user';
      fixture.injectDownloadButtons(onUnload$);
      expect(spyCreateDownloadButton).to.have.been.calledOnceWithExactly(onUnload$, expectedUrl);
    });

    it('should add classes to the download button to indicate a medium-sized button', () => {
      fixture.injectDownloadButtons(onUnload$);
      const downloadButton = getDownloadButton();
      expect(downloadButton).to.have.$class('sc-button-medium');
      expect(downloadButton).to.have.$class(ZC_DL_BUTTON_MEDIUM_CLASS);
    });

    it('should add the download button to the button group', () => {
      fixture.injectDownloadButtons(onUnload$);
      expect($.contains(buttonGroup[0], getDownloadButton()[0])).to.be.true;
    });
  });

  function getDownloadButton(): JQuery<HTMLElement> {
    return $(`.${ZC_DL_BUTTON_CLASS}`);
  }
});
