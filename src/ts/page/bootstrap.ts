import * as $ from 'jquery';
import {elementRemoved$} from '../util/dom-observer';
import {logger} from '../util/logger';
import {IContentPage} from './content-page';

export function bootstrap(contentPage: IContentPage): void {
  if (contentPage.shouldLoad()) {
    if (!hasLoaded(contentPage)) {
      load(contentPage);
    }
  } else {
    if (!hasUnloaded(contentPage)) {
      unload(contentPage);
    }
  }
}

function hasLoaded(contentPage: IContentPage): boolean {
  return $(`#${contentPage.id}`).length > 0;
}

function hasUnloaded(contentPage: IContentPage): boolean {
  return $(`#${contentPage.id}`).length === 0;
}

function load(contentPage: IContentPage): void {
  logger.log('Loading content page', contentPage.id);
  const contentPageTag = $('<div/>', {id: contentPage.id});
  $('body').append(contentPageTag);
  contentPage.subscriptions.add(elementRemoved$(contentPageTag[0])
    .subscribe(unload.bind(null, contentPage)));
  contentPage.onLoad();
}

function unload(contentPage: IContentPage): void {
  logger.log('Unloading content page', contentPage.id);
  $(`#${contentPage.id}`).remove();
  contentPage.subscriptions.unsubscribe();
}
