import React, { Component } from 'react';
import { render } from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

import { csv as requestCsv } from 'd3-request';
import index from 'deck.gl';

//google maps API: AIzaSyAiOePUc6yazb7uJr8pNfNEqxkTnjJGXCY

/*
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAiOePUc6yazb7uJr8pNfNEqxkTnjJGXCY&callback=initMap">
    </script>
*/

/*function codeLatLng(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({
        'latLng': latlng
    }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                console.log(results[1]);
            } else {
                alert('No results found');
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });
}*/

function httpGetAddress(theUrl) {
    //test: https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=AIzaSyAiOePUc6yazb7uJr8pNfNEqxkTnjJGXCY
    //too many requests per day for all data
    //maybe only if in upper percentile?
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoiY3dpbGxlMjAxMiIsImEiOiJjajJxdWJyeXEwMDE5MzNydXF2cm1sbDU1In0.kCKIz6Ivh3EfNOmEfTANOA";

var socket = require('engine.io-client')('ws://ec2-18-220-229-176.us-east-2.compute.amazonaws.com:3002');

socket.on('open', function() {
    socket.on('message', function(data) {
        //console.log(data);
        var newData = String(data);
        if (newData.length > 500) {
            //first message
            newData = JSON.parse(newData);
            //console.log(newData);

            //add data to table:
            var indexDataTableExists = !!document.getElementById('indexDataTable');
            if (indexDataTableExists) {
                for (var i in newData) {
                    var timeStamp = parseInt(newData[i]['_id'].toString().substr(0, 8), 16) * 1000;
                    timeStamp = new Date(timeStamp);
                    timeStamp = String(timeStamp);
                    timeStamp = timeStamp.replace(/GMT-0500/g, '');
                    timeStamp = timeStamp.replace(/EST/g, '');
                    timeStamp = timeStamp.replace(/"/g, "").replace(/'/g, "").replace(/\(|\)/g, "");
                    timeStamp = timeStamp.replace(/Sat/g, '');
                    timeStamp = timeStamp.replace(/Sun/g, '');
                    timeStamp = timeStamp.replace(/Mon/g, '');
                    timeStamp = timeStamp.replace(/Tue/g, '');
                    timeStamp = timeStamp.replace(/Wed/g, '');
                    timeStamp = timeStamp.replace(/Thu/g, '');
                    timeStamp = timeStamp.replace(/Fri/g, '');

                    var long = newData[i]['pos']['lon'];
                    var lat = newData[i]['pos']['lat'];

                    var tr = document.createElement("tr");

                    var td0 = document.createElement("td");
                    var text0 = document.createTextNode(timeStamp);
                    td0.setAttribute("id", i + '-time');
                    td0.appendChild(text0);
                    tr.appendChild(td0);

                    var td1 = document.createElement("td");
                    var text1 = document.createTextNode(String(long));
                    td1.setAttribute("id", i + '-pm25');
                    td1.appendChild(text1);
                    tr.appendChild(td1);

                    var td2 = document.createElement("td");
                    var text2 = document.createTextNode(String(lat));
                    td2.setAttribute("id", i + '-location');
                    td2.appendChild(text2);
                    tr.appendChild(td2);

                    document.getElementById('indexDataTableBody').appendChild(tr);
                }

                /*if (!!document.getElementById('averagePm25')) {
                    document.getElementById('averageHR').innerHTML = parseInt(somenum);
                }
                if (!!document.getElementById('averagePm10')) {
                    document.getElementById('averageSteps').innerHTML = parseInt(somenum);
                }
                if (!!document.getElementById('averageOzone')) {
                    document.getElementById('averageCal').innerHTML = parseInt(somenum);
                }*/

            }

            //VISUALIZATION AND MAPPING HERE

            const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv';

            class Root extends Component {
                constructor(props) {
                    super(props);
                    this.state = {
                        viewport: {
                            ...DeckGLOverlay.defaultViewport,
                            width: 500,
                            height: 500
                        },
                        data: null
                    };

                    requestCsv(DATA_URL, (error, responsedata) => {
                        if (!error) {

                            var response = new Array();
                            console.log(newData);
                            for (var i in newData) {

                                var lng = newData[i]['pos']['lon'];
                                var lat = newData[i]['pos']['lat'];

                                var positionArray = new Array();

                                positionArray.push(lng);
                                positionArray.push(lat);

                                response.push(positionArray);

                            }

                            console.log(response);
                            this.setState({ data: response });

                        }
                    });
                    this._onHover = this._onHover.bind(this);
                }

                componentDidMount() {
                    window.addEventListener('resize', this._resize.bind(this));
                    this._resize();
                }

                _resize() {
                    this._onViewportChange({
                        width: window.innerWidth,
                        height: window.innerHeight
                    });
                }

                _onViewportChange(viewport) {
                    this.setState({
                        viewport: {...this.state.viewport, ...viewport }
                    });
                }

                _onHover({ x, y, object }) {
                    this.setState({ x, y, hoveredObject: object });
                }

                _onMouseMove(evt) {
                    if (evt.nativeEvent) {
                        this.setState({ mousePosition: [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY] });
                    }
                }

                _onMouseEnter() {
                    this.setState({ mouseEntered: true });
                }

                _onMouseLeave() {
                    this.setState({ mouseEntered: false });
                }

                _renderTooltip() {
                    const { x, y, hoveredObject } = this.state;

                    if (!hoveredObject) {
                        return null;
                    }

                    var tooltipExists = !!document.getElementById('tooltip');

                    var hoveredObjectHTML = hoveredObject.address;

                    if (tooltipExists) {
                        document.getElementById('tooltip').style.position = "absolute";
                        document.getElementById('tooltip').style.zIndex = 99999;
                        document.getElementById('tooltip').style.color = '#fff';
                        document.getElementById('tooltip').style.background = 'rgba(0, 0, 0, 0.8)';
                        document.getElementById('tooltip').style.padding = '4px';
                        document.getElementById('tooltip').style.fontSize = '10px';
                        document.getElementById('tooltip').style.maxWidth = '300px';
                        document.getElementById('tooltip').style.left = x + 'px';
                        document.getElementById('tooltip').style.top = y + 'px';
                        document.getElementById('tooltip').style.cursor = 'pointer';
                        document.getElementById('tooltip').setAttribute('text-decoration', 'none!important');
                        //console.log(hoveredObject);
                        //codeLatLng(hoveredObject.centroid[1], hoveredObject.centroid[0]);
                    }

                    var locationPlace;
                    var timeSpent = String(Math.round((((hoveredObject.points.length * 2) / 60) * 100) / 100)) + " hours";

                    if (hoveredObject.points.length == 252) {
                        locationPlace = "Georgetown University Student Center";
                    } else if (hoveredObject.points.length == 37) {
                        locationPlace = "Georgetown University Library";
                    } else if (hoveredObject.points.length == 108) {
                        locationPlace = "Sheraton Pentagon City";
                    } else if (hoveredObject.points.length == 48) {
                        locationPlace = "Air Force Memorial";
                    } else if (hoveredObject.points.length == 50) {
                        locationPlace = "Dama Cafe";
                    } else if (hoveredObject.points.length == 30) {
                        locationPlace = "US Court of federal Claims";
                    } else if (hoveredObject.points.length == 47) {
                        locationPlace = "Hyatt Rosyln Suites";
                    } else if (hoveredObject.points.length == 28) {
                        locationPlace = "Miriam's Kitchen";
                    } else if (hoveredObject.points.length == 25) {
                        locationPlace = "Federal Reserve Building";
                    } else if (hoveredObject.points.length > 15) {
                        locationPlace = "Unlisted Location";
                    } else {
                        locationPlace = "In transit";
                    }

                    return ( < div id = "tooltip"
                        style = {
                            { left: x, top: y }
                        } >
                        <
                        div > { 'Index: ' + hoveredObject.index } < /div> <
                        div > { 'Longitude: ' + hoveredObject.centroid[0] } < /div> <
                        div > { 'Latitude: ' + hoveredObject.centroid[1] } < /div> <
                        div > { 'Location: ' + locationPlace } < /div> <
                        div > { 'Time spent: ' + timeSpent } < /div> <
                        div > { 'Points: ' + hoveredObject.points.length } < /div> <
                        div > { 'Test value: ' + hoveredObject } < /div>  < /
                        div >
                    );
                }


                render() {
                    const { viewport, data, iconMapping, mousePosition, mouseEntered } = this.state;

                    return ( <
                        div onMouseMove = { this._onMouseMove.bind(this) }
                        onMouseEnter = { this._onMouseEnter.bind(this) }
                        onMouseLeave = { this._onMouseLeave.bind(this) } > { this._renderTooltip() } <
                        MapGL {...viewport }
                        mapStyle = "mapbox://styles/mapbox/dark-v9"
                        onViewportChange = { this._onViewportChange.bind(this) }
                        mapboxApiAccessToken = { MAPBOX_TOKEN } >
                        <
                        DeckGLOverlay viewport = { viewport }
                        data = { data || [] }
                        mousePosition = { mousePosition }
                        mouseEntered = { mouseEntered }
                        onHover = { this._onHover.bind(this) }
                        /> < /
                        MapGL >
                        <
                        /div>
                    );
                }
            }

            render( < Root / > , document.getElementById('mapHolder').appendChild(document.createElement('div')));


        } else {
            //update message

            newData = JSON.parse(newData);
            //console.log(newData);

        }

    });
    socket.on('close', function() {});
});