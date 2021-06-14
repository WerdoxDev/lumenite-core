import express from 'express';
import Http from 'http';
import SocketIO from 'socket.io';
import historyApi from 'connect-history-api-fallback';
import path from 'path';
import { Light, StatusType } from '../types';
const port = process.env.PORT || 3001;
const app = express();
const http = new Http.Server(app);
const filePath = path.join(__dirname, '../dist/');
const io = new SocketIO.Server(http, {
    cors: {
        origin: "*",
    }
});

const lightPins = [5, 4];
const lightPinChecks = [14, 12];

let arduinoId: string;

io.on("connection", socket => {
    console.log('Client connected [Websocket], Id: ' + socket.id);
    let interval;

    if (arduinoId != null) {
        for (let i = 0; i < lightPinChecks.length; i++) {
            io.sockets.in(arduinoId).emit('module-light-status', { pinCheck: lightPinChecks[i], index: i });
        }
    }

    socket.on('module-light-status-confirm', (light: Light) => {
        console.log(light);
        io.emit('light-change-confirm', light);
    });

    socket.on('set-module', () => {
        console.log('Module configured');
        arduinoId = socket.id;
        io.emit('module-connect');
        for (let i = 0; i < lightPinChecks.length; i++) {
            io.sockets.in(arduinoId).emit('module-light-status', { pinCheck: lightPinChecks[i], index: i });
        }

        interval = setInterval(() => {
            if (arduinoId != null) {
                for (let i = 0; i < lightPinChecks.length; i++) {
                    io.sockets.in(arduinoId).emit('module-light-status', { pinCheck: lightPinChecks[i], index: i });
                }
            }
        }, 1000);
    });

    socket.on('light-change', (light: Light, status: StatusType) => {
        console.log(light);
        if (!arduinoId) io.emit('set-module');
        light.status = status;
        io.sockets.in(arduinoId).emit('module-light-change', { light: light, pin: lightPins[light.index], pinCheck: lightPinChecks[light.index] });
    });

    socket.on('module-light-change-confirm', (light: Light) => {
        console.log(light);
        io.emit('light-change-confirm', light);
    })

    socket.on('diconnect', () => {
        if (socket.id == arduinoId) {
            io.emit('module-disconnect');
            clearInterval(interval);
        }
    })
});

app.use(historyApi());

app.use('/', express.static(filePath));

http.listen({ host: '192.168.1.115', port: port }, () => {
    console.log(`Listening on port *:${port}`);
});

// http.listen({ host: '192.168.1.102', port: port }, () => {
//     console.log(`Listening on port *:${port}`);
// });

// http.listen(port, () => {
//     console.log(`Listening on port *:${port}`);
// });