'user strict';
var sql = require('./db.js');
const JSON = require('circular-json');

// var i=0;
//Task object constructor
var follow = function (followData) {
    this.following_id = followData.following_id;
    this.user_id = followData.user_id;
    this.type = followData.type;
};

const execute = (query) => {
    return new Promise((resove, reject) => {
        sql.query(query,
            function (err, rows) {
                if (err) reject(err);
                resove(rows);
            });
    }).catch((error) => {
        console.log(error)
    });
}

function sendPushNotification(msg,token) {
    var FCM = require('fcm-node');
    var serverKey = 'AAAABanujHg:APA91bGF55qWStMB0beACvuYYv9XEJcCjf8Cxv2n2v48HfolVRg9d1QB7GrKjIdgL1BPHcqi3KhxMRGPPo2o5wqto3aDM5Ln46OqbcZ7hGKgQ2vf5L36MM77dsfVufe2N1Yin9gwBM09'; // put your server key here
    var fcm = new FCM(serverKey);

    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        // to: 'e8oa1hZQgdM:APA91bFg1S1ItPkz7H9CyRT9GGQZUokepsnc-8OHshR5XqlY2LZdzuKddAZma0zko80HO34MjbmWru_2oiKEjlQbo2f6yYty_W5ibZ9gIM8k5h3D5AaH3tBpSIf4rc9GBY4o4DRaAsJM',
        to: token,
        // collapse_key: 'your_collapse_key',

        notification: {
            title: 'Hellopicshort',
            body: msg
        },
    };

    fcm.send(message, function (err, response) {
        if (err) {
            // console.log("Something has gone wrong!");
        } else {
            // console.log("Successfully sent with response: ", response);
        }
    });

}

follow.addFollow = async (req, result) => {
    var requiredParam = []
    //validate primary parameters
    if (!req.body.user_id) {
        requiredParam.push('user_id');
    }
    if (!req.body.following_id) {
        requiredParam.push('following_id');
    }

    if (requiredParam.length > 0) {
        result({
            'status': '0',
            'message': 'Required param : ' + requiredParam.join(", ")
        });
        return;
    }

    if (req.body.following_id == req.body.user_id) {
        result({
            'status': '0',
            'message': 'user_id and following_id cannot be same'
        })
        return;
    }

    if (req.body.type != 1 && req.body.type != 0) {
        result({
            'status': '0',
            'message': 'Invalid type'
        })
        return;
    }

    //check user
    const checkUserQuery = "select * from user where id=" + req.body.user_id;
    const rowsUser = await execute(checkUserQuery);
    var is_User_registered = rowsUser.length;
    if (is_User_registered == 0) {
        result({
            'status': '0',
            'message': 'Invalid User'
        })
        return;
    }

    //check follower
    const checkFollowingQuery = "select * from user where id=" + req.body.following_id;
    const rowsFollowing = await execute(checkFollowingQuery);
    var is_Following_registered = rowsFollowing.length;
    if (is_Following_registered == 0) {
        result({
            'status': '0',
            'message': 'Invalid following_id'
        })
        return;
    }



    //check user
    const checkFollowQuery = "select * from follow where following_id='" + req.body.following_id + "' and user_id=" + req.body.user_id;
    const rowsFollow = await execute(checkFollowQuery);
    //  console.log(rowsUser.length);
    var is_Follow = rowsFollow.length;
    if (is_Follow == 0) {
        const insertFollow = "insert into follow (following_id,user_id,type) values('" + req.body.following_id + "','" + req.body.user_id + "','" + req.body.type + "')";
        const rowsFollows = await execute(insertFollow);
        var message = rowsUser[0]['name']+" started following you";
        var push_token = rowsFollowing[0]['push_token'];
        sendPushNotification(message,push_token);
        result({
            'status': '1',
            'message': 'success'
        })
    } else {
        const insertFollow = "update follow set `type`=" + req.body.type + " where `following_id`=" + req.body.following_id + " and user_id=" + req.body.user_id;
        const rowsFollows = await execute(insertFollow);
        if(req.body.type==0){
            var message = rowsUser[0]['name']+" started following you";
        }else{
            var message = rowsUser[0]['name']+" followed you";
        }
        var push_token = rowsFollowing[0]['push_token'];
        sendPushNotification(message,push_token);
        result({
            'status': '1',
            'message': 'success'
        })
    }
}

follow.getFollow = async (id, type, req, result) => {

    if (type != 1 && type != 0) {
        result({
            'status': '0',
            'message': 'Invalid type'
        })
        return;
    }

    //check user
    const checkUserQuery = "select * from user where id=" + id;
    const rowsUser = await execute(checkUserQuery);
    var is_User_registered = rowsUser.length;
    if (is_User_registered == 0) {
        result({
            'status': '0',
            'message': 'Invalid User'
        })
        return;
    }


    if (type == 0) {
        const checkFollowQuery = "select follow.* from follow  where follow.user_id='" + id + "' and follow.type=0";
        const rowsFollow = await execute(checkFollowQuery);
        if (rowsFollow.length == 0) {
            result({
                'status': '0',
                'message': 'fail'
            })
        } else {
            for (var i = rowsFollow.length - 1; i >= 0; i--) {
                const checkFollowUserQuery = "select user.name as follower_name,user.profile_image as follower_profile_image from user where user.id='" + rowsFollow[i].following_id + "'";
                const rowsFollowUser = await execute(checkFollowUserQuery);
                rowsFollow[i]['follower_name'] = rowsFollowUser[0]['follower_name'];
                rowsFollow[i]['follower_profile_image'] = rowsFollowUser[0]['follower_profile_image'];
            }
            result({
                'status': '1',
                'message': 'success',
                'payload': rowsFollow
            })
        }
    } else {
        const checkFollowQuery = "select follow.* from follow left join user on user.id=follow.user_id where follow.following_id='" + id + "' and follow.type=0";
        const rowsFollow = await execute(checkFollowQuery);
        if (rowsFollow.length == 0) {
            result({
                'status': '0',
                'message': 'fail'
            })
        } else {
            for (var i = rowsFollow.length - 1; i >= 0; i--) {
                const checkFollowingUserQuery = "select user.name as following_name,user.profile_image as following_profile_image from user where user.id='" + rowsFollow[i].user_id + "'";
                const rowsFollowingUser = await execute(checkFollowingUserQuery);
                rowsFollow[i]['following_name'] = rowsFollowingUser[0]['following_name'];
                rowsFollow[i]['following_profile_image'] = rowsFollowingUser[0]['following_profile_image'];
            }
            result({
                'status': '1',
                'message': 'success',
                'payload': rowsFollow
            })
        }
    }
}


module.exports = follow;