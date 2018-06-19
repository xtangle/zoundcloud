import {ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_SMALL_CLASS} from '@src/constants';
import {DownloadButtonFactory} from '@src/page/injection/download-button-factory';
import {InjectionSignalFactory} from '@src/page/injection/injection-signal-factory';
import {ListItemInjectionService} from '@src/page/injection/list-item-injection-service';
import {matchesElements} from '@test/sinon-matchers';
import {configureChai} from '@test/test-initializers';
import * as $ from 'jquery';
import {EMPTY, of, Subscription} from 'rxjs';
import {restore, SinonSpy, SinonStub, spy, stub} from 'sinon';

const forEach = require('mocha-each');
const expect = configureChai();

describe('list item injection service', () => {
  const fixture = ListItemInjectionService;
  let subscriptions: Subscription;

  let stubCreateInjectionSignal$: SinonStub;
  let spyCreateDownloadButton: SinonSpy;

  interface IListItemTestObj {
    name: string;
    item: JQuery<HTMLElement>;
    href: string;
  }

  const soundListItem = {name: 'sound list item', href: '/sound_list_item_href'} as IListItemTestObj;
  const searchListItem = {name: 'search list item', href: '/search_list_item_href'} as IListItemTestObj;
  const trackListItem = {name: 'track list item', href: '/track_list_item_href'} as IListItemTestObj;
  const chartTracksItem = {name: 'chart tracks item', href: '/chart_tracks_item_href'} as IListItemTestObj;
  const listItemTestObjs: IListItemTestObj[] = [soundListItem, searchListItem, trackListItem, chartTracksItem];

  beforeEach(() => {
    subscriptions = new Subscription();
    document.body.innerHTML = `
      <body>
        ${getSoundListItemHTML(soundListItem.href)}
        ${getSearchListItemHTML(searchListItem.href)}
        ${getTrackListItemHTML(trackListItem.href)}
        ${getChartTracksItemHTML(chartTracksItem.href)}
      </body>
    `;
    soundListItem.item = $('#soundListItemTestId');
    searchListItem.item = $('#searchListItemTestId');
    trackListItem.item = $('#trackListItemTestId');
    chartTracksItem.item = $('#chartTracksItemTestId');

    stubCreateInjectionSignal$ = stub(InjectionSignalFactory, 'create$');
    stubCreateInjectionSignal$
      .returns(of(soundListItem.item, searchListItem.item, trackListItem.item, chartTracksItem.item));
    spyCreateDownloadButton = spy(DownloadButtonFactory, 'create');
  });

  afterEach(() => {
    subscriptions.unsubscribe();
    restore();
  });

  describe('injecting download buttons', () => {
    it('should inject the download buttons', () => {
      fixture.injectDownloadButtons(subscriptions);
      expect(getDownloadButtons().length).to.be.equal(4);
    });

    it('should not inject when injection signal did not emit', () => {
      stubCreateInjectionSignal$.returns(EMPTY);
      fixture.injectDownloadButtons(subscriptions);
      expect(getDownloadButtons().length).to.be.equal(0);
    });

    it('should create an injection signal with a selector that matches all list items', () => {
      fixture.injectDownloadButtons(subscriptions);
      const expectedListItems = listItemTestObjs.map((o) => o.item).reduce((a, b) => a.add(b));
      expect(stubCreateInjectionSignal$).to.have.been.calledOnce
        .calledWithMatch(matchesElements(expectedListItems));
    });

    it('should add classes to the download button to indicate a small-sized button', () => {
      fixture.injectDownloadButtons(subscriptions);
      const downloadButtons = getDownloadButtons();
      $.each(downloadButtons, (_, button) =>
        expect($(button)).to.have.$class('sc-button-small')
          .and.to.have.$class(ZC_DL_BUTTON_SMALL_CLASS)
      );
    });

    context('injecting to a specific type of list item', () => {
      // noinspection TypeScriptValidateJSTypes
      forEach(listItemTestObjs).it(
        (listItem: IListItemTestObj) =>
          `should create the download button with the correct parameters for ${listItem.name}`,
        (listItem: IListItemTestObj) => {
          stubCreateInjectionSignal$.returns(of(listItem.item));
          const expectedUrl = `${location.origin}${listItem.href}`;
          fixture.injectDownloadButtons(subscriptions);

          expect(spyCreateDownloadButton).to.have.been.calledOnce.calledWithExactly(subscriptions, expectedUrl);
        }
      );

      // noinspection TypeScriptValidateJSTypes
      forEach(listItemTestObjs).it(
        (listItem: IListItemTestObj) =>
          `should add the download button to the button group for ${listItem.name}`,
        (listItem: IListItemTestObj) => {
          stubCreateInjectionSignal$.returns(of(listItem.item));
          const buttonGroup = listItem.item.find('#buttonGroupTestId');
          fixture.injectDownloadButtons(subscriptions);
          const downloadButton = getDownloadButtons();

          expect(downloadButton.length).to.be.equal(1);
          expect($.contains(buttonGroup[0], downloadButton[0])).to.be.true;
        }
      );
    });
  });

  function getDownloadButtons(): JQuery<HTMLElement> {
    return $(`.${ZC_DL_BUTTON_CLASS}`);
  }
});

function getSoundActionsHTML(): string {
  return `
    <div class="soundActions sc-button-toolbar soundActions__small">
      <div id="buttonGroupTestId" class="sc-button-group sc-button-group-small"></div>
    </div>
  `;
}

function getSoundListItemHTML(href: string): string {
  return `
    <li id="soundListItemTestId" class="soundList__item">
      <div class="sound__header">
        <a class="soundTitle__title sc-link-dark" href="${href}"></a>
      </div>
      <div class="sound__footer g-all-transitions-300">
        ${getSoundActionsHTML()}
      </div>
    </li>
  `;
}

function getSearchListItemHTML(href: string): string {
  return `
    <li id="searchListItemTestId" class="searchList__item">
      <div class="sound__header">
        <a class="soundTitle__title sc-link-dark" href="${href}"></a>
      </div>
      <div class="sound__footer g-all-transitions-300">
        ${getSoundActionsHTML()}
      </div>
    </li>
  `;
}

function getTrackListItemHTML(href: string): string {
  return `
    <li id="trackListItemTestId" class="trackList__item sc-border-light-bottom">
      <div class="trackItem__content sc-truncate">
        <a href="${href}" class="trackItem__trackTitle sc-link-dark sc-font-light"></a>
      </div>
      <div class="trackItem__additional">
        ${getSoundActionsHTML()}
      </div>
    </li>
  `;
}

function getChartTracksItemHTML(href: string): string {
  return `
    <li id="chartTracksItemTestId" class="chartTracks__item">
      <div class="chartTrack__details">
        <div class="chartTrack__title sc-type-small sc-truncate">
          <a href="${href}" class="sc-link-dark"></a>
        </div>
      </div>
      <div class="chartTrack__actions">
        ${getSoundActionsHTML()}
      </div>
    </li>
  `;
}
