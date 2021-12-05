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

        client.query(`SELECT Chats.id, Chats.name, Count(CASE WHEN Messages.reading = false AND Messages.user_id <> $1 then 1 else null end) as unreading FROM Chats
        LEFT JOIN Messages ON Chats.id = Messages.chat_id
        where Chats.id IN
        (SELECT DISTINCT Chats.id FROM Chats
            JOIN UsersChats ON Chats.id = UsersChats.chat_id
            WHERE Chats.creator_id = $1 OR UsersChats.user_id = $1)
        GROUP BY Chats.id
            ;`, [5])
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