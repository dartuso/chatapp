import React, {useEffect, useState} from "react";
import io from 'socket.io-client';
import Input from "./Components/Input";
import MessageDisplay from "./Components/MessageDisplay";
import OnlineUsers from "./Components/OnlineUsers";
import {useCookies} from "react-cookie";
import "./App.css"

let socket = io(
    'localhost:4001',
    {
        transports: ['websocket']
    });

const App = () => {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [cookies, setCookie] = useCookies(["nickname"]);

    useEffect(() => {
        socket.emit("join", cookies.nickname);

        return () => {
            socket.off("join")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    useEffect(() => {
        socket.on("getCached", messages => {
                setMessages(messages);
            }
        );

        return () => {
            socket.off("getCached");
        }
    });

    useEffect(() => {
        socket.on("updateUser", username => {
            setCookie("nickname", username)
        })
        return () => {
            socket.off("updateUser")
        }
    }, [setCookie]);


    useEffect(() => {
        socket.on("users", users => {
            setUsers(users);
        });
        return () => {
            socket.off("users")
        }
    });


    useEffect(() => {
        socket.on("getMsg", message => {
            //FUNCTIONAL UPDATE VERY IMPORTANT
            message.user = true
            message.color =
                setMessages([...messages, message])
        });
        return () => {
            socket.off("getMsg")
        }
    });


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
                <div className="ChatComponents">
                    <MessageDisplay messages={messages} users={users}/>
                    <Input message={message} sendMessage={sendMessage} setMessage={setMessage}/>
                </div>
                <OnlineUsers users={users} />
            </div>
        </div>
    );
};

export default App;