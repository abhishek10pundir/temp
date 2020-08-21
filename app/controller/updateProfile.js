var updateProfile = require('../model/updateProfile');

exports.add_tasks = function(req, res) {
    updateProfile.addProfileData(req.params.id,req,function(err, success) {
      if (err){
        res.send(err);
      }else{
        res.send(success);
      }
    });
};

exports.get_tasks = function(req, res) {
    updateProfile.getProfileData(req,function(err, success) {
      if (err){
        res.send(err);
      }else{
        res.send(success);
      }
    });
};

exports.search_tasks = function(req, res) {
  updateProfile.searchProfileData(req.params.keyword,function(err, success) {
    if (err){
      res.send(err);
    }else{
      res.send(success);
    }
  });
};

exports.get_other_tasks = function(req, res) {
  updateProfile.getOtherProfileData(req,function(err, success) {
    if (err){
      res.send(err);
    }else{
      res.send(success);
    }
  });
};
