var extensionMethods = require(__dirname + '/../extension-methods');
var inputJson = require(__dirname + '/../../input/input.json');

var decache = require('decache');
var fs = require('fs');
var async = require('async');
var imageJsonResponse = [];
var fileFormats = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG'];

module.exports = {

	getImages: function(req, res) {
		decache(__dirname + '/../../input/input.json');
		inputJson = require(__dirname + '/../../input/input.json');
		extensionMethods.logContent('\t'+req.url+'\t\t'+200);
		res.status(200).json({"response":inputJson});
	},

	readImageDirectory: function(req, res) {
		imageJsonResponse = [];
		readDirectory().then(function(){
			var outputFilePath = __dirname + '/../../input/input.json';
			fs.writeFile(outputFilePath, JSON.stringify(imageJsonResponse), function(err) {
				if(err){
					console.log(err);
					extensionMethods.handleError(res, err.message, "Failed to update time")
				}
				else {
					if(res){
						extensionMethods.logContent('\t'+req.url+'\t\t'+200);
						res.status(200).json(imageJsonResponse);
					}
				}
			});
		});
	},

	getImage: function(req, res) {
		var path = __dirname + '/../../../Images/' + req.params.category + '/' + req.params.imageName;
		res.contentType('image/jpg');
		fs.exists(path, function(exists){
			if(!exists){
				path = __dirname + '/../../../default.jpg';
			}
			var s = fs.createReadStream(path);
			s.on('open', function () {
				s.pipe(res);
			});
			s.on('end', function() {
				extensionMethods.logContent('\t'+req.url+'\t\t'+req.params.imageName+'\t\t'+res.statusCode);
				return;
			});
			s.on('error', function() {
				extensionMethods.logContent('\t'+req.url+'\t\t'+req.params.imageName+'\t\t'+res.statusCode);
			});
		});
	},

	getThumbnailImage: function(req, res) {
		var path = __dirname + '/../../../Thumbnail-Images/' + req.params.category + '/' + req.params.imageName;
		res.contentType('image/jpg');
		fs.exists(path, function(exists){
			if(!exists){
				path = __dirname + '/../../../default.jpg';
			}
			var s = fs.createReadStream(path);
			s.on('open', function () {
				s.pipe(res);
			});
			s.on('end', function() {
				extensionMethods.logContent('\t'+req.url+'\t\t'+req.params.imageName+'\t\t'+res.statusCode);
				return;
			});
			s.on('error', function() {
				extensionMethods.logContent('\t'+req.url+'\t\t'+req.params.imageName+'\t\t'+res.statusCode);
			});
		});
	}
}

readDirectory = () => {
	return new Promise((resolve, reject) => {
		var path = __dirname + '/../../../Images';
		fs.readdir(path, function(err, imageDirectories) {
			async.each(imageDirectories, function(imageDirectory, callback){
				listImageFilesUnderDirectory(path + '/' + imageDirectory, imageDirectory).then(function(categoryJsonObject){
					if(categoryJsonObject.url){
						imageJsonResponse.push(categoryJsonObject);
					}
					callback(null);
				});
			}, function(err){
				if(err){
					console.log(err);
					reject();
				} else {
					resolve();
				}
			});
		});
	});
}

listImageFilesUnderDirectory = (categoryPath, imageDirectory) => {
	return new Promise((resolve, reject) => {
		fs.readdir(categoryPath, function(err, images) {
			let jsonObj = {};
			if(images){
				let imageList = [];
				Object.assign(imageList, images);
				for(let i=0;i<images.length;i++){
					let flag = true;
					for(let j=0;j<fileFormats.length;j++){
						if(images[i].endsWith(fileFormats[j])){
							flag = false;
							break;
						}
					}
					if(flag){
						imageList.splice(i, 1);
					}
				}
				jsonObj.category = imageDirectory;
				jsonObj.url = imageList;
			}
			resolve(jsonObj);	
		});
	});
}