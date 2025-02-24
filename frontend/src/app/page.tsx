"use client";

import Login from "@/components/login/login";
import {useEffect, useState} from "react";
import {socket} from "@/app/socket";
import Room from "@/components/room/room";

export default function Home() {
    // WebSockets
    const [, setIsConnected] = useState(false);
    const [, setTransport] = useState("N/A");

    const [loggedIn, setLoggedIn] = useState(false);

    // Username
    const [username, setUsername] = useState("");
    // Board name
    const [boardName, setBoardName] = useState("");

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);

            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
            console.log("Disconnected from server");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    return (
        <div className="flex items-center justify-center h-screen">
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
                    />
                )}
            </main>
        </div>
    );
}
