import * as React from 'react';
import { useContext, useEffect, useRef } from 'react';
import { Phrase, PlayerContext } from '../.';
import { parseSubs } from 'frazy-parser';
import './styles.css';

function PlayerExample() {
  const { state: playerState, methods: playerMethods } = useContext(
    //@ts-ignore
    PlayerContext
  );

  const mediaLinkInputRef = useRef<HTMLInputElement>(null);
  const phrasesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const peaksTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mediaLinkInputRef.current) {
      mediaLinkInputRef.current.value = playerState.mediaLink;
    }
  }, []);

  const setMediaLink = () => {
    if (mediaLinkInputRef.current) {
      playerMethods.setMediaLink(mediaLinkInputRef.current.value);
    }
  };

  const addPhrases = () => {
    if (phrasesTextareaRef.current) {
      const phrases = parseSubs(phrasesTextareaRef.current.value, false).map(
        elem => {
          const { id, start, end, body: text } = elem;
          return { id, start, end, data: { text } };
        }
      ) as Phrase[];
      playerMethods.updatePhrases({ phrases });
    }
  };

  const addPeaks = () => {
    if (peaksTextareaRef.current) {
      const peaks = JSON.parse(peaksTextareaRef.current.value);
      playerMethods.setPeaks(peaks);
    }
  };

  return (
    <>
      <video controls id="mediaElement" src={playerState.mediaLink} />
      <div id="waveformContainer" />
      <div id="timelineContainer" />
      <div>
        <button onClick={() => playerMethods.play()}>play</button>
        <button onClick={() => playerMethods.pause()}>pause</button>
      </div>
      <div>
        <div>
          <input type="text" placeholder="mediaLink" ref={mediaLinkInputRef} />
        </div>
        <div>
          <button onClick={setMediaLink}>set mediaLink</button>
        </div>
      </div>
      <h3>Phrases</h3>
      <div>
        <div>
          <textarea
            ref={phrasesTextareaRef}
            placeholder="phrases (captions, subtitles, timed text)"
          />
        </div>
        <div>
          <button onClick={addPhrases}>set phrases</button>
          <button onClick={() => playerMethods.removePhrases()}>
            remove phrases
          </button>
        </div>
      </div>
      <h3>Peaks</h3>
      <div>
        <div>
          <textarea ref={peaksTextareaRef} placeholder="peaks" />
        </div>
        <div>
          <button onClick={addPeaks}>set peaks</button>
          <button onClick={() => playerMethods.removePeaks()}>
            remove peaks
          </button>
          <button onClick={() => playerMethods.calculatePeaks()}>
            calculate peaks
          </button>
        </div>
      </div>
      <div>
        <div>
          {playerState.phrases.slice(1).map((elem, index) => {
            return (
              <div
                key={`phrase-${index}`}
                onClick={() => playerMethods.playPhrase(elem.id || '')}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
        <div>{JSON.stringify(playerState, null, 2)}</div>
      </div>
    </>
  );
}

export default PlayerExample;
