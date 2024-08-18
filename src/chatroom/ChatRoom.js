import React, { useEffect, useState } from 'react';
import styles from './ChatRoom.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ChatRoom = (props) => {
    const [roomList, setRoomList] = useState([]);
    const [myRoomList, setMyRoomList] = useState([]);
    const [newChatRoomName, setNewChatRoomName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const member = location.state;

    useEffect(() => {
        fetch('http://localhost:8080/chatroom', { // local
        // fetch('/api/chatroom', {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            setRoomList(data.chatRoomList);
        })
        .catch(error => {
            alert("채팅방 목록 조회 실패");
        });

        fetch(`http://localhost:8080/chatroom/${member.memberId}`, {
        // fetch(`/api/chatroom/${member.mebmerId}`, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            setMyRoomList(data.chatRoomList);
        })
        .catch(error => {
            alert("채팅방 목록 조회 실패");
        });
    }, []);

    const enterChatRoom = (roomId) => {
        navigate(`/chatroom/${roomId}`, {state: member});
    }
    const handleNewChatRoom = (event) => {
        setNewChatRoomName(event.target.value);
    };
    const createNewChatRoom = (event) => {
        event.preventDefault();
        if(member == null || member.memberId == null) {
            alert("INVALID ACCESS");
            return;
        }
        fetch("http://localhost:8080/chatroom/create", { // local
        // fetch("/api/chatroom/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                memberId: member.memberId,
                roomName: newChatRoomName
            })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            enterChatRoom(data.roomId);
        })
        .catch(error => {
            alert("채팅방을 생성할 수 없습니다.");
        })
    };
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    Anonymous Chat Room List
                </div>
            </div>

            <div className={styles.body}>
                {roomList.map(chatRoom => (
                    <div className={styles.room} key={chatRoom.roomId}>
                        <div className={styles.roomName}>
                            {chatRoom.roomName}
                        </div>
                        <button className={styles.button} onClick={(e) => enterChatRoom(chatRoom.roomId)}>입장하기</button>
                    </div>
                ))}
            </div>

            <div className={styles.body}>

            </div>

            <div className={styles.tail}>
                <div>
                    {member.memberId} , {member.memberName}
                </div>
                <div>
                    Chat Room
                </div>
                <input onChange={handleNewChatRoom}/>
                <button onClick={createNewChatRoom}>생성하기</button>

            </div>
            
        </div>
    )
};

export default ChatRoom;