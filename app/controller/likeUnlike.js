var likeUnlike = require('../model/likeUnlike');

exports.add_tasks = function(req, res) {
    likeUnlike.addLikeUnlike(req.params.id,req,function(err, success) {
      if (err)
        res.send(err);
        res.send(success);
    });
};
