import {ZC_DL_BUTTON_CLASS, ZC_DL_BUTTON_MEDIUM_CLASS, ZC_DL_BUTTON_SMALL_CLASS} from '@src/constants';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {elementExist$, elementExistOrAdded$} from '@src/util/dom-observer';
import {UrlService} from '@src/util/url-service';
import * as $ from 'jquery';
import {interval, merge, Observable, Subscription} from 'rxjs';
import {filter, switchMapTo} from 'rxjs/operators';
import {DownloadButtonFactory} from '@src/page/download-button-factory';

export const InjectionService = {
  injectDownloadButtons(subscriptions: Subscription) {
    subscriptions.add(injectToListenEngagement(subscriptions));
    subscriptions.add(injectToListItem(subscriptions));
    subscriptions.add(injectToUserInfoBar(subscriptions));
  }
};

function getElementToInjectInto$(selector: string): Observable<Node> {
  const hasNoDownloadButton = (node: Node) => $(node).find(`.${ZC_DL_BUTTON_CLASS}`).length === 0;
  const forcefullyInject$ = merge(
    interval(3000),
    ContentPageMessenger.onMessage(ReloadContentPageMessage.TYPE)
  ).pipe(
    switchMapTo(elementExist$(selector))
  );
  return merge(
    elementExistOrAdded$(selector),
    forcefullyInject$
  ).pipe(
    filter(hasNoDownloadButton)
  );
}

function injectToListenEngagement(subscriptions: Subscription): Subscription {
  const selector = 'div.listenEngagement.sc-clearfix';
  return getElementToInjectInto$(selector)
    .subscribe(addToListenEngagement.bind(null, subscriptions));
}

function injectToListItem(subscriptions: Subscription): Subscription {
  const selector = '.soundList__item, .searchList__item, .trackList__item, .chartTracks__item';
  return getElementToInjectInto$(selector)
    .subscribe(addToListItem.bind(null, subscriptions));
}

function injectToUserInfoBar(subscriptions: Subscription): Subscription {
  const selector = '.userInfoBar';
  return getElementToInjectInto$(selector)
    .subscribe(addToUserInfoBar.bind(null, subscriptions));
}

function addToListenEngagement(subscriptions: Subscription, listenEngagement: Node): void {
  const currUrl = UrlService.getCurrentUrl();
  const dlButton = DownloadButtonFactory.create(subscriptions, currUrl)
    .addClass(['sc-button-medium', ZC_DL_BUTTON_MEDIUM_CLASS]);
  const buttonGroup = $(listenEngagement).find('.listenEngagement__footer .soundActions .sc-button-group');
  addToButtonGroup(dlButton, buttonGroup);
}

function addToListItem(subscriptions: Subscription, listItem: Node): void {
  const jqListItem = $(listItem);
  const downloadInfoUrl = jqListItem.find('.soundTitle__title, .trackItem__trackTitle, .chartTrack__title > a')
    .first().prop('href');
  const dlButton = DownloadButtonFactory.create(subscriptions, downloadInfoUrl)
    .addClass(['sc-button-small', ZC_DL_BUTTON_SMALL_CLASS]);
  const buttonGroup = jqListItem.find('.soundActions .sc-button-group');
  addToButtonGroup(dlButton, buttonGroup);
}

function addToUserInfoBar(subscriptions: Subscription, userInfoBar: Node): void {
  const USER_URL_PATTERN = /https:\/\/soundcloud.com\/[^\/]+/;
  const userInfoUrl = USER_URL_PATTERN.exec(UrlService.getCurrentUrl())[0];
  const dlButton = DownloadButtonFactory.create(subscriptions, userInfoUrl)
    .addClass(['sc-button-medium', ZC_DL_BUTTON_MEDIUM_CLASS]);
  const buttonGroup = $(userInfoBar).find('.sc-button-group');
  addToButtonGroup(dlButton, buttonGroup);
}

function addToButtonGroup(dlButton: JQuery<HTMLElement>, buttonGroup: JQuery<HTMLElement>) {
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
