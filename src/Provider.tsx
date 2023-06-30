import * as React from 'react';

import { createContext, useEffect, useRef, useState } from 'react';
import { RegionsPluginParams } from 'wavesurfer.js/src/plugin/regions';
import { WaveSurferParams } from 'wavesurfer.js/types/params';
import { initWavesurfer, renderWaveform } from './wavesurfer';

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
  peaks: number[];
}

export interface PlayerContextState {
  phrases: Phrase[];
  mediaLink: string;
  currentTime: number;
  isPlaying: boolean;
  isReady: boolean;
  isFinished: boolean;
  currentPhraseNum: number;
  duration: number;
  peaks: number[];
}

interface PlayerContextMethods {
  setMediaLink: (mediaLink: string) => void;
  setCurrentTime: (currentTime: number) => void;
  setPeaks: (peaks: number[]) => void;
  calculatePeaks: () => void;
  removePeaks: () => void;
  updatePhrases: (props: UpdatePhrasesProps) => void;
  removePhrases: () => void;
  play: () => void;
  pause: () => void;
  playPhrase: (phraseId: string) => void;
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
  isPlaying: false,
  isFinished: false,
  duration: 0,
  mediaLink: '',
  phrases: [],
  peaks: [],
} as PlayerContextState;

export const PlayerProvider: React.FC<Props> = ({
  children,
  mediaLink: mediaLinkProp = '',
  phrasesProps,
  regionsOptions,
  wavesurferOptions,
  peaks: peaksProp,
}) => {
  const wavesurferRef = useRef<any>(null);

  const zeroPhrase = { id: '0', start: 0, end: 0 };

  const [state, setState] = useState<PlayerContextState>({
    ...defaultPlayerState,
    mediaLink: mediaLinkProp,
    phrases: [zeroPhrase, ...(phrasesProps?.phrases || [])],
  });

  useEffect(() => {
    const wavesurfer = initWavesurfer({
      phrases: phrasesProps?.phrases,
      regionsOptions,
      wavesurferOptions,
      setPlayerState: setState,
      peaks: peaksProp,
    });

    wavesurferRef.current = wavesurfer;
    updatePhrases({ phrases: [] });
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

    if (replace) {
      wavesurferRef.current.clearRegions();
    }

    newPhrases.forEach(phrase => {
      wavesurferRef.current.addRegion(phrase);
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

  const removePhrases = () => {
    wavesurferRef.current.clearRegions();
    setState(oldState => ({ ...oldState, phrases: [zeroPhrase] }));
  };

  const setMediaLink = (mediaLink: string) => {
    setState(oldState => ({ ...oldState, mediaLink }));
  };

  const play = () => {
    wavesurferRef.current.play();
  };

  const pause = () => {
    wavesurferRef.current.pause();
  };

  const playPhrase = (phraseId: string) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.regions.list[phraseId].play();
    }
  };

  const setCurrentTime = (currentTime: number) => {
    setState(oldState => ({ ...oldState, currentTime }));
    if (wavesurferRef.current) {
      wavesurferRef.current.seekTo(currentTime / state.duration);
    }
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

  const removePeaks = () => {
    setPeaks([]);
  };

  const methods = {
    updatePhrases,
    removePhrases,
    setMediaLink,
    setCurrentTime,
    setPeaks,
    calculatePeaks,
    removePeaks,
    play,
    pause,
    playPhrase,
  } as PlayerContextMethods;

  return (
    (
      <PlayerContext.Provider value={{ state, methods }}>
        {children}
      </PlayerContext.Provider>
    ) || <></>
  );
};
