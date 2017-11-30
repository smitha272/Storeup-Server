/**
 * Created by Krishna.R.K on 11/28/2017.
 */
var express = require('express');
var router = express.Router();
var db = require('./connectdb')();

/* GET users listing. */
router.post('/storeDetails', function(req, res, next) {

    var email = req.body.email;
    var storeName = req.body.storeName;
    var userDetails;
    console.log(email);
    db.query('select * from user_details where email =?',[email], function (err,rows, fields) {
        if(err)throw err;
        if(rows.length>0){
            userDetails = rows;
            db.query('select store_name,user_name,store_address, latitude, longitude,distance_traveled_by_user, COUNT(*) as Count from receipt_details where user_name = ? and store_name=? group by store_address order by Count desc',[email,storeName], function (err, rows, fields) {
                if(err)throw err;
                if(rows.length>0){
                    console.log("Usre details" + userDetails[0]);
                    console.log("rows" + JSON.stringify(rows));
                    res.json({"success":"1","storeDetails": rows ,"userDetails":userDetails});
                }else{
                    res.json({"success":"2"});
                }
            })
        }else{
            console.log("no such user");
        }
    })

});

module.exports = router;
