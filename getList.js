var request = require('request');
var fs = require('fs');
var path = require('path');
var dataDir = './data';
var listFile = 'list.json';
var modListFile = 'modList.json';
var configPath = './config';

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

if (!fs.existsSync(dataDir)) {
    console.log(dataDir, 'not found. Creating...');
    fs.mkdirSync(dataDir);
} else {
    console.log(dataDir, 'exists');
}

function getMainList() {
    return new Promise((resolve, reject) => {
        request.get({
                url: urls.components_api
            },
            function (error, response, body) {
                console.log('error:', error);
                console.log('statusCode:', response && response.statusCode);
                // console.log('Response: ', response);
                console.log('body:', body);

                if (!error) {
                    var statusCode = response && response.statusCode;
                    if (statusCode == 200) {
                        var jsonBody = JSON.parse(body);
                        var filePath = path.join(dataDir, listFile);
                        fs.writeFileSync(filePath, JSON.stringify(
                            jsonBody,
                            null,
                            4
                        ));
                        console.log('List successfully saved in', filePath);
                        resolve(filePath);
                    } else {
                        console.log('Status Code not equal 200');
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            }
        );
    });

}

function getAllVersionsList(ID) {
    return new Promise((resolve, reject) => {
        request.get({
                url: urls.components_api + `/${ID}/releases`
            },
            function (error, response, body) {
                if (!error) {
                    var statusCode = response && response.statusCode;
                    if (statusCode == 200) {
                        var jsonBody = JSON.parse(body);
                        resolve(jsonBody.releaseDetails);
                    } else {
                        console.log('Status Code not equal 200');
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            })
    })
}

async function getVersions() {
    var mainListPath = await getMainList();
    var mainList = JSON.parse(fs.readFileSync(mainListPath));
    if (mainList) {
        console.log(mainList.AssetCount);
        modifiedMainList = [];
        for(var i = 0; i < mainList.Details.length; i++){
            var component = mainList.Details[i];
            console.log('--------------------------------------------------------------------------');
            console.log(i+1);
            console.log('Fetching allVersions of', component.Name);
            var allVersions = await getAllVersionsList(component.ID);
            if(allVersions){
                console.log(component.Name, 'noOfVersions:', allVersions.length);
                component.allVersions = allVersions;
            } else {
                console.log(component.Name, 'noOfVersions:', 'ERROR Occurred while fetching allVersions');
                component.allVersions = allVersions;
            }
            modifiedMainList.push(component);
            console.log('--------------------------------------------------------------------------');
            console.log();
        };

        var finalList = {
            AssetCount: mainList.AssetCount,
            Details: modifiedMainList
        };

        var filePath = path.join(dataDir, modListFile);
        fs.writeFileSync(filePath, JSON.stringify(
            finalList,
            null,
            4
        ));
        console.log('Modified List written to', filePath);
    } else {
        console.log('Error in fetching Main List');
    }

}

getVersions();