import React, { useEffect, useState } from 'react';
import styles from './ChatRoom.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ChatRoom = (props) => {
    const [roomList, setRoomList] = useState([]);
    const [newChatRoomName, setNewChatRoomName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const member = location.state;

    useEffect(() => {
        fetch('http://localhost:8080/chatroom', {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            setRoomList(data.chatRoomList);
        })
        .catch(error => {
            alert("채팅방 목록 조회 실패");
        })
        // setRoomList([
        //         {roomId: 1, roomName: "아무나 ㄱㄱ", memberId: 1},
        //         {roomId: 2, roomName: "나도 ㄱㄱ", memberId: 2},
        //         {roomId: 3, roomName: "밤새 대화 ㄱㄱ", memberId: 3},
        //         {roomId: 4, roomName: "건전한 대화 추구", memberId: 4},
        //         {roomId: 5, roomName: "감귤 10키로 팝니다", memberId: 5},
        //         {roomId: 5, roomName: "크아", memberId: 5},
        //         {roomId: 5, roomName: "room5", memberId: 5},
        //         {roomId: 5, roomName: "room5", memberId: 5},
        //         {roomId: 5, roomName: "room5", memberId: 5},
        //         {roomId: 5, roomName: "room5", memberId: 5},
        //     ]
        // )
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
        fetch("http://localhost:8080/chatroom/create", {
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