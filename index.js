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
        https.get({url: links[offer]}, (rssResponse) => {
            let body = '';
            rssResponse.on('data', (d) => { body += d; }); // store each response chunk
            rssResponse.on('end', () => {
                var parser = new DomParser();
                var xmlDoc = parser.parseFromString(body,"text/xml");
                var title = "";
                var title = entities.decode(xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("item")[0].getElementsByTagName("title")[0].textContent);
                var response = "L'offre en cours pour \""+offer+"\" est : "+title;
                resolve(response);
            });
            rssResponse.on('error', (error) => {
                reject(error);
            });
        });
    });
};

app.use(koaBody());
app.use(async ctx => {
    let offer = ctx.request.body.result.parameters['Actual_Offer'];

    getArticle(offer).then((output) => {
        ctx.set('Content-Type', 'application/json; charset=UTF-8');
        ctx.body(JSON.stringify({ 'speech': output, 'displayText': output }));
    }).catch((error) => {
        ctx.set('Content-Type', 'application/json; charset=UTF-8');
        ctx.body(JSON.stringify({ 'speech': error, 'displayText': error }));
    });
});

app.on('error', (err, ctx) => {
    log.error('server error', err, ctx)
  });

process.env.PORT || 8000;
// app.listen(8000);