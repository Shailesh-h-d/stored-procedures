var mysql = require('mysql');

var connection = mysql.createConnection({
    host : 'localhost',
    user:'root', 
    password:'root', 
    database:'sqljoints',
    multipleStatements: true
});

connection.connect((err) => {
    if(err) {
        console.log('Error connecting to DB');
    } else {
        console.log('Connected to DB');
    }
});

module.exports = connection;