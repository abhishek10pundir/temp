'user strict';
var sql = require('./db.js');
const JSON = require('circular-json');

// var i=0;
//Task object constructor
var login = function(loginData){
    this.name = loginData.name;
    this.email = loginData.email;
    this.social_id = loginData.social_id;
    this.social_type = loginData.social_type;
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
login.addLoginData = async (req,result) => {
    var requiredParam = []
    //validate primary parameters  
    if(!req.body.social_id){
        requiredParam.push('social_id');
    }
    if(!req.body.social_type){
        requiredParam.push('social_type');
    }
    if(!req.body.push_token){
        requiredParam.push('push_token');
    }
    if(requiredParam.length>0){
        result({'status':'0','message':'Required param : '+requiredParam.join(", ")});
        return;
    }

    var social_id = req.body.social_id;
    var social_type = req.body.social_type;
    var name = "";
    var email = "";
    if(req.body.name){
        name = req.body.name;
    }
    if(req.body.email){
        email = req.body.email;
    }

     //check user
     const checkUserQuery = "select * from user where social_id='"+social_id+"' and social_type="+social_type;
     const rowsUser = await execute(checkUserQuery);
    //  console.log(rowsUser.length);
     var is_user_registered = rowsUser.length;
    if(is_user_registered==0){
        const insertUser = "insert into user (name,email,social_id,social_type,push_token) values('"+name+"','"+email+"','"+social_id+"',"+social_type+",'"+req.body.push_token+"')";
        const rowsUser = await execute(insertUser);
        var userInsertId = rowsUser.insertId;
        //get user
        const getUserQuery = "select * from user where id="+userInsertId;
        const getrowsUser = await execute(getUserQuery);
        if(getrowsUser[0]['name']==''){
            getrowsUser[0]['is_profile_updated']=0
        }else{
            getrowsUser[0]['is_profile_updated']=1
        }
        result({'status':'1','message':'success','payload':getrowsUser[0]})
    }else{
        const updateUser = "update `user` set `push_token`='"+req.body.push_token+"' where social_id='"+social_id+"' and social_type="+social_type;
        const rowsUpdatedUser = await execute(updateUser);

        const checkUserUpdatedQuery = "select * from user where social_id='"+social_id+"' and social_type="+social_type;
        const rowsNewUser = await execute(checkUserUpdatedQuery);

        if(rowsNewUser[0]['name']==''){
            rowsNewUser[0]['is_profile_updated']=0
        }else{
            rowsNewUser[0]['is_profile_updated']=1
        }
        result({'status':'1','message':'success','payload':rowsNewUser[0]})
    }
}


module.exports= login;