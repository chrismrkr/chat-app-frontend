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
        // fetch('http://localhost:8080/chatroom', { // local
        fetch('/api/chatroom', {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            setRoomList(data.chatRoomList);
        })
        .catch(error => {
            alert("전체 채팅방 목록 조회 실패");
        });

        // fetch(`http://localhost:8080/chatroom/${member.memberId}`, { // local
        fetch(`/api/chatroom/${member.memberId}`, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            setMyRoomList(data.chatRoomList);
        })
        .catch(error => {
            alert("내가 참여 중인 채팅방 목록 조회 실패");
        });
    }, []);

    const handleNewChatRoomName = (event) => {
        setNewChatRoomName(event.target.value);
    };

    const navigateToChatRoom = (roomId) => {
        // 채팅방 페이지로 이동
        navigate(`/chatroom/${roomId}`, {state: member});
    };

    const createNewChatRoom = (event) => {
        // 새로운 채팅방 생성 및 입장
        event.preventDefault();
        if(member == null || member.memberId == null) {
            alert("INVALID ACCESS");
            return;
        }
        // fetch("http://localhost:8080/chatroom/create", { // local
        fetch("/api/chatroom/create", {
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
            navigateToChatRoom(data.roomId);
        })
        .catch(error => {
            alert("채팅방을 생성할 수 없습니다.");
        })
    };
    const enterNewChatrooms = (event, roomId) => {
        // 일반 채팅방 입장
        event.preventDefault();
        if(member == null || member.memberId == null) {
            alert("INVALID ACCESS");
            return;
        }
        // fetch("http://localhost:8080/chatroom/enter", { // local
            fetch("/api/chatroom/enter", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    memberId: member.memberId,
                    roomId: roomId
                })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            navigateToChatRoom(roomId);
        })
        .catch(error => {
            alert("채팅방에 입장할 수 없습니다.");
        });
    };
    const enterMyChatrooms = (event, roomId) => {
        // 내가 참여 중인 채팅방 입장
        event.preventDefault();
        if(member == null || member.memberId == null) {
            alert("INVALID ACCESS");
            return;
        }
        navigateToChatRoom(roomId);
    };
    const exitMyChatrooms = (event, roomId) => {
        event.preventDefault();
        if(member == null || member.memberId == null) {
            alert("INVALID ACCESS");
            return;
        }

        // fetch("http://localhost:8080/chatroom/exit", { // local
            fetch("/api/chatroom/exit", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    memberId: member.memberId,
                    roomId: roomId
                })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            alert("채팅방에서 퇴장하였습니다.");
            window.location.reload()
        })
        .catch(error => {
            alert("채팅방 퇴장에 실패했습니다.");
        });
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    Anonymous Chat Room List
                </div>
            </div>

            <div className={styles.body}> 
                {roomList.map(chatRoom => (
                    // 새로운 채팅방 목록
                    <div className={styles.room} key={chatRoom.roomId}>
                        <div className={styles.roomName}>
                            {chatRoom.roomName}
                        </div>
                        <button className={styles.button} onClick={(e) => enterNewChatrooms(e, chatRoom.roomId)}>입장하기</button>
                    </div>
                ))}
            </div>

            <div className={styles.body}>
            {myRoomList.map(chatRoom => (
                    // 새로운 채팅방 목록
                    <div className={styles.room} key={chatRoom.roomId}>
                        <div className={styles.roomName}>
                            {chatRoom.roomName}
                        </div>
                        <button className={styles.button} onClick={(e) => enterMyChatrooms(e, chatRoom.roomId)}>입장하기</button>
                        <button className={styles.button} onClick={(e) => exitMyChatrooms(e, chatRoom.roomId)}>퇴장하기</button>
                    </div>
                ))}
            </div>

            <div className={styles.tail}>
                <div>
                    {member.memberId} , {member.memberName}
                </div>
                <div>
                    Chat Room
                </div>
                <input onChange={handleNewChatRoomName}/>
                <button onClick={createNewChatRoom}>생성하기</button>
            </div>
            
        </div>
    )
};

export default ChatRoom;