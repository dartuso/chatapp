const http = require("http");
const express = require("express");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const router = require("./router");
const app = express();
app.use(router);

const server = http.createServer(app);
// noinspection JSValidateTypes
const io = socketIo(server);


let users = [];
let messages = [];
io.on("connect", socket => {
    socket.on("join", (name) => {
        console.log("Receive join from " + socket.id + "with param: " + name + " .")

        const user = addUser(socket.id, name);
        updateName(user)
        io.emit("users", users);
        socket.emit("getCached", messages);
        sendServerMsg( user + " has joined")
        sendUserMsg("Welcome! your name is " + user)
    });


    socket.on("sendMsg", msg => {
        console.log("Receive message from " + socket.id + "with param: " + msg + " .")
        const user = findUser(socket.id);

        let s = msg.split(" ")
        if (s[0].startsWith('/')) {
            if (s[0] === "/name") {
                const oldName = user.name;
                const newName = s[1]
                const res = changeName({id: socket.id, newName: newName})
                if (res !== null) {
                    sendServerMsg(oldName + " is now " + newName)
                    updateName(newName)
                    io.emit("users", users);
                    io.emit("getCached", messages);
                } else {
                    sendUserMsg("Error in name selection!")
                }
            } else if (s[0] === "/color") {
                if (changeColour({id: socket.id, color: s[1]}) === null) {
                    sendUserMsg("Error in color selection. (/color RRGGBB hex)")
                } else {
                    io.emit("users", users);
                    io.emit("getCached", messages);
                }
            } else {
                sendUserMsg("Invalid command - select either /name or /color RRGGBB!")
            }
        } else if (user !== undefined) {
            for (let i = 0; i < s.length; i++){
                if(s[i] in emojiMap) {
                    s[i] = emojiMap[s[i]]
                }
            }
            let newEmojifiedMsg = s.join(' ')

            let message = storeMessage({
                id: socket.id,
                name: user.name,
                text: newEmojifiedMsg,
                color: user.color,
                date: new Date().toLocaleTimeString(),
            })

            io.emit("getMsg", message);
        }
    });


    socket.once("disconnect", () => {
        console.log("Receive disconnect from " + socket.id)
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

    const storeMessage = ({id, name, text, color, date}) => {
        const msg = {id, name, text, color, date}
        if (messages.length > 0) {
            const {name: prevName,date: prevDate} = messages[messages.length - 1]
            if (prevName === name && prevDate === date) {
                console.log("Found duplicate!")
            } else {
                if (messages.length > 200) {
                    messages.shift();
                }
            }
        }
        messages.push(msg);
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
        return users.find(user => user.name === newUser);
    };

    const addUser = (id, name) => {
        if (existingUser(name) || !name || typeof name !== "string" || name === 'SERVER') {
            name = createNewNickName();
        }
        console.log("Adding user with id" + id + " and name " + name)
        name = name.trim()
        let color = "#000";
        const existUser = users.find(user => user.id === id)
        let user = {id, name, color};

        if (existUser === undefined){
            users.push(user);
        }

        return name;
    }

    const removeUser = (id) => {
        const user = users.find(user => user.id === id)
        if(user !== undefined) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].id === id || users[i].name === user.name) {
                    users.splice(i, 1)
                    console.log("Deleted user " + id)
                }
            }
        }
    }

    const changeName = ({id, newName}) => {
        console.log("Searching for " + id + " to replace with " + newName)
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                users[i].name = newName
                console.log("Update user " + id + " to name " + users[i].name)
                for (let j = 0; j < messages.length; j++) {
                    if(messages[j].id === id){
                        messages[j].name = newName
                    }
                }
                return users[i]
            }
        }
        return null;
    }


    const changeColour = ({id, color}) => {
        color = '#' + color
        if(/^#([0-9A-F]{3}){1,2}$/i.test(color)){
            findUser(id).color = color
            for (let j = 0; j < messages.length; j++) {
                if(messages[j].id === id){
                    messages[j].color = color
                }
            }
            return color
        } else {
            return null
        }
    }

    const findUser = id => users.find(user => user.id === id);

    const sendServerMsg = (text) => {
        console.log("SERVER: sending msg: " + text)
        let message = storeMessage({id:'SERVER', name: "SERVER", text: text, color: '#ddbb2f', date: new Date().toLocaleTimeString()})
        io.emit("getMsg", message);
    }


    const sendUserMsg = (msg) => {
        console.log("Sending server messages to " + socket.id + "with content " + msg)
        socket.emit("getMsg", {id:'SERVER', name: "SERVER", text: msg, color: '#a796f5', date: new Date().toLocaleTimeString()});
    }

});

