const page = require('webpage').create();
const system = require('system');

if (system.args.length === 1) {
    console.log('Usage: phantomjs-script.js <some URL>');
    phantom.exit(1);
}

const protocol = 'https://';
const arg = system.args[1];
const url = arg.split('//')[1];

// output url
console.log('Loading:', arg);
console.log(' ');

const voyagerCookie = {
    'name': 'x_lzd_goblin_voyager_searchpage_enabled',
    'value': 'true',
    'domain': url.split('/')[0],
    'path': '/',
    'httponly': true,
    'secure': false,
    'expires': (new Date()).getTime() + (1000 * 60 * 60) /* <-- expires in 1 hour */
};

page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36';
page.settings.webSecurityEnabled = false;

// set cookie
//  - x_lzd_goblin_voyager_searchpage_enabled=true
page.addCookie(voyagerCookie);

// debug cookie
// console.log('Debug Cookie:', JSON.stringify(page.cookies));
// console.log(' ');

// track errors
page.onResourceError = function(resourceError) {
    // console.log('debug: network error', JSON.stringify(resourceError, undefined, 4));

    var msgStack = ['[NETWORK ERROR]: ' + resourceError.status + ' ' + resourceError.statusText];

    if (resourceError && resourceError.url) {
        msgStack.push('TRACE:');
        msgStack.push(' -> ' + resourceError.url + ': ' + resourceError.errorCode + ' ' + resourceError.errorString);
    }

    msgStack.push(' --');

    console.error(msgStack.join('\n'));
    console.log(' ');
};

// track timeouts
page.onResourceTimeout = function(request) {
    // console.log('debug: request timeout', JSON.stringify(request, undefined, 4));

    var msgStack = ['[REQUEST TIMEOUT]: ' + msg];

    msgStack.push(JSON.stringify(request, undefined, 4));
    msgStack.push(' --');

    console.error(msgStack.join('\n'));
    console.log(' ');

};

// track errors
page.onError = function(msg, trace) {
    // console.log('debug: error', msg, JSON.stringify(request, trace, 4));

    var msgStack = ['[JS ERROR]: ' + msg];

    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function+'")' : ''));
        });
    }
    msgStack.push(' --');

    console.error(msgStack.join('\n'));
    console.log(' ');
};

// get time
var t = Date.now();
// open page
page.open(protocol + url, function(status) {
    // calculate load time
    t = Date.now() - t;
    // print status
    console.log(protocol + url + ' Loaded in ' + t + ' ms');
    console.log('Done! ' + JSON.stringify(status, undefined, 4));
    console.log(' ');
    // return earlier when error
    if (status !== 'success') {
        phantom.exit(1);
    }
    // snap screen
    page.render('results/' + url + '/screenshot.png');
    // get errors list
    phantom.exit();
});