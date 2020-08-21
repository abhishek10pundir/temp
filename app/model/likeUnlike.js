'user strict';
var sql = require('./db.js');
const JSON = require('circular-json');

// var i=0;
//Task object constructor
var likeUnlike = function(likeUnlikeData){
    this.name = likeUnlikeData.name;
    this.email = likeUnlikeData.email;
    this.social_id = likeUnlikeData.social_id;
    this.social_type = likeUnlikeData.social_type;
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

likeUnlike.addLikeUnlike = async (id,req,result) => {
    var requiredParam = []
    //validate primary parameters
    if(!req.body.user_id){
        requiredParam.push('user_id');
    }

    if(requiredParam.length>0){
        result({'status':'0','message':'Required param : '+requiredParam.join(", ")});
        return;
    }

    if(req.body.type!=1 && req.body.type!=0){
        result({'status':'0','message':'Invalid type'})
        return;
    }

    const checkFeedQuery = "select * from feeds where id="+id;
    const rowsFeed = await execute(checkFeedQuery);
    var is_Feed = rowsFeed.length;
    if(is_Feed==0){
        result({'status':'0','message':'Invalid feed'})
        return;
    }

    const checkUserQuery = "select * from user where id="+req.body.user_id;
    const rowsUser = await execute(checkUserQuery);
    var is_User_registered = rowsUser.length;
    if(is_User_registered==0){
        result({'status':'0','message':'Invalid User'})
        return;
    }



     //check user
     const checkLikeQuery = "select * from feeds_like where feed_id='"+id+"' and user_id="+req.body.user_id;
     const rowsLike = await execute(checkLikeQuery);
    //  console.log(rowsUser.length);
     var is_Like = rowsLike.length;
    if(is_Like==0){
        const insertLike = "insert into feeds_like (feed_id,user_id,type) values('"+id+"','"+req.body.user_id+"','"+req.body.type+"')";
        const rowsLikes = await execute(insertLike);
        result({'status':'1','message':'success'})
    }else{
        const insertLike = "update feeds_like set `type`="+req.body.type+" where `feed_id`="+id+" and user_id="+req.body.user_id;
        const rowsLikes = await execute(insertLike);
        result({'status':'1','message':'success'})
    }
}


module.exports= likeUnlike;