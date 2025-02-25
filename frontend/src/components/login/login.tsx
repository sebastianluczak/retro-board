"use client";

import { useState, useEffect, useCallback } from "react";
import { socket } from "@/app/socket";

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
      console.warn("Username and board name must be at least 4 characters.");
      setErrors(["Username and board name must be at least 4 characters."]);
      return;
    }
    // username has to be a valid email address
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
      console.warn("Username must be a valid email address.");
      setErrors(["Username must be a valid email address."]);
      return;
    }

    setLoading(true);

    socket.emit("createBoard", { ownedBy: username, name: boardName });

    setLoading(false);
    setLoggedIn(true);
  }, [username, boardName, setLoggedIn]);

  useEffect(() => {
    return () => {
      socket.off("boardExists");
    };
  }, []);

  return (
    <div className="flex items-start h-screen">
      <div className="w-96 p-4 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">μRetro</h1>
        <h2 className="text-xl font-bold text-center">Create or Join a Board</h2>
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
