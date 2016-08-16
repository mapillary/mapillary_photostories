var jsonReturned;
var thumbnailURLs = [];
var markerList = {
    "type": "geojson",
    "data": {
        "type": "FeatureCollection",
        "features": []
    }
};
var rightMarker;
var map;
var rightMap;
var CLIENT_ID = "TVBudDVxUkNVVU5BZFQ5QmpKZVlndzoxMjE3N2VmOTE2YzU4OTNj";
//position last time node was changed
var lastNodechange;


//bottom bar map scroll handler //this will have to change, now just removing map when scrolling
$(document).scroll(function() {
    var storyPosition = $("#fullscreen-view").offset().top;
    var y = $(document).scrollTop(),
        footer = $("#clear-map");
    if (y >= storyPosition)  {
        footer.css({position: "fixed", "top" : "70%"});
        $("#expand-map").css({position: "fixed", "top" : "95%"});
    } else {
        //cannot expand map if at top part of page
        footer.css({position : "relative", display: "none"});
        $("#expand-map").css({position: "relative", display: "none"});
    }
    //if scrolled more than 200px -- hide map
    if (y > lastNodechange + 400) {
        footer.css({position : "relative", display: "none"});
    } else if (y < lastNodechange - 600) {
        footer.css({position : "relative", display: "none"});
    }
});

// Click handlers
$("#open-bottom-map").click(function() {
  $("#clear-map").css({position: "fixed", display: "block"});
  $("#expand-map").css({display: "none"});
});

$("#close-bottom-map").click(function() {
    footer = $("#clear-map");
    footer.css({position : "relative", display: "none"});
    $("#expand-map").css({display: "block"});
});

initPage();
initRightMap(53.0, 53.0, 'right-map');
$("html, body").animate({ scrollTop: 0 }, "fast");

function initAllViewers() {
    $('.fullscreen-item').each(function(i, el) {
        var picId = $(el).find('img').attr('src').replace("https://d1cuyjsrcm0gby.cloudfront.net/", '');
        picId = picId.replace("/thumb-2048.jpg", '');
        var id = "fullscreen-item-" + picId;
        $(el).attr('id', id);
        var fullscreenId = '#fullscreen-' + picId;
        $(fullscreenId).attr('id', fullscreenId);
        initViewerMapBlock($(el));
    });
}

function getGistJson() {
    $.ajax({
            url: 'https://api.github.com/gists/' + '008b49fd6bb056ddf15c6562fb4f0a26',
            type: 'GET',
            dataType: 'jsonp'
        }).success(function(gistdata) {
            jsonReturned = JSON.parse(gistdata.data.files.sequence_list.content);
            $('#mainTitle').text(jsonReturned.mainTitle);
            $('#mainDescription').text(jsonReturned.frontPageDescription);
            $('#description').fadeIn("slow");
            $(jsonReturned.keys).each(function(index, element) {
                getThumbnailForSequence(jsonReturned.keys[index].key, jsonReturned.keys.length, index);
            });
        });
}

function getLocalJson() {
    $.getJSON("sequence_list.json", function(json) {
        jsonReturned = json;
        $('#mainTitle').text(jsonReturned.mainTitle);
        $('#mainDescription').text(jsonReturned.frontPageDescription);
        $('#description').fadeIn("slow");
        $(jsonReturned.keys).each(function(index, element) {
            getThumbnailForSequence(jsonReturned.keys[index].key, jsonReturned.keys.length, index);
        });
    });
}


function getLocalNewJson() {
    $.getJSON("rio_story.json", function(json) {
        jsonReturned = json;
        $('#mainTitle').text(jsonReturned.mainTitle);
        $('#mainDescription').text(jsonReturned.frontPageDescription);
        $('#intro').text(jsonReturned.intro);
        $('#author').text(jsonReturned.author);
        $('#date').text(jsonReturned.date);
        $('#description').fadeIn("slow");
        $('#authorDate').fadeIn("slow");
        $(jsonReturned.keys).each(function(index, element) {
            getThumbnailForSequence(jsonReturned.keys[index].key, jsonReturned.keys.length, index);
        });
    });
}

//Helper functions
function initPage() {
    $('document').ready(function() {
        $(window).scrollTop();
        
        getGistJson();
        // getLocalJson();
       // getLocalNewJson();
    });
}

//finds the description of the current element
function findDescription (currentIndex) {
    for (var z = 0; z < jsonReturned.keys.length; z++) {
            if (jsonReturned.keys[z].key === sequenceIds[currentIndex]) {
                return jsonReturned.keys[currentIndex].description;
            }
    }
    return "";
}

