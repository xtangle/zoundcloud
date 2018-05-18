export interface IContentPage {
  readonly type: string;
  test(): boolean;
  load(): void;
  unload(): void;
  reload(): void;
}
