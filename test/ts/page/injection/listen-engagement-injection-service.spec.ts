import {ListenEngagementInjectionService} from '@src/page/injection/listen-engagement-injection-service';
import {useSinonChai} from '@test/test-initializers';
import {Subscription} from 'rxjs';

const expect = useSinonChai();

describe('listen engagement injection service', () => {
  const fixture = ListenEngagementInjectionService;
  let subscriptions: Subscription;

  beforeEach(() => {
    subscriptions = new Subscription();
    document.body.innerHTML = `
      <body>
        <div class="listenEngagement sc-clearfix">
          <div class="listenEngagement__footer sc-clearfix">
            <div class="soundActions sc-button-toolbar soundActions__medium">
              <div class="sc-button-group sc-button-group-medium">
                <button id="button-1"/>
                <button id="button-2"/>
              </div>
            </div>
          </div>
        </div>
      </body>
    `;
  });

  afterEach(() => {
    subscriptions.unsubscribe();
  });
});
