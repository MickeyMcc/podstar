var express = require('express');
var bodyParser = require('body-parser');

var db = require('../database-mysql');


var app = express();

app.use(express.static(__dirname + '/../react-client/dist'));

app.get('/shows', function (req, res) {
  db.selectAllShows(function(err, data) {
    if(err) {
      res.sendStatus(500);
    } else {
      res.json(data);
    }
  });
});

app.listen(3000, function() {
  console.log('listening on port 3000!');
});

