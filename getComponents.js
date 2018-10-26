var request = require('request');
var fs = require('fs');
var path = require('path');
var dataDir = './data';
var downDir = './download';
var tokenFile = 'token.json';
var listFile = 'modList.json';
var configPath = './config';

var getToken = require('./getToken');
var download = require('./download');

var list;
var listPath = path.join(dataDir, listFile);


if (!fs.existsSync(listPath)) {
    console.log(listPath, 'not found');
    list = {};
} else {
    console.log(listPath, 'exists');
    var temp = fs.readFileSync(listPath);
    list = JSON.parse(temp);
}

// Checking Download Dir
if (!fs.existsSync(downDir)) {
    console.log(downDir, 'not found. Creating...');
    fs.mkdirSync(downDir);
} else {
    console.log(downDir, 'exists');
}

console.log("AssetCount:", list.AssetCount);
console.log("Details Length:", list.Details.length);
// console.log(token)

async function downAllVersions() {
    for(var i = 0; i < list.Details.length; i++){
        console.log('-----------------------------------------------------------');
        console.log('Component', (i+1), 'of', list.Details.length);
        console.log('Preparing to Download...' );
        console.log('Component ID:', list.Details[i].ID);
        console.log('Component Name:', list.Details[i].Name);
        console.log('No of Versions:', list.Details[i].allVersions.length);

        for(var j = 0; j < list.Details[i].allVersions.length; j++){
            console.log('____________________________________________');
            console.log('Version', (j+1), 'of', list.Details[i].allVersions.length);
            console.log('Logging In...');
            var token = await getToken();
            console.log('Downloading', list.Details[i].allVersions[j].Version);
            console.log('Asset ID:', list.Details[i].allVersions[j].ID);
            console.log('fileSize:', list.Details[i].allVersions[j].fileSize);
            var singleDownDir = path.join(downDir, list.Details[i].Namespace + '_' + list.Details[i].ID);
            if(!fs.existsSync(singleDownDir)){
                fs.mkdirSync(singleDownDir);
            }
            var downloadRes = await download(list.Details[i].allVersions[j], token, singleDownDir);
            if(!downloadRes.error){
                console.log('Downloaded Successfully to:', downloadRes.filePath);
            } else {
                console.log('Download Error:', downloadRes.error);
            }
            console.log('____________________________________________');
        }
        console.log('-----------------------------------------------------------');
        console.log();
    }
    console.log('-----------------------------------------------------------');
    console.log("Downloaded All Components");
    console.log('-----------------------------------------------------------');
}

downAllVersions();
