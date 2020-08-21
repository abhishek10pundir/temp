var comment = require('../model/comment');

exports.add_tasks = function(req, res) {
    comment.addComment(req.params.id,req,function(err, success) {
      if (err)
        res.send(err);
        res.send(success);
    });
};
