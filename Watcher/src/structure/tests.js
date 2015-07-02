// TESTS.js---> The Explorer.
//This file is been created to be in Firstapp.html
//The second goal is to insert the script in the html page.

//First step, build the structure.
var fs=require("fs");

//@var Variables to define.
var explorer=new Array();
var dir='C:/Users/';

//To list in an array all files from dir.
var list= fs.readdir(dir,function(err,files){
  if(err){
    throw err;
  }
  else{
    console.log(files);
  }

});

//function to list in the console all the results of the array explorer.
var ExplorerList=function(){
  console.log(list);
};

//Call of the function.
ExplorerList();

//Constructors to determine if a thing we found is a folder or a File in a folder.
//@files
function folder(name){
  this.name=name;
  folder.Add=function(){

  }
};

//@folder
function FilesInFolder(name, xtsion){
    this.name=name;
    this.xtsion=xtsion;
    file.Add=function(){

    }
};

var SearchAgain=function() {


};
