const WebSocketServer = require('ws').Server;
const auth = require('../middleware/auth').getUser;
const chatRepo = require('../db/chatRepo');
const users = new Map();

const onMessage = async (ws, data) => {
    console.log(ws.user.id, data);
    switch (data.type) {
        case 'NOTIFY_READ_MESSAGE':
            const result = await chatRepo.updateUserReadingMessage(data.body.id);
            let users = await chatRepo.findAllUsersInChatW(result.chat_id, ws.user.id);
            SendMessageTo(users, 'NOTIFY_READ_MESSAGE', {id:result.id, chat_id:result.chat_id, reading: true})
            break;
        default:
            console.log(data);
            return;
    }
}

const SendMessageTo = (from, type, data) => {
    function send(user_id, type, data) {
        const ws = users.get(user_id);
        if (!ws) return;
        ws.send(JSON.stringify({
            type,
            body:data
        }));
    }
    if (Array.isArray(from)) {
        from.forEach(id => send(id, type, data));
    } else send(from, type, data);
}

const StartServer = (server) => {

    let wsServer = new WebSocketServer({
        noServer: true
    });

    wsServer.on('connection', (ws) => {
        ws.on('message', (msg) => {
            try {
                const data = JSON.parse(msg);
                if (ws.user) {
                    onMessage(ws, data);
                } else {
                    const user = auth(data.token);
                    if (!user) return ws.close(1011, "ошибка подключения");
                    ws.user = user;
                    users.set(user.id, ws);
                    ws.send(JSON.stringify({
                        type: 'CONN',
                        connection: true
                    }))
                }
            } catch (err) {
                console.log(err);
                ws.close(1011, "ошибка подключения");
            }

        });
        ws.on("close", (code, reason) => {
            if (ws.user) {
                users.delete(ws.user.id)
            }
        })
    });

    server.on('upgrade', async (req, socet, head) => {
        wsServer.handleUpgrade(req, socet, head, (ws) => {
            wsServer.emit('connection', ws, req);
        })
    });
}
module.exports = {
    StartServer,
    SendMessageTo
}
