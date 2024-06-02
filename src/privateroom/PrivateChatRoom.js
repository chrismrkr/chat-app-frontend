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
    const connect = () => {
        client.current = new Client({
            // ws://localhost:8080/ws
            brokerURL: 'ws://localhost:80/ws',
            onConnect: () => {
                console.log("connected!");
                client.current.subscribe(`/chatroom/${roomId}`, (msg) => {
                    const resBody = JSON.parse(msg.body);
                    console.log(msg.body)
                    setMessages((prevMessages) => [...prevMessages, resBody]);
                })
            }
        });
        client.current.activate();
    };
    const disconnect = () => {
        client.current.deactivate();
    }
    useEffect(() => {
        connect();
        return () => disconnect();
    }, []);
    const publishMessage = (event) => {
        event.preventDefault();
        if(!client.current.connected) return;
        client.current.publish({
            destination: `/chatroom/${roomId}`,
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
