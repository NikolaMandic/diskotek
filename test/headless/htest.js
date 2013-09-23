// googletesting.js
casper.test.begin('main', 5, function suite(test) {
    casper.start("http://localhost:3000/index.html#/", function() {
      this.clickLabel('disassemble','a');
      test.assertUrlMatch(/disas$/,'switched to disas view');
      casper.waitFor(function check() {
        return this.evaluate(function() {
          return document.querySelectorAll('svg').length > 0;
        });
      }, function then() {    // step to execute when check() is ok
        test.assertExists('svg',"found svg");
        test.assertExists('svg text',"it has something in it");
        test.assertExists('svg rect');
        test.assertExists('.sectionP','sections drawn');

      }, function timeout() { // step to execute if check has failed
        this.echo("I can't haz my screenshot.").exit();
      });
    });

    casper.then(function() {
    });

    casper.run(function() {
        test.done();
    });
});
