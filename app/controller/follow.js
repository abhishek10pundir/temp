var follow = require('../model/follow');

exports.add_tasks = function(req, res) {
    follow.addFollow(req,function(err, success) {
      if (err)
        res.send(err);
        res.send(success);
    });
};

exports.get_tasks = function(req, res) {
    follow.getFollow(req.params.id,req.params.type,req,function(err, success) {
      if (err)
        res.send(err);
        res.send(success);
    });
};
