import * as React from 'react';
import { useContext, useEffect, useRef } from 'react';
import { Phrase, PlayerContext } from '../.';
import { parseSubs } from 'frazy-parser';

const styles = { controlsBlock: { marginTop: '1rem' } };

function PlayerExample() {
  const { state: playerState, methods: playerMethods } = useContext(
    //@ts-ignore
    PlayerContext
  );

  const mediaLinkInputRef = useRef<HTMLInputElement>(null);
  const phrasesTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <>
      <video controls id="mediaElement" src={playerState.mediaLink} />
      <div id="waveformContainer" />
      <div id="timelineContainer" />
      <div style={styles.controlsBlock}>
        <button onClick={() => playerMethods.play()}>play</button>
        <button onClick={() => playerMethods.pause()}>pause</button>
      </div>
      <div style={styles.controlsBlock}>
        <div>
          <input type="text" placeholder="mediaLink" ref={mediaLinkInputRef} />
        </div>
        <div>
          <button onClick={setMediaLink}>set mediaLink</button>
        </div>
      </div>
      <div style={styles.controlsBlock}>
        <div>
          <textarea
            ref={phrasesTextareaRef}
            placeholder="phrases (captions, subtitles, timed text)"
          />
        </div>
        <div>
          <button onClick={addPhrases}>set phrases</button>
        </div>
      </div>
      <div style={styles.controlsBlock}>
        <div>
          <button onClick={() => playerMethods.removePhrases()}>
            remove phrases
          </button>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0.25rem',
          }}
        >
          {playerState.phrases.slice(1).map((elem, index) => {
            return (
              <div
                key={`phrase-${index}`}
                style={{
                  border: '1px solid blue',
                  width: 20,
                  margin: 5,
                  borderRadius: 5,
                  cursor: 'pointer',
                }}
                onClick={() => playerMethods.playPhrase(elem.id || '')}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
        <div
          style={{
            textAlign: 'left',
            maxWidth: 300,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          {JSON.stringify(playerState, null, 2)}
        </div>
      </div>
    </>
  );
}

export default PlayerExample;
