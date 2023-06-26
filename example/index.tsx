import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PlayerProvider } from '../.';
import PlayerExample from './PlayerExample';

const mediaLink =
  'https://firebasestorage.googleapis.com/v0/b/ismail-player.appspot.com/o/content%2Fmedia%2Fted-explained.mp4?alt=media&token=849048d2-4d18-4e03-80b8-bce3bf9fee57';

const phrasesProps = {
  phrases: [
    {
      id: '1',
      start: 1,
      end: 2.35,
      data: {
        text: 'Getting access to great ideas\n',
      },
    },
    {
      id: '2',
      start: 2.53,
      end: 3.9,
      data: {
        text: "hasn't always been easy.",
      },
    },
  ],
  randomIds: false,
};

const App = () => {
  return (
    //@ts-ignore
    <PlayerProvider
      {...{
        mediaLink,
        phrasesProps,
        wavesurferOptions: { minPxPerSec: 150 },
      }}
    >
      <PlayerExample />
    </PlayerProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
