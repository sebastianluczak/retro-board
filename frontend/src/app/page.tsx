'use client';

import Login from '@/components/login/login';
import { useEffect, useState } from 'react';
import { socket } from '@/app/socket';
import Room from '@/components/room/room';
import TopBar from '@/components/topbar/top-bar';
import toast from 'react-simple-toasts';

export default function Home() {
  // WebSockets
  const [, setIsConnected] = useState(false);
  const [, setTransport] = useState('N/A');

  const [loggedIn, setLoggedIn] = useState(false);

  // Username
  const [username, setUsername] = useState('');
  // Board name
  const [boardName, setBoardName] = useState('');

  // timer
  const [timer, setTimer] = useState<{ secondsLeft: number, isRunning: boolean} | null>(null);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on('upgrade', (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport('N/A');
      toast('Disconnected from server due to unknown error.', { duration: 5000 });
      setLoggedIn(false);
      setUsername('');
      setBoardName('');
    }

    function setNewTimer(data: { secondsLeft: number, boardName: string }) {
      console.log('New Timer data:', data);
      // poll for new timer data every second
      const interval = setInterval(() => {
        console.log('sending getTimer');
        socket.emit('getTimer', { boardName: data.boardName });
      }, 1000);
      if (timer) {
        setTimer({ ...timer, secondsLeft: data.secondsLeft });
      } else {
        setTimer({ secondsLeft: data.secondsLeft, isRunning: true });
      }

      setTimeout(() => {
        clearInterval(interval);
      }, data.secondsLeft * 1000);
    }

    function updateTimer(data: { secondsLeft: number, boardName: string }) {
      console.log('Updated Timer data:', data);

      if (timer) {
        setTimer({ ...timer, secondsLeft: data.secondsLeft });
      } else {
        setTimer({ secondsLeft: data.secondsLeft, isRunning: true });
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('timer', setNewTimer);
    socket.on('newTimer', updateTimer);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <>
      <TopBar
        username={username}
        loggedIn={loggedIn}
        timer={timer}
      />
      <div className="flex items-center justify-center mt-20">
        <main>
          {!loggedIn && (
            <Login
              username={username}
              setUsername={setUsername}
              boardName={boardName}
              setBoardName={setBoardName}
              loggedIn={loggedIn}
              setLoggedIn={setLoggedIn}
            />
          )}
          {loggedIn && (
            <Room
              boardName={boardName}
              username={username}
            />
          )}
        </main>
        <footer>
          <p className="absolute bottom-0 right-0 text-center text-gray-500 mt-8 shadow-xl shadow-black p-2 font-bold">
            Made with ❤️ by
            <a href="https://github.com/sebastianluczak" target={'_blank'} rel="noreferrer">
              🌈 IT Magician 🦄
            </a>
            <i>
              © 2025
            </i>
          </p>
        </footer>
      </div>
    </>
  );
}
