import React, { Component } from 'react';
import { render } from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

import { json as requestJson } from 'd3-request';
import index from 'deck.gl';

const MAPBOX_TOKEN = "pk.eyJ1IjoiY3dpbGxlMjAxMiIsImEiOiJjajJxdWJyeXEwMDE5MzNydXF2cm1sbDU1In0.kCKIz6Ivh3EfNOmEfTANOA"; // eslint-disable-line

const DATA_URL = 'http://localhost:9700/data/mapdata.json';

class Root extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viewport: {
                ...DeckGLOverlay.defaultViewport,
                width: 500,
                height: 500
            },
            data: null,
            iconMapping: null
        };

        requestJson(DATA_URL, (error, response) => {
            if (!error) {
                this.setState({ data: response });
            }
        });
        requestJson('http://localhost:9700/data/location-icon-mapping.json', (error, response) => {
            if (!error) {
                this.setState({ iconMapping: response });
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
            var file = hoveredObject.time.split(' at ');
            file = file[0].replace(/\//g, '-') + '.json';
            document.getElementById('tooltip').setAttribute('href', '/graphs.html?dataset=' + (hoveredObject.address).replace(/:/g, '-') + '/' + file + '&sampletime=.25');
        }

        function timeDiff(datetime) {
            var datetime = new Date(datetime).getTime();
            var now = new Date().getTime();
            if (isNaN(datetime)) {
                return "";
            }
            if (datetime < now) {
                var milisec_diff = now - datetime;
            } else {
                var milisec_diff = datetime - now;
            }
            var days = Math.floor(milisec_diff / 1000 / 60 / (60 * 24));
            var date_diff = new Date(milisec_diff);
            if (days > 0) {
                return days + " Days " + (date_diff.getUTCHours()) + " Hours " + (date_diff.getUTCMinutes()) + " Minutes " + (date_diff.getUTCSeconds()) + " Seconds";
            } else {
                if (date_diff.getUTCHours() > 0) {
                    return (date_diff.getUTCHours()) + " Hours " + (date_diff.getUTCMinutes()) + " Minutes " + (date_diff.getUTCSeconds()) + " Seconds";
                } else {
                    return (date_diff.getUTCMinutes()) + " minutes " + (date_diff.getUTCSeconds()) + " seconds ago";
                }
            }
        }

        var updateTime = hoveredObject.time.replace(/at/g, ' ');
        var elapsedTime = timeDiff(updateTime);


        return ( < div id = "tooltip"
            style = {
                { left: x, top: y }
            } >
            <
            div > { hoveredObject.location } < /div>  <
            div > { `Elapsed Time: ${elapsedTime}` } < /div>  <
            div > { `Time Taken: ${hoveredObject.time}` } < /div> <
            div > { `PM2.5: ${hoveredObject.pm25}` } < /div> <
            div > { `PM10: ${hoveredObject.pm10}` } < /div> <
            div > { `CO: ${hoveredObject.COInflammables}` } < /div> <
            div > { `Smoke: ${hoveredObject.smokeMethaneButaneLpg}` } < /div> <
            div > { `CNG: ${hoveredObject.cng}` } < /div> < /
            div >
        );
    }

    render() {
        const { viewport, data, iconMapping, mousePosition, mouseEntered } = this.state;
        if (!data) {
            return null;
        }
        return ( <
            div onMouseMove = { this._onMouseMove.bind(this) }
            onMouseEnter = { this._onMouseEnter.bind(this) }
            onMouseLeave = { this._onMouseLeave.bind(this) } > { this._renderTooltip() } <
            MapGL {...viewport }
            mapStyle = "mapbox://styles/mapbox/satellite-streets-v10"
            onViewportChange = { this._onViewportChange.bind(this) }
            mapboxApiAccessToken = { MAPBOX_TOKEN } >
            <
            DeckGLOverlay viewport = { viewport }
            data = { data }
            iconAtlas = "data/location-icon-atlas.png"
            iconMapping = { iconMapping }
            showCluster = { true }
            mousePosition = { mousePosition }
            mouseEntered = { mouseEntered }
            onHover = { this._onHover.bind(this) }
            />

            <
            /MapGL>

            <
            /div>
        );
    }
}

render( < Root / > , document.getElementById('mapHolder').appendChild(document.createElement('div')));