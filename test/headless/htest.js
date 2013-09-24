// googletesting.js
/*
 * this stuff is needed for chai to load it's modules
 * */
process = {
  env:{
    eql_COV:undefined
  }
};

// load chai although it's not used :-D
var chai = require("chai");

casper.test.begin('main', 8, function suite(test) {
    // open page
    casper.start("http://localhost:3000/index.html#/", function() {
      // disassemble default target
      this.clickLabel('disassemble','a');
      // check to see if switched view
      test.assertUrlMatch(/disas$/,'switched to disas view');

      //wait for svg to pop up
      casper.waitFor(function check() {
        return this.evaluate(function() {
          return document.querySelectorAll('svg').length > 0;
        });
      }, function then() {    // step to execute when check() is ok
        
        test.assertExists('svg',"found svg");
        test.assertExists('svg text',"it has something in it");
        test.assertExists('svg rect',"has some rects looking good");
        test.assertExists('.sectionP','sections drawn');

      }, function timeout() { // step to execute if check has failed
        this.echo("I can't haz my screenshot.").exit();
      });
    });

    casper.then(function() {
      // check if there are sections in right menu they are hidden here
      test.assertEval(function() {
            return __utils__.findAll(".menuItem").length >= 5;
        }, "there are a few sections");
        
    });
    casper.then(function(){
      // now test debugging
      this.clickLabel('debug','a');
      // check to see if switched
      test.assertUrlMatch(/#\/$/,'switched to debug view');
      
      // start debugging
      this.clickLabel('start debugging','a');

      // are there some instructions shown?
      casper.waitForSelector('.inst_row',function(){
        test.assertEval(function(){
          return __utils__.findAll(".inst_row").length>=5;
        })
      });

    });
    casper.run(function() {
        test.done();
    });
    
});
