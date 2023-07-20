import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Phrase, PlayerContext } from '../.';
import { parseSubs } from 'frazy-parser';
import './styles.css';

function PlayerExample() {
  const { state: playerState, methods: playerMethods } = useContext(
    //@ts-ignore
    PlayerContext
  );

  const [formState, setFormState] = useState({
    mediaLink: '',
    repeatDelay: 1,
    repeatCount: 2,
    delayMeasure: 'phrase length',
    phrasesTextarea: '',
    peaksTextarea: '',
    playbackRate: 1,
  });

  const updateFormState = newValues => {
    setFormState(oldState => ({
      ...oldState,
      ...newValues,
    }));
  };

  const onChange = event => {
    const {
      target: { id, value },
    } = event;
    updateFormState({ [id]: value });
    const playerStateIds = ['repeatDelay', 'repeatCount', 'delayMeasure'];
    if (playerStateIds.includes(id)) {
      playerMethods.updateState({ [id]: value });
    }
    if (id === 'playbackRate') {
      playerMethods.setPlaybackRate(value);
    }
  };

  useEffect(() => {
    updateFormState({
      mediaLink: playerState.mediaLink,
    });
  }, []);

  const setMediaLink = () => {
    playerMethods.setMediaLink(formState.mediaLink);
  };

  const playDictation = () => {
    const { repeatCount, repeatDelay, delayMeasure } = formState;
    //@ts-ignore
    playerMethods.playDictation({ repeatCount, repeatDelay, delayMeasure });
  };

  const addPhrases = () => {
    const phrases = parseSubs(formState.phrasesTextarea, false).map(elem => {
      const { id, start, end, body: text } = elem;
      return { id, start, end, data: { text } };
    }) as Phrase[];
    playerMethods.updatePhrases({ phrases });
  };

  const addPeaks = () => {
    const peaks = JSON.parse(formState.peaksTextarea);
    playerMethods.setPeaks(peaks);
  };

  return (
    <>
      <section className="player">
        <video controls id="mediaElement" src={playerState.mediaLink} />
        <div id="waveformContainer" />
        <div id="timelineContainer" />
      </section>
      <section className="mediaControls">
        <h3>Media controls</h3>
        <div>
          <button onClick={() => playerMethods.play()}>play</button>
          <button onClick={() => playerMethods.pause()}>pause</button>
          <label htmlFor="playbackRate">Speed</label>
          <input
            type="number"
            placeholder="speed"
            id="playbackRate"
            min="0.25"
            max="2"
            step="0.25"
            value={formState.playbackRate}
            {...{ onChange }}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="mediaLink"
            id="mediaLink"
            value={formState.mediaLink}
            {...{ onChange }}
          />
          <button onClick={setMediaLink}>set mediaLink</button>
        </div>
      </section>
      <section className="dictation">
        <h3>Dictation</h3>
        <div>
          <label htmlFor="repeatDelay">Repeat delay</label>
          <input
            type="number"
            placeholder="repeatDelay"
            id="repeatDelay"
            min="1"
            value={formState.repeatDelay}
            {...{ onChange }}
          />
        </div>
        <div>
          <label htmlFor="repeatCount">Repeat count</label>
          <input
            type="number"
            placeholder="repeatCount"
            id="repeatCount"
            min="1"
            value={formState.repeatCount}
            {...{ onChange }}
          />
        </div>
        <div>
          <label htmlFor="delayMeasure">Delay measure</label>
          <select
            {...{ onChange }}
            id="delayMeasure"
            value={formState.delayMeasure}
            {...{ onChange }}
          >
            <option value="phrase length">phrase length</option>
            <option value="seconds">seconds</option>
          </select>
        </div>

        <button onClick={playDictation}>play dictation</button>
      </section>
      <section className="phrases">
        <h3>Phrases</h3>
        <div className="phrasesToPlay">
          Click to play phrase:{' '}
          {playerState.phrases.slice(1).map((elem, index) => {
            return (
              <div
                key={`phrase-${index}`}
                onClick={() => playerMethods.playPhrase(elem.id || '')}
                className="phrase"
              >
                {index + 1}
              </div>
            );
          })}
        </div>
        <div>
          <textarea
            id="phrasesTextarea"
            placeholder="phrases (captions, subtitles, timed text)"
            {...{ onChange }}
          />
        </div>
        <div>
          <button onClick={addPhrases}>set phrases</button>
          <button onClick={() => playerMethods.removePhrases()}>
            remove phrases
          </button>
        </div>
      </section>
      <section className="peaks">
        <h3>Peaks</h3>
        <div>
          <textarea id="peaksTextarea" placeholder="peaks" {...{ onChange }} />
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
      </section>
      <section className="playerStateCode">
        <pre>{JSON.stringify(playerState, null, 2)}</pre>
      </section>
    </>
  );
}

export default PlayerExample;
