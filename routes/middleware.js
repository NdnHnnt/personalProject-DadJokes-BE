require('dotenv').config()
const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({
        status: 401,
        msg: "Bearer token not found, please login to get your token :("
    });

    jwt.verify(token, process.env.SECRETTOKEN, (err, response) => {
        if (err) return res.status(403).json({
            status: 403,
            msg: "invalid token, please login to get your veified token"
        });
        req.response = response;
        next();
    })
}

function authenticateHeader(req, res, next) {
    const header = req.get("Content-Type");
    console.log(header);
    if (header != "application/json") return res.status(403).json({
        status: 403,
        msg: "invalid header type"
    });
    next();
}

function rolecheck(req, res, next) {
    if (req.response.id != "1") {
        return res.status(403).json({
            status: 403,
            msg: "forbidden"
        });
    }
    next();
}

module.exports = { authenticateToken, authenticateHeader, rolecheck };