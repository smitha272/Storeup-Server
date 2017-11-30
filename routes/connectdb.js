var mysql = require('mysql'),
    db = null;
module.exports = function () {
    if(!db) {
        db = mysql.createConnection({
            host:       "cmpe275.cgy1wsewzyvd.us-west-1.rds.amazonaws.com",
            port: "3306",
            user:       "krishnark1993",
            password:   "krishna1993",
            database:   "storeup"
        });
    };
    return db;
};
