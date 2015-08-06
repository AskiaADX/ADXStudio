var app = require('app');  // Module to control application life.
var ipc = require('ipc');
var explorer = require('../../src/explorer/explorer.js');
var path = require('path');
var ADC   = require('adcutil').ADC;
var fs = require('fs');

ipc.on('explorer-ready', function(event) {
    var explorerView = event.sender;

    var defaultPath = path.join(__dirname, '../../');
    explorer.load(defaultPath, function(err, files) {
        explorerView.send('explorer-expand-folder', err, files, 'root');
        global.project.path = defaultPath;
        global.project.adc  = new ADC(global.project.path);
    });

    app.on('menu-open-project', function (folderpath) {
        explorer.load(folderpath, function(err, files) {
            explorerView.send('explorer-expand-folder', err, files, 'root');
            global.project.path = folderpath;
            global.project.adc  = new ADC(global.project.path);
        });
    });

    // Message from 'index.js' the view.
    // Here we receive the object sent from index.js.
    ipc.on('explorer-rename', function(event, file, newName) {
      var oldPath = file.path;
      var newPath = path.join(oldPath, '../', '/' + newName);

      fs.stat(newPath, function(err, stats) {

        //if folder/file doesn't exist.
        if (err || (!stats.isFile() && !stats.isDirectory())) {

          fs.rename(oldPath, newPath, function(err) {
            if(err) {
              console.log(err.message);
            } else {
              console.log('Cool ca marche');
            }
          });
        } else {
          console.log('File or folder already exists.');

        }
      });




      console.log(oldPath);
      console.log(newPath);
    });
});

ipc.on('explorer-load-folder', function(event, folderpath, elementid) {
  explorer.load(folderpath, function(err, files) {
    event.sender.send('explorer-expand-folder', err, files, elementid);
  });
});
