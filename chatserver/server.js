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
        console.log("Receive join from " + socket.id + "with param: " + name + " .")

        addUser(socket.id, name);
        socket.emit("getCached", messages);
        // sendUserMsg(name + " is your name, welcome!")
    });


    socket.on("sendMsg", msg => {
        console.log("Receive message from " + socket.id + "with param: " + msg + " .")
        const user = findUser(socket.id);

        let s = msg.split(" ")
        if (s[0].startsWith('/')) {
            if (s[0] === "/name") {
                const res = changeName({id: socket.id, newName: s[1]})
                if (res !== null) {
                    updateName(res.name)
                } else {
                    sendUserMsg("Error in name selection")
                }
            } else if (s[0] === "/color") {
                if (changeColour({id: socket.id, color: s[1]}) === null) {
                    sendUserMsg("Error in color selection. (/color RRGGBB hex)")
                }
            } else {
                sendUserMsg("Invalid command - select either /name or /color RRGGBB")
            }
        } else if (user !== undefined) {
            console.log("sending message")
            for (let i = 0; i < s.length; i++){
                if(s[i] in emojiMap) {
                    s[i] = emojiMap[s[i]]
                }
            }
            let newEmojifiedMsg = s.join(' ')

            let message = storeMessage({
                name: user.name,
                text: newEmojifiedMsg,
                color: user.color,
                date: new Date().toLocaleTimeString(),
            })
            // io.emit("getMsg", message);
            io.emit("getCached", messages);
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
        } else {
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
        return users.find(user => user.name === newUser);
    };

    const addUser = (id, name) => {
        if (existingUser(name) || !name || typeof name !== "string") {
            name = createNewNickName();
        }
        console.log("Adding user with id" + id + " and name " + name)
        name = name.trim()
        let color = "#000";
        const existUser = users.find(user => user.id == id)
        let user = {};

        if (existUser === undefined){
            user = {id, name, color};
            users.push(user);
        }

        updateName(name)
        io.emit("users", users);

        return {user};
    }

    const removeUser = (id) => {
        const user = users.find(user => user.id == id)
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
                return users[i]
            }
        }
        return null;
    }


    const changeColour = ({id, color}) => {
        color = '#' + color
        if(/^#([0-9A-F]{3}){1,2}$/i.test(color)){
            findUser(id).color = color
            return color
        } else {
            return null
        }
    }

    const findUser = id => users.find(user => user.id == id);
    const findIndexUser = id => users.findIndex(user => user.id == id);

    const sendServerMsg = (text) => {
        console.log("SERVER: sending msg: " + text)
        let message = storeMessage({name: "SERVER", text: text, color: '#000', date: new Date().toLocaleTimeString()})
        io.emit("getMsg", message);
    }


    const sendUserMsg = (msg) => {
        console.log("Sending server messages to " + socket.id + "with content " + msg)
        socket.emit("getMsg", {name: "SERVER", text: msg, color: '#000', date: new Date().toLocaleTimeString()});
    }

});

server.listen(port, () => console.log(`Listening on port ${port}`));


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

