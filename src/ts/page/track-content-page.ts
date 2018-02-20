import * as $ from 'jquery';
import 'rxjs/add/observable/merge';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {ZC_DL_BUTTON_CLASS} from '../constants';
import {elementAdded$, elementExist$} from '../util/dom-observer';
import {logger} from '../util/logger';
import {IContentPage} from './content-page';

export class TrackContentPage implements IContentPage {
  public readonly id = 'zc-track-content';
  public readonly subscriptions: Subscription = new Subscription();

  public shouldLoad(): boolean {
    const TRACK_URL_PATTERN = /^[^:]*:\/\/soundcloud\.com\/([^\/]+)\/([^\/]+)(?:\?in=.+)?$/;
    const TRACK_URL_BLACKLIST_1 = ['you', 'charts', 'pages', 'settings', 'jobs', 'tags', 'stations'];
    const TRACK_URL_BLACKLIST_2 = ['stats'];
    const matchResults = TRACK_URL_PATTERN.exec(document.location.href);
    return matchResults &&
      (TRACK_URL_BLACKLIST_1.indexOf(matchResults[1]) < 0) &&
      (TRACK_URL_BLACKLIST_2.indexOf(matchResults[2]) < 0);
  }

  public onLoad(): void {
    const listenEngagementSelector = 'div.listenEngagement.sc-clearfix';
    this.subscriptions.add(Observable.merge(
      elementExist$(listenEngagementSelector),
      elementAdded$((node: Node) => $(node).is(listenEngagementSelector))
    ).subscribe(injectDlButton.bind(this)));
  }
}

function injectDlButton(listenEngagement: Node): void {
  const soundActions = $(listenEngagement).find('div.soundActions.sc-button-toolbar.soundActions__medium');
  const dlButton = createDlButton(soundActions);
  dlButton.on('click', () => logger.log('Clicked download button!'));
  addDlButton(soundActions, dlButton);
}

function createDlButton(soundActions: JQuery<HTMLElement>): JQuery<HTMLElement> {
  const dlButton = $('<button/>')
    .addClass(['sc-button', 'sc-button-medium'])
    .addClass(ZC_DL_BUTTON_CLASS)
    .attr('id', 'zcTrackDlButton')
    .prop('title', 'Download this track');
  if ($(soundActions).find('.sc-button-responsive').length) {
    dlButton.addClass('sc-button-responsive');
    dlButton.html('Download');
  } else {
    dlButton.addClass('sc-button-icon');
  }
  return dlButton;
}

function addDlButton(soundActions: JQuery<HTMLElement>, dlButton: JQuery<HTMLElement>): void {
  const buttonGroup = soundActions.children('div').first();
  if (buttonGroup.length) {
    const lastButtonInGroup = buttonGroup.children('button').last();
    if (lastButtonInGroup.hasClass('sc-button-more')) {
      dlButton.insertBefore(lastButtonInGroup);
    } else {
      buttonGroup.append(dlButton);
    }
  }
}
