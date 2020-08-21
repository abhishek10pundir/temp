'user strict';
var sql = require('./db.js');
const JSON = require('circular-json');

// var i=0;
//Task object constructor
var updateProfile = function (profileData) {
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
    this.wallpaper = profileData.wallpaper;
    this.bio = profileData.bio;
    this.category_id = profileData.category_id;
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
updateProfile.addProfileData = async (id, req, result) => {
    //check user
    const checkUserQuery = "select * from user where id=" + id;
    const rowsUser = await execute(checkUserQuery);

    var is_user_registered = rowsUser.length;
    if (is_user_registered == 0) {
        result({
            'status': '0',
            'message': 'Invalid user'
        })
    }

    //check category_id
    if (req.body.category_id) {
        const checkCategoryQuery = "select * from category where id=" + req.body.category_id;
        const rowsCategory = await execute(checkCategoryQuery);
        var is_category_found = rowsCategory.length;
        if (is_category_found == 0) {
            result({
                'status': '0',
                'message': 'Invalid category_id'
            })
        }
    }


    var requestParam = []
    var set = "";
    if (req.body.name) {
        requestParam.push('name');
        set += '`name`="' + req.body.name + '",';
    }
    if (req.body.email) {
        requestParam.push('email');
        set += '`email`="' + req.body.email + '",';
    }
    if (req.body.phone) {
        requestParam.push('phone');
        set += '`phone`="' + req.body.phone + '",';
    }
    if (req.body.address) {
        requestParam.push('address');
        set += '`address`="' + req.body.address + '",';
    }
    if (req.body.dob) {
        requestParam.push('dob');
        set += '`dob`="' + req.body.dob + '",';
    }
    if (req.body.gender) {
        requestParam.push('gender');
        set += '`gender`="' + req.body.gender + '",';
    }
    if (req.body.school) {
        requestParam.push('school');
        set += '`school`="' + req.body.school + '",';
    }
    if (req.body.college) {
        requestParam.push('college');
        set += '`college`="' + req.body.college + '",';
    }
    if (req.body.company) {
        requestParam.push('company');
        set += '`company`="' + req.body.company + '",';
    }
    if (req.body.profile_image) {
        requestParam.push('profile_image');
        set += '`profile_image`="' + req.body.profile_image + '",';
    }
    if (req.body.bio) {
        requestParam.push('bio');
        set += '`bio`="' + req.body.bio + '",';
    }
    if (req.body.category_id) {
        requestParam.push('category_id');
        set += '`category_id`="' + req.body.category_id + '",';
    }
    if (req.body.wallpaper ) {
        requestParam.push('wallpaper');
        set += '`wallpaper`="' + req.body.wallpaper  + '",';
    }

    //update user
    set = set.slice(0, -1)
    if (requestParam.length > 0) {
        const updateUserQuery = "update user set " + set + " where `id`=" + id;
        // console.log(updateUserQuery)
        const rowsUserUpdate = await execute(updateUserQuery);
        //get user
        const getUserQuery = "select * from user where id=" + id;
        const getrowsUser = await execute(getUserQuery);
        result({
            'status': '1',
            'message': 'success',
            'payload': getrowsUser[0]
        })
    } else {
        result({
            'status': '0',
            'message': 'fail. No param found in request.'
        })
    }
}

updateProfile.getProfileData = async (req, result) => {
    //check user
    var id = req.params.id;
    const checkUserQuery = "select * from user where id=" + id;
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    if (is_user_registered == 0) {
        result({
            'status': '0',
            'message': 'Invalid user'
        })
    } else {
        //following
        const checkFollowingQuery = "select follow.*,user.name as follower_name,user.profile_image as follower_profile_image from follow left join user on user.id=follow.user_id where follow.user_id='" + id + "' and follow.type=0";
        const rowsFollowing = await execute(checkFollowingQuery);
        var following = rowsFollowing.length;

        //follower
        const checkFollowerQuery = "select follow.*,user.name as follower_name,user.profile_image as follower_profile_image from follow left join user on user.id=follow.user_id where follow.following_id='" + id + "' and follow.type=0";
        const rowsFollower = await execute(checkFollowerQuery);
        var follower = rowsFollower.length;

        //feeds count
        const checkFeedsQuery = "select * from feeds where user_id=" + id;
        const rowsFeeds = await execute(checkFeedsQuery);
        var Feeds = rowsFeeds.length;

        //category
        if(rowsUser[0]['category_id']!=null){
            const checkCategoryQuery = "select * from category where id=" + rowsUser[0]['category_id'];
            const rowsCategory = await execute(checkCategoryQuery);
            var Category = rowsCategory[0]['name'];
        }

        rowsUser[0]['following'] = following;
        rowsUser[0]['follower'] = follower;
        rowsUser[0]['feeds'] = Feeds;

        // //get user's feed
        // const getfeedsUser = "select * from feeds where user_id="+id;
        // const rowsFeedsUser = await execute(getfeedsUser);
        // if(rowsFeedsUser.length > 0){
        //     var countLike = [];
        //     for (var i = rowsFeedsUser.length - 1; i >= 0; i--) {
        //         const getfeedsLikes = "select * from feeds_like where feed_id="+rowsFeedsUser[i].id+" and type=0";
        //         const rowsFeedsLikes = await execute(getfeedsLikes);
        //         for (var j = rowsFeedsLikes.length - 1; j >= 0; j--) {
        //             countLike.push(rowsFeedsLikes.length);
        //         }
        //     }
        //     rowsUser[0]['total_like'] = countLike.length;
        // }else{
        //     rowsUser[0]['total_like'] = 0;
        // }     

        //get total likes for profile user
        let likeCountQuery="select count(*) from feeds_like where user_id=" + id + "and type=0";
        let likeCount=await execute(likeCountQuery);
        rowsUser[0]['total_like']=likeCount;

        if(rowsUser[0]['category_id']==null){
            rowsUser[0]['category_name'] = null;
        }else{
            rowsUser[0]['category_name'] = Category;
        }    
        result({
            'status': '1',
            'message': 'success',
            'payload': rowsUser[0]
        })
    }
}

updateProfile.getOtherProfileData = async (req, result) => {
    var requiredParam = []
    //validate primary parameters
    if (!req.body.user_id) {
        requiredParam.push('user_id');
    }
    if (!req.body.other_user_id) {
        requiredParam.push('other_user_id');
    }
    if (requiredParam.length > 0) {
        result({
            'status': '0',
            'message': 'Required param : ' + requiredParam.join(", ")
        });
        return;
    }
    if (req.body.user_id==req.body.other_user_id) {
        result({
            'status': '0',
            'message': 'Error : user_id and other_user_id cannot be same.'
        });
        return;
    }
    //check user
    var user_id = req.body.user_id;
    var other_user_id = req.body.other_user_id;
    const checkUserQuery = "select * from user where id=" + user_id;
    const rowsUser = await execute(checkUserQuery);
    var is_user_registered = rowsUser.length;
    if (is_user_registered == 0) {
        result({
            'status': '0',
            'message': 'Invalid user_id'
        })
        return;
    }

    const checkOtherUserQuery = "select * from user where id=" + other_user_id;
    const rowsOtherUser = await execute(checkOtherUserQuery);
    var is_other_user_registered = rowsOtherUser.length;
    if (is_other_user_registered == 0) {
        result({
            'status': '0',
            'message': 'Invalid other_user_id'
        })
        return;
    }

    const checkFollowingMeQuery = "select * from follow where following_id='" + other_user_id + "' and user_id='"+user_id+"' and follow.type=0";
    const rowsFollowingMe = await execute(checkFollowingMeQuery);
    var isfollowing = rowsFollowingMe.length;


    const checkFollowingQuery = "select follow.*,user.name as follower_name,user.profile_image as follower_profile_image from follow left join user on user.id=follow.user_id where follow.user_id='" + other_user_id + "' and follow.type=0";
        const rowsFollowing = await execute(checkFollowingQuery);
        var following = rowsFollowing.length;

        //follower
        const checkFollowerQuery = "select follow.*,user.name as follower_name,user.profile_image as follower_profile_image from follow left join user on user.id=follow.user_id where follow.following_id='" + other_user_id + "' and follow.type=0";
        const rowsFollower = await execute(checkFollowerQuery);
        var follower = rowsFollower.length;

        //feeds count
        const checkFeedsQuery = "select * from feeds where user_id=" + other_user_id;
        const rowsFeeds = await execute(checkFeedsQuery);
        var Feeds = rowsFeeds.length;

        //likes count functionality added
        let likeCountQuery="select count(*) from feeds_like where user_id=" + other_user_id + "and type=0";
        let likeCount=await execute(likeCountQuery);

        rowsOtherUser[0]['following'] = following;
        rowsOtherUser[0]['follower'] = follower;
        rowsOtherUser[0]['feeds'] = Feeds;
        rowsOtherUser[0]['total_like']=likeCount; //send total likes for particular user

    rowsOtherUser[0]['is_following'] = isfollowing;

    result({
        'status': '1',
        'message': 'success',
        'payload': rowsOtherUser[0]
    })
}


module.exports = updateProfile;