var bodyParser = require('body-parser')
var express = require('express');
var fs = require('fs');
var HashMap = require('hashmap');
var https = require('https');
var path = require('path');
var pug = require('pug');

var app = express();


var sequenceIds = [];
var thumbnailURLs = []
var json = "";
var imgObject;
var map = new HashMap();
var mapillaryClientId = 'TVBudDVxUkNVVU5BZFQ5QmpKZVlndzoxMjE3N2VmOTE2YzU4OTNj';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

fs.readFile('./sequence_list.json', addSequencesToList);

app.get('/', function(req, res) {
    if(thumbnailURLs != undefined) {
        res.send(pug.renderFile(path.join(__dirname + '/templates/index.pug'), {
            imgUrls: thumbnailURLs,
            title:  JSON.parse(json).mainTitle,
            description: JSON.parse(json).frontPageDescription
        }));
    }
});

app.get('/story/*', function(req, res) {
    var pictureId = req.originalUrl.split("/story/").pop();
    getStartInfo(pictureId, res);
});

app.get('/storyinfo', function(req, res) {
    fs.readFile('./sequence_list.json', function(err, data) {
        if (err) throw err;
        var title = "";
        var description = "";
        var sequenceId = map.get(JSON.parse(Object.keys(req.query)[0]).picId);
        var d = JSON.parse(data);
        for(var i = 0; i < d.keys.length; i++) {
            if(d.keys[i].key == sequenceId) {
                title = d.keys[i].title;
                description = d.keys[i].description;
            }
        }

        var returnData = {};
        returnData.title = title;
        returnData.description = description;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(returnData));
    });
});

app.get('/imginfo', function(req, res) {
    fs.readFile('./sequence_list.json', function(err, data) {
        if (err) throw err;
        var description = "";
        var picId = JSON.parse(Object.keys(req.query)[0]).picId;
        var d = JSON.parse(data);
        for(var i = 0; i < d.imagedescriptions.length; i++) {
            if(d.imagedescriptions[i].key == picId) {
                description = d.imagedescriptions[i].description;
            }
        }

        var returnData = {};
        returnData.description = description;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(returnData));
    });
});

app.listen(3000, function () {
    console.log('Running on port 3000.');
});

function addSequencesToList(err, data) {
    if (err) throw err
    json = data;
    getThumbnails();
}

function getThumbnails() {
    var obj = JSON.parse(json);

    for(var i = 0; i < obj.keys.length; i++) {
        sequenceIds.push(obj.keys[i].key);
    }

    for (var i = 0; i < sequenceIds.length; i++) {
        getThumbnailForSequence(sequenceIds[i]);
    }
}

function getThumbnailForSequence(sequenceId) {
    var pathAppend = '/v2/s/' + sequenceId + '?client_id=' + mapillaryClientId;

    var options = {
    host: 'a.mapillary.com',
    path: pathAppend
    };

    var req = https.request(options);

    req.on('response', function(res) {
        res.body = "";
        res.on('data', function(chunk) {
            res.body += chunk;
        });

        res.on('end', function() {
            try {
                var obj = JSON.parse(res.body)
            } catch (e) {
                return console.error(e);
            }
            map.set(obj.keys[0], sequenceId);
            thumbnailURLs.push("https://d1cuyjsrcm0gby.cloudfront.net/" + obj.keys[0]
                + "/thumb-2048.jpg" );
        });
    });

    req.on('error', function(err) {
        console.log(err);
    });
    req.end();
}

function getStartInfo(pictureId, res1) {
    var pathAppend = '/v2/im/' + pictureId + '?client_id=' + mapillaryClientId;

    var options = {
        host: 'a.mapillary.com',
        path: pathAppend
    };

    var req = https.request(options);

    req.on('response', function(res) {
        res.body = "";
        res.on('data', function(chunk) {
            res.body += chunk;
        });

        res.on('end', function () {
            var obj = JSON.parse(res.body)
            imgObject =  obj;
            res1.send(pug.renderFile(path.join(__dirname + '/templates/story.pug'), {
                pictureId: pictureId,
                imgLat: imgObject.lat,
                imgLon: imgObject.lon
            }));

        });
    });

    req.on('error', function(err) {
        console.log( options.host + pathAppend);
        console.log(err);
    });
    req.end();
}
