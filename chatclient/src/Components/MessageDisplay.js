import React, {useEffect, useRef} from "react";
import Message from "./Message";
import "./MessageDisplay.css"

export default function MessageDisplay({messages, users}) {
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(scrollToBottom, [messages]);

    return (
        <div>
            <div>
                Messages:
            </div>
        <div>
            {messages.map(message => <Message key={message.id}  {...message} />)}
            <div ref={messagesEndRef} />
        </div>
        </div>
    )
}