function appendStoryElements (index) {
    for (var i = 0; i < thumbnailURLs.length; i++) {
        if (thumbnailURLs[i] != "") { //if element has sequence
            var id = thumbnailURLs[i].replace('https://d1cuyjsrcm0gby.cloudfront.net/', '');
            id = id.replace('/thumb-2048.jpg', '');
            var description = findDescription(i);
            $('#fullscreen-view').append("<div id='fullscreen-description'> <div class='description-text'> <h1 id='fullscreen-title'>"+ jsonReturned.keys[i].title + " </h1> <h2 class='fullscreen-body' id=\'" + jsonReturned.keys[i].title.replace(' ', '-') + "\'>" +
                description +
                "</h2> </div> <p id='img-description'></p> <div class='fullscreen-item'> <img src='" +
                thumbnailURLs[i] +
                "'/> </div> </div>");
        } else { //text with no sequence (wont find right description if multiple entries with no sequence)
            var description = findDescription(i);
            $('#fullscreen-view').append("<div id='fullscreen-description'> <div class='description-text'> <h1 id='fullscreen-title'>"+ jsonReturned.keys[i].title + " </h1> <h2 class='fullscreen-body' id=\'" + jsonReturned.keys[i].title.replace(' ', '-') + "\'>" +
            description +
            "</h2> </div> </div>");
        }
    }
}

var counter = 0;
var sequenceIds = [];

function getThumbnailForSequence(sequenceId, length, currentIndex) {
    console.log(sequenceId);
    sequenceIds.push(sequenceId);
    if (sequenceId != "") {
    var pathAppend = '/v2/s/' + sequenceId + '?client_id=' + CLIENT_ID;
    var host = 'https://a.mapillary.com';

    $.ajax({
        url: host + pathAppend,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            var thumbnail = ("https://d1cuyjsrcm0gby.cloudfront.net/" + data.keys[0] +
                "/thumb-2048.jpg");
            thumbnailURLs[currentIndex] = thumbnail;
            counter++;
            if (counter == length) { //to make sure that all elements have been fetched before continuing
                appendStoryElements(currentIndex);
                //should be here, was initializing map multiple times. still dont have all locations..
                initMap(53.0, 53.0, 'map');
            }
            initAllViewers();
           // initMap(53.0, 53.0, 'map');
        }, //success end
        error: function() {
            console.log("ERROR: when fetching the thumbnails for the sequences.");
        }
    });
    } else {
        thumbnailURLs[currentIndex] = ""; //appends empty string to the URL's..
        counter++;
    }
}

function initMap(lat, lon, mapContainer) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwaWxsYXJ5IiwiYSI6ImNpanB0NmN1bDAwOTF2dG03enM3ZHRocDcifQ.Z6wgtnyRBO0TuY3Ak1tVLQ';
    map = new mapboxgl.Map({
        container: mapContainer, // container id
        style: 'mapbox://styles/mapbox/streets-v8', //stylesheet location
        center: [lon, lat], // starting position
        zoom: 12 // starting zoom
    });

    var mapillarySource = {
        type: 'vector',
        tiles: ['https://d2munx5tg0hw47.cloudfront.net/tiles/{z}/{x}/{y}.mapbox'],
        minzoom: 0,
        maxzoom: 16
    };

    var bounds = new mapboxgl.LngLatBounds();
    for (var i = 0; i < jsonReturned.keys.length; i++) {
        addMarker(map, bounds, jsonReturned.keys[i].key, jsonReturned.keys[i].title)
    }

    //error handling
    map.on('error', function(err) {
        console.log("An error occured while loading the map");
        console.log(err);
    })

    map.on('load', function() {
        map.addSource("points", markerList);
        map.addLayer({
            "id": "points",
            "type": "symbol",
            "source": "points",
            "layout": {
                "icon-image": "{icon}-15",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        });

        map.addSource('mapillary', mapillarySource)
        map.addLayer({
            'id': 'mapillary',
            'type': 'line',
            'source': 'mapillary',
            'source-layer': 'mapillary-sequences',
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-opacity': 0.6,
                'line-color': 'rgb(53, 175, 109)',
                'line-width': 2
            }
        }, 'markers')

        map.on('click', function(e) {
            var divToScroll = map.queryRenderedFeatures(e.point)[0].properties.title;
            divToScroll = ('#' + divToScroll).toString();
            divToScroll = divToScroll.replace(' ', '-');
            $('html, body').animate({
                scrollTop: $(divToScroll).offset().top
            }, 2000);
        });
    });

    map.scrollZoom.disable();
    map.addControl(new mapboxgl.Navigation());
}

function addMarker(map, bounds, searchKey, title) {
    //to exclude any keys that do not have a sequence
    if (searchKey != "") {
        var pathAppend = '/v2/s/' + searchKey + '?client_id=' + CLIENT_ID;
        var host = 'https://a.mapillary.com';
        $.ajax({
            url: host + pathAppend,
            type: 'GET',
            dataType: 'json'
        }).success(function(data) {
            var coords = data.coords[0];
            var feature = {
                "type": "Feature",
                "properties": {
                    "title": title,
                    "icon": "marker-15"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [coords[0], coords[1]]
                }
            };
            markerList.data.features.push(feature);
            bounds.extend(feature.geometry.coordinates);
            map.fitBounds(bounds, {padding: 100}); //padding to see all points
        });
    }
}


