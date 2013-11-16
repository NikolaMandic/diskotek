
'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('ldApp'));
  it("should check to see if service modules are loaded properly", function() {
    runs(function() {
      var bScript = false;
      require(['bScript'],function(BScript){
          bScript=BScript;
      });
    });
    waitsFor(function() {
      return bScript;
    }, "The Value should be incremented", 750);
    runs(function(){
      inject(function (beeScript) {
        expect(beeScript).toBe(true);
      });

    });
  });
 });
