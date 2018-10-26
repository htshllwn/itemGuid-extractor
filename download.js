var request = require('request');
var fs = require('fs');
var path = require('path');

var getSingleComponent = function (componentObj, token, downDir) {
	return new Promise(function (resolve, reject) {
		var downURL = componentObj.fileURL + '?agent=web';
		var options = {
			url: downURL,
			headers: {
				'X-KONY-AUTHORIZATION': token
			},
			encoding: null
		};

		request(options, function(error, response, body){
			if(!error){
				var statusCode = response && response.statusCode;
				if(statusCode == 200) {
					// console.log(downDir)
					// console.log(componentObj.ID)
					var filePath = path.join(downDir, componentObj.ID.toString());
					var zipPath = filePath + '.zip';
					// console.log(filePath);
					fs.writeFile(zipPath, body, function(err){
						if(err){
							resolve({ error: 'Saving to zip Error' });
						}
						resolve({ filePath: zipPath });
					});
				} else {
					resolve({ error: 'Status Code not equal 200' });
				}
			} else {
				resolve({ error: 'File Downloading Error' });
			}
		})

	});
}

module.exports = getSingleComponent;