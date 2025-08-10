import { Server, Socket } from "socket.io";

const rooms: Record<string, Map<string, string>> = {};

const generateRoomId = (len = 6) => {
    let res = "";
    for (let i = 0; i < len; i++) {
        res += Math.floor(Math.random() * len);
    }
    return rooms[res] ? generateRoomId(len) : res;
};

export default (io: Server) => {
    io.on("connection", (socket: Socket) => {
        const username = String(socket.handshake.query.username) ?? "unknown";
        socket.on("create-room", () => {
            const roomID = generateRoomId();
            rooms[roomID] = new Map();
            rooms[roomID].set(socket.id, username);
            socket.join(roomID);
            socket.emit("room-created", JSON.stringify({ roomID }));
        });
    });
};
