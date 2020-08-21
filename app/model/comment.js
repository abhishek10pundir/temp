'user strict';
var sql = require('./db.js');
const JSON = require('circular-json');

// var i=0;
//Task object constructor
var comment = function (commentData) {
    this.name = commentData.name;
    this.email = commentData.email;
    this.social_id = commentData.social_id;
    this.social_type = commentData.social_type;
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

comment.addComment = async (id, req, result) => {
    var requiredParam = []
    //validate primary parameters
    if (!req.body.user_id) {
        requiredParam.push('user_id');
    }

    if (!req.body.comment) {
        requiredParam.push('comment');
    }

    if (requiredParam.length > 0) {
        result({
            'status': '0',
            'message': 'Required param : ' + requiredParam.join(", ")
        });
        return;
    }

    const checkFeedQuery = "select * from feeds where id=" + id;
    const rowsFeed = await execute(checkFeedQuery);
    var is_Feed = rowsFeed.length;
    if (is_Feed == 0) {
        result({
            'status': '0',
            'message': 'Invalid feed'
        })
        return;
    }

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




    const insertComment = "insert into feeds_comment (feed_id,user_id,comment) values('" + id + "','" + req.body.user_id + "','" + req.body.comment + "')";
    const rowsComments = await execute(insertComment);
    result({
        'status': '1',
        'message': 'success'
    })
}


module.exports = comment;