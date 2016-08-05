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
var allViewers = [];

//bottom bar map scroll handler //this will have to change, now just removing map when scrolling
$(document).scroll(function() {
    var storyPosition = $("#story").offset().top;
    var y = $(document).scrollTop(),
        footer = $("#right-map");
    if(y >= storyPosition)  {
        footer.css({position: "fixed", "top" : "75%"});
    } else {
        footer.css({position : "relative", display: "none"});
    }
});

// $(document).on('resize', resizeViewers);

// function resizeViewers() {
//     console.log("resized");
//     for (i = 0; i < allViewers.length; i++) {
//         allViewers[i].resize();
//     }
// }

// Click handlers
$("#back").click(function() {
    $('.center-panel').fadeOut("slow");
    $('#back').fadeOut("slow");
    var descriptionDiv = $('#img-description').detach();
    $(playButton).click();
    $('#mly').empty();
});

$("#close-map").click(function() {
    $('#close-map').fadeOut('slow');
    $("#right-description").fadeIn("slow");
    $('#back').fadeIn("slow");
});

initPage();
initRightMap(53.0, 53.0, 'right-map');

function initAllViewers() {
    // $('#story #story-description .glyphicon.glyphicon-resize-full').each(function(i, el) {
    //     var id = "fullscreen-" + i;;
    //     $(el).attr('id', id);
    // });

    // $('.story-item').each(function(i, el) {
    //     var picId = $(el).find('img').attr('src').replace("https://d1cuyjsrcm0gby.cloudfront.net/", '');
    //     picId = picId.replace("/thumb-2048.jpg", '');
    //     var id = "story-item-" + picId;
    //     $(el).attr('id', id);
    //     var fullscreenId = '#fullscreen-' + picId;
    //     $(fullscreenId).attr('id', fullscreenId);
    //      initMapillaryViewer($(el));
    //     //initViewerMapBlock($(el));
    //     var newDivName = 'wrapper-' + picId;
    //     $(el).wrap("<div class='" + newDivName + "' style='position: relative;'></div>");
    //     newDivId = '.' + newDivName;
    //     $(newDivId).append('<span class="glyphicon glyphicon-resize-full"></span>');
    //     $(newDivId).append('<span class="glyphicon glyphicon-play"></span>');
    // });

    //adding the viewer in the fullscreen mode
    $('.fullscreen-item').each(function(i, el) {
        var picId = $(el).find('img').attr('src').replace("https://d1cuyjsrcm0gby.cloudfront.net/", '');
        picId = picId.replace("/thumb-2048.jpg", '');
        var id = "fullscreen-item-" + picId;
        $(el).attr('id', id);
        var fullscreenId = '#fullscreen-' + picId;
        $(fullscreenId).attr('id', fullscreenId);
        initViewerMapBlock($(el));
    });
    initMapillaryViewerIcons();
}

function getGistJson() {
    $.ajax({
            // url: 'https://gist.github.com/filippak/cc24b5f51084b6677b7f4119e2101c3f.js',
            url: 'https://api.github.com/gists/' + '008b49fd6bb056ddf15c6562fb4f0a26',
            type: 'GET',
            dataType: 'jsonp'
        }).success(function(gistdata) {
            jsonReturned = JSON.parse(gistdata.data.files.sequence_list.content);
            // console.log(jsonReturned); 
            $('#mainTitle').text(jsonReturned.mainTitle);
            $('#mainDescription').text(jsonReturned.frontPageDescription);
            $('#description').fadeIn("slow");
            //get author and intro from new json format here
            $(jsonReturned.keys).each(function(index, element) {
                getThumbnailForSequence(jsonReturned.keys[index].key, jsonReturned.keys.length, index);
            });
        });
}

function getLocalJson() {
    $.getJSON("sequence_list.json", function(json) {
        // console.log(json); 
        jsonReturned = json;
        $('#mainTitle').text(jsonReturned.mainTitle);
        $('#mainDescription').text(jsonReturned.frontPageDescription);
        $('#description').fadeIn("slow");
        //get author and intro from new json format here
        $(jsonReturned.keys).each(function(index, element) {
            getThumbnailForSequence(jsonReturned.keys[index].key, jsonReturned.keys.length, index);
        });
    });
}


//Helper functions
function initPage() {
    $('document').ready(function() {
        $(window).scrollTop(0);
        
        getGistJson();
        // getLocalJson();
        initMapillaryViewerIcons();
    });
}

function appendStoryElements (index) {
    //same functionality as before, just breaking out in own function
    for (var i = 0; i < thumbnailURLs.length; i++) {
        var id = thumbnailURLs[i].replace('https://d1cuyjsrcm0gby.cloudfront.net/', '');
        id = id.replace('/thumb-2048.jpg', '');
        var description = "";
        for (var z = 0; z < jsonReturned.keys.length; z++) {
            if (jsonReturned.keys[z].key === sequenceIds[i]) {
                description = jsonReturned.keys[i].description
            }
        }
        console.log("appending div");
        $('#fullscreen-view').append("<div id='fullscreen-description'> <div class='description-text'> <h1 id='fullscreen-title'>"+ jsonReturned.keys[i].title + " </h1> <h2 id=\'" + jsonReturned.keys[i].title.replace(' ', '-') + "\'>" +
            description +
            "</h2> </div> <p id='img-description'></p> <div class='fullscreen-item'> <img src='" +
            thumbnailURLs[i] +
            "'/> </div> </div>");
    }
}

