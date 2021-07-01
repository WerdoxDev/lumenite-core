import express from 'express';
import Http from 'http';
import SocketIO from 'socket.io';
import historyApi from 'connect-history-api-fallback';
import path from 'path';
import { Light, StatusType, TempSensor } from '../types';
const port = process.env.PORT || 3001;
const app = express();
const http = new Http.Server(app);
const filePath = path.join(__dirname, '../dist/');
const io = new SocketIO.Server(http, {
    cors: {
        origin: "*",
    }
});

const lights = [{ pin: 5, pinCheck: 14 }, { pin: 4, pinCheck: 12 }];

let numOfDevices = 0;

let moduleId: string = "nothing";

io.on("connection", socket => {
    console.log('Client connected [Websocket], Id: ' + socket.id);

    socket.on('set-client', () => {
        io.sockets.in(moduleId).emit('module-get-lights-status');
        io.sockets.in(moduleId).emit('module-get-temp-status');
        io.sockets.in(moduleId).emit('module-check');
        socket.emit('configure-client');
        numOfDevices++;
        io.sockets.except(moduleId).emit('set-device-count', numOfDevices);
        socket.on('light-status-change-request', (light: Light) => {
            if (moduleId == "nothing") return;
            io.sockets.in(moduleId).emit('module-change-light-status', light);
        });
        socket.on('disconnect', () => {
            numOfDevices--;
            io.sockets.except(moduleId).emit('set-device-count', numOfDevices);
        });
    })

    socket.on('set-module', () => {
        socket.emit('configure-module', lights);
        socket.on('configure-module', () => {
            moduleId = socket.id;
            socket.emit('module-get-lights-status');
            socket.emit('module-get-temp-status');
            console.log('Module configured');
            io.sockets.except(moduleId).emit('module-connect');
        });
        socket.on('module-connected', () => {
            io.sockets.except(moduleId).emit('module-connect');
        })
        socket.on('module-light-status-changed', (light: Light) => {
            io.sockets.except(moduleId).emit('light-status-changed', light);
        });
        socket.on('module-get-lights-status', (lights: Array<Light>) => {
            io.sockets.except(moduleId).emit('set-lights-status', lights);
        });
        socket.on('module-temp-status-changed', (tempSensor: TempSensor) => {
            io.sockets.except(moduleId).emit('set-temp-status', tempSensor);
        });
        socket.on('module-light-pin-error', (light: Light) => {
            io.sockets.except(moduleId).emit('light-pin-error', light);
        })
        socket.on('disconnect', () => {
            io.sockets.except(moduleId).emit('module-disconnect');
            console.log('Module disconnect');
        });
    });
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