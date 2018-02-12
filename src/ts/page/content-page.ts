import * as $ from 'jquery';
import {Subscription} from 'rxjs/Subscription';
import {domElementRemoved$} from './dom-utils';

export abstract class ContentPage {
  protected subscriptions: Subscription = new Subscription();

  protected constructor(protected readonly id: string) {
  }

  public bootstrap() {
    if (this.shouldLoad()) {
      if (!this.hasInitialized()) {
        this.initialize();
      }
    } else {
      if (!this.hasUninitialized()) {
        this.unInitialize();
      }
    }
  }

  protected abstract shouldLoad(): boolean;

  protected abstract onInit(): void;

  private hasInitialized(): boolean {
    return $(`#${this.id}`).length > 0;
  }

  private hasUninitialized(): boolean {
    return $(`#${this.id}`).length === 0;
  }

  private initialize(): void {
    console.log('(ZC): Initializing content page', this.id);
    const contentPageTag = $('<div/>', {id: this.id});
    $('body').append(contentPageTag);
    this.subscriptions.add(domElementRemoved$(contentPageTag[0]).subscribe(() => this.unInitialize()));
    this.onInit();
  }

  private unInitialize(): void {
    console.log('(ZC): Un-initializing content page', this.id);
    $(`#${this.id}`).remove();
    this.subscriptions.unsubscribe();
  }
}
