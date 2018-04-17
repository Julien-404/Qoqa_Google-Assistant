'use strict';
const Koa = require('koa');
const koaBody = require('koa-body');

const https = require('https');
const DomParser = require('dom-parser');
const Entities = require('html-entities').XmlEntities;

const app = new Koa();
const entities = new Entities();

const links = {
    "Qoqa" : "https://www.qoqa.ch/fr/feed/product.xml",
    "Qwine" : "https://qwine.qoqa.ch/fr/feed/product.xml",
    "Qbeer" : "https://qbeer.qoqa.ch/fr/feed/product.xml",
    "Qsport" : "https://qsport.qoqa.ch/fr/feed/product.xml",
    "Qooking" : "https://qooking.qoqa.ch/fr/feed/product.xml",
    "Qids" : "https://qids.qoqa.ch/fr/feed/product.xml",
    
};

const getArticle = function(offer) {
    return new Promise((resolve, reject) => {
        console.log(links[offer]);
        https.get(links[offer], (rssResponse) => {
            let body = '';
            rssResponse.on('data', (d) => { body += d; }); // store each response chunk
            rssResponse.on('end', () => {
                // console.log('END', body);
                let parser = new DomParser();
                let xmlDoc = parser.parseFromString(body,"text/xml");
                // console.log(xmlDoc.getElementsByTagName("title")[2].textContent);
                let shopTitle = xmlDoc.getElementsByTagName("title")[0].textContent;
                let title = xmlDoc.getElementsByTagName("title")[1].textContent;
                let product = xmlDoc.getElementsByTagName("title")[2].textContent;
                let response = `${shopTitle}, ${title} : ${product}.`;
                resolve(response);
            });
            rssResponse.on('error', (error) => {
                // console.log('ERROR', error);
                reject(error);
            });
        });
    });
};

app.use(koaBody());
app.use(async ctx => {
    let offer = ctx.request.body.parameters['Actual_Offer'];

    await getArticle(offer).then((output) => {
        console.log(output);
        ctx.set('Content-Type', 'application/json; charset=UTF-8');
        ctx.body = JSON.stringify({ 'speech': output, 'displayText': output });
    }).catch((error) => {
        ctx.set('Content-Type', 'application/json; charset=UTF-8');
        ctx.body = JSON.stringify({ 'speech': error, 'displayText': error });
    });
});

app.on('error', (err, ctx) => {
    console.log('error in function :', err);
  });

  app.set('port', (process.env.PORT || 3000))
  app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
  })


// process.env.PORT || 3000;
// app.listen(3000);