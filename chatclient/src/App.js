import React, {useEffect, useState} from "react";
import io from 'socket.io-client';
import Input from "./Components/Input";
import MessageDisplay from "./Components/MessageDisplay";
import OnlineUsers from "./Components/OnlineUsers";
import {useCookies} from "react-cookie";

const socket = io(
    'localhost:4001',
    {
        transports: ['websocket']
    });

const App = () => {
    const [name, setName] = useState("");
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [cookies, setCookie] = useCookies(["nickname"]);


    useEffect(() => {
        socket.emit("join", cookies.nickname );
        socket.on("updateUser", username => {
            setName("")
            setName(username);
            setCookie("nickname", username)
        })
    },[cookies.nickname,cookies, setCookie]);

    useEffect(() => {
        socket.on("users", users => {
            setUsers([])
            setUsers(users);
        });
    },[users]);


    useEffect(() => {
        socket.on("getCached", messages => {
                console.log("Received cache")
                setMessages([])
                setMessages(messages);
            }
        );

        socket.on("getMsg", message => {
            console.log("Received single message")
            setMessages([...messages, message])
        });

    },[messages]);


    const sendMessage = event => {
        event.preventDefault()
        socket.emit("sendMsg", message);
    };


    return (
        <div className="App">
            <div>{name} is your name</div>
            <OnlineUsers users={users}/>
            <div className="ChatBox">
                <MessageDisplay messages={messages} users={users}/>
                <Input message={message} sendMessage={sendMessage} setMessage={setMessage}/>
            </div>
        </div>
    );
};

export default App;