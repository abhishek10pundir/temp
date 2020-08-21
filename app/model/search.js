'user strict';
var sql = require('./db.js');
const JSON = require('circular-json');

// var i=0;
//Task object constructor
var search = function(profileData){
    this.name = profileData.name;
    this.email = profileData.email;
    this.phone = profileData.phone;
    this.address = profileData.address;
    this.dob = profileData.dob;
    this.gender = profileData.gender;
    this.school = profileData.school;
    this.college = profileData.college;
    this.company = profileData.company;
    this.profile_image = profileData.profile_image;
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

search.searchProfileData = async (keyword,req,result) => {
    //check user
    const checkUserQuery = "select * from user where name like '"+keyword+"%'";
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    console.log(is_user_registered);
    if(is_user_registered==0){
        return result({'status':'0','message':'No data found'})
    }else{
        for (var i = 0; i < rowsUser.length; i++) {
            var user_id = rowsUser[i]['id'];
            //following
            const checkFollowingQuery = "select follow.*,user.name as follower_name,user.profile_image as follower_profile_image from follow left join user on user.id=follow.user_id where follow.user_id='"+user_id+"' and follow.type=0";
            const rowsFollowing = await execute(checkFollowingQuery);
            var following = rowsFollowing.length;

            //follower
            const checkFollowerQuery = "select follow.*,user.name as follower_name,user.profile_image as follower_profile_image from follow left join user on user.id=follow.user_id where follow.following_id='"+user_id+"' and follow.type=0";
            const rowsFollower = await execute(checkFollowerQuery);
            var follower = rowsFollower.length;

            //feeds count
            const checkFeedsQuery = "select * from feeds where user_id="+user_id;
            const rowsFeeds = await execute(checkFeedsQuery);
            var Feeds = rowsFeeds.length;

            rowsUser[i]['following'] = following;
            rowsUser[i]['follower'] = follower;
            rowsUser[i]['feeds'] = Feeds;
        }
        return result({'status':'1','message':'success','payload':rowsUser})
    }
}


module.exports= search;