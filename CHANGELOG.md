# [1.5.0](https://github.com/xtangle/zoundcloud/compare/v1.4.4...v1.5.0) (2019-03-19)


### Features

* **download:** dummy commit, for generating changelog purposes ([74377a3](https://github.com/xtangle/zoundcloud/commit/74377a3))



# [1.5.0](https://github.com/xtangle/zoundcloud/compare/v1.4.4...v1.5.0) (2019-03-19)


### Features

* **download:** dummy commit, for generating changelog purposes ([74377a3](https://github.com/xtangle/zoundcloud/commit/74377a3))



## [1.4.4](https://github.com/xtangle/zoundcloud/compare/v1.4.3...v1.4.4) (2019-03-11)


### Bug Fixes

* **download:** fixed unauthorized error when fetching from i1 api ([1c4cbaf](https://github.com/xtangle/zoundcloud/commit/1c4cbaf))



## [1.4.3](https://github.com/xtangle/zoundcloud/compare/v1.4.2...v1.4.3) (2019-02-12)


### Bug Fixes

* **download:** fixed bug where options cannot be fetched, blocking the download. ([#17](https://github.com/xtangle/zoundcloud/issues/17))



## [1.4.2](https://github.com/xtangle/zoundcloud/compare/v1.4.1...v1.4.2) (2018-12-31)


### Bug Fixes

* **e2e:** fix wrong file size ([4546572](https://github.com/xtangle/zoundcloud/commit/4546572))


### Features

* **download:** add option to disable adding cover art metadata ([3a8e850](https://github.com/xtangle/zoundcloud/commit/3a8e850))
* **options:** add validation to options page ([0e200d3](https://github.com/xtangle/zoundcloud/commit/0e200d3))



## [1.4.1](https://github.com/xtangle/zoundcloud/compare/v1.4.0...v1.4.1) (2018-11-10)


### Bug Fixes

* **options:** fix options page sometimes not opening ([7d23273](https://github.com/xtangle/zoundcloud/commit/7d23273))
* **e2e:** remove deleted track in playlist ([#8](https://github.com/xtangle/zoundcloud/issues/8)) ([0052b0a](https://github.com/xtangle/zoundcloud/commit/0052b0a))


### Features

* **download:** add download buttons to tracks in discover page playlists ([#9](https://github.com/xtangle/zoundcloud/issues/9)) ([69fea47](https://github.com/xtangle/zoundcloud/commit/69fea47))



# [1.4.0](https://github.com/xtangle/zoundcloud/compare/v1.3.2...v1.4.0) (2018-11-04)


### Bug Fixes

* **e2e:** disable parallel workers to make tests less flaky ([906cfac](https://github.com/xtangle/zoundcloud/commit/906cfac))
* **e2e:** fix e2e script in ci ([82dc586](https://github.com/xtangle/zoundcloud/commit/82dc586))
* **e2e:** fix e2e script in ci ([9e4ae66](https://github.com/xtangle/zoundcloud/commit/9e4ae66))
* **e2e:** fix wrong selector ([e8b29ce](https://github.com/xtangle/zoundcloud/commit/e8b29ce))
* **e2e:** increase timeouts and add retry to e2e test ([db5b72e](https://github.com/xtangle/zoundcloud/commit/db5b72e))
* **e2e:** retry test suites and run tests in parallel ([1e38ef6](https://github.com/xtangle/zoundcloud/commit/1e38ef6))
* **options:** fix bug where stream prematurely completes ([7a5ee30](https://github.com/xtangle/zoundcloud/commit/7a5ee30))


### Features

* **icon:** show colored icon when visiting soundcloud page ([e94f0d0](https://github.com/xtangle/zoundcloud/commit/e94f0d0))
* **options:** add descriptions to options and enable configurable track title pattern ([dda2e7d](https://github.com/xtangle/zoundcloud/commit/dda2e7d))
* **options:** Add options page interface ([7f3c076](https://github.com/xtangle/zoundcloud/commit/7f3c076))
* **options:** implement options functionality ([2129b0a](https://github.com/xtangle/zoundcloud/commit/2129b0a))



## [1.3.2](https://github.com/xtangle/zoundcloud/compare/v1.3.1...v1.3.2) (2018-10-17)


### Bug Fixes

* **e2e:** add waits to make test less brittle ([03b035f](https://github.com/xtangle/zoundcloud/commit/03b035f))



## [1.3.1](https://github.com/xtangle/zoundcloud/compare/v1.3.0...v1.3.1) (2018-10-09)


### Bug Fixes

* **cover-art:** Fix song not downloading when there is no cover art. ([31b4116](https://github.com/xtangle/zoundcloud/commit/31b4116))


### Features

* **cover-art:** Download 500x500 cover art for tracks by default. ([6a10ec3](https://github.com/xtangle/zoundcloud/commit/6a10ec3))



# [1.3.0](https://github.com/xtangle/zoundcloud/compare/v1.2.0...v1.3.0) (2018-06-24)


### Bug Fixes

* **injection:** add small delay to fix download buttons sometimes not injecting on page load ([20679fb](https://github.com/xtangle/zoundcloud/commit/20679fb))
* **injection:** revert previous fix of buttons not injecting at page load and implement another fix ([aa23e7d](https://github.com/xtangle/zoundcloud/commit/aa23e7d))
* **release:** v1.3.0, remove default_locales from manifest.json ([b7f1b33](https://github.com/xtangle/zoundcloud/commit/b7f1b33))
* **release:** v1.3.0, use updated icon ([b1f6d15](https://github.com/xtangle/zoundcloud/commit/b1f6d15))



# [1.2.0](https://github.com/xtangle/zoundcloud/compare/v1.1.0...v1.2.0) (2018-06-22)


### Bug Fixes

* **button:** fix bug where download button is incorrectly set to be an icon ([f48cd7a](https://github.com/xtangle/zoundcloud/commit/f48cd7a))
* **test:** Add all tests for download services ([d7affc4](https://github.com/xtangle/zoundcloud/commit/d7affc4))
* **test:** Add more tests to download services and fix existing tests ([fe29f31](https://github.com/xtangle/zoundcloud/commit/fe29f31))
* **test:** add verror for wrapping errors and fix tests for track-download-service ([4dfbeac](https://github.com/xtangle/zoundcloud/commit/4dfbeac))
* **test:** Fixing some existing tests related to metadata and downloading ([5f8845e](https://github.com/xtangle/zoundcloud/commit/5f8845e))
* **track-content:** fix issue of not downloading when button is clicked before track info is fetched ([eb81f32](https://github.com/xtangle/zoundcloud/commit/eb81f32))
* **unload:** fix bug where content page is not unloaded when tab is closed or navigated away from soundcloud page ([4c35ded](https://github.com/xtangle/zoundcloud/commit/4c35ded))


### Features

* **download:** Adding download button to playlists, user pages, and list items. ([e0b6105](https://github.com/xtangle/zoundcloud/commit/e0b6105))
* **download:** Implemented tests for track download method service. ([3a2cf81](https://github.com/xtangle/zoundcloud/commit/3a2cf81))



# [1.1.0](https://github.com/xtangle/zoundcloud/compare/v1.0.0...v1.1.0) (2018-05-14)


### Bug Fixes

* **doc:** use shield.io badges ([a574b9c](https://github.com/xtangle/zoundcloud/commit/a574b9c))


### Features

* **metadata:** mp3 files downloaded will now have idv3 metadata added. ([d77ed3b](https://github.com/xtangle/zoundcloud/commit/d77ed3b))



# [1.0.0](https://github.com/xtangle/zoundcloud/compare/94107e7...v1.0.0) (2018-05-06)


### Bug Fixes

* **build:** Have npm build not fail when lint errors are encountered, remove lint step in ci build ([488905d](https://github.com/xtangle/zoundcloud/commit/488905d))
* **ci:** Add sudo required and specify chrome addon in travis config ([ff00120](https://github.com/xtangle/zoundcloud/commit/ff00120))
* **content:** Fix bug where content-page is unloaded twice ([63e76d1](https://github.com/xtangle/zoundcloud/commit/63e76d1))
* **content:** Fixed behavior of loading download button, refactored to inject based on node added event instead of timers ([19e22a0](https://github.com/xtangle/zoundcloud/commit/19e22a0))
* **test:** Refactored and fixed test for background-script. Also updated dependencies. ([d660bc7](https://github.com/xtangle/zoundcloud/commit/d660bc7))


### Features

* **background:** Unload the background script when the onSuspend event is emitted ([4362fb3](https://github.com/xtangle/zoundcloud/commit/4362fb3))
* **ci:** Adding travis.yml ([94107e7](https://github.com/xtangle/zoundcloud/commit/94107e7))
* **ci:** Remove extra node version from travis.yml ([c07206e](https://github.com/xtangle/zoundcloud/commit/c07206e))
* **ci:** Run build script on Travis-CI ([b6f25bb](https://github.com/xtangle/zoundcloud/commit/b6f25bb))
* **content:** Adding download button to track content page ([f07034b](https://github.com/xtangle/zoundcloud/commit/f07034b))
* **content:** First pass at adding listener on url change in background script and running content script ([6cb7299](https://github.com/xtangle/zoundcloud/commit/6cb7299))
* **content:** Fixed logic to load/unload content scripts, added test libraries and rxjs ([225e8e5](https://github.com/xtangle/zoundcloud/commit/225e8e5))
* **download:** Initial stab at setting up framework to enabling downloads ([efbc40a](https://github.com/xtangle/zoundcloud/commit/efbc40a))
* **download:** Initial stab at setting up framework to enabling downloads ([d5004da](https://github.com/xtangle/zoundcloud/commit/d5004da))
* **spec:** Replaced jsdom with karma with Chrome launcher, added some tests for dom-utils ([267236f](https://github.com/xtangle/zoundcloud/commit/267236f))
* **track-download:** Added correct filename and extension to downloaded track ([0b1cfbc](https://github.com/xtangle/zoundcloud/commit/0b1cfbc))
* **webpack:** Added cleaning output dir and copying of assets to webpack build script ([110a5a3](https://github.com/xtangle/zoundcloud/commit/110a5a3))
* **webpack:** Enable hot-reloading of chrome extension ([fd590d5](https://github.com/xtangle/zoundcloud/commit/fd590d5))
* **webpack:** Split webpack config into dev and prod, add different build tasks for dev and prod ([e85faaa](https://github.com/xtangle/zoundcloud/commit/e85faaa))



