/**
 * Service to get the URL of the current page.
 *
 * Normally, a function simple as this would be in-lined. However, for testing using Karma, we cannot set the URL
 * of the page as it forces the page to reload. The reason for placing this logic in a separate service is so that
 * it is possible for it to be stubbed out.
 */
export const UrlService = {
  getCurrentUrl(): string {
    return document.location.href;
  }
};
