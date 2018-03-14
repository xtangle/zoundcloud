import {UrlService} from '@src/util/url-service';
import {expect} from 'chai';

describe('url service', () => {
  const fixture = UrlService;

  it('should get the current page\'s URL', () => {
    expect(fixture.getCurrentUrl()).to.be.equal(document.location.href);
  });
});
