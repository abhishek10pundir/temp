'user strict';
var sql = require('./db.js');
const JSON = require('circular-json');

// var i=0;
//Task object constructor
var feeds = function(feedsData){
    this.name = feedsData.name;
    this.email = feedsData.email;
    this.phone = feedsData.phone;
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

feeds.addfeeds = async (req,result) => {
    var requiredParam = []
    if(!req.body.user_id){
        requiredParam.push('user_id');
    }
    if(!req.body.caption){
        requiredParam.push('caption');
    }
    //validate media
    if(req.body.media){
        for(var i = 0; i < req.body.media.length; i++){
            if(!req.body.media[i]['media_url']){
                requiredParam.push('media.media_url');
            }
            if((req.body.media[i].media_type!=0 && req.body.media[i].media_type!=1)){
                requiredParam.push('media.media_type');
            }
        }
    }

    if(requiredParam.length>0){
        result({'status':'0','message':'Required param : '+requiredParam.join(", ")});
        return;
    }
    const checkUserQuery = "select * from user where id="+req.body.user_id;
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    if(is_user_registered==0){
        result({'status':'0','message':'Invalid user'})
        return;
    }

     //insert feed
     const insertfeeds = "insert into feeds (user_id,caption) values('"+req.body.user_id+"','"+req.body.caption+"')";
     const rowsFeeds = await execute(insertfeeds);
     var feedsInsertId = rowsFeeds.insertId;

     //add media
     if(req.body.media){
        for(var i = 0; i < req.body.media.length; i++){
            var media_url = req.body.media[i]['media_url'];
            var media_type = req.body.media[i]['media_type'];
            var insertMedia = "insert into feeds_media (feed_id,media_url,media_type) values ('"+feedsInsertId+"','"+media_url+"',"+media_type+")";
            var rowsMedia = await execute(insertMedia);
        } 
     } 
     result({'status':'1','message':'success'})
}

feeds.getfeeds = async (id,user_id,req,result) => {

    const checkUserQuery = "select * from user where id="+user_id;
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    if(is_user_registered==0){
        result({'status':'0','message':'Invalid user'})
        return;
    }

     const getfeeds = "select feeds.id,feeds.user_id,feeds.caption,feeds.created_at,feeds.updated_at,user.name,user.profile_image from feeds left join user on user.id=feeds.user_id where feeds.id="+id;
     const rowsFeeds = await execute(getfeeds);

     if(rowsFeeds.length > 0){
        //check user_id views it 
        const getfeedsViewsByUser = "select * from views where feed_id="+id+" and user_id="+user_id;
        const rowsFeedsViewsByUser = await execute(getfeedsViewsByUser);
        if(rowsFeedsViewsByUser.length==0){
            const insertfeedsViewsByUser = "insert into views (feed_id,user_id) values ('"+id+"','"+user_id+"')";
            const rowsFeedsInsertByUser = await execute(insertfeedsViewsByUser);
        }
        //count total views feed 
        const countfeedsViewsByUser = "select * from views where feed_id="+id;
        const rowsFeedsCountByUser = await execute(countfeedsViewsByUser);


        const getfeedsLikes = "select * from feeds_like where feed_id="+id+" and type=0";
        const rowsFeedsLikes = await execute(getfeedsLikes);
        rowsFeeds[0]['like'] = rowsFeedsLikes.length;
        for (var i = rowsFeeds.length - 1; i >= 0; i--) {
            const mediaQuery = 'SELECT * FROM feeds_media where feed_id = "' + rowsFeeds[i].id + '"';
            const sets = await execute(mediaQuery);
            rowsFeeds[i]['media'] = [];
            if (sets.length > 0) {
                var setStatus = [];
                for (var j = sets.length - 1; j >= 0; j--) {
                    rowsFeeds[i]['media'][j] = sets[0];
                }
            }
            // rows[i]['ss']='ss';
        }
        const getLastComment = "select feeds_comment.id,feeds_comment.user_id,feeds_comment.comment,user.name,user.profile_image from feeds_comment left join user on user.id=feeds_comment.user_id where feed_id="+id+" order by id desc";
        const rowsLastComment = await execute(getLastComment);
        // console.log(rowsLastComment[0])
        rowsFeeds[0]['last_comment'] = [];
        rowsFeeds[0]['views'] = rowsFeedsCountByUser.length;

        if(rowsLastComment.length!=0){
            rowsFeeds[0]['last_comment'] = rowsLastComment;
        }
        result({'status':'1','message':'success','payload':rowsFeeds[0]})
     }else{
        result({'status':'0','message':'fail: Data not found '})
     }
}

feeds.getallfeeds = async (id,req,result) => {
    const feedPerPage=5;   //at a time 5 feeds will be sent by api
    let offset=0;
    let currentPage=0;
    let nextPage=1;
    const checkUserQuery = "select * from user where id="+id;
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    if(is_user_registered==0){
        result({'status':'0','message':'Invalid user'})
        return;
    }
    //if request params has current page sent  
    if(req.params.currentPage!=NULL){
        currentPage=parseInt(req.params.currentPage);
        offset=currentPage*feedPerPage;
        nextPage=currentPage+1;
    }
        

    const getfeeds = "select feeds.id,feeds.user_id,feeds.caption,feeds.created_at,feeds.updated_at,user.name,user.profile_image from feeds left join user on user.id=feeds.user_id order by feeds.id desc limit "+ feedPerPage +" offset "+offset;
    const rowsFeeds = await execute(getfeeds);
    if(rowsFeeds.length > 0){
       for (var i = rowsFeeds.length - 1; i >= 0; i--) {
            rowsFeeds[i]['like'] = [];
            const getfeedsLikes = "select * from feeds_like where feed_id="+rowsFeeds[i].id+" and type=0";
            const rowsFeedsLikes = await execute(getfeedsLikes);
            rowsFeeds[i]['like'] = rowsFeedsLikes.length;

            //do i like feed
            const getfeedsLikesMe = "select * from feeds_like where feed_id="+rowsFeeds[i].id+" and user_id="+id+" and type=0";
            const rowsFeedsLikesMe = await execute(getfeedsLikesMe);
            rowsFeeds[i]['is_user_like'] = rowsFeedsLikesMe.length;

           const mediaQuery = 'SELECT * FROM feeds_media where feed_id = "' + rowsFeeds[i].id + '"';
           const sets = await execute(mediaQuery);
           rowsFeeds[i]['media'] = [];
           if (sets.length > 0) {
               var setStatus = [];
               for (var j = sets.length - 1; j >= 0; j--) {
                   rowsFeeds[i]['media'][j] = sets[0];
               }
           }
           // rows[i]['ss']='ss';

           const countfeedsViewsByUser = "select * from views where feed_id="+rowsFeeds[i].id;
           const rowsFeedsCountByUser = await execute(countfeedsViewsByUser);
           rowsFeeds[i]['views'] = rowsFeedsCountByUser.length;


       }
       for (var i = rowsFeeds.length - 1; i >= 0; i--) {
            const getLastComment = "select feeds_comment.id,feeds_comment.user_id,feeds_comment.comment,user.name,user.profile_image from feeds_comment left join user on user.id=feeds_comment.user_id where feeds_comment.feed_id="+rowsFeeds[i].id+" order by feeds_comment.id desc limit 1";
            const rowsLastComment = await execute(getLastComment);
            // console.log(rowsLastComment[0])
            rowsFeeds[i]['last_comment'] = [];

            if(rowsLastComment.length==0){
                rowsFeeds[i]['last_comment'] = null;
            }else{
                rowsFeeds[i]['last_comment'] = rowsLastComment[0];
            }
       }

       let data={
           rowsFeeds:rowsFeeds,
           nextPage:nextPage
       }; 
       result({'status':'1','message':'success','payload':data})
    }else{
       result({'status':'0','message':'fail: Data not found '})
    }
}

feeds.getuserfeeds = async (id,req,result) => {
    const feedPerPage=5;   //at a time 5 feeds will be sent by api
    let offset=0;
    let currentPage=0;
    let nextPage=1;
    const checkUserQuery = "select * from user where id="+id;
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    if(is_user_registered==0){
        result({'status':'0','message':'Invalid user'})
        return;
    }
    //if request params has current page sent  
    if(req.params.currentPage!=NULL){
        currentPage=parseInt(req.params.currentPage);
        offset=currentPage*feedPerPage;
        nextPage=currentPage+1;
    }
    const getfeeds = "select feeds.id,feeds.user_id,feeds.caption,feeds.created_at,feeds.updated_at,user.name,user.profile_image from feeds left join user on user.id=feeds.user_id where feeds.user_id="+id+" order by feeds.id desc limit "+ feedPerPage + " offset "+ offset;
    const rowsFeeds = await execute(getfeeds);
    if(rowsFeeds.length > 0){
       for (var i = rowsFeeds.length - 1; i >= 0; i--) {
            rowsFeeds[i]['like'] = [];
            const getfeedsLikes = "select * from feeds_like where feed_id="+rowsFeeds[i].id+" and type=0";
            const rowsFeedsLikes = await execute(getfeedsLikes);
            rowsFeeds[i]['like'] = rowsFeedsLikes.length;

            //do i like feed
            const getfeedsLikesMe = "select * from feeds_like where feed_id="+rowsFeeds[i].id+" and user_id="+id+" and type=0";
            const rowsFeedsLikesMe = await execute(getfeedsLikesMe);
            rowsFeeds[i]['is_user_like'] = rowsFeedsLikesMe.length;

           const mediaQuery = 'SELECT * FROM feeds_media where feed_id = "' + rowsFeeds[i].id + '"';
           const sets = await execute(mediaQuery);
           rowsFeeds[i]['media'] = [];
           if (sets.length > 0) {
               var setStatus = [];
               for (var j = sets.length - 1; j >= 0; j--) {
                   rowsFeeds[i]['media'][j] = sets[0];
               }
           }
           // rows[i]['ss']='ss';
       }
       const getLastComment = "select feeds_comment.id,feeds_comment.user_id,feeds_comment.comment,user.name,user.profile_image from feeds_comment left join user on user.id=feeds_comment.user_id where feed_id="+id+" order by id desc limit 1";
       const rowsLastComment = await execute(getLastComment);
       // console.log(rowsLastComment[0])
       rowsFeeds[i]['last_comment'] = [];

       if(rowsLastComment.length==0){
           rowsFeeds[i]['last_comment'] = null;
       }else{
           rowsFeeds[i]['last_comment'] = rowsLastComment[0];
       }
       let data={
        rowsFeeds:rowsFeeds,
        nextPage:nextPage
    }; 
       result({'status':'1','message':'success','payload':data})
    }else{
       result({'status':'0','message':'fail: Data not found '})
    }
}

//update feeds
feeds.updatefeeds = async (id,req,result) => {
    var requiredParam = []
    if(!req.body.caption){
        requiredParam.push('caption');
    }
    //validate media
    if(req.body.media){
        for(var i = 0; i < req.body.media.length; i++){
            if(!req.body.media[i]['media_url']){
                requiredParam.push('media.media_url');
            }
            if((req.body.media[i].media_type!=0 && req.body.media[i].media_type!=1)){
                requiredParam.push('media.media_type');
            }
        }
    }

    if(requiredParam.length>0){
        result({'status':'0','message':'Required param : '+requiredParam.join(", ")});
        return;
    }
    const checkUserQuery = "select * from feeds where id="+id;
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    if(is_user_registered==0){
        result({'status':'0','message':'Invalid feed'})
        return;
    }

     //update feed
     const insertfeeds = "update feeds set `caption`='"+req.body.caption+"' where id="+id;
     const rowsFeeds = await execute(insertfeeds);

     //add media
     if(req.body.media){
         //delete media
         var insertMedia = "delete from feeds_media where feed_id="+id;
         var rowsMedia = await execute(insertMedia);
         //insert media
        for(var i = 0; i < req.body.media.length; i++){
            var media_url = req.body.media[i]['media_url'];
            var media_type = req.body.media[i]['media_type'];
            var insertMedia = "insert into feeds_media (feed_id,media_url,media_type) values ('"+id+"','"+media_url+"',"+media_type+")";
            var rowsMedia = await execute(insertMedia);
        } 
     } 
     result({'status':'1','message':'success'})
}

//delete feeds
feeds.deleteFeed = async (id,req,result) => {
    const checkUserQuery = "select * from feeds where id="+id;
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    if(is_user_registered==0){
        result({'status':'0','message':'Invalid feed'})
        return;
    }

    //delete feed
    const deleteQuery = "delete from feeds where id="+id;
    const rowsFeed = await execute(deleteQuery);

    //delete feed likes
    const deleteLikeQuery = "delete from feeds_like where feed_id="+id;
    const rowsFeedLike = await execute(deleteLikeQuery);

    //delete feeds comment
    const deleteCommentQuery = "delete from feeds_comment where feed_id="+id;
    const rowsFeedComment = await execute(deleteCommentQuery);

    //delete feeds media
    const deleteMediaQuery = "delete from feeds_media where feed_id="+id;
    const rowsFeedMedia = await execute(deleteMediaQuery);

     result({'status':'1','message':'success'})
}

//get all feeds based upon media_type for (type=0 response =images) and for (type=1 response=videos)

feeds.getallfeedsForImagesOrVideos = async (id,req,result) => { 
    const feedPerPage=5;   //at a time 5 feeds will be sent by api
    let offset=0;
    let currentPage=0;
    let nextPage=1;
    let type;
    const checkUserQuery = "select * from user where id="+id;
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    if(is_user_registered==0){
        result({'status':'0','message':'Invalid user'})
        return;
    }
    //check what type of media is requested by user
    if(req.params.media_type=="0")
        type=0;
    else if(req.params.media_type=="1")
        type=1;
    else{
        result({'status':'0','message':'Invalid media type requested'})
        return; 
    }
    //if request params has current page sent  
    if(req.params.currentPage!=null){
        currentPage=parseInt(req.params.currentPage);
        offset=currentPage*feedPerPage;
        nextPage=currentPage+1;
    }
        

    const getfeeds = "select f.id,f.user_id,f.caption,f.created_at,f.updated_at,u.name,u.profile_image from feeds f left join user u on u.id=f.user_id left join feeds_media fm on fm.feed_id=f.id  where fm.media_type="+ type +"order by f.id desc limit "+ feedPerPage +" offset "+offset;
    const rowsFeeds = await execute(getfeeds);
    if(rowsFeeds.length > 0){
       for (var i = rowsFeeds.length - 1; i >= 0; i--) {
            rowsFeeds[i]['like'] = [];
            const getfeedsLikes = "select * from feeds_like where feed_id="+rowsFeeds[i].id+" and type=0";
            const rowsFeedsLikes = await execute(getfeedsLikes);
            rowsFeeds[i]['like'] = rowsFeedsLikes.length;

            //do i like feed
            const getfeedsLikesMe = "select * from feeds_like where feed_id="+rowsFeeds[i].id+" and user_id="+id+" and type=0";
            const rowsFeedsLikesMe = await execute(getfeedsLikesMe);
            rowsFeeds[i]['is_user_like'] = rowsFeedsLikesMe.length;

           const mediaQuery = 'SELECT * FROM feeds_media where feed_id = "' + rowsFeeds[i].id + '"';
           const sets = await execute(mediaQuery);
           rowsFeeds[i]['media'] = [];
           if (sets.length > 0) {
               var setStatus = [];
               for (var j = sets.length - 1; j >= 0; j--) {
                   rowsFeeds[i]['media'][j] = sets[0];
               }
           }
           // rows[i]['ss']='ss';

           const countfeedsViewsByUser = "select * from views where feed_id="+rowsFeeds[i].id;
           const rowsFeedsCountByUser = await execute(countfeedsViewsByUser);
           rowsFeeds[i]['views'] = rowsFeedsCountByUser.length;

           //check if user is following the owner user of particular post
           const checkUserFollowingFeedOwnerQuery="select * from follow where user_id="+id+" and following_id="+rowsFeeds[i].user_id;
           const checkUserFollowingFeedOwner=await execute(checkUserFollowingFeedOwnerQuery);
           if(checkUserFollowingFeedOwner.length==0){
               rowsFeeds[i]['is_user_follow']='N';
           }else{
            rowsFeeds[i]['is_user_follow']='Y';
           }

       }
       for (var i = rowsFeeds.length - 1; i >= 0; i--) {
            const getLastComment = "select feeds_comment.id,feeds_comment.user_id,feeds_comment.comment,user.name,user.profile_image from feeds_comment left join user on user.id=feeds_comment.user_id where feeds_comment.feed_id="+rowsFeeds[i].id+" order by feeds_comment.id desc limit 1";
            const rowsLastComment = await execute(getLastComment);
            // console.log(rowsLastComment[0])
            rowsFeeds[0]['last_comment'] = [];

            if(rowsLastComment.length==0){
                rowsFeeds[0]['last_comment'] = null;
            }else{
                rowsFeeds[0]['last_comment'] = rowsLastComment[0];
            }
       }

       let data={
           rowsFeeds:rowsFeeds,
           nextPage:nextPage
       }; 
       result({'status':'1','message':'success','payload':data})
    }else{
       result({'status':'0','message':'fail: Data not found '})
    }
}

//get user feeds based upon media_type for (type=0 response =images) and for (type=1 response=videos)

feeds.getuserfeedsForImagesOrVideos = async (id,req,result) => {
    const feedPerPage=5;   //at a time 5 feeds will be sent by api
    let offset=0;
    let currentPage=0;
    let nextPage=1;
    let type;
    const checkUserQuery = "select * from user where id="+id;
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    if(is_user_registered==0){
        result({'status':'0','message':'Invalid user'})
        return;
    }
     //check what type of media is requested by user
     if(req.params.media_type=="0")
        type=0;
    else if(req.params.media_type=="1")
        type=1;
    else{
        result({'status':'0','message':'Invalid media type requested'})
        return; 
    }
    //if request params has current page sent  
    if(req.params.currentPage!=null){
        currentPage=parseInt(req.params.currentPage);
        offset=currentPage*feedPerPage;
        nextPage=currentPage+1;
    }
    const getfeeds = "select f.id,f.user_id,f.caption,f.created_at,f.updated_at,u.name,u.profile_image from feeds f left join user u on u.id=f.user_id left join feeds_media fm on fm.feed_id=f.id where fm.media_type="+type+" and u.id="+id+" order by f.id desc limit "+ feedPerPage + " offset "+ offset;
    const rowsFeeds = await execute(getfeeds);
    if(rowsFeeds.length > 0){
       for (var i = rowsFeeds.length - 1; i >= 0; i--) {
            rowsFeeds[i]['like'] = [];
            const getfeedsLikes = "select * from feeds_like where feed_id="+rowsFeeds[i].id+" and type=0";
            const rowsFeedsLikes = await execute(getfeedsLikes);
            rowsFeeds[i]['like'] = rowsFeedsLikes.length;

            //do i like feed
            const getfeedsLikesMe = "select * from feeds_like where feed_id="+rowsFeeds[i].id+" and user_id="+id+" and type=0";
            const rowsFeedsLikesMe = await execute(getfeedsLikesMe);
            rowsFeeds[i]['is_user_like'] = rowsFeedsLikesMe.length;

            //views for the feeds;
            const countfeedsViewsByUser = "select * from views where feed_id="+rowsFeeds[i].id;
            const rowsFeedsCountByUser = await execute(countfeedsViewsByUser);
            rowsFeeds[i]['views'] = rowsFeedsCountByUser.length;

            
           const mediaQuery = 'SELECT * FROM feeds_media where feed_id = "' + rowsFeeds[i].id + '"';
           const sets = await execute(mediaQuery);
           rowsFeeds[i]['media'] = [];
           if (sets.length > 0) {
               var setStatus = [];
               for (var j = sets.length - 1; j >= 0; j--) {
                   rowsFeeds[i]['media'][j] = sets[0];
               }
           }
           // rows[i]['ss']='ss';
       }
       const getLastComment = "select feeds_comment.id,feeds_comment.user_id,feeds_comment.comment,user.name,user.profile_image from feeds_comment left join user on user.id=feeds_comment.user_id where feed_id="+id+" order by id desc limit 1";
       const rowsLastComment = await execute(getLastComment);
       // console.log(rowsLastComment[0])
       rowsFeeds[0]['last_comment'] = [];

       if(rowsLastComment.length==0){
           rowsFeeds[0]['last_comment'] = null;
       }else{
           rowsFeeds[0]['last_comment'] = rowsLastComment[0];
       }
       let data={
        rowsFeeds:rowsFeeds,
        nextPage:nextPage
    }; 
       result({'status':'1','message':'success','payload':data})
    }else{
       result({'status':'0','message':'fail: Data not found '})
    }
}
 
module.exports= feeds;