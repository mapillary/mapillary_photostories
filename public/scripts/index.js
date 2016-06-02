var viewer;
var marker;
var map;
var firstPageClosed = false;

initPage();
initMap(53.0, 53.0);



//Click handlers
$('#view-map').click(function() {
    replaceDescriptionWithMap();
    map.invalidateSize();
});

$("#back").click(function() {
    if($("#map").is(':visible')) {
        $("#close-map").click();
    }

    $('.center-panel').fadeOut("slow");
    $('#back').fadeOut("slow");

    $('.grid').fadeIn("slow");
    $('.grid-item').fadeIn("slow");

    $('.grid').masonry();
    var descriptionDiv = $('#img-description').detach();
    $('#mly').empty().append(descriptionDiv);
});

$("#close-map").click(function() {
    $("#map").fadeOut("slow");
    $('#close-map').fadeOut('slow');

    $("#right-description").fadeIn("slow");
    $('#back').fadeIn("slow");
});


$('.grid-item').click(function() {
    var $this = $(this);
    fadeInCenterElements();

    var requestString = getRequestString($this);
    setSequenceTitleAndDescription(requestString);
    initMapillaryViewer($this);
    wrapImagesWithLinks($this);

    $('.grid').masonry();
});


$('body').click(function() {
    if(!firstPageClosed) {
        closeFirstPage();
    }
});

function initPage() {
    $('#description').fadeIn( "slow" );
    $('#icon img').fadeIn( "slow" );
    $('.grid').masonry({
        itemSelector: '.grid-item',
        fitWidth: true,
        transitionDuration: '0.3s'

    });
}

function closeFirstPage() {
    firstPageClosed = true;
    $("#description").fadeOut();
    $('.grid').fadeIn("slow");
    $('.grid-item').fadeIn("slow");
    $('.grid').masonry();
}

function replaceDescriptionWithMap() {
    $('#right-description').fadeOut('slow');
    $('#close-map').fadeIn('slow');
    $('#map').fadeIn('slow');
}

function initMap(lat, lon) {
    map = L.map('map').setView([0, 0], 10);
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib});
    map.addLayer(osm);

    var mlyVectorLayerConfig = {
        url: 'https://d2munx5tg0hw47.cloudfront.net/tiles/{z}/{x}/{y}.mapbox',
        maxZoom: 18,
        style: function (feature) {
            var style = {};
            style.color = 'rgba(0, 255, 0, 0.7)';
            style.size = 3;
            return style;
        }
    };

    var mvtSource = new L.TileLayer.MVTSource(mlyVectorLayerConfig);
    map.addLayer(mvtSource);
    var latLon = [lat, lon];
    map.setView(latLon, 15);
    marker = L.marker({
        lat: latLon[0],
        lon: latLon[1]
    });
    marker.addTo(map);
}


function checkForImageDescription(picId) {
    var dataRequest = {
        "picId" : picId
    };
    dataRequest.picId = picId;
    var requestString = JSON.stringify(dataRequest);
    $.ajax({
        method: 'get',
        url: window.location.origin + '/imginfo',
        contentType: 'application/json; charset=utf-8',
        data: requestString,
        processData: false,
        dataType: 'json'
    }).done(function(data){
        imgDescription = data.description;
        if(imgDescription != "") {
            $("#img-description").show();
            $("#img-description p").show();
            $("#img-description p" ).text(imgDescription);
        } else {
            $("#img-description").hide();
        }
    });
}

function initMapillaryViewer(el) {
    var picId =  el.find('img').attr('src').replace("https://d1cuyjsrcm0gby.cloudfront.net/", '');
    picId = picId.replace("/thumb-2048.jpg", '');

    viewer = new Mapillary
        .Viewer('mly',
        'TVBudDVxUkNVVU5BZFQ5QmpKZVlndzoxMjE3N2VmOTE2YzU4OTNj',
        picId, {cover: false, baseImageSize: Mapillary.ImageSize.Size2048, maxImageSize: Mapillary.ImageSize.Size2048});

    viewer.on('nodechanged', function (node) {
        var latLon = [node.latLon.lat, node.latLon.lon]
        if(map != null) {
            map.setView(latLon, 15)

            if (!marker) {
                marker = L.marker(node.latLon).addTo(map)

            } else {
                marker.setLatLng(node.latLon)
            }

            checkForImageDescription(viewer.getComponent("image")._navigator._keyRequested$.value);
        }});

}

function setSequenceTitleAndDescription(requestString) {
    $.ajax({
        method: 'get',
        url: window.location.origin + '/storyinfo',
        contentType: 'application/json; charset=utf-8',
        data: requestString,
        processData: false,
        dataType: 'json'
    }).done(function(data){
        var title = data.title;
        var description = data.description;
        $("#description-text h1").text(title);
        $("#description-text p").text(description);
    });
}

function getRequestString(el) {
    var picId = el.find('img').attr('src').replace("https://d1cuyjsrcm0gby.cloudfront.net/", '');
    picId = picId.replace("/thumb-2048.jpg", '');

    var dataRequest = {
        "picId" : picId
    };
    dataRequest.picId = picId;
    var requestString = JSON.stringify(dataRequest);
    return requestString;
}

function fadeInCenterElements() {
    $('#back').fadeIn("slow");
    $('.center-panel').fadeIn("slow");
    $('#left-img ').fadeIn("slow");
    $('#viewer').fadeIn("slow");
    $(".mly-wrapper").fadeIn("slow");
    $('#right-description').fadeIn("slow");
    $('.grid').fadeOut("fast");
    $('.grid').masonry();
}

function wrapImagesWithLinks(el) {
    var picId =  el.find('img').attr('src').replace("https://d1cuyjsrcm0gby.cloudfront.net/", '');
    picId = picId.replace("/thumb-2048.jpg", '');

    var fullScreenLinkHTML = "<a href='story/picId'></a></div>";
    fullScreenLinkHTML = fullScreenLinkHTML.replace("picId", picId);

    var mapillaryLinkHTML = "<a href='http://www.mapillary.com/map/im/picId/photo'></a>"
    mapillaryLinkHTML = mapillaryLinkHTML.replace("picId", picId);

    $("#fullscreen").wrap(fullScreenLinkHTML);
    $("#mapillary").wrap(mapillaryLinkHTML);
}