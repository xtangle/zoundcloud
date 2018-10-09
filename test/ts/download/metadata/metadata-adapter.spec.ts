import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {TrackMetadataFactory} from '@src/download/metadata/track-metadata-factory';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {XhrService} from '@src/util/xhr-service';
import {configureChai, useRxTesting} from '@test/test-initializers';
import {EMPTY, of} from 'rxjs';
import {restore, SinonStub, stub} from 'sinon';

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
    });

    it('should use high res url if it is available', () => {
      stubPing$.withArgs(expectedHighResUrl).returns(of(200));
      const expectedMetadata = {...metadata, cover_url: expectedHighResUrl};
      stubAddIDV2Metadata.returns(EMPTY);

      rx.subscribeTo(fixture.addMetadata$(inputDlInfo));
      expect(stubAddIDV2Metadata).to.have.been.calledOnceWithExactly(expectedMetadata, inputDlInfo);
    });

    it('should fall back to original cover art url if high res version is not available', () => {
      stubPing$.withArgs(expectedHighResUrl).returns(of(404));
      const expectedMetadata = {...metadata};
      stubAddIDV2Metadata.returns(EMPTY);

      rx.subscribeTo(fixture.addMetadata$(inputDlInfo));
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
