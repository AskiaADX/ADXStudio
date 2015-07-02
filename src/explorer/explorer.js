var fs=require('fs');
var path=require("path");


/**
* load.SpecifiedDirectory and return all files and folders
*
*    var explorer=require('ADXStudio/src/explorer/explorer.js');
*    explorer.load('C:/',function(err,files){
*       console.log(files); // [
*                               {name:"documents and settings", type:"folder", path:"C:/Document and settings/"}
*                               {name:"desktop.ini", type:"file", path:'C:/Desktop.ini/'}
*                              ]
*    });
*
* @param {String} dir The SpecifiedDirectory to load.
* @param {Function} callback
* @param {Error} callback.err Error
* @param {Array} callback.files return an array of files/folders
*/
exports.load=function(dir,callback){
  if(!callback){
      throw new Error('Invalid argument, expected callback');
    }
    if(typeof dir != 'string'){
      callback(new Error('Invalid argument, expected dir to be string.'),null);
      return;
    }

    fs.stat(dir,function(err,stats){
      if(err){
        callback(err,null);
        return;
      }

      if(!stats.isDirectory()){
        callback(new Error('Invalid dir path.'),null);
        return;
      }
      fs.readdir(dir,function(err1,files){
        if(err1){
          callback(err1,null);
        }
        else{
          var finalFiles=[];
          for (var i = 0; i < files.length; i++) {

            var stats;

            try{
              stats=fs.statSync(path.join(dir,files[i]));
            }
            catch(err2){
              continue;
            }


            finalFiles[i]={
              name:files[i],
              path:path.join(dir,files[i])
            };


            if (stats.isFile()){
              finalFiles[i].type='file';
            }
            else{
              finalFiles[i].type='folder';
            }
          }
          console.log(finalFiles);
          callback(null,finalFiles);
        }

      });

    });
};
