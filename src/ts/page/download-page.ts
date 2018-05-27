import {
  ZC_DL_BUTTON_CLASS,
  ZC_DL_BUTTON_ICON_CLASS,
  ZC_DL_BUTTON_MEDIUM_CLASS,
  ZC_DL_BUTTON_SMALL_CLASS
} from '@src/constants';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestDownloadMessage} from '@src/messaging/page/request-download.message';
import {elementExist$, elementExistOrAdded$} from '@src/util/dom-observer';
import {logger} from '@src/util/logger';
import {UrlService} from '@src/util/url-service';
import * as $ from 'jquery';
import {fromEvent, interval, merge, Subscription} from 'rxjs';
import {filter, mapTo, switchMapTo, throttleTime} from 'rxjs/operators';

export const DownloadPage = {
  load(subscriptions: Subscription) {
    subscriptions.add(injectDlButtonToListenEngagement(subscriptions));
    subscriptions.add(injectDlButtonToListItem(subscriptions));
    subscriptions.add(injectDlButtonToUserInfoBar(subscriptions));
  }
};

const hasNoDownloadButton = (node: Node) => $(node).find(`.${ZC_DL_BUTTON_CLASS}`).length === 0;

const forceInject$ = (selector: string) => merge(
  interval(3000),
  ContentPageMessenger.onMessage(ReloadContentPageMessage.TYPE)
).pipe(switchMapTo(elementExist$(selector)));

function injectDlButtonToListenEngagement(subscriptions: Subscription): Subscription {
  const selector = 'div.listenEngagement.sc-clearfix';
  return merge(elementExistOrAdded$(selector), forceInject$(selector))
    .pipe(filter(hasNoDownloadButton))
    .subscribe(addDlButtonToListenEngagement.bind(null, subscriptions));
}

function injectDlButtonToListItem(subscriptions: Subscription): Subscription {
  const selector = '.soundList__item, .searchList__item, .trackList__item, .chartTracks__item';
  return merge(elementExistOrAdded$(selector), forceInject$(selector))
    .pipe(filter(hasNoDownloadButton))
    .subscribe(addDlButtonToListItem.bind(null, subscriptions));
}

function injectDlButtonToUserInfoBar(subscriptions: Subscription): Subscription {
  const selector = '.userInfoBar';
  return merge(elementExistOrAdded$(selector), forceInject$(selector))
    .pipe(filter(hasNoDownloadButton))
    .subscribe(addDlButtonToUserInfoBar.bind(null, subscriptions));
}

function addDlButtonToListenEngagement(subscriptions: Subscription, listenEngagement: Node): void {
  const currUrl = UrlService.getCurrentUrl();
  const dlButton = createBaseDlButton(subscriptions, currUrl)
    .addClass(['sc-button-medium', ZC_DL_BUTTON_MEDIUM_CLASS]);
  const buttonGroup = $(listenEngagement).find('.listenEngagement__footer .soundActions .sc-button-group');
  appendDlButtonToButtonGroup(dlButton, buttonGroup);
}

function addDlButtonToListItem(subscriptions: Subscription, listItem: Node): void {
  const jqListItem = $(listItem);
  const downloadInfoUrl = jqListItem.find('.soundTitle__title, .trackItem__trackTitle, .chartTrack__title > a')
    .first().prop('href');
  const dlButton = createBaseDlButton(subscriptions, downloadInfoUrl)
    .addClass(['sc-button-small', ZC_DL_BUTTON_SMALL_CLASS]);
  const buttonGroup = jqListItem.find('.soundActions .sc-button-group');
  appendDlButtonToButtonGroup(dlButton, buttonGroup);
}

function addDlButtonToUserInfoBar(subscriptions: Subscription, userInfoBar: Node): void {
  const USER_URL_PATTERN = /https:\/\/soundcloud.com\/[^\/]+/;
  const userInfoUrl = USER_URL_PATTERN.exec(UrlService.getCurrentUrl())[0];
  const dlButton = createBaseDlButton(subscriptions, userInfoUrl)
    .addClass(['sc-button-medium', ZC_DL_BUTTON_MEDIUM_CLASS]);
  const buttonGroup = $(userInfoBar).find('.sc-button-group');
  appendDlButtonToButtonGroup(dlButton, buttonGroup);
}

function createBaseDlButton(subscriptions: Subscription, downloadInfoUrl: string): JQuery<HTMLElement> {
  const dlButton = $('<button/>')
    .addClass(['sc-button', 'sc-button-responsive'])
    .addClass([ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_ICON_CLASS])
    .prop('title', 'Download')
    .html('Download');
  addDlButtonBehavior(subscriptions, dlButton, downloadInfoUrl);
  return dlButton;
}

function addDlButtonBehavior(subscriptions: Subscription, dlButton: JQuery<HTMLElement>, downloadInfoUrl: string) {
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

function appendDlButtonToButtonGroup(dlButton: JQuery<HTMLElement>, buttonGroup: JQuery<HTMLElement>) {
  if (buttonGroup.length) {
    const buttons = buttonGroup.children('button');
    if (buttons.first().hasClass('sc-button-icon')) {
      dlButton.addClass('sc-button-icon');
    }
    const shareButton = buttons.filter('.sc-button-share');
    if (shareButton.length) {
      dlButton.insertAfter(shareButton);
    } else {
      const lastButtonInGroup = buttons.last();
      if (lastButtonInGroup.hasClass('sc-button-more')) {
        dlButton.insertBefore(lastButtonInGroup);
      } else {
        buttonGroup.append(dlButton);
      }
    }
  }
}
