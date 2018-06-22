import {InjectionService} from '@src/page/injection/injection-service';
import {ListItemInjectionService} from '@src/page/injection/list-item-injection-service';
import {ListenEngagementInjectionService} from '@src/page/injection/listen-engagement-injection-service';
import {UserInfoBarInjectionService} from '@src/page/injection/user-info-bar-injection-service';
import {configureChai} from '@test/test-initializers';
import {Subject} from 'rxjs';
import {restore, SinonStub, stub} from 'sinon';

const expect = configureChai();

describe('injection service', () => {
  const fixture = InjectionService;
  let onUnload$: Subject<any>;

  let stubInjectToListenEngagement: SinonStub;
  let stubInjectToListItem: SinonStub;
  let stubInjectToUserInfoBar: SinonStub;

  beforeEach(() => {
    stubInjectToListenEngagement = stub(ListenEngagementInjectionService, 'injectDownloadButtons');
    stubInjectToListItem = stub(ListItemInjectionService, 'injectDownloadButtons');
    stubInjectToUserInfoBar = stub(UserInfoBarInjectionService, 'injectDownloadButtons');

    onUnload$ = new Subject();
    fixture.injectDownloadButtons(onUnload$);
  });

  afterEach(() => {
    restore();
  });

  it('should inject download buttons to listen engagement', () => {
    expect(stubInjectToListenEngagement).to.have.been.calledOnceWithExactly(onUnload$);
  });

  it('should inject download buttons to list items', () => {
    expect(stubInjectToListItem).to.have.been.calledOnceWithExactly(onUnload$);
  });

  it('should inject download buttons to user info bar', () => {
    expect(stubInjectToUserInfoBar).to.have.been.calledOnceWithExactly(onUnload$);
  });
});
