const router = require("express").Router();
const rooms = require("../db/rooms");
const { v4: uuidV4 } = require("uuid");

router.get("/", (req, res) => {
    res.status(200).send(rooms.getRooms());
});

router.get("/:id", (req, res) => {
    let resp = rooms.getRoomByID(req.params["id"]);
    res.status(resp.error ? 400 : 200).send(resp);
});

router.post("/", (req, res) => {
    let resp = rooms.createRoom(uuidV4(), req.query["username"]);
    res.status(resp.error ? 400 : 200).send(resp);
});

router.post("/:id/join", (req, res) => {
    let resp = rooms.joinRoom(req.params["id"], req.query["username"]);
    res.status(resp.error ? 400 : 200).send(resp);
});

router.post("/:id/leave", (req, res) => {
    let resp = rooms.leaveRoom(req.params["id"], req.query["username"]);
    res.status(resp.error ? 400 : 200).send(resp);
});

module.exports = router;
