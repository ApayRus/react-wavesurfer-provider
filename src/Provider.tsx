import * as React from 'react';

import { createContext, useEffect, useRef, useState } from 'react';
import { RegionsPluginParams } from 'wavesurfer.js/src/plugin/regions';
import { WaveSurferParams } from 'wavesurfer.js/types/params';
import { initWavesurfer, renderWaveform } from './wavesurfer';
import WaveSurfer from 'wavesurfer.js';
import merge from 'lodash-es/merge';

export interface Phrase {
  id?: string;
  start: number;
  end: number;
  data?: { text: string };
}

interface UpdatePhrasesProps {
  phrases: Phrase[];
  randomIds?: boolean;
  replace?: boolean;
}

interface Props {
  children: JSX.Element;
  mediaLink?: string;
  phrasesProps?: UpdatePhrasesProps;
  regionsOptions?: RegionsPluginParams;
  wavesurferOptions?: WaveSurferParams;
  peaks?: number[];
}

export type DelayMeasure = 'phraseLength' | 'seconds';

export interface PlayerContextState {
  phrases: Phrase[];
  mediaLink: string;
  currentTime: number;
  isPlaying: boolean;
  isReady: boolean;
  isFinished: boolean;
  currentPhraseNum: number;
  currentPhraseId: string;
  duration: number;
  peaks: number[];
  playMode: 'all' | 'phrase' | 'dictation';
  //dictation:
  currentRepeatNum: number;
  timerId: number;
  // repeatTimer: number; // seconds to play next repeat
  // repeatTimerId: number;
}

interface PlayDictationProps {
  repeatCount: number;
  repeatDelay: number;
  delayMeasure: DelayMeasure;
}

interface PlayerContextMethods {
  setMediaLink: (mediaLink: string) => void;
  setCurrentTime: (currentTime: number) => void;
  setPeaks: (peaks: number[]) => void;
  setRepeatDelay: (repeatDelay: number) => void;
  setRepeatCount: (repeatCount: number) => void;
  setDelayMeasure: (delayMeasure: DelayMeasure) => void;
  getWavesurferInstance: () => WaveSurfer | null;
  calculatePeaks: () => void;
  removePeaks: () => void;
  updatePhrases: (props: UpdatePhrasesProps) => void;
  updatePhrase: (phraseUpdate: Partial<Phrase>) => void;
  removePhrase: (id: string) => void;
  removePhrases: () => void;
  play: () => void;
  pause: () => void;
  playPhrase: (phraseId: string) => void;
  playDictation: (props: PlayDictationProps) => void;
  updateState: (newValues: Partial<PlayerContextState>) => void;
  setPlaybackRate: (rate: number) => void;
}

interface PlayerContextType {
  state: PlayerContextState;
  methods: PlayerContextMethods;
}

export const PlayerContext = createContext({} as PlayerContextType);

export const defaultPlayerState = {
  isReady: false,
  currentTime: 0,
  currentPhraseNum: 0,
  currentPhraseId: '0',
  isPlaying: false,
  isFinished: false,
  duration: 0,
  mediaLink: '',
  peaks: [],
  playMode: 'all',
  //dictation
  currentRepeatNum: 1,
  timerId: 0,
  // repeatTimer:0, // seconds to next repeat
  // repeatTimerId:0
  phrases: [],
} as PlayerContextState;

