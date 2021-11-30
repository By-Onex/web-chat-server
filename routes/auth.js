const Router = require('express').Router;
const db = require('../db/DB').client;
const jwt = require('jsonwebtoken');

const router = new Router();

module.exports = router;

router.post('/login', async (req, res) => {
    const {user_name} = req.body;
    if(!user_name) return res.status(400).json({error:'Неверно указан логин'});

    const {rows} = await db.query("SELECT id, name FROM Users WHERE name = $1", [user_name]);
    const user = rows[0];

    if(user){
        const token = jwt.sign(
            {id: user.id, name: user.name },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        user.token = token;
        return res.status(200).json(user);
    }
    return res.status(400).json({error:`Пользователя с именем ${user_name} не существует`});
});

