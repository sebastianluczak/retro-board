"use client";

import Login from "@/components/login/login";
import Chat from "@/components/chat/chat";
import {useEffect, useState} from "react";
import {socket} from "@/app/socket";
import Room from "@/components/room/room";

export default function Home() {
    // WebSockets
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");

    // Username
    const [username, setUsername] = useState("");

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
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("events", (message) => {
            console.log("Received message from server", message);
        });

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("events");
        };
    }, []);

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center font-[family-name:var(--font-geist-sans)]">
            <main className="flex row-start-2 items-center sm:items-start">
                <Login username={username} setUsername={setUsername} />
                {username && (
                    <Room/>
                )}
                {!username && (
                    <div className="flex flex-col gap-4">
                        <h1 className="text-2xl font-bold text-center">Status</h1>
                        <p>
                            Provide a username to login.
                        </p>
                    </div>
                )}
                {username && (
                    <>
                        <div className="flex flex-col gap-4">
                            <h1 className="text-2xl font-bold">Websocket status</h1>
                            <div>
                                <p>Status: {isConnected ? "connected" : "disconnected"}</p>
                                <p>Transport: {transport}</p>
                                <p>Username: {username}</p>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
