const Router = require('express').Router;
const db = require('../db/DB').client;
const format = require('pg-format');

const router = new Router();

module.exports = router;

router.get('/:id', async (req, res) => {
    const {id} = req.params;
    
    const {rows} = await db.query("SELECT * FROM Chats WHERE id = $1", [~~id]);
    res.send(rows[0]);
})

router.get('/', async (req, res) => {
    const {
        rows
    } = await db.query("SELECT * FROM Chats");
    res.send(rows);
});

router.get('/:id/messages', async (req, res) => {
    const {id} = req.params;
    const {rows} = await db.query(`SELECT * FROM Messages 
        WHERE Messages.chat_id = $1`, [~~id]);
        //setTimeout(() => res.send(rows), 3000);
        res.send(rows);
})

router.get('/:id/users', async (req, res) => {
    const {id} = req.params;
    // WHERE UsersChats.chat_id = $1 OR Chats.id = $1;`, [~~id]
    const {rows} = await db.query(`SELECT Users.id, Users.name FROM Users
        LEFT OUTER JOIN UsersChats ON UsersChats.user_id = Users.id
        LEFT JOIN Chats ON Chats.creator_id = Users.id
        WHERE UsersChats.chat_id = $1 OR Chats.id = $1`, [~~id]);
    res.send(rows);
    //setTimeout(() => res.send(rows), 3000);
})

router.post('/:id/create_message', async (req, res) => {
    const msg_data = [req.body.chat_id, req.body.user_id, req.body.text, req.body.date];
    const { rows } = await db.query(format(`INSERT INTO Messages (chat_id, user_id, text, date) VALUES %L RETURNING *;`, [msg_data]))
    res.send(rows);
});