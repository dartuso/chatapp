const http = require("http");
const express = require("express");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const router = require("./router");
const app = express();
app.use(router);

const server = http.createServer(app);
const io = socketIo(server);


let users = [];
let messages = [];
io.on("connect", socket => {
    socket.on("join", (name) => {
        console.log("Receive join from " +socket.id + "with param: " + name + " ." )
        if (existingUser(name) || !name) {
            name = createNewNickName();
            updateName(name)
        }
        addUser(socket.id, name);
        sendPreviousMessages();

        sendUserMsg(name + " is your name, welcome!")



        console.log("Sent users to all users")
        io.emit("users", users);
        sendServerMsg(name + " has joined!")
    });


    socket.on("sendMsg", msg => {
        console.log("Receive message from " +socket.id + "with param: " + msg + " ." )
        const user = findUser(socket.id);

        let s = msg.split(" ")
        //if name if color esleo
        if (s[0] === "/name") {
            const res = changeName({id: socket.id, newName: s[1]})
            if (res !== null) {
                updateName(res)
            } else {
                sendUserMsg("Error in name selection")
            }
        } else if (s[0] === "/color") {
            if (changeColour({id: socket.id, color: s[1]}) === null) {
                sendUserMsg("Error in color selection. (/color RRGGBB hex)")
            }
        } else {
            //TODO santize data?
            console.log("sending message")
            let message = storeMessage({
                name: user.name,
                text: msg,
                color: user.color,
                date: new Date().toLocaleString(),
            })
            io.emit("getMsg", message);
        }
    });


    socket.once("disconnect", () => {
        console.log("Receive disconnect from " +socket.id )
        const user = removeUser(socket.id);
        if (user) {
            sendServerMsg(user.name + " has left.")
        }
        io.emit("users", users);
    });


    const updateName = (username) => {
        console.log("Sent update name to " + socket.id + "with content " + username)

        socket.emit("updateUser", username)
    }

    const updateColor = (color) => {
        console.log("Sent update color to " + socket.id + "with content " + color)
        socket.emit("updateColor", color)
    }

    const storeMessage = ({name, text, color, date}) => {
        const msg = {name, text, color, date}
        if (messages.length > 0) {
            const {prevname, prevtext, prevcolor, prevdate} = messages[messages.length - 1]
            if (prevname === name && prevdate === date) {
                console.log("Found duplicate!")
            } else {
                if (messages.length > 200) {
                    messages.shift();
                }
            }
            messages.push(msg);
        } else  {
            messages.push(msg);
        }

        return msg;

    }

    function createNewNickName() {
        let username = userGen()
        while (existingUser(username)) {
            username = userGen()
        }
        return username;
    }

    const userGen = () => {
        return "User" + Math.floor(Math.random() * 10000).toString();
    }

    const existingUser = newUser => {
        return users.find(user => user.nickname === newUser);
    };

    const addUser = (id, name) => {
        console.log("Adding user with id" + id + " and name " + name)
        name = name.trim()
        let color = "#000";

        const user = {id, name, color};
        users.push(user);
        return {user};
    }

    const removeUser = ({id}) => {
        const index = findIndexUser(id)
        if (index !== -1) {
            console.log("Deleting user" )
            return users.splice(index, 1)[0];
        }
    }

    const changeName = ({id, newName}) => {
        if (existingUser(newName)) {
            return null
        } else {
            findUser(id).name = newName
            return newName
        }
    }


//TODO check valid hex
    const changeColour = ({id, color}) => {
        findUser(id).color = color
        return color
    }

    const findUser = id => users.find(user => user.id === id);
    const findIndexUser = id => users.findIndex(user => user.id === id);

    const sendServerMsg = (text) => {
        console.log("SERVER: sending msg: " + text)
        let message = storeMessage({name: "SERVER", text: text, color: '#000', date: new Date().toLocaleString()})
        io.emit("getMsg", message );
    }



    const sendUserMsg = (msg) => {
        console.log("Sending server messages to " +socket.id + "with content " + msg )
        socket.emit("getMsg", {name: "SERVER", text: msg, color: '#000', date: new Date().toLocaleString()});
    }


    const sendPreviousMessages = () => {
        console.log("Sending cached  to " +socket.id )
        socket.emit("getCached", messages);
    }

});

server.listen(port, () => console.log(`Listening on port ${port}`));