server.listen(port.toString(), () => console.log(`Listening on port ${port}`));


const emojiMap = {
    'o/': '👋',
    '</3': '💔',
    '<3': '💗',
    '8-D': '😁',
    '8D': '😁',
    ':-D': '😁',
    ':-3': '😁',
    ':3': '😁',
    ':D': '😁',
    'B^D': '😁',
    'X-D': '😁',
    'x-D': '😁',
    ':\')': '😂',
    ':\'-)': '😂',
    ':-))': '😃',
    '8)': '😄',
    ':)': '😊',
    ':-)': '😄',
    ':]': '😄',
    ':^)': '😄',
    ':c)': '😄',
    ':o)': '😄',
    ':}': '😄',
    '0:)': '😇',
    '0:-)': '😇',
    '0:-3': '😇',
    '0:3': '😇',
    '0;^)': '😇',
    'O:-)': '😇',
    '3:)': '😈',
    '3:-)': '😈',
    '}:)': '😈',
    '}:-)': '😈',
    '*)': '😉',
    '*-)': '😉',
    ':-,': '😉',
    ';)': '😉',
    ';-)': '😉',
    ';-]': '😉',
    ';D': '😉',
    ';]': '😉',
    ';^)': '😉',
    ':-|': '😐',
    ':|': '😐',
    ':(': '😞',
    ':-(': '😒',
    ':-<': '😒',
    ':-[': '😒',
    ':-c': '😒',
    ':<': '😒',
    ':[': '😒',
    ':c': '😒',
    ':{': '😒',
    '%)': '😖',
    '%-)': '😖',
    ':-P': '😜',
    ':-b': '😜',
    ':-p': '😜',
    ':P': '😜',
    ':b': '😜',
    ':p': '😜',
    ';(': '😜',
    'X-P': '😜',
    'd:': '😜',
    'x-p': '😜',
    ':-||': '😠',
    ':@': '😠',
    ':-.': '😡',
    ':-/': '😡',
    ':/': '😐',
    ':L': '😡',
    ':S': '😡',
    ':\\': '😡',
    ':\'(': '😢',
    ':\'-(': '😢',
    '^5': '😤',
    '^<_<': '😤',
    'o/\\o': '😤',
    '|-O': '😫',
    '|;-)': '😫',
    ':###..': '😰',
    ':#': '😅',
    ':-###..': '😰',
    'D-\':': '😱',
    D8: '😱',
    'D:': '😱',
    'D:<': '😱',
    'D;': '😱',
    DX: '😱',
    'v.v': '😱',
    '8-0': '😲',
    ':-O': '😲',
    ':-o': '😲',
    ':O': '😲',
    ':o': '😲',
    'O-O': '😲',
    O_O: '😲',
    O_o: '😲',
    'o-o': '😲',
    o_O: '😲',
    o_o: '😲',
    ':$': '😳',
    '#-)': '😵',
    ':&': '😶',
    ':-#': '😶',
    ':-&': '😶',
    ':-X': '😶',
    ':X': '😶',
    ':-J': '😼',
    ':*': '😽',
    ':^*': '😽',
    '*\\0/*': '🙆',
    '\\o/': '🙆',
    ':>': '😄',
    '>.<': '😡',
    '>:(': '😠',
    '>:)': '😈',
    '>:-)': '😈',
    '>:/': '😡',
    '>:O': '😲',
    '>:P': '😜',
    '>:[': '😒',
    '>:\\': '😡',
    '>;)': '😈',
    '>_>^': '😤',
    '^^': '😊',
};

