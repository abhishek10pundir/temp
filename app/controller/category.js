var category = require('../model/category');

exports.get_tasks = function(req, res) {
    category.getTask(req,function(err, success) {
      if (err)
        res.send(err);
        res.send(success);
    });
};
