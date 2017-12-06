const page = require('webpage').create();
const system = require('system');

if (system.args.length === 1) {
  console.log('Provide some URL');
  phantom.exit();
}

const url = system.args[1];

// With PhantomJS
page.open(url, function() {
  //  Set cookies

  //  Snap screen
  page.render('images/' + url.split('//')[1] + '.png');

  //  Get errors list
  phantom.exit();
});