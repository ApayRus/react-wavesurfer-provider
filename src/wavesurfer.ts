import RegionsPlugin, {
  RegionParams,
  RegionsPluginParams,
} from 'wavesurfer.js/src/plugin/regions';
import TimelinePlugin from 'wavesurfer.js/src/plugin/timeline';
import WaveSurfer from 'wavesurfer.js';
import { PlayerContextState, Phrase } from './Provider';
import { findCurrentPhraseNum } from 'frazy-parser';
import { WaveSurferParams } from 'wavesurfer.js/types/params';

interface InitProps {
  regionsOptions?: RegionsPluginParams;
  wavesurferOptions?: WaveSurferParams;
  phrases?: Phrase[];
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerContextState>>;
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
}: InitProps) => {
  const mediaElement = document.querySelector(
    '#mediaElement'
  ) as HTMLMediaElement;

  clearWaveformElement();

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
  const { controls } = mediaElement;
  wavesurfer.load(mediaElement);
  mediaElement.controls = controls; //wavesurfer.load removes controls, we want to save them

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
      const oldPhrases = oldState.phrases;
      const phrases = updatePhrases(phrase, oldPhrases);
      return { ...oldState, phrases };
    });
  };

  const updateCurrentPhraseNum = (delta = 0) => {
    const currentTime: number = wavesurfer.getCurrentTime() + delta;

    setPlayerState(oldState => {
      const phrases = oldState.phrases;
      const currentPhraseNum = findCurrentPhraseNum(phrases, currentTime);
      return { ...oldState, currentPhraseNum };
    });
  };

  //EVENT HANDLERS
  wavesurfer.on('ready', () => {
    setPlayerState(oldState => ({ ...oldState, isReady: true }));
  });

  wavesurfer.on('audioprocess', () => {
    const currentTime = wavesurfer.getCurrentTime();
    setPlayerState(oldState => ({ ...oldState, currentTime }));
  });

  wavesurfer.on('region-click', (region, event) => {
    event.stopPropagation();
    region.play();
  });
  wavesurfer.on('region-removed', (region /* event */) => {
    setPlayerState(oldState => {
      const oldPhrases = oldState.phrases;
      const phrases = oldPhrases.filter(elem => elem.id !== region.id);
      return { ...oldState, phrases };
    });
  });

  wavesurfer.on('region-updated', (region: Phrase /* event */) => {
    updatePhrase(region);
  });

  wavesurfer.on('region-in', (/* region: Phrase */) => {
    updateCurrentPhraseNum();
  });

  wavesurfer.on('region-out', (/* region: Phrase */) => {
    updateCurrentPhraseNum();
  });

  wavesurfer.on('seek', (/* region: Phrase */) => {
    updateCurrentPhraseNum();
  });

  wavesurfer.on('play', (/* region: Phrase */) => {
    setPlayerState(oldState => ({ ...oldState, isPlaying: true }));
  });

  wavesurfer.on('pause', (/* region: Phrase */) => {
    setPlayerState(oldState => ({ ...oldState, isPlaying: false }));
  });

  wavesurfer.on('finish', (/* region: Phrase */) => {
    setPlayerState(oldState => ({ ...oldState, isPlaying: false }));
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
