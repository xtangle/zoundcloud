import {ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_ICON_CLASS} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestTrackDownloadMessage} from '@src/messaging/page/request-track-download.message';
import {IContentPage} from '@src/page/content-page';
import {subscribeToReloadPageRequest} from '@src/page/content-page-commons';
import {elementAdded$, elementExist$} from '@src/util/dom-observer';
import {logger} from '@src/util/logger';
import {UrlService} from '@src/util/url-service';
import * as $ from 'jquery';
import {BehaviorSubject, fromEvent, merge, Subscription} from 'rxjs';
import {filter, first, switchMap, take, throttleTime, timeout} from 'rxjs/operators';

export const ZC_TRACK_DL_BUTTON_ID = 'zcTrackDlButton';

export class TrackContentPage implements IContentPage {
  public readonly type = 'track';
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
    this.subscriptions.add(this.injectDlButton());
    this.subscriptions.add(subscribeToReloadPageRequest.call(this));
    this.updateTrackInfo();
    logger.debug('Loaded track content page');
  }

  public unload(): void {
    removeDlButton();
    this.subscriptions.unsubscribe();
    logger.debug('Unloaded track content page');
  }

  public reload(): void {
    this.trackInfo$.next(null);
    this.updateTrackInfo();
    logger.debug('Reloaded track content page');
  }

  private updateTrackInfo(): void {
    this.subscriptions.add(
      DownloadInfoService.getTrackInfo$(UrlService.getCurrentUrl()).subscribe((trackInfo) => {
        logger.debug('Updated track info', trackInfo);
        this.trackInfo$.next(trackInfo);
      })
    );
  }

  private injectDlButton(): Subscription {
    const listenEngagementSelector = 'div.listenEngagement.sc-clearfix';
    return merge(
      elementExist$(listenEngagementSelector),
      elementAdded$((node: Node) => $(node).is(listenEngagementSelector))
    ).subscribe(this.addDlButton.bind(this));
  }

  private addDlButton(listenEngagement: Node): void {
    const dlButton = this.createDlButton();
    const soundActions = $(listenEngagement).find('div.soundActions.sc-button-toolbar.soundActions__medium');
    const buttonGroup = soundActions.children('div').first();
    if (buttonGroup.length) {
      const lastButtonInGroup = buttonGroup.children('button').last();
      if (lastButtonInGroup.hasClass('sc-button-more')) {
        dlButton.insertBefore(lastButtonInGroup);
      } else {
        buttonGroup.append(dlButton);
      }
    }
    logger.debug('Added download button');
  }

  private createDlButton(): JQuery<HTMLElement> {
    const dlButton = $('<button/>')
      .addClass(['sc-button', 'sc-button-medium', 'sc-button-responsive'])
      .addClass(ZC_DL_BUTTON_ICON_CLASS)
      .addClass(ZC_DL_BUTTON_CLASS)
      .attr('id', ZC_TRACK_DL_BUTTON_ID)
      .prop('title', 'Download this track')
      .html('Download');
    this.addDlButtonBehavior(dlButton);
    return dlButton;
  }

  private addDlButtonBehavior(dlButton: JQuery<HTMLElement>) {
    const downloadClick$ = fromEvent(dlButton, 'click').pipe(throttleTime(3000));
    const toFirstTrackInfo$ = () => this.trackInfo$.pipe(
      take(2),
      filter((trackInfo) => trackInfo !== null),
      first(),
      timeout(30000)
    );
    this.subscriptions.add(
      downloadClick$.pipe(switchMap(toFirstTrackInfo$))
        .subscribe(
          (trackInfo) => {
            logger.debug('Downloading track', trackInfo.id);
            ContentPageMessenger.sendToExtension(new RequestTrackDownloadMessage(trackInfo));
          },
          (err) => logger.error('Error fetching track info', err)
        )
    );
  }
}

function removeDlButton(): void {
  $(`#${ZC_TRACK_DL_BUTTON_ID}`).remove();
}