var counter = 0;
var sequenceIds = [];

function getThumbnailForSequence(sequenceId, length, currentIndex) {
    sequenceIds.push(sequenceId);
    var pathAppend = '/v2/s/' + sequenceId + '?client_id=' + CLIENT_ID;
    var host = 'https://a.mapillary.com';

    $.ajax({
        url: host + pathAppend,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log("successfully feched the data");
            console.log(data);
            var thumbnail = ("https://d1cuyjsrcm0gby.cloudfront.net/" + data.keys[0] +
                "/thumb-2048.jpg");
            thumbnailURLs[currentIndex] = thumbnail;
            // thumbnailURLs.push("https://d1cuyjsrcm0gby.cloudfront.net/" + data.keys[0] +
            //     "/thumb-2048.jpg");

            counter++;
            console.log(counter + " thumbnails fetched");
            if (counter == length) { //to make sure that all elements have been fetched before continuing
                appendStoryElements(currentIndex);
                    //old, appending to story
                        //         // $('#story').append("<div id='story-description'> <div class='description-text'> <h1 id='fullscreen-title'>"+ jsonReturned.keys[i].title + " </h1> <h2 id=\'" + jsonReturned.keys[i].title.replace(' ', '-') + "\'>" +
                        //         //     description +
                        //         //     "</h2> </div> <br><br><p id='img-description'></p><div class='story-item'> <img src='" +
                        //         //     thumbnailURLs[i] +
                        //         //     "'/></div> </div>");

            }
            initAllViewers();
            initMap(53.0, 53.0, 'map');
        }, //success end
        error: function() {
            console.log("ERROR FETCHING DATA");
        }
    });
}

function initMap(lat, lon, map) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwaWxsYXJ5IiwiYSI6ImNpanB0NmN1bDAwOTF2dG03enM3ZHRocDcifQ.Z6wgtnyRBO0TuY3Ak1tVLQ';
    map = new mapboxgl.Map({
        container: map, // container id
        style: 'mapbox://styles/mapbox/streets-v8', //stylesheet location
        center: [lon, lat], // starting position
        zoom: 8 // starting zoom
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
                "icon": "marker"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [coords[0], coords[1]]
            }
        };
        markerList.data.features.push(feature);
        bounds.extend(feature.geometry.coordinates);
        map.fitBounds(bounds, {padding: 50}); //padding to see all points
    });
}


function initRightMap(lat, lon, setMap, picId) {
    console.log("added new right map with id " + picId);
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
    //to be able to scroll easier --in the map footer
    rightMap.scrollZoom.disable();
    rightMap.addControl(new mapboxgl.Navigation());

}

function checkForImageDescription(el, picId) {
    var imgDescription = "";
    $(jsonReturned.imagedescriptions).each(function(index, element) {
        if (element.key === picId) {
            imgDescription = element.description;
        }
    });
    var descriptionElement = el.parent().parent().find('#img-description')
    if (imgDescription != "") {
        descriptionElement.show();
        descriptionElement.show();
        descriptionElement.text(imgDescription);
        console.log("Image Description for this image!!");
    } else {
        descriptionElement.hide();
    }
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
                cover: false,
                baseImageSize: Mapillary.ImageSize.Size2048,
                maxImageSize: Mapillary.ImageSize.Size2048,
                sequence: {
                    minWidth: 200,
                }
            });

        // allViewers.push(viewer);
        // console.log(allViewers);

        viewer.on('nodechanged', function(node) {
            //if in the story section
            var storyPosition = $("#story").offset().top;
            var y = $(document).scrollTop();
            if (y >= storyPosition)  {
                $("#right-map").css({display: "block"});
            }
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
                zoom: 15
            })
        });
        viewer.on('hover', function(node) {
            console.log("on hover in viewer"); 
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
                zoom: 15
            })
        });
}

function initMapillaryViewer(el, startNode) {
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
                cover: false,
                baseImageSize: Mapillary.ImageSize.Size2048,
                maxImageSize: Mapillary.ImageSize.Size2048,
                sequence: {
                    minWidth: 200,
                }
            });

    if (el.attr('id') == "mly") {
        viewer.on('nodechanged', function(node) {
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
                zoom: 15
            })
        });
    }
}

function fadeInCenterElements() {
    $('#back').fadeIn("slow");
    $('.center-panel').fadeIn("slow");
    $('#viewer').fadeIn("slow");
    $(".mly-wrapper").fadeIn("slow");
}

function initMapillaryViewerIcons() {
    $('.glyphicon.glyphicon-resize-full').click(function() {
        var picId = $(this).parent().attr('class').replace('wrapper-', '');
        console.log(picId);
        fadeInCenterElements();
        initMapillaryViewer($('#mly'), picId);
    });

    $('.glyphicon.glyphicon-play').click(function() {
        $(this).hide();
        var playButton = '.' + $(this).parent().attr('class') + ' .domRenderer .SequencePlay';
        $(playButton).click();
    });
}