function initRightMap(lat, lon, setMap, picId) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwaWxsYXJ5IiwiYSI6ImNpanB0NmN1bDAwOTF2dG03enM3ZHRocDcifQ.Z6wgtnyRBO0TuY3Ak1tVLQ';
    rightMap = new mapboxgl.Map({
        container: setMap, // container id
        style: 'mapbox://styles/mapbox/streets-v8', //stylesheet location
        center: [lon, lat], // starting position
        zoom: 16 // starting zoom
    });

    var mapillarySource = {
        type: 'vector',
        tiles: ['https://d2munx5tg0hw47.cloudfront.net/tiles/{z}/{x}/{y}.mapbox'],
        minzoom: 0,
        maxzoom: 16
    };

    //on error
    rightMap.on('error', function(err) {
        console.log("An error occured while loading the right-map");
        console.log(err);
    })

    rightMap.on('style.load', function() {
        var markerSource = {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [lon, lat]
                },
                properties: {
                    title: 'You\'re here!',
                    'marker-symbol': 'marker'
                }
            }
        };

        rightMap.addSource('markers', markerSource);
        rightMap.addLayer({
            id: 'markers',
            type: 'symbol',
            source: 'markers',
            layout: {
                'icon-image': '{marker-symbol}-15',
                'text-field': '{title}',
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-offset': [0, 0.6],
                'text-anchor': 'top'
            }
        })

        rightMap.addSource('mapillary', mapillarySource)
        rightMap.addLayer({
            'id': 'mapillary',
            'type': 'line',
            'source': 'mapillary',
            'source-layer': 'mapillary-sequences',
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-opacity': 0.8,
                'line-color': 'rgb(53, 175, 109)',
                'line-width': 4
            }
        }, 'markers')
    })
    rightMap.scrollZoom.disable();
    rightMap.addControl(new mapboxgl.Navigation());

}

function checkForImageDescription(el, picId) {
    var imgDescription = "";
    $(jsonReturned.imageDescriptions).each(function(index, element) {
        if (element.key === picId) {
            imgDescription = element.description;
        }
    });
    var descriptionElement = el.parent().find('#img-description')
    if (imgDescription != "") {
        descriptionElement.show();
        descriptionElement.show();
        descriptionElement.text(imgDescription);
        console.log("Image Description for this image!!");
    } else {
        descriptionElement.hide();
    }
}

function displayBottomMap(viewer) {
    //if in div with js viewers
    var storyPosition = $("#fullscreen-view").offset().top;
    var y = $(document).scrollTop();
    if (y >= storyPosition)  {
        $("#clear-map").css({display: "block"});
        $("#expand-map").css({display: "block"}); //display the expand btn
        $(".fullscreen-item").css({height: "75%"});
        $("#fullscreen-view").css("padding-bottom", "20%");
        viewer.resize();

    }
}

function saveCurrentPosition() {
    lastNodechange = $(document).scrollTop();
    console.log(lastNodechange);
}

function initViewerMapBlock(el, startNode) {
    if (!startNode) {
        var picId = el.find('img').attr('src').replace("https://d1cuyjsrcm0gby.cloudfront.net/", '');
        picId = picId.replace("/thumb-2048.jpg", '');
        el.find('img').remove();
    } else {
        picId = startNode;
    }

    var viewer = new Mapillary
        .Viewer(el.attr('id'),
            'TVBudDVxUkNVVU5BZFQ5QmpKZVlndzoxMjE3N2VmOTE2YzU4OTNj',
            picId, {
                cover: true,
                renderMode: Mapillary.RenderMode.Fill,
                baseImageSize: Mapillary.ImageSize.Size2048,
                maxImageSize: Mapillary.ImageSize.Size2048,
                sequence: {
                    minWidth: 200,
                }
            });


        viewer.on('nodechanged', function(node) {
            checkForImageDescription(el, picId);
            displayBottomMap(viewer);
            rightMap.resize();
            var lnglat = [node.latLon.lon, node.latLon.lat]
            var tempSource = new mapboxgl.GeoJSONSource({
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: lnglat
                    },
                    properties: {
                        title: 'You\'re here!',
                        'marker-symbol': 'marker'
                    }
                }
            })
            rightMap.getSource('markers').setData(tempSource._data)
            rightMap.flyTo({
                center: lnglat,
                zoom: 16
            })
            var currDiv = el.attr('id');
            document.getElementById(currDiv).scrollIntoView();
            saveCurrentPosition();
        });
}

