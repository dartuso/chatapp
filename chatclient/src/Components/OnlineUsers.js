import React from "react";

const OnlineUsers = ({users}) => {

    return (
        <div className='OnlineUsers'>
            <div className="Title">
                Users:
            </div>
            <div>
                {users.map(({name}) => (
                    <div key={name}>
                        {name}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OnlineUsers;