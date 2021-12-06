const Router = require('express').Router;
const middle_auth = require('../middleware/auth').checkAuth;

const db = require('../db/DB').client;

const router = new Router();
router.use(middle_auth);

module.exports = router;


//Получить всех пользователей
router.get('/all', async (req, res) => {
    const {
        rows
    } = await db.query("SELECT * FROM Users");
    res.send(rows);
});

//Получить информацию о пользователе
router.get('/:id', async (req, res) => {
    const {id} = req.params;
    
    const {rows} = await db.query("SELECT * FROM Users WHERE id = $1", [~~id]);
    res.send(rows[0]);
});

//Получить все чаты в которых состоит пользователь
router.get('/:id/chats', async (req, res) => {
    const {id} = req.params;

    const {rows} = await db.query(`
        SELECT
            Chats.id, Chats.name,
            Count(CASE WHEN Messages.reading = false AND Messages.user_id <> $1
                then 1 else null end
            ) as unreading
        FROM Chats
        LEFT JOIN Messages ON Chats.id = Messages.chat_id
        WHERE Chats.id IN
            (SELECT DISTINCT Chats.id FROM Chats
                JOIN UsersChats ON Chats.id = UsersChats.chat_id
                WHERE Chats.creator_id = $1 OR UsersChats.user_id = $1
            )
        GROUP BY Chats.id
        ;`, [~~id]);
    

    res.status(200).json(rows);


    //setTimeout(() =>res.status(200).json(rows), 3000);
});
