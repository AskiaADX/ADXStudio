

describe('explorer', function () {
    describe('#load', function () {


      var explorer, wasCalled;

      beforeEach(function () {
        explorer = require("../../src/explorer/explorer.js");
        wasCalled = false;
      });
      function runSync(dir, fn) {
        runs( function () {
          explorer.load(dir, function (err, files) {
            fn(err, files);
            wasCalled = true;
          });
        });
        waitsFor(function () {
          return wasCalled;
        });
      };

      it("Should be a function", function () {
        expect(typeof explorer.load).toBe('function');
      });

      it("Should throw an exception when callback argument is undefined", function () {
        expect( function () {
          explorer.load();
        }).toThrow(new Error('Invalid argument, expected callback'));
      });

      it("Should return an exception when dir argument is not a string.", function () {
        runSync(12345, function (err, files) {
            expect(err instanceof Error).toBe(true);
        });
      });

      it("Should return an error when it's not a valid directory path", function () {
          runSync('joke', function (err, files) {
              expect(err instanceof Error).toBe(true);
          });
      });

      it("Should not return an error when it's a valid directory path", function () {
          runSync('C:/',  function (err, files) {
              expect(err instanceof Error).toBe(false);
          });
      });

      it("should return an array", function () {
        runSync('C:/', function (err, files) {
          expect(Array.isArray(files)).toBe(true);
        });
      });


      it("should return an array of objects.", function () {
        runSync('C:/', function (err, files){
          expect(typeof files[0] == 'object' && typeof files[files.length-1] == 'object').toBe(true);
        });
      });


      it("should return an array of objects with property name, type and path.", function () {
         runSync('C:/', function (err, files) {
           expect(typeof files[0].name).toBe('string');
           expect(typeof files[0].type).toBe('string');
           expect(typeof files[0].path).toBe('string');
         });
      });
    });
});
