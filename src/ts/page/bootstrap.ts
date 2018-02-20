import * as $ from 'jquery';
import {elementRemoved$} from '../util/dom-observer';
import {logger} from '../util/logger';
import {IContentPage} from './content-page';

export function bootstrap(contentPage: IContentPage): void {
  if (contentPage.test()) {
    load(contentPage);
  } else {
    unload(contentPage);
  }
}

function load(contentPage: IContentPage): void {
  if (!hasLoaded(contentPage)) {
    logger.log('Loading content page', contentPage.id);
    const idTag = createIdTag(contentPage.id);
    addIdTagToDOM(idTag);
    contentPage.subscriptions.add(elementRemoved$(idTag).subscribe(() => contentPage.unload()));
    contentPage.load();
  }
}

function unload(contentPage: IContentPage): void {
  if (!hasUnloaded(contentPage)) {
    logger.log('Unloading content page', contentPage.id);
    removeIdTagFromDOM(contentPage.id);
    contentPage.unload();
  }
}

function hasLoaded(contentPage: IContentPage): boolean {
  return $(`#${contentPage.id}`).length > 0;
}

function hasUnloaded(contentPage: IContentPage): boolean {
  return $(`#${contentPage.id}`).length === 0;
}

function createIdTag(id: string): HTMLElement {
  return $('<div/>', {id})[0];
}

function addIdTagToDOM(idTag: HTMLElement): void {
  $('body').append(idTag);
}

function removeIdTagFromDOM(id: string): void {
  $(`#${id}`).remove();
}