export const PlayerProvider: React.FC<Props> = ({
  children,
  mediaLink: mediaLinkProp = '',
  phrasesProps,
  regionsOptions,
  wavesurferOptions,
  peaks: peaksProp,
}) => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const zeroPhrase = { id: '0', start: 0, end: 0 };

  const [state, setState] = useState<PlayerContextState>({
    ...defaultPlayerState,
    mediaLink: mediaLinkProp,
    phrases: [zeroPhrase, ...(phrasesProps?.phrases || [])],
  });

  const updateState = (newValues: Partial<PlayerContextState>) => {
    setState(oldState => ({ ...oldState, ...newValues }));
  };

  useEffect(() => {
    const wavesurfer = initWavesurfer({
      phrases: phrasesProps?.phrases,
      regionsOptions,
      wavesurferOptions,
      setPlayerState: setState,
      peaks: peaksProp,
    });

    wavesurferRef.current = wavesurfer;
    console.log('wavesurfer');
    console.log(wavesurfer);
    updatePhrases({ phrases: [], replace: true });
  }, [state.mediaLink, mediaLinkProp]);

  useEffect(() => {
    const { phrases = [], randomIds, replace } = phrasesProps || {};
    updatePhrases({ phrases, randomIds, replace });
  }, [phrasesProps?.phrases]);

  const updatePhrases = ({
    phrases = [],
    randomIds = true,
    replace = true,
  }: UpdatePhrasesProps) => {
    let newPhrases = [] as Phrase[];
    const isPhrasesWithoutIds = phrases.filter(elem => elem.id).length === 0;
    if (randomIds || isPhrasesWithoutIds) {
      // add random ids (if we hadn't ids or need new original ids)
      newPhrases = phrases.map(phrase => {
        const id = (Math.random() + 1).toString(36).substring(7);
        return { ...phrase, id };
      });
    } else {
      newPhrases = phrases;
    }

    newPhrases.forEach(phrase => {
      if (wavesurferRef.current) {
        wavesurferRef.current.addRegion(phrase);
      }
    });

    setState(oldState => {
      const { phrases: oldPhrases } = oldState;
      let phrases = (replace
        ? [...newPhrases]
        : [...oldPhrases, ...newPhrases]
      ).sort((a, b) => a.start - b.start);

      // add zero phrase if it doesn't exist
      if (!phrases.find(elem => elem.start === 0 && elem.end === 0)) {
        phrases = [zeroPhrase, ...phrases];
      }
      return { ...oldState, phrases };
    });
  };

  const updatePhrase = (phraseUpdate: Partial<Phrase>) => {
    const { id = '' } = phraseUpdate;
    const { phrases } = { ...state };
    const region = wavesurferRef.current?.regions.list[id];
    const regionUpdated = merge(region, phraseUpdate);
    if (wavesurferRef.current) {
      wavesurferRef.current.regions.list[id] = regionUpdated;
    }
    const phrase = phrases.find(elem => elem.id === id);
    const phraseIndex = phrases.findIndex(elem => elem.id === id);
    const phraseUpdated = merge(phrase, phraseUpdate);
    phrases[phraseIndex] = phraseUpdated;
    updatePhrases({ phrases, randomIds: false });
  };

  const removePhrase = (id: string) => {
    if (wavesurferRef.current) {
      const region = wavesurferRef.current.regions.list[id];
      region.remove();
    }
  };

  const removePhrases = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.clearRegions();
      updatePhrases({ phrases: [zeroPhrase], replace: true });
    }
  };

  const setMediaLink = (mediaLink: string) => {
    updateState({ mediaLink });
  };

  const play = () => {
    if (wavesurferRef.current) {
      stopDictation();
      updateState({ playMode: 'all' });
      wavesurferRef.current.play();
    }
  };

  const pause = () => {
    if (wavesurferRef.current) {
      stopDictation();
      updateState({ playMode: 'all' });
      wavesurferRef.current.pause();
    }
  };

  const playPhrase = (phraseId: string) => {
    if (wavesurferRef.current) {
      updateState({ playMode: 'phrase' });
      stopDictation();
      wavesurferRef.current.regions.list[phraseId].play();
    }
  };

  const playDictationPhraseOnce = (phraseId: string) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.regions.list[phraseId].play();
    }
  };

  const setCurrentTime = (currentTime: number) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.seekTo(currentTime / state.duration);
    }
  };

  const setPlaybackRate = (rate: number) => {
    wavesurferRef.current?.setPlaybackRate(rate);
  };

  const setPeaks = (peaks: number[]) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.backend.setPeaks(peaks);
      wavesurferRef.current.drawBuffer();
    }
  };

  const calculatePeaks = () => {
    if (wavesurferRef.current) {
      const mediaElement = document.querySelector(
        '#mediaElement'
      ) as HTMLMediaElement;
      renderWaveform({ mediaElement, wavesurfer: wavesurferRef.current });
    }
  };

  const stopDictation = () => {
    clearTimeout(state.timerId);
    updateState({ timerId: 0 });
  };

  interface PlayDictationPhraseProps {
    currentRepeatNum: number;
    phraseNum: number;
    repeatCount: number;
    repeatDelay: number;
    delayMeasure: DelayMeasure;
  }

  const playDictationPhrase = ({
    currentRepeatNum,
    phraseNum,
    repeatCount,
    repeatDelay,
    delayMeasure,
  }: PlayDictationPhraseProps) => {
    const { phrases } = state;
    if (phraseNum === phrases.length) return;
    const phrase = phrases[phraseNum];
    const { id = '0', start, end } = phrase;
    const phraseLength = end - start;
    const delaySeconds =
      delayMeasure === 'phraseLength'
        ? phraseLength * repeatDelay
        : phraseLength + repeatDelay;

    playDictationPhraseOnce(id);

    const timerId = setTimeout(() => {
      if (currentRepeatNum < repeatCount) {
        playDictationPhrase({
          currentRepeatNum: currentRepeatNum + 1,
          phraseNum,
          repeatCount,
          repeatDelay,
          delayMeasure,
        });
      }
      if (currentRepeatNum == repeatCount) {
        playDictationPhrase({
          currentRepeatNum: 1,
          phraseNum: phraseNum + 1,
          repeatCount,
          repeatDelay,
          delayMeasure,
        });
      }
      if (
        phraseNum === phrases.length - 1 &&
        currentRepeatNum === repeatCount
      ) {
        stopDictation();
        updateState({ isFinished: true });
      }
    }, delaySeconds * 1000);

    //@ts-ignore
    updateState({ timerId });
    updateState({ currentRepeatNum });
  };

  const playDictation = ({
    repeatCount,
    repeatDelay,
    delayMeasure,
  }: PlayDictationProps) => {
    stopDictation();
    const { currentPhraseNum } = state;
    updateState({ playMode: 'dictation' });
    const beginFrom = currentPhraseNum <= 0 ? 1 : currentPhraseNum;
    playDictationPhrase({
      currentRepeatNum: 1,
      phraseNum: beginFrom,
      repeatCount,
      repeatDelay,
      delayMeasure,
    });
  };

  const removePeaks = () => {
    setPeaks([]);
  };

  const getWavesurferInstance = () => {
    return wavesurferRef.current;
  };

  const methods = {
    updatePhrases,
    updatePhrase,
    removePhrase,
    removePhrases,
    setMediaLink,
    setCurrentTime,
    setPeaks,
    calculatePeaks,
    removePeaks,
    play,
    pause,
    playPhrase,
    playDictation,
    updateState,
    setPlaybackRate,
    getWavesurferInstance,
  } as PlayerContextMethods;

  return (
    (
      <PlayerContext.Provider value={{ state, methods }}>
        {children}
      </PlayerContext.Provider>
    ) || <></>
  );
};
