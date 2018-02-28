import * as $ from 'jquery';
import 'rxjs/add/observable/merge';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {ZC_DL_BUTTON_CLASS} from '../constants';
import {elementAdded$, elementExist$} from '../util/dom-observer';
import {logger} from '../util/logger';
import {IContentPage} from './content-page';

export const ZC_TRACK_DL_BUTTON_ID = 'zcTrackDlButton';

export class TrackContentPage implements IContentPage {

  public readonly id = 'zc-track-content';
  private readonly subscriptions: Subscription = new Subscription();

  public test(): boolean {
    const TRACK_URL_PATTERN = /^[^:]*:\/\/soundcloud\.com\/([^\/]+)\/([^\/]+)(?:\?in=.+)?$/;
    const TRACK_URL_BLACKLIST_1 = ['you', 'charts', 'jobs', 'messages', 'mobile',
      'pages', 'pro', 'search', 'stations', 'settings', 'tags'];
    const TRACK_URL_BLACKLIST_2 = ['albums', 'comments', 'followers', 'following', 'likes',
      'playlists', 'reposts', 'stats', 'tracks'];
    const matchResults = TRACK_URL_PATTERN.exec(this.getCurrentURL());
    return (matchResults !== null) &&
      (TRACK_URL_BLACKLIST_1.indexOf(matchResults[1]) < 0) &&
      (TRACK_URL_BLACKLIST_2.indexOf(matchResults[2]) < 0);
  }

  public load(): void {
    const listenEngagementSelector = 'div.listenEngagement.sc-clearfix';
    this.subscriptions.add(Observable.merge(
      elementExist$(listenEngagementSelector),
      elementAdded$((node: Node) => $(node).is(listenEngagementSelector))
    ).subscribe(injectDlButton.bind(this)));
    logger.log('Loaded track content page');
  }

  public unload(): void {
    removeDlButton();
    this.subscriptions.unsubscribe();
    logger.log('Unloaded track content page');
  }

  private getCurrentURL = () => document.location.href;
}

function injectDlButton(listenEngagement: Node): void {
  const soundActions = $(listenEngagement).find('div.soundActions.sc-button-toolbar.soundActions__medium');
  const dlButton = createDlButton();
  dlButton.on('click', () => logger.log('Clicked track download button'));
  addDlButton(soundActions, dlButton);
}

function createDlButton(): JQuery<HTMLElement> {
  return $('<button/>')
    .addClass(['sc-button', 'sc-button-medium', 'sc-button-responsive'])
    .addClass(ZC_DL_BUTTON_CLASS)
    .attr('id', ZC_TRACK_DL_BUTTON_ID)
    .prop('title', 'Download this track')
    .html('Download');
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

function removeDlButton(): void {
  $(`#${ZC_TRACK_DL_BUTTON_ID}`).remove();
}
