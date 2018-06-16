import {ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_ICON_CLASS} from '@src/constants';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestDownloadMessage} from '@src/messaging/page/request-download.message';
import {logger} from '@src/util/logger';
import * as $ from 'jquery';
import {fromEvent, Subscription} from 'rxjs';
import {mapTo, throttleTime} from 'rxjs/operators';

export const DownloadButtonFactory = {
  create(subscriptions: Subscription, downloadInfoUrl: string): JQuery<HTMLElement> {
    const dlButton = createDlButton();
    addDlButtonBehavior(dlButton, subscriptions, downloadInfoUrl);
    return dlButton;
  }
};

function createDlButton(): JQuery<HTMLElement> {
  return $('<button/>')
    .addClass(['sc-button', 'sc-button-responsive'])
    .addClass([ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_ICON_CLASS])
    .prop('title', 'Download')
    .html('Download');
}

function addDlButtonBehavior(dlButton: JQuery<HTMLElement>,
                             subscriptions: Subscription,
                             downloadInfoUrl: string) {
  const downloadClick$ = fromEvent(dlButton, 'click').pipe(throttleTime(3000));
  subscriptions.add(
    downloadClick$.pipe(mapTo(downloadInfoUrl))
      .subscribe(
        (dlInfoUrl: string) => {
          logger.debug('Downloading', dlInfoUrl);
          ContentPageMessenger.sendToExtension(new RequestDownloadMessage(dlInfoUrl));
        },
        (err) => logger.error('Error downloading', err)
      )
  );
}
