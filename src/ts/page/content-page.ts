import {Subscription} from 'rxjs/Subscription';

export interface IContentPage {
  readonly id: string;
  readonly subscriptions: Subscription;
  test(): boolean;
  load(): void;
  unload(): void;
}
