var path = require("path");
var fs = require('fs');
var packager = require('electron-packager');

var outputPath = path.join(process.cwd(), "releases/0.0.0.2/");
var opts = {
    "dir"  : process.cwd(),
    "name" : "ADXStudio",
    "platform" : "win32",
    "arch" : "all",
    "version" : "0.36.0",
    "out" : outputPath,
    "icon" : path.join(process.cwd(), "app/adx-studio_icon.ico"),
    "overwrite" : true,
    "ignore" : /(\.adxstudio|docs|tmp|\.git|\.idea|releases|jasmine-node|pack\.js)/i,
    "version-string" : {
        "CompanyName" : "Askia SAS",
        "LegalCopyright" : "Copyright (c) Askia 2015",
        "FileDescription" : "Askia Design eXtension - Studio",
        "OriginalFilename" : "ADXStudio",
        "FileVersion" : "0.0.0.2",
        "ProductVersion" : "0.0.0.2",
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
    console.log("Package done in `" + appPath + "`");
});
