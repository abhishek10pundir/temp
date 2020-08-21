var login = require('../model/login');

exports.add_tasks = function(req, res) {
    login.addLoginData(req,function(err, success) {
      if (err)
        res.send(err);
        res.send(success);
    });
};
