const Router = require('express').Router;
const db = require('../db/DB').client;

const router = new Router();

module.exports = router;


router.get('/all', async (req, res) => {
    const {
        rows
    } = await db.query("SELECT * FROM Users");
    res.send(rows);
});

router.get('/:id', async (req, res) => {
    const {id} = req.params;
    
    const {rows} = await db.query("SELECT * FROM Users WHERE id = $1", [~~id]);
    res.send(rows[0]);
});

router.get('/:id/chats', async (req, res) => {
    const {id} = req.params;
    const {rows} = await db.query(
        `SELECT DISTINCT id, name FROM Chats
        LEFT JOIN UsersChats ON Chats.id = UsersChats.chat_id
        WHERE UsersChats.user_id = $1 OR Chats.creator_id = $1`, [~~id]);
    res.send(rows);
});
