import RegionsPlugin, {
  RegionParams,
  RegionsPluginParams,
} from 'wavesurfer.js/src/plugin/regions';
import TimelinePlugin from 'wavesurfer.js/src/plugin/timeline';
import WaveSurfer from 'wavesurfer.js';
import { PlayerContextState, Phrase, defaultPlayerState } from './Provider';
import { findCurrentPhraseNum } from 'frazy-parser';
import { WaveSurferParams } from 'wavesurfer.js/types/params';

interface InitProps {
  regionsOptions?: RegionsPluginParams;
  wavesurferOptions?: WaveSurferParams;
  phrases?: Phrase[];
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerContextState>>;
  peaks?: number[];
}

const defaultWavesurferOptions = {
  backend: 'MediaElement',
  // waveColor: '#A8DBA8',
  // progressColor: '#3B8686',
  minPxPerSec: 50,
  // height: 100,
  normalize: true,
  autoCenter: true,
  scrollParent: true,
} as WaveSurferParams;

const defaultRegionsOptions = {
  dragSelection: true,
  contentEditable: true,
  removeButton: true,
} as RegionsPluginParams;

export const initWavesurfer = ({
  phrases,
  regionsOptions,
  wavesurferOptions,
  setPlayerState,
  peaks,
}: InitProps) => {
  const updatePlayerState = (newValues: Partial<PlayerContextState>) => {
    setPlayerState(oldState => ({ ...oldState, ...newValues }));
  }; // to call setPlayerState shorter sometimes

  const mediaElement = document.querySelector(
    '#mediaElement'
  ) as HTMLMediaElement;

  clearWaveformElement();

  setPlayerState(oldState => ({
    ...oldState,
    ...defaultPlayerState,
    mediaLink: oldState.mediaLink,
  }));

  const wavesurfer = WaveSurfer.create({
    ...defaultWavesurferOptions,
    ...wavesurferOptions,
    container: '#waveformContainer',
    plugins: [
      RegionsPlugin.create({
        // regionsMinLength: 2,
        regions: phrases,
        ...defaultRegionsOptions,
        ...regionsOptions,
      }),
      TimelinePlugin.create({
        container: '#timelineContainer' /* wavesurferTimelineRef.current! */,
      }),
    ],
  });

  renderWaveform({ mediaElement, wavesurfer, peaks });
  // UTILS

  const updatePhrase = (region: RegionParams) => {
    const {
      id,
      start,
      end,
      // @ts-ignore
      data,
    } = region;

    const phrase = { id, start, end, data } as Phrase;

    setPlayerState(oldState => {
      const { phrases: oldPhrases } = oldState;
      const phrases = updatePhrases(phrase, oldPhrases);
      return { ...oldState, phrases };
    });
  };

  const updateCurrentPhraseNum = (delta = 0) => {
    const currentTime: number = wavesurfer.getCurrentTime() + delta;
    setPlayerState(oldState => {
      const { phrases } = oldState;
      const currentPhraseNum = findCurrentPhraseNum(phrases, currentTime);
      return { ...oldState, currentPhraseNum };
    });
  };

  //EVENT HANDLERS
  wavesurfer.on('ready', () => {
    updatePlayerState({ isReady: true, duration: wavesurfer.getDuration() });
  });

  wavesurfer.on('audioprocess', () => {
    const currentTime = wavesurfer.getCurrentTime();
    updatePlayerState({ currentTime });
  });

  wavesurfer.on('region-click', (region, event) => {
    updatePlayerState({ playMode: 'phrase' });
    event.stopPropagation();
    region.play();
  });

  wavesurfer.on('region-removed', (region /* event */) => {
    setPlayerState(oldState => {
      const { phrases: oldPhrases } = oldState;
      const phrases = oldPhrases.filter(elem => elem.id !== region.id);
      return { ...oldState, phrases };
    });
  });

  // wavesurfer.on('region-update-end', (region: Phrase /* event */) => {
  //   updatePhrase(region);
  // });

  wavesurfer.on('region-update-end', (region: Phrase /* event */) => {
    updatePhrase(region);
  });

  wavesurfer.on('region-in', (region: Phrase) => {
    // console.log(region.id);
    wavesurfer.setDisabledEventEmissions(['region-in']);
    setPlayerState(oldState => {
      const { id = 0 } = region;
      return { ...oldState, currentPhraseNum: +id };
    });
    // updateCurrentPhraseNum();
  });

  wavesurfer.on('region-out', () => {
    wavesurfer.setDisabledEventEmissions([]);
    // updateCurrentPhraseNum();
  });

  wavesurfer.on('seek', (/* region: Phrase */) => {
    updatePlayerState({
      currentTime: wavesurfer.getCurrentTime(),
      isFinished: false,
    });
    updateCurrentPhraseNum();
  });

  wavesurfer.on('play', (/* region: Phrase */) => {
    updatePlayerState({ isPlaying: true });
  });

  wavesurfer.on('pause', (/* region: Phrase */) => {
    //when a region was played by clicking on the waveform region
    setPlayerState(oldState => {
      const { playMode } = oldState;
      if (playMode !== 'dictation') {
        return { ...oldState, isPlaying: false, playMode: 'all' };
      } else {
        return { ...oldState, isPlaying: false };
      }
    });
  });

  wavesurfer.on('finish', (/* region: Phrase */) => {
    updatePlayerState({ isPlaying: false, isFinished: true });
  });

  return wavesurfer;
};

function updatePhrases(phrase: Phrase, phrases: Phrase[]) {
  const phrasesExcept1 = phrases.filter(elem => elem.id !== phrase.id);
  const newPhrases = [...phrasesExcept1, phrase].sort(
    (a, b) => a.start - b.start
  );
  return newPhrases;
}

function clearWaveformElement() {
  const waveformContainer = document.querySelector(
    '#waveformContainer'
  ) as HTMLDivElement;

  if (waveformContainer) {
    waveformContainer.innerHTML = ''; //otherwise it will be doubled on each init
  }
}

interface RenderWaveformProps {
  mediaElement: HTMLMediaElement;
  wavesurfer: WaveSurfer;
  peaks?: number[];
}

export function renderWaveform({
  mediaElement,
  wavesurfer,
  peaks,
}: RenderWaveformProps) {
  const { controls } = mediaElement;
  if (peaks) {
    wavesurfer.load(mediaElement, peaks);
  } else {
    wavesurfer.load(mediaElement); //generate peaks on client side
  }
  mediaElement.controls = controls; //wavesurfer.load removes controls, we want to save them
}
