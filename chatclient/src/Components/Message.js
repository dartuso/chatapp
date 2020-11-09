import React from "react";
import {useCookies} from "react-cookie";

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
         <div style={{color:color}}>
             {date + " " + name + ": " + text}
         </div>
     );
}

export default Message;