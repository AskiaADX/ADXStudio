var path = require("path");
var fs = require('fs');
var packager = require('electron-packager');

var outputPath = path.join(process.cwd(), "releases/1.0.0alpha/");
var opts = {
    "dir"  : process.cwd(),
    "name" : "ADXStudio",
    "platform" : "win32",
    "arch" : "all",
    "version" : "0.34.1",
    "out" : outputPath,
    "icon" : path.join(process.cwd(), "app/adx-studio_icon.ico"),
    "overwrite" : true,
    "ignore" : /(\.adxstudio|docs|tmp|\.git|\.idea|releases|jasmine-node|pack\.js)/i,
    "version-string" : {
        "CompanyName" : "Askia SAS",
        "LegalCopyright" : "Copyright (c) Askia 2015",
        "FileDescription" : "Askia Design eXtension - Studio",
        "OriginalFilename" : "ADXStudio",
        "FileVersion" : "1.0.0.0",
        "ProductVersion" : "1.0.0.0",
        "ProductName" : "ADXStudio",
        "InternalName" : "ADXStudio"
    }
};

console.log("Package starting ...");
packager(opts, function done (err, appPath) {
    if (err) {
        console.log(err);
        return;
    }

    console.log("Renaming the 32bit version of the AskCmn for the ia32 output...");
    var adxshellPath = path.join(outputPath, "ADXStudio-win32-ia32/resources/app/node_modules/adcutil/lib/adxshell/");
    fs.unlink(path.join(adxshellPath, 'AskCmn.dll'), function () {
        fs.rename(path.join(adxshellPath, 'AskCmn32.dll') , path.join(adxshellPath, 'AskCmn.dll'));
    });
    fs.unlink(path.join(adxshellPath, 'AskCmn.pdb'), function (err) {
        if (!err) {
            fs.rename(path.join(adxshellPath, 'AskCmn32.pdb'), path.join(adxshellPath, 'AskCmn.pdb'));
        }
    });
    console.log("Package done in `" + appPath + "`");
});