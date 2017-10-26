var mysql = require('mysql'),
    db = null;
module.exports = function () {
    if(!db) {
        db = mysql.createConnection({
            host:       "us-cdbr-iron-east-05.cleardb.net",
            user:       "bbd5e5e671a7c5",
            password:   "de180bd8",
            database:   "heroku_c1fa4345c6367dd"
        });
    };
    return db;
};
