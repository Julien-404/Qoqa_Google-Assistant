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

const getOffer = function(offer) {
    return new Promise((resolve, reject) => {
        console.log('URL : ', links[offer]);
        https.get(links[offer], (rssResponse) => {
            let body = '';
            rssResponse.on('data', (d) => { body += d; }); // store each response chunk
            rssResponse.on('end', () => {
                // console.log('END', body);
                let parser = new DomParser();
                let xmlDoc = parser.parseFromString(body,"text/xml");
                // console.log(xmlDoc.getElementsByTagName("title")[2].textContent);
                let shopTitle = xmlDoc.getElementsByTagName("title")[0].textContent;
                //let title = xmlDoc.getElementsByTagName("title")[1].textContent;
                let product = xmlDoc.getElementsByTagName("title")[1].textContent;
                let response = `${shopTitle} : ${product}.`;
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
    let offer = ctx.request.body.queryResult.parameters['Actual_Offer'];
    let responseID = ctx.request.body['responseId'];
    let endResponse = ' Je peux faire autre chose pour vous ?'

    if (offer === "") {
        //In case of nothing in the JSON recived by google, return an error
        let output = "Désoler, il y a eu une erreur. Merci de répéter votre demande."
        console.log(output);
            ctx.set('Content-Type', 'application/json; charset=UTF-8');
            ctx.body = JSON.stringify({'fulfillmentText': output, 'payload': { 'google': { 'expectUserResponse': true, 'simpleResponse': {'textToSpeech': output}}}});
    } else {
        await getOffer(offer).then((output) => {
            console.log(output);
            ctx.set('Content-Type', 'application/json; charset=UTF-8');
            ctx.body = JSON.stringify({'fulfillmentText': output+endResponse, 'payload': { 'google': { 'expectUserResponse': true, 'simpleResponse': {'textToSpeech': output+endResponse}}}}); 
        }).catch((error) => {
            ctx.set('Content-Type', 'application/json; charset=UTF-8');
            ctx.body = JSON.stringify({'fulfillmentText': error, 'payload': { 'google': { 'expectUserResponse': true, 'simpleResponse': {'textToSpeech': error}}}}); 
        });
    }

});

const port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening to %s', port);
