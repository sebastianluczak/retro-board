import { useState, useEffect, useCallback } from 'react';
import { socket } from '@/app/socket';

type LoginProps = {
  username: string;
  setUsername: (username: string) => void;
  boardName: string;
  setBoardName: (boardName: string) => void;
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
};

export default function Login({ username, boardName, setUsername, setBoardName, setLoggedIn }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const loginToServer = useCallback(() => {
    if (username.length < 4 || boardName.length < 4) {
      console.warn('Username and board name must be at least 4 characters.');
      setErrors(['Username and board name must be at least 4 characters.']);

      return;
    }
    // username has to be a valid email address
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
      console.warn('Username must be a valid email address.');
      setErrors(['Username must be a valid email address.']);

      return;
    }

    setLoading(true);

    socket.emit('createBoard', { ownedBy: username, name: boardName });

    setLoading(false);
    setLoggedIn(true);
  }, [username, boardName, setLoggedIn]);

  useEffect(() => {
    return () => {
      socket.off('boardExists');
    };
  }, []);

  const loadExistingBoard = () => {
    const fileInput = document.getElementById('boardFile') as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const board = JSON.parse(e.target?.result as string);
        if (username && board.name && board.columns) {
          setBoardName(board.name);
          // todo: payload has to be updated to include all the necessary data for the board
          socket.emit('createBoard', { ownedBy: username, name: board.name });
          setLoggedIn(true);
        } else {
          console.warn('Invalid board file or username missing.');
          setErrors(['Invalid board file or username missing.']);
        }
      };
      reader.readAsText(file);
    } else {
      console.warn('No file selected.');
      setErrors(['No file selected.']);
    }
  };

  return (
    <div id="loginForm" className="flex items-start h-screen">
      <div className="w-96 p-4 rounded-lg shadow-lg">
        <h1 data-testid={'login-heading'} className="text-2xl font-bold text-center uppercase shadow-xl shadow-black p-2 rounded-2xl">Create or Join a Board</h1>
        <form className="mt-4">
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-500">
              Your e-mail address
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              className="mt-1 block w-full px-3 py-2 border bg-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="boardName" className="block text-sm font-medium text-gray-500">
              Board name
            </label>
            <input
              type="text"
              id="boardName"
              name="boardName"
              value={boardName}
              className="mt-1 block w-full px-3 py-2 border bg-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={(e) => setBoardName(e.target.value)}
            />
          </div>
          <div className="text-red-500">
            {errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
          <button
            type="button"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            onClick={loginToServer}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <span className={'flex justify-center text-gray-500 text-center mt-2'}>or</span>
          <label htmlFor="boardFile" className="block text-sm font-medium text-gray-500">
            Upload a board file
          </label>
          <input
            type="file"
            id="boardFile"
            name="boardFile"
            className="mt-1 block w-full px-3 py-2 border bg-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <input
            type="button"
            value="Load board"
            className="w-full mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            onClick={loadExistingBoard}
          />
          {/* Small disclaimer stating that loading a board is currently in early development */}
          <div className="flex justify-center text-gray-500 text-sm mt-2 text-center">
            <p>⚠️ Loading a board is currently in early development and might not work as expected.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
