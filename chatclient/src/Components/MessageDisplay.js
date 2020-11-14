import React, {useEffect, useRef} from "react";
import Message from "./Message";
import "./MessageDisplay.css"

export default function MessageDisplay({messages, users}) {
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({behavior: "smooth"})
    }

    useEffect(scrollToBottom, [messages]);

    return (
        <div>
            <div className="Title">
                Messages:
            </div>
            <div className="MessageBox">
                {messages.map(message => <Message key={message.id}  {...message} />)}
                <div ref={messagesEndRef}/>
            </div>
        </div>
    )
}