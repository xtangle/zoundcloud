import {ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_ICON_CLASS} from '@src/constants';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestDownloadMessage} from '@src/messaging/page/request-download.message';
import {logger} from '@src/util/logger';
import * as $ from 'jquery';
import {fromEvent, Subscription} from 'rxjs';
import {throttleTime} from 'rxjs/operators';

export const DownloadButtonFactory = {
  create(subscriptions: Subscription, resourceInfoUrl: string): JQuery<HTMLElement> {
    const dlButton = createDlButton();
    addDlButtonBehavior(dlButton, subscriptions, resourceInfoUrl);
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
                             resourceInfoUrl: string) {
  subscriptions.add(
    fromEvent(dlButton, 'click')
      .pipe(throttleTime(3000))
      .subscribe(() => {
        logger.debug('Downloading', resourceInfoUrl);
        ContentPageMessenger.sendToExtension$(new RequestDownloadMessage(resourceInfoUrl));
      })
  );
}
