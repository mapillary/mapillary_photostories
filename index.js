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
    $('#story #story-description .glyphicon.glyphicon-resize-full').each(function(i, el) {
        var id = "fullscreen-" + i;;
        $(el).attr('id', id);
    });

    $('.story-item').each(function(i, el) {
        var picId = $(el).find('img').attr('src').replace("https://d1cuyjsrcm0gby.cloudfront.net/", '');
        picId = picId.replace("/thumb-2048.jpg", '');
        var id = "story-item-" + picId;
        $(el).attr('id', id);
        var fullscreenId = '#fullscreen-' + picId;
        $(fullscreenId).attr('id', fullscreenId);
        initMapillaryViewer($(el));
        var newDivName = 'wrapper-' + picId;
        $(el).wrap("<div class='" + newDivName + "' style='position: relative;'></div>");
        newDivId = '.' + newDivName;
        $(newDivId).append('<span class="glyphicon glyphicon-resize-full"></span>');
        $(newDivId).append('<span class="glyphicon glyphicon-play"></span>');
    });
    initMapillaryViewerIcons();
}


//Helper functions
function initPage() {
    $('document').ready(function() {
        $(window).scrollTop(0);

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
        initMapillaryViewerIcons();
    });

    $(window).scroll(function(i) {
        var scrollVar = $(window).scrollTop();
        $('#description').css("opacity", 1 - scrollVar / 250);
        $('#icon img').css("opacity", 1 - scrollVar / 250);
        $('.background').css("opacity", 1 - scrollVar / 500);
        $('#story').css("opacity", scrollVar / 1000);
    });
}

var sequenceIds = [];

function getThumbnailForSequence(sequenceId, length, currentIndex) {
    sequenceIds.push(sequenceId);
    var pathAppend = '/v2/s/' + sequenceId + '?client_id=' + CLIENT_ID;
    var host = 'https://a.mapillary.com';

    $.ajax({
        url: host + pathAppend,
        type: 'GET',
        dataType: 'json'
    }).success(function(data) {
        thumbnailURLs.push("https://d1cuyjsrcm0gby.cloudfront.net/" + data.keys[0] +
            "/thumb-2048.jpg");
        if (currentIndex == length - 1) {
            for (var i = 0; i < thumbnailURLs.length; i++) {
                var id = thumbnailURLs[i].replace('https://d1cuyjsrcm0gby.cloudfront.net/', '');
                id = id.replace('/thumb-2048.jpg', '');
                var description = "";
                for (var z = 0; z < jsonReturned.keys.length; z++) {
                    if (jsonReturned.keys[z].key === sequenceIds[i]) {
                        description = jsonReturned.keys[i].description
                    }
                }
                $('#story').append("<div id='story-description'><h2 id=\'" + jsonReturned.keys[i].title.replace(' ', '-') + "\'>" +
                    description +
                    "</h2><br><br><p id='img-description'></p><div class='story-item'> <img src='" +
                    thumbnailURLs[i] +
                    "'/></div><hr></div>");
            }
            initAllViewers();
            initMap(53.0, 53.0, 'map');
        }
    });
}

function initMap(lat, lon, map) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwaWxsYXJ5IiwiYSI6ImNpanB0NmN1bDAwOTF2dG03enM3ZHRocDcifQ.Z6wgtnyRBO0TuY3Ak1tVLQ';
    map = new mapboxgl.Map({
        container: map, // container id
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
        map.fitBounds(bounds);
    });
}


function initRightMap(lat, lon, setMap) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwaWxsYXJ5IiwiYSI6ImNpanB0NmN1bDAwOTF2dG03enM3ZHRocDcifQ.Z6wgtnyRBO0TuY3Ak1tVLQ';
    rightMap = new mapboxgl.Map({
        container: setMap, // container id
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
                'line-opacity': 0.6,
                'line-color': 'rgb(53, 175, 109)',
                'line-width': 2
            }
        }, 'markers')
    })

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
    } else {
        descriptionElement.hide();
    }
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
        fadeInCenterElements();
        initMapillaryViewer($('#mly'), picId);
    });

    $('.glyphicon.glyphicon-play').click(function() {
        $(this).hide();
        var playButton = '.' + $(this).parent().attr('class') + ' .domRenderer .SequencePlay';
        $(playButton).click();
    });
}
