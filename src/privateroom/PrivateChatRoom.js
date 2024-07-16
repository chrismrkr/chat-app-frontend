import React, { useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import styles from './PrivateChatRoom.module.css';
import { Client } from "@stomp/stompjs";

const PrivateChatRoom = () => {
    const location = useLocation();
    const member = location.state;
    const {roomId} = useParams();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const client = useRef({});
    const [isConnected, setIsConnected] = useState(false);
    const [tryReconnect, setTryReconnect] = useState(true);
    const connect = () => {
        if(isConnected) {
            return;
        }
        console.log(`WEBSOCKET EVENT: OPEN`)
        client.current = new Client({
            // brokerURL: 'ws://localhost:8080/ws', // local
            brokerURL: 'ws://localhost:80/ws',
            heartbeatIncoming: 20000, // server -> client heartbeat 20s
            heartbeatOutgoing: 20000, // client -> server heartbeat 20s
        });
        client.current.onConnect = () => { // websocket 연결 성공 콜백
            setIsConnected(true);
            client.current.subscribe(`/exchange/chat.exchange/roomId.${roomId}`, (msg) => {
            // client.current.subscribe(`/chatroom/${roomId}`, (msg) => {
                const resBody = JSON.parse(msg.body);
                setMessages((prevMessages) => [...prevMessages, resBody]);
            })
            console.log("WEBSOCKET EVENT: CONNECT")
        };
        client.current.onWebSocketClose = (event) => { // websocket 연결 해제 콜백
            setIsConnected(false);
            console.log(`WEBSOCKET EVENT: CLOSE ${event.code} ${event.reason}`);
            if(tryReconnect && !isConnected) {
                setTimeout(() => {
                    connect();
                }, 3000);
            }
        };
        client.current.activate();
    };

    const disconnect = () => {
        console.log(`WEBSOCKET EVENT: DISCONNECT`)
        setTryReconnect(false);
        client.current.deactivate(() => {
            setIsConnected(false);
        });
    }

    useEffect(() => {
        connect();
        return () => disconnect();
    }, []);

    const publishMessage = (event) => {
        event.preventDefault();
        if(!client.current.connected) return;
        client.current.publish({
            destination: `/app/message/${roomId}`,
            body: JSON.stringify({
                senderName: member.memberName,
                message: message
            })
        });
        setMessage('');
    };
    const handleMessageChange = (event) => {
        setMessage(event.target.value);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    Let's Chat
                </div>
                
            </div>
            <div className={styles.body}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={styles.message}>
                        <div className={styles.sender}>
                            {msg.senderName}
                        </div>
                        <div className={styles.content}>
                            {msg.message}
                        </div>
                    </div>
                ))

                }
            </div>
            <div className={styles.tail}>
                <input placeholder="Type Message" value={message} className={styles.message} onChange={handleMessageChange}></input>
                <button className={styles.button} onClick={publishMessage} onEnter>Send</button>
            </div>
            {/* {roomId} {member.memberId} {member.memberName} */}
        </div>
    )
};

export default PrivateChatRoom;
