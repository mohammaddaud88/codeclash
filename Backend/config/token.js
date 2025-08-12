const jwt = require('jsonwebtoken');
const secret = 'mdkdfjdhfkjhd@#$%&safh8840505312@!$%#^&*';

function setUser(user){
    const payload = {
        _id: user._id,
        email:user.email
    };
    return jwt.sign(payload,secret,{expiresIn:'24h'});
}

function getUser(token){
    return jwt.verify(token,secret);
}

module.exports = {setUser,getUser}