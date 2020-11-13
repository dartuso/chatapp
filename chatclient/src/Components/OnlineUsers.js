import React from "react";
import "./OnlineUsers.css"

 const OnlineUsers = ({users}) => (
    <div>
        <div>Users:</div>
        <div>
            {users.map(({name}) => (
                <div>
                    {name}
                </div>
                ))}
        </div>
    </div>
 );

export default OnlineUsers;