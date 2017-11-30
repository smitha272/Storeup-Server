/**
 * Created by Krishna.R.K on 10/28/2017.
 */

var express = require('express');
var router = express.Router(),
    db         = require('./connectdb')(),
    formidable = require('formidable'),
    fs         = require('fs-extra'),
    path       = require('path');

var vision = require('@google-cloud/vision')
var gcloud = vision({
    projectId: 'storeup-164304',

    // The path to your key file:
    keyFilename: '../ServiceAccountKey/StoreUp-6dfe8732b53c.json'
});

/*var distance = require('google-distance-matrix');*/

var distance = require('google-distance');
distance.apiKey = 'AIzaSyAqqJKFP-CkHrHIPZa06G0bsKVGbat52Cw';

var googleMapsClient = require('@google/maps').createClient({
    key:'AIzaSyCLwIbvlz-UN3Z-E5nUgolJGCPLwnhcnHo'
});

/*distance.key('AIzaSyC6ezAD_4Buxvhc45mgz4Zi_LrF3ucN594');*/


router.post('/getImageOcr', function(req, res, next) {
    var StorageReference = req.body.StorageReference;
    var userid = req.body.userId;
    var email = req.body.email
    var downloadUrl = req.body.downloadUrl;
    var user_address = req.body.address;
   console.log(user_address);

    var gcsImageUri = 'gs://storeup-7952a.appspot.com/images/'+StorageReference;
    var source = {
        gcsImageUri : gcsImageUri
    };
    var image = {
        source : source
    };
    // var image = {
    // content: fs.readFileSync('../public/Images/Safeway.jpg').toString('base64')
    // };
    var type = vision.v1.types.Feature.Type.TEXT_DETECTION;
    var logoType = vision.v1.types.Feature.Type.LOGO_DETECTION;

    var featuresElement = { type:type};
    var featuresElementLogo = { type:logoType};
    var features = [featuresElement,featuresElementLogo];
    /*var featuresElement = {
        type : type
    };
    var features = [featuresElement];*/
    var requestsElement = {
        image : image,
        features : features
    };
    var requests = [requestsElement];
    gcloud.batchAnnotateImages({requests: requests}).then(function(results) {
        /*var response = responses[0];
        console.log(JSON.stringify(response));*/


        var text = results[0].responses[0].fullTextAnnotation.text;
        console.log("Text is: \n"+JSON.stringify(text));
        var logo="";
        if(typeof (results[0].responses[0].logoAnnotations[0])=="undefined"){
            var count=0;
            for(var i=0;i<text.length;i++){
                if(count>=1){
                    break;
                }
                if(count==0){
                    logo+=text.charAt(i);
                }
                if(text.charAt(i)=="\n")
                    count++;
            }
        }else{
            logo = results[0].responses[0].logoAnnotations[0].description;
        }

        var address="";

        switch(logo){
            case "Target"||"Target Corporation":
                var count=0;
                for(var i=0;i<text.length;i++){
                    if(count>1){
                        break;
                    }
                    if(count==1){
                        address+=text.charAt(i);
                    }
                    if(text.charAt(i)=='\n'){
                        count++;
                    }
                }
                console.log(address);
                break;
            case "Walmart":
                var count=0;
                for(var i=0;i<text.length;i++){
                    if(count>5){
                        break;
                    }
                    if(count==5){
                        address+=text.charAt(i);
                    }
                    if(text.charAt(i)=='\n'){
                        count++;
                    }
                }
                break;
            case "Costco":
                var count=0;
                for(var i=0;i<text.length;i++){
                    if(count>3){
                        break;
                    }
                    if(count==1 || count==2){
                        address+=text.charAt(i);
                    }
                    if(text.charAt(i)=='\n'){
                        count++;
                    }
                }
                break;
        }

        /*if(logo=="Target" || logo=="Target Corporation"){
            var count=0;
            for(var i=0;i<text.length;i++){
                if(count>1){
                    break;
                }
                if(count==1){
                    address+=text.charAt(i);
                }
                if(text.charAt(i)=='\n'){
                    count++;
                }
            }
            console.log(address);
        }else if(logo == "Walmart"){
            var count=0;
            for(var i=0;i<text.length;i++){
                if(count>5){
                    break;
                }
                if(count==5){
                    address+=text.charAt(i);
                }
                if(text.charAt(i)=='\n'){
                    count++;
                }
            }
        }else if (logo == "Costco"){
            var count=0;
            for(var i=0;i<text.length;i++){
                if(count>3){
                    break;
                }
                if(count==1 || count==2){
                    address+=text.charAt(i);
                }
                if(text.charAt(i)=='\n'){
                    count++;
                }
            }
        }else if  (logo == "SAFEWAY"){

        }*/

        /*console.log("Text is: \n"+text);
         console.log("Store Name is :"+logo+" and the address is:"+address);*/
        var addr = logo+" "+address;
        console.log(addr);
        var mail;
        var useraddr;
        var latitude;
        var longitude;
        db.query('INSERT into receipt_details VALUES(?,?,?,?,?,?,?,?,?,?)', [0, userid, email, StorageReference,logo, address, downloadUrl,0,0,0], function (err, result) {
            if (err) throw err;
            //console.log("The data is"+JSON.stringify(result));
            //res.json({success: "1", userID: userid, message: "data stored successfully"});

            db.query('select * from user_details where email = ?',[email],function(err, rows, fields) {
                if (err) throw err;

                if (rows.length > 0) {
                    mail = rows[0].email;
                    useraddr = rows[0].street+" "+rows[0].city;

                    googleMapsClient.geocode({
                        address: addr
                    },function (err,response) {
                        if(!err){
                            if(response){
                                console.log("The address is: "+JSON.stringify(response.json.results[0].geometry));
                                latitude = response.json.results[0].geometry.location.lat;
                                longitude = response.json.results[0].geometry.location.lng;
                                var origins = useraddr;
                                var destination = addr;
                                distance.get(
                                    {
                                        origin: origins,
                                        destination: destination,
                                        mode: 'car',
                                        units: 'imperial'
                                    },
                                    function(err, data) {
                                        if (err) return console.log(err);
                                        if(data){
                                            console.log("distance: " + data.distance);
                                            var distanceTravelled = data.distance;
                                            db.query('update receipt_details set distance_traveled_by_user = ?, latitude = ?, longitude=? where user_name = ? and url = ?',[distanceTravelled,latitude,longitude, email, StorageReference], function (err,result){
                                                if(err)throw err;
                                                console.log("updated successfuly");
                                                res.json({success: "1", userID: 1, message: "registered"});
                                            })
                                        }
                                    });

                            }else{
                                console.log("No such address");
                            }
                        }
                    });

                }else {

                }
            })
            console.log(result.insertId);
        })








        // doThingsWith(response)
    }).catch(function(err) {
        console.error(err);
    });

});
module.exports=router;