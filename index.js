/*
 HTTP Cloud Function.
 @param {Object} req Cloud Function request context.
 @param {Object} res Cloud Function response context.
*/
'use strict';
const http = require('http');
const DomParser = require('dom-parser');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const category_paths = {
    "Qoqa" : "https://www.qoqa.ch/fr/feed/product.xml",
    "Qwine" : "https://qwine.qoqa.ch/fr/feed/product.xml",
    "Qbeer" : "https://qbeer.qoqa.ch/fr/feed/product.xml",
    "Qsport" : "https://qsport.qoqa.ch/fr/feed/product.xml",
    "Qooking" : "https://qooking.qoqa.ch/fr/feed/product.xml",
    "Qids" : "https://qids.qoqa.ch/fr/feed/product.xml",
    
};

exports.getCategory = (req, res) => {
    let category = req.body.result.parameters['Categories'];
    getArticle(category).then((output) => {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
    }).catch((error) => {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
    });
};

var getArticle = function(category){
    return new Promise((resolve, reject) => {
        http.get({path: category_paths[category]}, (rssResponse) => {
            let body = '';
            rssResponse.on('data', (d) => { body += d; }); // store each response chunk
            rssResponse.on('end', () => {
                var parser = new DomParser();
                var xmlDoc = parser.parseFromString(body,"text/xml");
                var title = "";
                var title = entities.decode(xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("item")[0].getElementsByTagName("title")[0].textContent);
                var response = "L'offre en cours pour \""+category+"\" est : "+title;
                resolve(response);
            });
            rssResponse.on('error', (error) => {
                reject(error);
            });
        });
    });
}