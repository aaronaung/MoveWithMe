const app = require("express")();
const http = require("http");
const cors = require("cors");
const { leaveRoom, getRoomByID, deleteRoom } = require("./db/rooms");
const PORT = 4000;
require("dotenv").config();

app.use(cors());
app.use("/rooms", require("./routes/rooms"));

const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("socket connected", socket.id);
    socket.on("joinRoom", (roomID, userID) => {
        console.log(`user ${userID} joined room ${roomID}`);
        socket.join(roomID);

        // let everyone else (but yourself) in the room know that you're connected.
        socket.to(roomID).broadcast.emit("userConnected", userID);

        socket.on("disconnect", () => {
            console.log("socket disconnected", userID);
            leaveRoom(roomID, userID);

            const room = getRoomByID(roomID);
            if (room.users && room.users.length === 0) {
                deleteRoom(roomID);
            }

            // on disconnect, let everyone else (but yourself) know that you've disconnected.
            socket.to(roomID).broadcast.emit("userDisconnected", userID);
        });
    });
});

server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
