// Using in memory database since this is just a passion project
const rooms = {}; // map of roomID to usernames

const getRooms = () => rooms;

const deleteRoom = (id) => {
    delete rooms[id];
    return id;
};

const getRoomByID = (id) => {
    if (!rooms[id]) {
        return { error: "room not found" };
    }
    return { id, users: rooms[id] };
};

const createRoom = (id, username) => {
    if (!rooms[id]) {
        rooms[id] = [username];
        return { id, users: [] };
    }
    return { error: "room id already exists" };
};

const joinRoom = (roomID, username) => {
    if (!rooms[roomID]) {
        return { error: "room not found" };
    }
    if (rooms[roomID].indexOf(username) !== -1) {
        return { error: "username already taken" };
    }
    rooms[roomID].push(username);
    return { username };
};

const leaveRoom = (roomID, username) => {
    if (!rooms[roomID]) {
        return { error: "room not found" };
    }

    let userIndex = rooms[roomID].indexOf(username);
    if (userIndex === -1) {
        return { error: "username not in the room" };
    }

    rooms[roomID].splice(userIndex, 1);
    return { roomID, username };
};

module.exports = {
    getRooms,
    getRoomByID,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
};
