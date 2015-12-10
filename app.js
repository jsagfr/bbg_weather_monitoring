var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app).listen(8888, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
var io = require('socket.io').listen(server);

var Si7005 = require('./si7005');
var si7005 = new Si7005(2);


app.set('view engine', 'ejs');

read_t_hm = function(){
    var temp = si7005.readTemp();
    var hm = si7005.readHumidity(temp);
    var weather = { temperature: temp.toFixed(2),
		    humidity:    hm.toFixed(2) };
    return weather;
}

app.get('/', function(req, res){
    res.render('index', read_t_hm());
});



var callback = function(){
    io.emit('weather', read_t_hm());
};
var timerEmit = setInterval(callback, 1000);

