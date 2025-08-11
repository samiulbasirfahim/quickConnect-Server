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
        console.log("Connected ", username);
        socket.on("create-room", () => {
            const roomID = generateRoomId();
            // const roomID = "000000";
            rooms[roomID] = new Map();
            rooms[roomID].set(socket.id, username);
            socket.join(roomID);
            socket.emit("room-created", { roomID });
            console.log(
                `User '${username}' (socket ID: ${socket.id}) created room '${roomID}'`,
            );
        });
        socket.on("join-room", ({ roomID }: { roomID: string }) => {
            if (!rooms[roomID]) {
                return socket.emit("error", { message: "Room does not exist." });
            }
            const existingUsers = Array.from(rooms[roomID]);
            rooms[roomID].set(socket.id, username);
            socket.join(roomID);
            socket.to(roomID).emit("user-joined", { socketID: socket.id, username });
            socket.emit("existing-users", { roomID, existingUsers });
        });

        socket.on("offer", (data) => {
            const { to, offer } = data;
            console.log("forwarding offer to", to);
            socket.to(to).emit("offer", {
                offer,
                from: socket.id,
            });
        });

        socket.on("answer", (data) => {
            const { answer, to } = data;
            console.log("forwarding answer to ", to);
            socket.to(to).emit("answer", {
                answer,
                from: socket.id,
            });
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            console.log(`Forwarding candidate to ${to}`);
            io.to(to).emit("ice-candidate", { sender: socket.id, candidate });
        });
        socket.on("disconnect", () => {
            console.log("Disoconnected: ", username);
        });
    });
};
