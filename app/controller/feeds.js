var feeds = require('../model/feeds');

exports.add_tasks = function(req, res) {
    feeds.addfeeds(req,function(err, success) {
      if (err){
        res.send(err);
      }else{
        res.send(success);
      }
    });
};

exports.get_tasks = function(req, res) {
    feeds.getfeeds(req.params.id,req.params.user_id,req,function(err, success) {
      if (err){
        res.send(err);
      }else{
        res.send(success);
      }
    });
};

exports.get_all_tasks = function(req, res) {
  feeds.getallfeeds(req.params.id,req,function(err, success) {
    if (err){
      res.send(err);
    }else{
      res.send(success);
    }
  });
};

exports.update_tasks = function(req, res) {
  feeds.updatefeeds(req.params.id,req,function(err, success) {
    if (err){
      res.send(err);
    }else{
      res.send(success);
    }
  });
};

exports.get_user_tasks = function(req, res) {
    feeds.getuserfeeds(req.params.id,req,function(err, success) {
      if (err){
        res.send(err);
      }else{
        res.send(success);
      }
    });
};

exports.delete_tasks = function(req, res) {
  feeds.deleteFeed(req.params.id,req,function(err, success) {
    if (err){
      res.send(err);
    }else{
      res.send(success);
    }
  });
};


//get all videos or images based on request
exports.get_all_video_or_images = function(req, res) {
  feeds.getallfeedsForImagesOrVideos(req.params.id,req,function(err, success) {
    if (err){
      res.send(err);
    }else{
      res.send(success);
    }
  });
};

//get vidoes or images based on request for particular user
exports.get_user_video_or_images = function(req, res) {
  feeds.getuserfeedsForImagesOrVideos(req.params.id,req,function(err, success) {
    if (err){
      res.send(err);
    }else{
      res.send(success);
    }
  });
};


