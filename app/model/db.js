'user strict';

var mysql = require('mysql');

//local mysql db connection
port = process.env.PORT || 3030; 
var connection = mysql.createConnection({
    host     : '18.184.6.157',
    port:port,
    user     : 'root',
    password : 'ankit@123',
    database : 'pic_short'
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;