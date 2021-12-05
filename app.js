require('dotenv').config()

const express = require('express');
const cors = require('cors')
const DB = require('./db/DB');

const user = require('./routes/user');
const chat = require('./routes/chat');
const auth = require('./routes/auth');
const ws = require('./ws/index').StartServer;

const app = express();
const port = 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.options('*', cors());

app.use('/user', user);
app.use('/chat', chat);
app.use('/auth', auth);

app.get('/', async (req, res) => {
    const {rows} = await DB.client.query("SELECT * FROM Users");
    res.send(rows);
});

DB.ConnectDB().then(res => {
    if(!res) return;
    
    const server = app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    });
    ws(server);
});
