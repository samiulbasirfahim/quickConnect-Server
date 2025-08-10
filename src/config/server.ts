import express, { type Express } from "express";
import http from "http";
import { Server } from "socket.io";
import signaling from "../socket/signaling";

const app: Express = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

signaling(io);

export default server;
