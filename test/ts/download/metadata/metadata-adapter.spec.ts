import {ITrackInfo} from '@src/download/download-info';
import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {TrackMetadataFactory} from '@src/download/metadata/track-metadata-factory';
import {useRxTesting, useSinonChai} from '@test/test-initializers';
import {of} from 'rxjs';
import {SinonStub, stub} from 'sinon';
import DownloadOptions = chrome.downloads.DownloadOptions;

const expect = useSinonChai();

describe('metadata adapter', () => {
  const rx = useRxTesting();
  const fixture = MetadataAdapter;

  describe('adding metadata', () => {
    const trackInfo = {} as ITrackInfo;
    const metadata = {} as ITrackMetadata;

    let stubCreateMetadata: SinonStub;
    let stubAddIDV2Metadata: SinonStub;

    beforeEach(() => {
      stubCreateMetadata = stub(TrackMetadataFactory, 'create');
      stubCreateMetadata.withArgs(trackInfo).returns(metadata);

      stubAddIDV2Metadata = stub(ID3MetadataService, 'addID3V2Metadata$');
    });

    afterEach(() => {
      stubCreateMetadata.restore();
      stubAddIDV2Metadata.restore();
    });

    it('should add id3 metadata when downloading a mp3 file', () => {
      const expected = {foo: 'bar'};
      const downloadOptions = {filename: 'some.file.mp3'} as DownloadOptions;
      stubAddIDV2Metadata.withArgs(metadata, downloadOptions).returns(of(expected));

      rx.subscribeTo(fixture.addMetadata$(trackInfo, downloadOptions));
      expect(rx.next).to.be.calledOnce.calledWithExactly(expected);
    });

    it('should not add metadata when not downloading a mp3 file', () => {
      const downloadOptions = {filename: 'some.file.wav'} as DownloadOptions;

      rx.subscribeTo(fixture.addMetadata$(trackInfo, downloadOptions));
      expect(rx.next).to.be.calledOnce.calledWithExactly(downloadOptions);
    });
  });
});
