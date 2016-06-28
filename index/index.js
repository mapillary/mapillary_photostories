//json and thumbnails
var jsonReturned;
var thumbnailURLs = []
//markers
var markerList = [];
var rightMarker;
//maps
var map;
var rightMap;
var CLIENT_ID = "TVBudDVxUkNVVU5BZFQ5QmpKZVlndzoxMjE3N2VmOTE2YzU4OTNj";

// Click handlers
$("#back").click(function() {
    $('.center-panel').fadeOut("slow");
    $('#back').fadeOut("slow");
    var descriptionDiv = $('#img-description').detach();
    $('#mly').empty()
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
        var id = "fullscreen-" + i;
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
    var host =  'https://a.mapillary.com';

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
                $('#story').append("<div id='story-description'><h2>" +
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
    map = L.map(map).setView([0, 0], 20);
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {
        maxZoom: 18,
        attribution: osmAttrib
    });
    map.addLayer(osm);

    var mlyVectorLayerConfig = {
        url: 'https://d2munx5tg0hw47.cloudfront.net/tiles/{z}/{x}/{y}.mapbox',
        maxZoom: 18,
        style: function(feature) {
            var style = {};
            style.color = 'rgba(0, 255, 0, 0.7)';
            style.size = 3;
            return style;
        }
    };

    var mvtSource = new L.TileLayer.MVTSource(mlyVectorLayerConfig);
    map.addLayer(mvtSource);
    var latLon = [lat, lon];

    for (var i = 0; i < jsonReturned.keys.length; i++) {
        var searchKey = jsonReturned.keys[i].key;
        var pathAppend = '/v2/s/' + searchKey + '?client_id=' + CLIENT_ID;
        var host = 'https://a.mapillary.com';

        $.ajax({
            url: host + pathAppend,
            type: 'GET',
            dataType: 'json'
        }).success(function(data) {
            console.log(data);
            var coords = data.coords[0];
            var marker = L.marker({
                lat: coords[1],
                lon: coords[0]
            });
            marker.addTo(map);
            markerList.push(marker)

            var group = new L.featureGroup(markerList);
            map.fitBounds(group.getBounds());
        });
    }
}

function initRightMap(lat, lon, setMap) {
    rightMap = L.map(setMap).setView([0, 0], 17);
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {
        maxZoom: 18,
        attribution: osmAttrib
    });
    rightMap.addLayer(osm);

    var mlyVectorLayerConfig = {
        url: 'https://d2munx5tg0hw47.cloudfront.net/tiles/{z}/{x}/{y}.mapbox',
        maxZoom: 18,
        style: function(feature) {
            var style = {};
            style.color = 'rgba(0, 255, 0, 0.7)';
            style.size = 3;
            return style;
        }
    };

    var mvtSource = new L.TileLayer.MVTSource(mlyVectorLayerConfig);
    rightMap.addLayer(mvtSource);
    var latLon = [lat, lon];
    rightMap.setView(latLon, 15);
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
        console.log(imgDescription);
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
                navigation: false
            });

    viewer.on('nodechanged', function(node) {
        var latLon = [node.latLon.lat, node.latLon.lon]
        if (rightMap != null) {
            rightMap.setView(latLon, 15);
            if (!rightMarker) {
                rightMarker = L.marker(node.latLon).addTo(rightMap)
            } else {
                rightMarker.setLatLng(node.latLon)
            }
        }
        checkForImageDescription(el, node._key);
    });
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
        rightMap.invalidateSize();
    });

    $('.glyphicon.glyphicon-play').click(function() {
        $(this).hide();
        var playButton = '.' + $(this).parent().attr('class') + ' .domRenderer .SequencePlay';
        $(playButton).click();
    });
}
