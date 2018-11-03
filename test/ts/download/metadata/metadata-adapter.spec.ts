import {EMPTY, of, timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {clock, restore, SinonStub, stub, useFakeTimers} from 'sinon';
import {ID3MetadataService} from 'src/ts/download/metadata/id3-metadata-service';
import {MetadataAdapter} from 'src/ts/download/metadata/metadata-adapter';
import {ITrackMetadata} from 'src/ts/download/metadata/track-metadata';
import {TrackMetadataFactory} from 'src/ts/download/metadata/track-metadata-factory';
import {ITrackDownloadInfo} from 'src/ts/download/track-download-info';
import {XhrService} from 'src/ts/util/xhr-service';
import {configureChai, useRxTesting} from 'test/ts/test-initializers';

const expect = configureChai();

describe('metadata adapter', () => {
  const rx = useRxTesting();

  const fixture = MetadataAdapter;
  let inputDlInfo: ITrackDownloadInfo;
  let metadata: ITrackMetadata;

  let stubPing$: SinonStub;
  let stubCreateMetadata: SinonStub;
  let stubAddIDV2Metadata: SinonStub;

  beforeEach(() => {
    useFakeTimers();

    inputDlInfo = {downloadOptions: {}, trackInfo: {}} as ITrackDownloadInfo;
    metadata = {title: 'foo', cover_url: 'cover-url-large.jpg'} as ITrackMetadata;

    stubPing$ = stub(XhrService, 'ping$');
    stubPing$.returns(of(404)); // Use original cover art url by default

    stubCreateMetadata = stub(TrackMetadataFactory, 'create');
    stubCreateMetadata.withArgs(inputDlInfo.trackInfo).returns(metadata);

    stubAddIDV2Metadata = stub(ID3MetadataService, 'addID3V2Metadata$');
  });

  afterEach(() => {
    restore();
  });

  describe('updating the cover art url in the metadata', () => {
    const expectedHighResUrl = 'cover-url-t500x500.jpg';

    beforeEach(() => {
      // Set file extension to .mp3 to enable adding metadata for these set of tests
      inputDlInfo.downloadOptions.filename = 'file.name.mp3';
      stubAddIDV2Metadata.returns(EMPTY);
    });

    it('should not update cover art url if there is no cover art url', () => {
      metadata.cover_url = '';
      const expectedMetadata = {...metadata};

      rx.subscribeTo(fixture.addMetadata$(inputDlInfo));
      expect(stubAddIDV2Metadata).to.have.been.calledOnceWithExactly(expectedMetadata, inputDlInfo);
    });

    it('should use high resolution cover art url if it is available', () => {
      stubPing$.withArgs(expectedHighResUrl).returns(of(200));
      const expectedMetadata = {...metadata, cover_url: expectedHighResUrl};

      rx.subscribeTo(fixture.addMetadata$(inputDlInfo));
      expect(stubAddIDV2Metadata).to.have.been.calledOnceWithExactly(expectedMetadata, inputDlInfo);
    });

    it('should fall back to original cover art url if high resolution version is not available', () => {
      stubPing$.withArgs(expectedHighResUrl).returns(of(404));
      const expectedMetadata = {...metadata};

      rx.subscribeTo(fixture.addMetadata$(inputDlInfo));
      expect(stubAddIDV2Metadata).to.have.been.calledOnceWithExactly(expectedMetadata, inputDlInfo);
    });

    it('should not update cover art url if pinging for high resolution url takes 10 seconds or more', () => {
      stubPing$.withArgs(expectedHighResUrl).returns(timer(10000).pipe(mapTo(200)));
      const expectedMetadata = {...metadata};

      rx.subscribeTo(fixture.addMetadata$(inputDlInfo));
      clock.tick(10001);
      expect(stubAddIDV2Metadata).to.have.been.calledOnceWithExactly(expectedMetadata, inputDlInfo);
    });
  });

  it('should add id3 metadata when downloading a mp3 file', () => {
    inputDlInfo.downloadOptions.filename = 'file.name.mp3';
    const expectedDlInfo = {trackInfo: {title: 'bar'}} as ITrackDownloadInfo;
    stubAddIDV2Metadata.withArgs(metadata, inputDlInfo).returns(of(expectedDlInfo));

    rx.subscribeTo(fixture.addMetadata$(inputDlInfo));
    expect(rx.next).to.be.calledOnceWithExactly(expectedDlInfo);
    expect(rx.complete).to.be.called;
  });

  it('should not add metadata when not downloading a mp3 file', () => {
    inputDlInfo.downloadOptions.filename = 'file.name.wav';

    rx.subscribeTo(fixture.addMetadata$(inputDlInfo));
    expect(rx.next).to.be.calledOnceWithExactly(inputDlInfo);
    expect(rx.complete).to.be.called;
  });
});
