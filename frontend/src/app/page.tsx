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

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

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
      </div>
    </>
  );
}
