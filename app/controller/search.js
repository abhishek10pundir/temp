var search = require('../model/search');

exports.search_tasks = function(req, res) {
    search.searchProfileData(req.params.keyword,req,function(err, success) {
      if (err){
        res.send(err);
      }else{
        res.send(success);
      }
    });
};
