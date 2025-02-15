"use client";

import {useEffect} from "react";
import {debounce} from "lodash";
import {socket} from "@/app/socket";

type LoginProps = {
    username: string;
    setUsername: (username: string) => void;
};

const DEFAULT_ROOM = "default";

export default function Login(props: LoginProps) {
    const { username, setUsername } = props;

    useEffect(() => {
        const loginToServer = () => {
            socket.emit("login", {
                room: DEFAULT_ROOM,
                username
            });
        };

        if (username) {
            console.log("Username is", username);
            console.log("Logging in...");
            loginToServer();
        }
    }, [username]);

    return (
        <div className="flex items-start h-screen">
            <div className="w-96 p-4 rounded-lg shadow-lg">
                {!username && (
                    <>
                        <h1 className="text-2xl font-bold text-center">Login</h1>
                        <form className="mt-4">
                            <div className="mb-4">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="mt-1 block w-full px-3 py-2 border bg-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                                focus:ring-2 focus:ring-primary"
                                    onChange={debounce((e) => setUsername(e.target.value), 1000)}
                                />
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}