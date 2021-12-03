const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
    const token = req.headers["token"];
    if(!token) {
        return res.status(403).json({error:"Вы не авторизованы"});
    }
    try{
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;
        return next();
    }
    catch(err){
        return res.status(401).json({error:"Неверный токен"});
    }
}

const getUser = (token) => {
    if(!token) return null;
    try {
        return jwt.verify(token, process.env.TOKEN_KEY);
    }catch(err){
        return null;
    }
}

module.exports = {checkAuth, getUser};