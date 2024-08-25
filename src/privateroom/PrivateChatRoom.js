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

    const clientRef = useRef(null);

    useEffect(() => {
        // fetch(`http://localhost:8080/chatroom/history/${roomId}/${member.memberId}`, { // local
        fetch(`/api/chatroom/history/${roomId}/${member.memberId}`, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            const histories = data.chatHistories || [];
            histories.forEach(element => {
                setMessages((prevMessages) => [...prevMessages, element]);        
            });
            console.log("");
        }).catch(e => {
            alert("Error");
        })
    }, []);

    const connect = () => {
        if(clientRef.current && clientRef.current.connected) {
            console.log("WEBSOCKET EVENT: ALREADY CONNECTED")
            return;
        }
        console.log(`WEBSOCKET EVENT: OPEN`)
        const client = new Client({
            // brokerURL: 'ws://localhost:8080/ws', // local
            brokerURL: 'ws://localhost:80/ws', 
            connectHeaders: {

            },
            heartbeatIncoming: 20000, // server -> client heartbeat 20s
            heartbeatOutgoing: 20000, // client -> server heartbeat 20s
            reconnectDelay: 5000,
        });
        client.onConnect = () => { // websocket 연결 성공 콜백
            console.log(`WEBSOCKET EVENT: CONNECT ${client.connected}`);
            client.subscribe(`/exchange/chat.exchange/roomId.${roomId}`, (msg) => {
            // client.current.subscribe(`/chatroom/${roomId}`, (msg) => {
                const resBody = JSON.parse(msg.body);
                setMessages((prevMessages) => [...prevMessages, resBody]);
                msg.ack();
            }, {ack: 'client'});
            client.subscribe(`/internal/healthcheck`, (msg) => {
                const resBody = JSON.parse(msg.body);
                console.log(Date.now() + resBody.message);
            });
        };
        client.onWebSocketClose = (event) => { // websocket 연결 종료 콜백
            console.log(`WEBSOCKET EVENT: CLOSE ${event.code} ${event.reason}`);
        };
        
        client.activate();
        clientRef.current = client;
    };

    const disconnect = () => {
        clientRef.current.deactivate(() => {
            console.log(`WEBSOCKET EVENT: DISCONNECT`)
        });
    }

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [roomId]);

    const publishMessage = (event) => {
        event.preventDefault();
        if(!clientRef.current.connected) return;
        clientRef.current.publish({
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
