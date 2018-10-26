var find = require('find');
var fs = require('fs');
var path = require('path');
var dataDir = './data';
var downDir = './download';
var extractDir = './extracted';
var tokenFile = 'token.json';
var listFile = 'modList.json';
var configPath = './config';
var outputJSON = path.join(dataDir, 'allItemGuidList.json');

const StreamZip = require('node-stream-zip');

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

// Checking Extraxt Dir
if (!fs.existsSync(extractDir)) {
    console.log(extractDir, 'not found. Creating...');
    fs.mkdirSync(extractDir);
} else {
    console.log(extractDir, 'exists');
}

var extractSingle = function (listObj, componentDownDir, componentExtractDir) {
    // console.log("Entered extractSingle");
    // console.log('-----------------------------------------------------------------------');
    // console.log(listObj.Name);
    var extractCount = 0;
    return new Promise(function (resolve, reject) {
        // console.log(i);
        var tempZipPath = path.join(componentDownDir, listObj.ID + '.zip');
        var singleExtractDir = path.join(componentExtractDir, listObj.ID.toString());
        // console.log(tempZipPath);
        if (!fs.existsSync(tempZipPath)) {
            listObj.itemGuidArray = [{
                itemGuid: "Zip file not found",
                propJsonPath: ''
            }];
            // console.log('-----------------------------------------------------------------------');
            console.log();
            resolve(listObj)

        } else {
            var zip = new StreamZip({
                file: tempZipPath,
                storeEntries: true
            });

            if (!fs.existsSync(singleExtractDir)) {
                console.log('Creating', singleExtractDir);
                fs.mkdirSync(singleExtractDir);
            }

            zip.on('ready', () => {
                zip.extract(null, singleExtractDir, (err, count) => {
                    if (err) {
                        listObj.itemGuidArray = [{
                            itemGuid: "Zip file Extract Error",
                            propJsonPath: ''
                        }];
                    } else {
                        // var files = find.fileSync(/properties.json$/, singleExtractDir);
                        console.log("Extracted to", singleExtractDir)
                        var files = find.fileSync('properties.json', singleExtractDir);
                        console.log(files);
                        // listObj.noOfpropJSON = files.length;
                        var itemGuidArray = [];
                        for(var i = 0; i < files.length; i++){
                            var singleItemGUID = {};
                            var propJsonPath = files[i];
                            var propJsonData = fs.readFileSync(propJsonPath);
                            var propJson = JSON.parse(propJsonData);
                            singleItemGUID.propJsonPath = path.relative(singleExtractDir, files[i]);
                            if (propJson.itemGuid) {
                                singleItemGUID.itemGuid = propJson.itemGuid;
                            } else {
                                singleItemGUID.itemGuid = "itemGuid not Found";
                            }
                            itemGuidArray.push(singleItemGUID);
                        }
                        listObj.itemGuidArray = itemGuidArray;
                    }
                    console.log(err ? 'Extract error' : `Extracted ${count} entries`);
                    zip.close();
                    // console.log('-----------------------------------------------------------------------');
                    console.log();
                    resolve(listObj)

                });
            });
        }

    });
}

console.log(list.Details.length);
var modifiedList = [];

async function extractAll() {
    for(var i = 0; i < list.Details.length; i++){
        console.log('-----------------------------------------------------------');
        console.log("Processing", i+1, "of", list.Details.length, "components");
        var componentDownDir = path.join(downDir, list.Details[i].Namespace + '_' + list.Details[i].ID);
        var componentExtractDir = path.join(extractDir, list.Details[i].Namespace + '_' + list.Details[i].ID);
        if(!fs.existsSync(componentExtractDir)){
            console.log("Creating", componentExtractDir);
            fs.mkdirSync(componentExtractDir);
        } else {
            console.log(componentExtractDir, "already exists");
        }
        var modifiedAllVersions = [];
        for(var j = 0; j < list.Details[i].allVersions.length; j++){
            console.log('------------------------------');
            console.log("Extracting", j+1, "of", list.Details[i].allVersions.length, "versions");
            var extractRes = await extractSingle(list.Details[i].allVersions[j], componentDownDir, componentExtractDir);
            modifiedAllVersions.push(extractRes);
            console.log('------------------------------');
            console.log();
        }
        list.Details[i].allVersions = modifiedAllVersions;
        modifiedList.push(list.Details[i]);
        console.log('-----------------------------------------------------------');
        console.log();
    }
    console.log('-----------------------------------------------------------');
    console.log("Extracted all");
    console.log(modifiedList.length);
    fs.writeFileSync(outputJSON, JSON.stringify(modifiedList, null, 4));
    console.log('-----------------------------------------------------------');
}

extractAll();

