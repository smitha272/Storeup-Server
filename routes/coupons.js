var express = require('express');
var router = express.Router(),
    db         = require('./connectdb')(),
    formidable = require('formidable');

router.get('/getCoupon', function(req, res, next) {
    console.log("comed ");
    var email    = req.query.email;
    console.log(email);

    db.query('select store_name,user_name,store_address, latitude, longitude,distance_traveled_by_user, COUNT(*) as Count from receipt_details where user_name = ? group by store_name',[email], function(err, rows, fields) {
        if (err) throw err;

        if (rows.length > 0) {
            console.log(rows);
            res.json({success: "1", "couponCount": rows});

        }else {
            res.json({success: "0", message: "no coupons"});
        }
    })
});

module.exports = router;


