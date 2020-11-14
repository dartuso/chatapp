import React from "react";
import "./Input.css"
export default function Input({ setMessage, sendMessage, message }) {

    return (
        <form className="formBox">
            <input
                className="inputBox"
                type="text"
                placeholder="Type here to chat"
                value={message}
                onChange={({ target: { value } }) => setMessage(value)}
                onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
            />
            <button className="sendButton" onClick={event => sendMessage(event)}>SEND</button>
        </form>
    );
}