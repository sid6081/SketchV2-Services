// var moment = require('moment');
// var momentTimezone = require('moment-timezone');
// var fs = require('fs');
var winston = require('winston');
var fs = require('fs');
var moment = require('moment');

module.exports = {

	handleError: function(res, reason, message, code) {
		console.log("ERROR: " + reason);
		module.exports.logContent(res.url+'\t\t'+message+'\t\t'+res.statusCode);
		res.status(code || 500).json({"status":"failure","message": message});
	},

	logContent: function(endpoint) {
		let logDir = __dirname + '/../../logs/';
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir);
		}
		var timeStamp = moment().format("YYYY-MM-DD HH:mm:ss");
		const logger = new (winston.Logger)({
			transports: [
				new (winston.transports.Console)({
					timestamp: timeStamp,
					colorize: true,
					level: 'info'
				}),
				new (winston.transports.File)({
					filename: `${logDir}/results.log`,
					timestamp: timeStamp,
					level: 'info',
					formatter: function(options) {
						// Returned string will be passed to the logger
						return timeStamp + ',' + 
						options.message;
					},
					json: false
				})
			]
		});
		logger.info(endpoint);
	},

	logRotate: function() {
		var logDir = __dirname + '/../../logs';
		if (!fs.existsSync(logDir)) {
			return;
		}
		var filename = moment().subtract(1, 'day').format("DD-MMM-YYYY");
		var logFilePath = logDir + '/results.log';
		var newLogFilePath = logDir + '/' + filename+ '.log';
		fs.readFile(logFilePath, function(error, logData){
			if(error){
				console.log(err);
				module.exports.handleError(res, err.message, "Failed while log rotating")
			} else {
				fs.writeFile(newLogFilePath, logData, function(err) {
					if(err){
						console.log(err);
						module.exports.handleError(res, err.message, "Failed to update time")
					}
					else {
						fs.unlink(logFilePath);
					}
				});
			}
		});
		
	}
}




