

describe('explorer',function(){
    describe('#load',function(){


      var explorer,wasCalled;

      beforeEach(function(){
        explorer=require("../../src/explorer/explorer.js");
        wasCalled=false;
      });

      it("Should be a function", function(){
                expect(typeof explorer.load).toBe('function');
      });

      it("Should throw an exception when callback argument is undefined", function(){
        expect(function(){ explorer.load();}).toThrow(new Error('Invalid argument, expected callback'));
      });

      it("Should return an exception when dir argument is not a string.", function(){
        runs(function(){
          explorer.load(12345,function(err,files){
            expect(err instanceof Error).toBe(true);
            wasCalled=true;
          });
        });
        waitsFor(function(){
          return wasCalled;
        });
      });

      it("Should return an error when it's not a valid directory path", function(){
          runs(function(){
              explorer.load('joke',function(err, files){
                  expect(err instanceof Error).toBe(true);
                  wasCalled=true;
              });

          });
          waitsFor(function(){
            return wasCalled;
          });

      });

      it("Should not return an error when it's a valid directory path", function(){
          runs(function(){
            explorer.load('C:/',function(err, files){
                expect(err instanceof Error).toBe(false);
                wasCalled=true;
            });

          });
          waitsFor(function(){
            return wasCalled;
          });

      });

      it("should return an array",function(){
        runs(function(){
          explorer.load('C:/',function(err,files){
            expect(Array.isArray(files)).toBe(true);
            wasCalled=true;
          });
        });
        waitsFor(function(){
          return wasCalled;
        });

      });


      it("should return an array of objects.",function(){
        runs(function(){
          explorer.load('C:/',function(err,files){
            expect(typeof files[0]=='object' && typeof files[files.length-1]=='object').toBe(true);
            wasCalled=true;
          });
        });
        waitsFor(function(){
          return wasCalled;
        });

      });


      it("should return an array of objects with property name and type and path.",function(){
        runs(function(){
          explorer.load('C:/',function(err,files){
            expect(typeof files[0].name).toBe('string');
            expect(typeof files[0].type).toBe('string');
            expect(typeof files[0].path).toBe('string');
            wasCalled=true;
          });
        });
        waitsFor(function(){
          return wasCalled;
        });

      });


    });
});
