let users = [];

const createNewNickName = () => {
    let username = userGen
    while (existingUser(username)) {
        username = userGen
    }
    return username;
}

const userGen = () => {
    return "User" + Math.floor(Math.random() * 10000).toString();
}

const existingUser = newUser => {
    return users.find(user => user.nickname === newUser);
};

const addUser = ({id, name}) => {
    name = name.trim().toLowerCase();
    let textColor = "#000";

    const user = {id, name, color};
    users.push(user);
    return {user};
}

const removeUser = ({id}) => {
    const index = findIndexUser(id)
    if (index !== -1) {
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

const getUsers = () => {
    return users
}