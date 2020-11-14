import React from "react";
import {useCookies} from "react-cookie";
import "./Message.css"

 const Message = ({name: name,text: text, color: color,date: date}) => {
     const [cookies, setCookie] = useCookies(["nickname"]);

     let sentByUser = false;
     if (name === cookies.nickname){
         sentByUser = true;
     }
    if (typeof(name) !== "string"){
        name = "ERROR"
    }
     if (typeof(text) !== "string"){
         text = "ERROR"
     }
     if (typeof(date) !== "string"){
         date = "ERROR"
     }

     return (
         <div className="message" >
             <div className="time" style={{color:color}}>
                 {date}
             </div>
             <div className="user" style={{color:color}}>
                 {name + ":"}
             </div>
             <div className="text" style={sentByUser ? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>
                 {text}
             </div>
         </div>
     );
};

export default Message;