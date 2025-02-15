"use client";

import {useEffect, useState} from "react";
import {socket} from "@/app/socket";

type ChatData = {
    username: string;
    message: string;
};

type ChatProps = {
    username: string;
};

export default function Chat(props: ChatProps) {
    const [messages, setMessages] = useState<ChatData[]>([]);
    const [chatMessage, setChatMessage] = useState("");

    const { username } = props;

    const emitMessageToServer = (message: string) => {
        socket.emit("events", {
            message,
            username
        } as ChatData);
    }

    useEffect(() => {
        socket.on("events", (message) => {
            console.log("Received message from server", message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.off("events");
        };
    }, []);

    return (
        <>
            <div className="flex flex-col gap-4">
                <label>Message
                    <input
                        type="text"
                        style={{padding: "0.5rem", backgroundColor: "#000000", color: "#ffffff"}}
                        onChange={(e) => setChatMessage(e.target.value)}
                    />
                </label>

                <input
                    type={"button"}
                    value={"Send message"}
                    style={{padding: "0.5rem", backgroundColor: "#000000", color: "#ffffff"}}
                    onClick={() => emitMessageToServer(chatMessage)}
                />

                <ul className="flex flex-col gap-2">
                    {messages.map((message, index) => (
                        <li key={index}>[{message.username}] {message.message} </li>
                    ))}
                </ul>
            </div>
        </>

    );
}