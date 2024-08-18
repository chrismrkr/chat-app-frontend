import { useState } from "react";
import styles from "./Login.module.css";
import {useNavigate} from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const handleInputChage = (event) => {
        setUsername(event.target.value);
    }
    const startLogin = (event) => {
        event.preventDefault();
        fetch(`http://localhost:8080/member/${username}`, { // local
        // fetch(`/api/member/${username}`, {
            method: 'POST',
        })
        .then(response => {
            return response.json();
        })
        .then((res) => {
            navigate("/chatroom", {state: res});
        })
        .catch((error) => {
            alert("현재 채팅방에 입장할 수 없습니다.")
        });
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    Anonymous Chat Room Home
                </div>
            </div>
            <div className={styles.login_box}>
                <div className={styles.name}>
                    <div className={styles.title}>Name</div>
                    <input className={styles.input} onChange={handleInputChage}></input>
                </div>
                <div className={styles.start}>
                    <button title="start" className={styles.button} 
                    onClick={startLogin}>
                        시작하기
                    </button>
                </div>
            </div>
        </div>
    );
};


export default Login;