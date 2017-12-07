const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const childProcess = require('child_process');
const phantomjs = require('phantomjs-prebuilt');
const binPath = phantomjs.path;

if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' filename');
    process.exit(1);
}

const baseDir = 'results/';

const lineReader = require('readline').createInterface({
    input: fs.createReadStream(path.join(__dirname, process.argv[2]))
});

lineReader.on('line', function(line) {
    console.log('Loading ', line);
    let testDir = baseDir + line.split('//')[1];
    // create dir
    mkdirp.sync(testDir);
    // run phantomjs

    let child = childProcess.execFile(
        binPath, ['--ignore-ssl-errors=true', path.join(__dirname, 'phantomjs-script.js'), line],
        function(err, stdout, stderr) {
            // report errors
            if (err) {
                console.log('Error', err);
            }
            // debug output
            // console.log(stdout);
            // write file
            fs.writeFile(testDir + '/error.txt', stdout, 'utf-8', function(err) {
                if (err) {
                    return console.log('Error writing file:', err);
                }
                // finish!
                process.stdout.write('>');
            });
        });
    child.stderr.on("data", function(data) {
        // error
        process.stdout.write('_');
    })
    child.stdout.on('data', function(data) {
        // data
        process.stdout.write('.');
    });
    child.on("exit", function(code) {
        // done
        process.stdout.write('!');
    })

    return child;
});