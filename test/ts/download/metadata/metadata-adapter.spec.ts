import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {TrackMetadataFactory} from '@src/download/metadata/track-metadata-factory';
import {ITrackDownloadMethod} from '@src/download/track-download-method';
import {useRxTesting, useSinonChai} from '@test/test-initializers';
import {of} from 'rxjs';
import {SinonStub, stub} from 'sinon';
import DownloadOptions = chrome.downloads.DownloadOptions;

const expect = useSinonChai();

describe('metadata adapter', () => {
  const rx = useRxTesting();
  const fixture = MetadataAdapter;

  describe('adding metadata', () => {
    const inputDlOptions = {} as DownloadOptions;
    let stubCreateMetadata: SinonStub;
    let stubAddIDV2Metadata: SinonStub;

    beforeEach(() => {
      stubCreateMetadata = stub(TrackMetadataFactory, 'create');
      stubAddIDV2Metadata = stub(ID3MetadataService, 'addID3V2Metadata$');
    });

    afterEach(() => {
      stubCreateMetadata.restore();
      stubAddIDV2Metadata.restore();
    });

    it('should add id3 metadata when downloading a mp3 file', () => {
      const metadata = {} as ITrackMetadata;
      const downloadMethod = {fileExtension: 'mp3'} as ITrackDownloadMethod;
      const expectedDlOptions = {foo: 'bar'};
      stubCreateMetadata.withArgs(downloadMethod).returns(metadata);
      stubAddIDV2Metadata.withArgs(metadata, inputDlOptions).returns(of(expectedDlOptions));

      rx.subscribeTo(fixture.addMetadata$(downloadMethod, inputDlOptions));
      expect(rx.next).to.be.calledOnce.calledWithExactly(expectedDlOptions);
      expect(rx.complete).to.be.called;
    });

    it('should not add metadata when not downloading a mp3 file', () => {
      const downloadMethod = {fileExtension: 'wav'} as ITrackDownloadMethod;

      rx.subscribeTo(fixture.addMetadata$(downloadMethod, inputDlOptions));
      expect(rx.next).to.be.calledOnce.calledWithExactly(inputDlOptions);
      expect(rx.complete).to.be.called;
    });
  });
});
