import logo from './logo.svg';
import styles from './App.module.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './login/Login';
import ChatRoom from './chatroom/ChatRoom';
import PrivateChatRoom from './privateroom/PrivateChatRoom';

function App() {
  return (
    <div className={styles.App}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/chatroom" element={<ChatRoom />} />
          <Route path='/chatroom/:roomId' element={<PrivateChatRoom />}/> 
        </Routes>
     </Router>
    </div>
    /*
    <div className={styles.App}>
      <Login />
    </div>
    */
  );
}

export default App;
