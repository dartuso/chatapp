import React from "react";
import "./OnlineUsers.css"

 const OnlineUsers = ({users},me) => (
    <div>
        <div className="Title">
                Users:
        </div>

        <div>
            {users.map(({name}) => (
                <div key={name}>
                    {name === me ? name : name + " (You)"}
                </div>
                ))}
        </div>
    </div>
 );

export default OnlineUsers;