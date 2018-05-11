import {ZC_DL_BUTTON_CLASS} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {IMessageHandlerArgs} from '@src/messaging/messenger';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestTrackDownloadMessage} from '@src/messaging/page/request-track-download.message';
import {IContentPage} from '@src/page/content-page';
import {elementAdded$, elementExist$} from '@src/util/dom-observer';
import {logger} from '@src/util/logger';
import {UrlService} from '@src/util/url-service';
import * as $ from 'jquery';
import {BehaviorSubject, fromEvent, merge, Subscription} from 'rxjs';
import {map, throttleTime} from 'rxjs/operators';

export const ZC_TRACK_DL_BUTTON_ID = 'zcTrackDlButton';

export class TrackContentPage implements IContentPage {
  public readonly id = 'zc-track-content';
  private readonly subscriptions: Subscription = new Subscription();
  private readonly trackInfo$: BehaviorSubject<ITrackInfo | null> = new BehaviorSubject<ITrackInfo>(null);

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
      merge(
        elementExist$(listenEngagementSelector),
        elementAdded$((node: Node) => $(node).is(listenEngagementSelector))
      ).subscribe(this.injectDlButton.bind(this))
    );
    this.subscriptions.add(
      ContentPageMessenger.onMessage(ReloadContentPageMessage.TYPE).subscribe(
        (args: IMessageHandlerArgs<ReloadContentPageMessage>) => {
          if (args.message.contentPageId === this.id) {
            this.reload();
          }
        })
    );
    this.subscriptions.add(
      this.trackInfo$.subscribe((trackInfo: ITrackInfo) => logger.debug('Updated track info', trackInfo))
    );
    this.updateTrackInfo();
    logger.debug('Loaded track content page');
  }

  public unload(): void {
    removeDlButton();
    this.subscriptions.unsubscribe();
    logger.debug('Unloaded track content page');
  }

  private reload(): void {
    this.trackInfo$.next(null);
    this.updateTrackInfo();
  }

  private updateTrackInfo(): void {
    this.subscriptions.add(
      DownloadInfoService.getTrackInfo$(UrlService.getCurrentUrl()).subscribe(this.trackInfo$)
    );
  }

  private injectDlButton(listenEngagement: Node): void {
    const soundActions = $(listenEngagement).find('div.soundActions.sc-button-toolbar.soundActions__medium');
    const dlButton = createDlButton();
    const downloadClick$ = fromEvent(dlButton[0], 'click').pipe(throttleTime(3000));
    this.subscriptions.add(
      downloadClick$.pipe(map(() => this.trackInfo$.getValue()))
        .subscribe((trackInfo: ITrackInfo) => {
          if (trackInfo) {
            ContentPageMessenger.sendToExtension(new RequestTrackDownloadMessage(trackInfo));
          }
        })
    );
    addDlButton(soundActions, dlButton);
  }
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
