const Router = require('express').Router;
const db = require('../db/DB').client;
const format = require('pg-format');
const middle_auth= require('../middleware/auth').checkAuth;

const ws = require('../ws/index');

const chatRepo = require('../db/chatRepo');

const router = new Router();

module.exports = router;
router.use(middle_auth);

//Информация о чате
router.get('/:id', async (req, res) => {
    const {id} = req.params;
    
    const {rows} = await db.query("SELECT * FROM Chats WHERE id = $1", [~~id]);
    res.send(rows[0]);
});

//Получить все чаты
router.get('/', async (req, res) => {
    const {
        rows
    } = await db.query("SELECT * FROM Chats");
    res.send(rows);
});

//Получить все сообщения в чате
router.get('/:id/messages', async (req, res) => {
    const { id } = req.params;
    const { rows } = await db.query(`SELECT * FROM Messages 
        WHERE Messages.chat_id = $1 ORDER BY date`, [~~id]);

    setTimeout(() => res.json(rows), 500);
});

//Получить всех пользователей чата
router.get('/:id/users', async (req, res) => {
    const {id} = req.params;
    const {rows} = await db.query(`SELECT Users.id, Users.name FROM Users
        LEFT JOIN UsersChats ON UsersChats.user_id = Users.id
        LEFT JOIN Chats ON Chats.creator_id = Users.id
        WHERE UsersChats.chat_id = $1 OR Chats.id = $1`, [~~id]);
    res.send(rows);
    //setTimeout(() => res.send(rows), 3000);
});

//Создать сообщение в чате
router.post('/:id/create_message', async (req, res) => {
    const msg_data = [req.body.chat_id, req.body.user_id, req.body.text, req.body.date];
    const { rows } = await db.query(format(`INSERT INTO Messages (chat_id, user_id, text, date) VALUES %L RETURNING *;`, [msg_data]))
    setTimeout(() =>res.json(rows[0]), 1500);
    let users = await chatRepo.findAllUsersInChatW(req.body.chat_id, req.body.user_id);
    ws.SendMessageTo(users, 'NEW_MESSAGE', rows[0])
});

router.post('/create', async (req, res) => {
    console.log(req.user.id, req.body.name, req.body.users);
    const chatData = [req.body.name, req.user.id];
    const { rows } = await db.query(format(`INSERT INTO Chats (name, creator_id) VALUES %L RETURNING *;`, [chatData]));
    let id = rows[0].id;
    let users = [];
    for(let i = 0; i < req.body.users.length; i++){
        users.push([id, req.body.users[i]]);
    }
    const result = await (await db.query(format(`INSERT INTO UsersChats (chat_id, user_id) VALUES %L RETURNING *`, users))).rows;
    res.json(rows[0]);
});