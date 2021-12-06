const {Client} = require('pg');

const initDB = require('./initDB');

const client = new Client({
    user: process.env.USER,
    host: process.env.HOST,
    database:  process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});

const ConnectDB = async (recreate = false)=> {
    console.log("Start connecnt DB");
    await client.connect(err => {
        if (err){
            console.log('Error connect db', err);
            return false;
        }

        client.query(`SELECT Users.id, Users.name FROM Users
        LEFT JOIN UsersChats ON UsersChats.user_id = Users.id
        LEFT JOIN Chats ON Chats.creator_id = Users.id
        WHERE UsersChats.chat_id = $1 OR Chats.id = $1
            ;`, [1])
            .then(data => console.log(data.rows));

    });
    if(recreate){
        await initDB.DropDB(client);
        await initDB.CreateDB(client);
        await initDB.GenerateValuesDB(client);
    }

    return true;
}

module.exports = {
    ConnectDB,
    client
}