const db = require('./DB').client;
const format = require('pg-format');

const findAllUsersInChatW = async (chat_id, user_id) => {
    const {rows} = await db.query(`SELECT Users.id FROM Users
        LEFT OUTER JOIN UsersChats ON UsersChats.user_id = Users.id
        LEFT JOIN Chats ON Chats.creator_id = Users.id
        WHERE (UsersChats.chat_id = $1 OR Chats.id = $1) AND Users.id <> $2`, [chat_id, user_id]);

    return rows.map(u => u.id);
}

const findAllUsersInChat = async (chat_id) => {
    const {rows} = await db.query(`SELECT Users.id, Users.name FROM Users
        LEFT OUTER JOIN UsersChats ON UsersChats.user_id = Users.id
        LEFT JOIN Chats ON Chats.creator_id = Users.id
        WHERE UsersChats.chat_id = $1 OR Chats.id = $1`, [chat_id]);

    return rows;
}

const updateUserReadingMessage = async (message_id) => {
    const {rows} = await db.query(`UPDATE Messages SET reading = false WHERE id = $1 RETURNING *`, [message_id]);
    return rows[0];
}

module.exports = {
    findAllUsersInChat,
    updateUserReadingMessage,
    findAllUsersInChatW
}