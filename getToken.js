var request = require('request');
var fs = require('fs');
var path = require('path');
var dataDir = './data';
var tokenFile = 'token.json';
var configPath = './config';


var formData;
var credentialsPath = path.join(configPath, 'credentials.json');

if (!fs.existsSync(credentialsPath)) {
    console.log(credentialsPath, 'not found');
    formData = {};
} else {
    console.log(credentialsPath, 'exists');
    var temp = fs.readFileSync(credentialsPath);
    formData = JSON.parse(temp);
}

var urls;
var urlsPath = path.join(configPath, 'urls.json');

if (!fs.existsSync(urlsPath)) {
    console.log(urlsPath, 'not found');
    urls = {};
} else {
    console.log(urlsPath, 'exists');
    var temp = fs.readFileSync(urlsPath);
    urls = JSON.parse(temp);
}

var getToken = function(){
    return new Promise(function(resolve, reject){
        request.post({
            url: urls.login_url,
            form: formData
        },
        function (error, response, body) {
            // console.log('error:', error); 
            // console.log('statusCode:', response && response.statusCode);
            // console.log('Response: ', response);
            // console.log('body:', body);
    
            if(!error){
                var statusCode = response && response.statusCode;
                if(statusCode == 200) {
                    var jsonBody = JSON.parse(body);
                    var token = jsonBody.claims_token.value;
                    // console.log('Token:', token);
                    var filePath = path.join(dataDir, tokenFile);
                    fs.writeFileSync(filePath, JSON.stringify(
                        { token: token },
                        null,
                        4
                    ));
                    resolve(token);
                    // console.log('Token successfully saved in', filePath);
                } else {
                    console.log('Status Code not equal 200');
                    reject('Status Code not equal 200');
                }
            } else {
                reject(error);
            }
        }
    );
    });
}

module.exports = getToken

