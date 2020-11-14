import React, {useEffect, useState} from "react";
import io from 'socket.io-client';
import Input from "./Components/Input";
import MessageDisplay from "./Components/MessageDisplay";
import OnlineUsers from "./Components/OnlineUsers";
import {useCookies} from "react-cookie";
import "./App.css"

let socket

const App = () => {
    const [name, setName] = useState("");
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [cookies, setCookie] = useCookies(["nickname"]);

    useEffect(() => {
         socket = io(
            'localhost:4001',
            {
                transports: ['websocket']
            });
        socket.emit("join", cookies.nickname);
        socket.on("getCached", messages => {
                setMessages(messages);
            }
        );
    }, []);




    useEffect(() => {
        socket.on("updateUser", username => {
            setName("")
            setName(username);
            setCookie("nickname", username)
        })
    },[cookies,setCookie,name,setName]);

    useEffect(() => {
        socket.on("users", users => {
            setUsers([])
            setUsers(users);
        });
    },[users,setUsers]);


    useEffect(() => {
        socket.on("getMsg", message => {
            messages.push(message)
            setMessages(messages)
        });

    },[messages]);


    const sendMessage = event => {
        if (message !== "") {
            event.preventDefault()
            socket.emit("sendMsg", message);
            setMessage("")
        }
    };

    return (
        <div className="App">
            <div className="Apptitle">Daniel's Chat App 📃</div>
            <div className="break"/>
            <div className="ChatGrid">
                <div>
                    <MessageDisplay messages={messages} users={users}/>
                    <Input message={message} sendMessage={sendMessage} setMessage={setMessage}/>
                </div>
                <OnlineUsers users={users} me={name}/>
            </div>
        </div>
    );
};

export default App;