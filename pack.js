"use strict";

const fileVersion = "0.0.0.8";
const path = require("path");
const packager = require('electron-packager');
const outputPath = path.join(process.cwd(), "releases/" + fileVersion + "/");
const opts = {
    "dir"  : process.cwd(),
    "name" : "ADXStudio",
    "platform" : "win32",
    "arch" : "all",
    "version" : "0.36.8",
    "out" : outputPath,
    "icon" : path.join(process.cwd(), "app/adx-studio_icon.ico"),
    "overwrite" : true,
    "ignore" : /(\.adxstudio|docs|tmp|\.git|\.idea|releases|jasmine-node|pack\.js)/i,
    "version-string" : {
        "CompanyName" : "Askia SAS",
        "LegalCopyright" : "Copyright (c) Askia 2016",
        "FileDescription" : "Askia Design eXtension - Studio",
        "OriginalFilename" : "ADXStudio",
        "FileVersion" : fileVersion,
        "ProductVersion" : fileVersion,
        "ProductName" : "ADXStudio",
        "InternalName" : "ADXStudio"
    }
};

console.log("Package version " + fileVersion +  " starting ...");
packager(opts, function done (err, appPath) {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Package done in `" + appPath + "`");
});
