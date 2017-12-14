const fs = require("fs");
const parseUrl = require("url").parse;
const path = require("path");
const childProcess = require("child_process");
const puppeteer = require("puppeteer");
const mkdirp = require("mkdirp");

const PAGE_LOAD_TIMEOUT = 60000;

if (process.argv.length < 3) {
    console.log("Usage: node " + process.argv[1] + " filename");
    process.exit(1);
}

const urlsListFile = path.join(__dirname, process.argv[2]);

const getResourceFolderName = (url) => {
    const baseDir = 'results';
    let result = `${baseDir}/${url.hostname}/`;

    if (url.path.length > 1) {
        result = result + `${url.path.substring(1).replace(
            /[\/,\.]/g,
            "_"
        )}`;
    }

    return result;
}

console.log("[Start] Reading pages.txt");
fs.readFile(urlsListFile, function(err, data) {
    if (err) throw err;
    
    console.log("[ End ] Reading pages.txt");
    
    urls = data
        .toString()
        .split("\n")
        .filter(el => el !== "");
        
    checkUrls(urls);
});

const checkUrls = async urls => {
    console.log('[ Start > ] Running Puppeteer');

    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true
    });

    await Promise.all(urls.map(async (itemUrl, index) => {
        const url = parseUrl(itemUrl);
        const testDir = getResourceFolderName(url);
        const voyagerCookie = {
            name: "x_lzd_goblin_voyager_searchpage_enabled",
            value: "true",
            domain: url.hostname,
            path: "/",
            httponly: true,
            secure: false,
            expires:
                new Date().getTime() +
                1000 * 60 * 60 /* <-- expires in 1 hour */
        };

        // Create directory to put results
        mkdirp.sync(testDir);

        console.log(`[ Start ${index} ] Loading.. `, url.href);
        
        // Open page and get screenshot
        try {
            const page = await browser.newPage();
            await page.setUserAgent(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"
            );
            await page.setCookie(voyagerCookie);
            await page.goto(url.href, {
                timeout: PAGE_LOAD_TIMEOUT
            });
            await page.screenshot({
                 path: `${testDir}/screenshot.png`,
                 fullPage: true
            });
    
            // Collect errors
            page.on("console", msg => {
                if (msg.type === "error") {
                    console.log("ERROR ---> ", msg.text);
               }
            });
    
            // Close the page
            await page.close();
            console.log(`[ End   ${index} ] Loading `, url.href);
        } catch(e) {
            console.log(`[ Error ${index} ] ${e}`);
        }
        
        return Promise.resolve();
    }));

    await browser.close();

    console.log('[ End   > ] Stop Puppeteer');
};
