const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const phantomjs = require('phantomjs-prebuilt')
const binPath = phantomjs.path

if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' filename');
  process.exit(1);
}

const lineReader = require('readline').createInterface({
  input: fs.createReadStream(path.join(__dirname, process.argv[2]))
});
 
lineReader.on('line', function(line) {
  console.log('Loading ', line);
  return childProcess.execFile(
    binPath,
    [ path.join(__dirname, 'phantomjs-script.js'), line ],
    function(err, stdout, stderr) {
      console.log('Finish ', line);
      console.log(err , stdout, stderr);
    })
});
