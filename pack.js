"use strict";

const fileVersion = "1.0.0.0";
const path = require("path");
const packager = require('electron-packager');
const outputPath = path.join(process.cwd(), "releases/" + fileVersion + "/");
const opts = {
    "dir"  : process.cwd(),
    "name" : "ADXStudio",
    "platform" : "win32",
    "arch" : "all",
    "electronVersion" : "1.6.2",
    "out" : outputPath,
    "icon" : path.join(process.cwd(), "app/adx-studio_icon.ico"),
    "overwrite" : true,
    "ignore" : /(\.adxstudio|docs|tmp|\.git|\.idea|releases|jasmine-node|pack\.js)/i,
<<<<<<< HEAD
    "app-copyright" :  "Copyright (c) Askia 2017",
    "app-version" : fileVersion,
    "build-version" : fileVersion,
    "version-string" : {
=======
    "appCopyright" :  "Copyright (c) Askia 2017",
    "appVersion" : fileVersion,
    "buildVersion" : fileVersion,
    "win32metadata" : {
>>>>>>> feature-adp
        "CompanyName" : "Askia SAS",
        "FileDescription" : "Askia Design eXtension - Studio",
        "OriginalFilename" : "ADXStudio",
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
