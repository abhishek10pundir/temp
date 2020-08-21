'user strict';
const express = require('express');
bodyParser = require('body-parser');
app = express();
port = process.env.PORT || 3030; 

const mysql = require('mysql');
// connection configurations
const mc = mysql.createConnection({
    host     : '18.184.6.157',
    port:port,
    user     : 'root',
    password : 'ankit@123',
    database : 'pic_short'
});
 
// connect to database
mc.connect();


//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
    return;
});

app.listen(port);
console.log('todo list RESTful API server started on: ' + port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



var routes = require('./app/route/approute'); //importing route
routes(app); //register the route