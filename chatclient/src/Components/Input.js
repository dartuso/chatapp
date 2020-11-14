import React from "react";
import "./Input.css"

export default function Input({setMessage, sendMessage, message}) {

    return (
        <form className="formBox">
            <input className="inputBox" type="text" placeholder="Type here to chat" value={message}
                   onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
                   onChange={({target: {value}}) => setMessage(value)}
            />
            <button className="sendButton" onClick={event => sendMessage(event)}>SEND</button>
        </form>
    );
}