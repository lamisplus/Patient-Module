import React, { useState } from 'react';
import SockJsClient from 'react-stomp';
import { wsUrl } from "../../../api";

function ProgressComponent() {
    const [message, setMessage] = useState("");

    const onConnected = () => {
        console.error("Connected!!");
    };

    const onMessageReceived = (msg) => {
       
        if (msg) {
            setMessage(msg);
        }
    };

    const onDisconnected = () => {
        console.error("Disconnected!");
    };

    return (
        <div>
            <SockJsClient
                url={wsUrl}
                topics={['/topic/checking-in-out-process']}
                onConnect={onConnected}
                onDisconnect={onDisconnected}
                onMessage={msg => onMessageReceived(msg)}
                debug={true}  // Enable debugging
            />
            <div><h3>{message}</h3></div>
        </div>
    );
}

export default ProgressComponent;
