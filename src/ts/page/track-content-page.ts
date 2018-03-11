import {ZC_DL_BUTTON_CLASS} from '@src/constants';
import {IContentPage} from '@src/page/content-page';
import {ITrackInfo} from '@src/service/download-info/download-info';
import {DownloadInfoService} from '@src/service/download-info/download-info-service';
import {UrlService} from '@src/service/url-service';
import {elementAdded$, elementExist$} from '@src/util/dom-observer';
import {logger} from '@src/util/logger';
import * as $ from 'jquery';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/throttleTime';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Subscription} from 'rxjs/Subscription';

export const ZC_TRACK_DL_BUTTON_ID = 'zcTrackDlButton';

export class TrackContentPage implements IContentPage {

  public readonly id = 'zc-track-content';
  private readonly subscriptions: Subscription = new Subscription();
  private readonly trackInfo$: ReplaySubject<ITrackInfo> = new ReplaySubject<ITrackInfo>(1);

  public test(): boolean {
    const TRACK_URL_PATTERN = /^[^:]*:\/\/soundcloud\.com\/([^\/]+)\/([^\/]+)(?:\?in=.+)?$/;
    const TRACK_URL_BLACKLIST_1 = ['you', 'charts', 'jobs', 'messages', 'mobile',
      'pages', 'pro', 'search', 'stations', 'settings', 'tags'];
    const TRACK_URL_BLACKLIST_2 = ['albums', 'comments', 'followers', 'following', 'likes',
      'playlists', 'reposts', 'stats', 'tracks'];
    const matchResults = TRACK_URL_PATTERN.exec(UrlService.getCurrentUrl());
    return (matchResults !== null) &&
      (TRACK_URL_BLACKLIST_1.indexOf(matchResults[1]) < 0) &&
      (TRACK_URL_BLACKLIST_2.indexOf(matchResults[2]) < 0);
  }

  public load(): void {
    const listenEngagementSelector = 'div.listenEngagement.sc-clearfix';
    this.subscriptions.add(
      Observable.merge(
        elementExist$(listenEngagementSelector),
        elementAdded$((node: Node) => $(node).is(listenEngagementSelector))
      ).subscribe(injectDlButton.bind(this))
    );
    this.subscriptions.add(
      DownloadInfoService.getTrackInfo(UrlService.getCurrentUrl()).subscribe(this.trackInfo$)
    );
    logger.log('Loaded track content page');
  }

  public unload(): void {
    removeDlButton();
    this.subscriptions.unsubscribe();
    logger.log('Unloaded track content page');
  }
}

function injectDlButton(listenEngagement: Node): void {
  const soundActions = $(listenEngagement).find('div.soundActions.sc-button-toolbar.soundActions__medium');
  const dlButton = createDlButton();
  const downloadClick$ = Observable.fromEvent(dlButton[0], 'click').throttleTime(3000);
  this.subscriptions.add(
    downloadClick$.subscribe(() => {
      logger.log('Clicked track download button');
      this.trackInfo$.first().subscribe(
        (info: ITrackInfo) => logger.log('Download started!', info),
        (err: string) => logger.log('Error starting download!', err)
      );
    })
  );
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
