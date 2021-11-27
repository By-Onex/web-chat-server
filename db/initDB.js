const { Client } = require("pg");
const format = require('pg-format');

/**
 * @param {Client} db
 */
const DropDB = async (db) => {
    const {
        result
    } = await db.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log(result);
    return result;
}

/**
 * @param {Client} db
 */
const CreateDB = async db => {
    let {
        result
    } = await db.query(`CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        name varchar(40) NOT NULL CHECK(name <> '')
    );`);

    result = await db.query(`CREATE TABLE IF NOT EXISTS Chats (
        id SERIAL PRIMARY KEY,
        name varchar(40) NOT NULL CHECK(name <> ''),
        creator_id integer REFERENCES Users(id)
    );`);

    result = await db.query(`CREATE TABLE IF NOT EXISTS UsersChats (
        chat_id integer REFERENCES Chats(id),
        user_id integer REFERENCES Users(id),
        UNIQUE (chat_id, user_id)
    );`)

    result = await db.query(`CREATE TABLE IF NOT EXISTS Messages (
        id SERIAL PRIMARY KEY,
        chat_id integer REFERENCES Chats(id),
        user_id integer REFERENCES Users(id),
        text varchar(225) NOT NULL CHECK(text <> ''),
        date TIMESTAMPTZ
    );`)
}

/**
 * @param {Client} db
 */
const GenerateValuesDB = async db => {
    let users = [];
    for (let i = 0; i < 5; i++) {
        users.push(['user' + (i+1)]);
    }

    let { result } = await db.query(format(`INSERT INTO Users (name) VALUES %L`, users));
    
    let { rows } = await db.query("SELECT * FROM Users;");
    console.log(rows)
    

    let chats = [];
    for (let i = 0; i < 5; i++) {
        chats.push(['chat №' + (1+i), getRandomInt(3, rows.length+1)]);
    }

    result = await db.query(format(`INSERT INTO Chats (name, creator_id) VALUES %L`, chats));
    
    {
        let {rows} = await db.query("SELECT * FROM Chats;");
        console.log(rows);

        let usersGroup = [];
        for (let i = 0; i < rows.length; i++) {
            usersGroup.push([rows[i].id, 1]);
            usersGroup.push([rows[i].id, 2]);
        }
        
        let inserted_rows = await (await db.query(format(`INSERT INTO UsersChats (chat_id, user_id) VALUES %L RETURNING *;`, usersGroup))).rows;
        console.log(inserted_rows);

        let messages = [];
        for (let i = 0; i < rows.length; i++) {
            const {id, creator_id} = rows[i];
            for(let j =0; j < getRandomInt(3,5); j++)
                messages.push([id, creator_id, `Hello my message ${j+1}`, new Date()]);
        }

        inserted_rows = await (await db.query(format(
            `INSERT INTO Messages (chat_id, user_id, text, date)
            VALUES %L RETURNING *;`, messages))).rows;
        console.log(inserted_rows);
        }
    

    return result;
}


const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}

module.exports = {
    DropDB,
    CreateDB,
    GenerateValuesDB
}