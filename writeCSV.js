const path = require('path');
const fs = require('fs');
const csvWriter = require('csv-write-stream');

var dataDir = './data';
var downDir = './download';
var extractDir = './extracted';
var tokenFile = 'token.json';
var listFile = 'allItemGuidList.json';
var configPath = './config';

const csvOPFile = path.join(dataDir, 'allItemGuidList.csv');

var componentsList;
var listPath = path.join(dataDir, listFile);

if (!fs.existsSync(listPath)) {
    console.log(listPath, 'not found');
    componentsList = {};
} else {
    console.log(listPath, 'exists');
    var temp = fs.readFileSync(listPath);
    componentsList = JSON.parse(temp);
}

const writer = csvWriter();
writer.pipe(fs.createWriteStream(csvOPFile))

for (const singleComponent of componentsList) {
    let tempJson = {};
    
    if(singleComponent.Name){
        tempJson.Name = singleComponent.Name;
    } else {
        tempJson.Name = "";
    }

    if(singleComponent.ID){
        tempJson.componentID = singleComponent.ID;
    } else {
        tempJson.componentID = "";
    }

    for(var i = 0; i < singleComponent.allVersions.length; i++){
        var singleVersion = singleComponent.allVersions[i];
        tempJson.Version = singleVersion.Version;
        tempJson.assetID = singleVersion.ID;
        tempJson.fileURL = singleVersion.fileURL+"?agent=web";
        tempJson.fileSize = singleVersion.fileSize;
        if(singleVersion.itemGuidArray.length == 0){
            tempJson.itemGuid = "properties.json NOT Found";
            tempJson.propJsonPath = "";
            console.log(tempJson);
            writer.write(tempJson);
        } else {
            for(var j = 0; j < singleVersion.itemGuidArray.length; j++){
                var newObj = Object.assign({}, tempJson);
                newObj.itemGuid = singleVersion.itemGuidArray[j].itemGuid;
                newObj.propJsonPath = singleVersion.itemGuidArray[j].propJsonPath;
                console.log(newObj);
                writer.write(newObj);
            }
        }
    }

    

    // writer.write(tempJson);
}

writer.end();
console.log(csvOPFile, "Generated");