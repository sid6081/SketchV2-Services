var express = require('express');
var bodyParser = require('body-parser');
var winston = require('winston');
var moment = require('moment');
var schedule = require('node-schedule');
 
var image = require('./image/image');
var extensionMethods = require('./extension-methods');

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

var server = app.listen(process.env.PORT || 8030, function () {
	var port = server.address().port;
	console.log("App now running on port", port);
	extensionMethods.logContent('\n\tApp now running on port' + port);

	var imageJsonUpdate = schedule.scheduleJob('0 */15 * * * *', function(){
		console.log('TimeStamp : ', moment().format("MM-DD HH:mm:ss"));
		extensionMethods.logContent('\t---------------------- Updating input file ----------------------');
		image.readImageDirectory();
	});

	var logFileRotate = schedule.scheduleJob('0 1 0 * * *', function(){
		console.log('Log Rotate - TimeStamp : ', moment().format("MM-DD HH:mm:ss"));
		extensionMethods.logContent('\t---------------------- Updating log rotate file ----------------------');
		//extensionMethods.logRotate();
		// image.readImageDirectory();
	});
});

app.get("/images", image.getImages);
app.get("/getImage/:category/:imageName", image.getImage);
app.get("/getThumbnailImage/:category/:imageName", image.getThumbnailImage);
app.get("/readImageDirectory", image.readImageDirectory);