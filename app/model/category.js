'user strict';
var sql = require('./db.js');
const JSON = require('circular-json');

// var i=0;
//Task object constructor
var category = function (categoryData) {
    this.id = categoryData.id;
    this.name = categoryData.name;
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

category.getTask = async (req, result) => {
    const Query = "select * from category";
    const rows = await execute(Query);
    var is_category_found= rows.length;
    if (is_category_found == 0) {
        result({
            'status': '0',
            'message': 'Category not found'
        })
        return;
    }else{
        result({
            'status': '1',
            'message': rows
        })
        return;
    }
}    

module.exports = category;
