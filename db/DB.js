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