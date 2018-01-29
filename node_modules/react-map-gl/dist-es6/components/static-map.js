var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import autobind from '../utils/autobind';

import { getInteractiveLayerIds, setDiffStyle } from '../utils/style-utils';
import isImmutableMap from '../utils/is-immutable-map';

import WebMercatorViewport from 'viewport-mercator-project';

import Mapbox from '../mapbox/mapbox';

/* eslint-disable max-len */
var TOKEN_DOC_URL = 'https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens';
var NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
/* eslint-disable max-len */

function noop() {}

var UNAUTHORIZED_ERROR_CODE = 401;

var propTypes = Object.assign({}, Mapbox.propTypes, {
  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: PropTypes.bool,
  /** Whether the map is visible */
  visible: PropTypes.bool
});

var defaultProps = Object.assign({}, Mapbox.defaultProps, {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  preventStyleDiffing: false,
  visible: true
});

var childContextTypes = {
  viewport: PropTypes.instanceOf(WebMercatorViewport)
};

var StaticMap = function (_PureComponent) {
  _inherits(StaticMap, _PureComponent);

  _createClass(StaticMap, null, [{
    key: 'supported',
    value: function supported() {
      return Mapbox && Mapbox.supported();
    }
  }]);

  function StaticMap(props) {
    _classCallCheck(this, StaticMap);

    var _this = _possibleConstructorReturn(this, (StaticMap.__proto__ || Object.getPrototypeOf(StaticMap)).call(this, props));

    _this._queryParams = {};
    if (!StaticMap.supported()) {
      _this.componentDidMount = noop;
      _this.componentWillReceiveProps = noop;
      _this.componentDidUpdate = noop;
      _this.componentWillUnmount = noop;
    }
    _this.state = {
      accessTokenInvalid: false
    };
    autobind(_this);
    return _this;
  }

  _createClass(StaticMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new WebMercatorViewport(this.props)
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var mapStyle = this.props.mapStyle;


      this._mapbox = new Mapbox(Object.assign({}, this.props, {
        container: this._mapboxMap,
        onError: this._mapboxMapError,
        mapStyle: isImmutableMap(mapStyle) ? mapStyle.toJS() : mapStyle
      }));
      this._map = this._mapbox.getMap();
      this._updateQueryParams(mapStyle);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this._mapbox.setProps(newProps);
      this._updateMapStyle(this.props, newProps);

      // this._updateMapViewport(this.props, newProps);

      // Save width/height so that we can check them in componentDidUpdate
      this.setState({
        width: this.props.width,
        height: this.props.height
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // Since Mapbox's map.resize() reads size from DOM
      // we must wait to read size until after render (i.e. here in "didUpdate")
      this._updateMapSize(this.state, this.props);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._mapbox.finalize();
      this._mapbox = null;
      this._map = null;
    }

    // External apps can access map this way

  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map;
    }

    /** Uses Mapbox's
      * queryRenderedFeatures API to find features at point or in a bounding box.
      * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
      * To query only some of the layers, set the `interactive` property in the
      * layer style to `true`.
      * @param {[Number, Number]|[[Number, Number], [Number, Number]]} geometry -
      *   Point or an array of two points defining the bounding box
      * @param {Object} parameters - query options
      */

  }, {
    key: 'queryRenderedFeatures',
    value: function queryRenderedFeatures(geometry, parameters) {
      var queryParams = parameters || this._queryParams;
      if (queryParams.layers && queryParams.layers.length === 0) {
        return [];
      }
      return this._map.queryRenderedFeatures(geometry, queryParams);
    }

    // Hover and click only query layers whose interactive property is true

  }, {
    key: '_updateQueryParams',
    value: function _updateQueryParams(mapStyle) {
      var interactiveLayerIds = getInteractiveLayerIds(mapStyle);
      this._queryParams = { layers: interactiveLayerIds };
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;

      if (sizeChanged) {
        this._map.resize();
        // this._callOnChangeViewport(this._map.transform);
      }
    }
  }, {
    key: '_updateMapStyle',
    value: function _updateMapStyle(oldProps, newProps) {
      var mapStyle = newProps.mapStyle;
      var oldMapStyle = oldProps.mapStyle;
      if (mapStyle !== oldMapStyle) {
        if (isImmutableMap(mapStyle)) {
          if (this.props.preventStyleDiffing) {
            this._map.setStyle(mapStyle.toJS());
          } else {
            setDiffStyle(oldMapStyle, mapStyle, this._map);
          }
        } else {
          this._map.setStyle(mapStyle);
        }
        this._updateQueryParams(mapStyle);
      }
    }
  }, {
    key: '_mapboxMapLoaded',
    value: function _mapboxMapLoaded(ref) {
      this._mapboxMap = ref;
    }

    // Handle map error

  }, {
    key: '_mapboxMapError',
    value: function _mapboxMapError(evt) {
      var statusCode = evt.error && evt.error.status || evt.status;
      if (statusCode === UNAUTHORIZED_ERROR_CODE && !this.state.accessTokenInvalid) {
        // Mapbox throws unauthorized error - invalid token
        console.error(NO_TOKEN_WARNING); // eslint-disable-line
        this.setState({ accessTokenInvalid: true });
      }
    }
  }, {
    key: '_renderNoTokenWarning',
    value: function _renderNoTokenWarning() {
      if (this.state.accessTokenInvalid) {
        var style = {
          position: 'absolute',
          left: 0,
          top: 0
        };
        return createElement('div', { key: 'warning', id: 'no-token-warning', style: style }, [createElement('h3', { key: 'header' }, NO_TOKEN_WARNING), createElement('div', { key: 'text' }, 'For information on setting up your basemap, read'), createElement('a', { key: 'link', href: TOKEN_DOC_URL }, 'Note on Map Tokens')]);
      }

      return null;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          className = _props.className,
          width = _props.width,
          height = _props.height,
          style = _props.style,
          visible = _props.visible;

      var mapContainerStyle = Object.assign({}, style, { width: width, height: height, position: 'relative' });
      var mapStyle = Object.assign({}, style, {
        width: width,
        height: height,
        visibility: visible ? 'visible' : 'hidden'
      });
      var overlayContainerStyle = {
        position: 'absolute',
        left: 0,
        top: 0,
        width: width,
        height: height,
        overflow: 'hidden'
      };

      // Note: a static map still handles clicks and hover events
      return createElement('div', {
        key: 'map-container',
        style: mapContainerStyle,
        children: [createElement('div', {
          key: 'map-mapbox',
          ref: this._mapboxMapLoaded,
          style: mapStyle,
          className: className
        }), createElement('div', {
          key: 'map-overlays',
          // Same as interactive map's overlay container
          className: 'overlays',
          style: overlayContainerStyle,
          children: this.props.children
        }), this._renderNoTokenWarning()]
      });
    }
  }]);

  return StaticMap;
}(PureComponent);

export default StaticMap;


StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
StaticMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3N0YXRpYy1tYXAuanMiXSwibmFtZXMiOlsiUHVyZUNvbXBvbmVudCIsImNyZWF0ZUVsZW1lbnQiLCJQcm9wVHlwZXMiLCJhdXRvYmluZCIsImdldEludGVyYWN0aXZlTGF5ZXJJZHMiLCJzZXREaWZmU3R5bGUiLCJpc0ltbXV0YWJsZU1hcCIsIldlYk1lcmNhdG9yVmlld3BvcnQiLCJNYXBib3giLCJUT0tFTl9ET0NfVVJMIiwiTk9fVE9LRU5fV0FSTklORyIsIm5vb3AiLCJVTkFVVEhPUklaRURfRVJST1JfQ09ERSIsInByb3BUeXBlcyIsIk9iamVjdCIsImFzc2lnbiIsIm1hcFN0eWxlIiwib25lT2ZUeXBlIiwic3RyaW5nIiwib2JqZWN0IiwicHJldmVudFN0eWxlRGlmZmluZyIsImJvb2wiLCJ2aXNpYmxlIiwiZGVmYXVsdFByb3BzIiwiY2hpbGRDb250ZXh0VHlwZXMiLCJ2aWV3cG9ydCIsImluc3RhbmNlT2YiLCJTdGF0aWNNYXAiLCJzdXBwb3J0ZWQiLCJwcm9wcyIsIl9xdWVyeVBhcmFtcyIsImNvbXBvbmVudERpZE1vdW50IiwiY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsImNvbXBvbmVudERpZFVwZGF0ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwic3RhdGUiLCJhY2Nlc3NUb2tlbkludmFsaWQiLCJfbWFwYm94IiwiY29udGFpbmVyIiwiX21hcGJveE1hcCIsIm9uRXJyb3IiLCJfbWFwYm94TWFwRXJyb3IiLCJ0b0pTIiwiX21hcCIsImdldE1hcCIsIl91cGRhdGVRdWVyeVBhcmFtcyIsIm5ld1Byb3BzIiwic2V0UHJvcHMiLCJfdXBkYXRlTWFwU3R5bGUiLCJzZXRTdGF0ZSIsIndpZHRoIiwiaGVpZ2h0IiwiX3VwZGF0ZU1hcFNpemUiLCJmaW5hbGl6ZSIsImdlb21ldHJ5IiwicGFyYW1ldGVycyIsInF1ZXJ5UGFyYW1zIiwibGF5ZXJzIiwibGVuZ3RoIiwicXVlcnlSZW5kZXJlZEZlYXR1cmVzIiwiaW50ZXJhY3RpdmVMYXllcklkcyIsIm9sZFByb3BzIiwic2l6ZUNoYW5nZWQiLCJyZXNpemUiLCJvbGRNYXBTdHlsZSIsInNldFN0eWxlIiwicmVmIiwiZXZ0Iiwic3RhdHVzQ29kZSIsImVycm9yIiwic3RhdHVzIiwiY29uc29sZSIsInN0eWxlIiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwia2V5IiwiaWQiLCJocmVmIiwiY2xhc3NOYW1lIiwibWFwQ29udGFpbmVyU3R5bGUiLCJ2aXNpYmlsaXR5Iiwib3ZlcmxheUNvbnRhaW5lclN0eWxlIiwib3ZlcmZsb3ciLCJjaGlsZHJlbiIsIl9tYXBib3hNYXBMb2FkZWQiLCJfcmVuZGVyTm9Ub2tlbldhcm5pbmciLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVFBLGFBQVIsRUFBdUJDLGFBQXZCLFFBQTJDLE9BQTNDO0FBQ0EsT0FBT0MsU0FBUCxNQUFzQixZQUF0QjtBQUNBLE9BQU9DLFFBQVAsTUFBcUIsbUJBQXJCOztBQUVBLFNBQVFDLHNCQUFSLEVBQWdDQyxZQUFoQyxRQUFtRCxzQkFBbkQ7QUFDQSxPQUFPQyxjQUFQLE1BQTJCLDJCQUEzQjs7QUFFQSxPQUFPQyxtQkFBUCxNQUFnQywyQkFBaEM7O0FBRUEsT0FBT0MsTUFBUCxNQUFtQixrQkFBbkI7O0FBRUE7QUFDQSxJQUFNQyxnQkFBZ0IseUZBQXRCO0FBQ0EsSUFBTUMsbUJBQW1CLHlEQUF6QjtBQUNBOztBQUVBLFNBQVNDLElBQVQsR0FBZ0IsQ0FBRTs7QUFFbEIsSUFBTUMsMEJBQTBCLEdBQWhDOztBQUVBLElBQU1DLFlBQVlDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCUCxPQUFPSyxTQUF6QixFQUFvQztBQUNwRDtBQUNBRyxZQUFVZCxVQUFVZSxTQUFWLENBQW9CLENBQzVCZixVQUFVZ0IsTUFE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LEVBQWdCc0IsVUFBVSxVQUExQixFQUF6QixDQUExQjtBQUNBLFVBQU16RCxXQUFXRixPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQnlELEtBQWxCLEVBQXlCO0FBQ3hDdEIsb0JBRHdDO0FBRXhDQyxzQkFGd0M7QUFHeEM4QixvQkFBWTNELFVBQVUsU0FBVixHQUFzQjtBQUhNLE9BQXpCLENBQWpCO0FBS0EsVUFBTTRELHdCQUF3QjtBQUM1QlQsa0JBQVUsVUFEa0I7QUFFNUJDLGNBQU0sQ0FGc0I7QUFHNUJDLGFBQUssQ0FIdUI7QUFJNUJ6QixvQkFKNEI7QUFLNUJDLHNCQUw0QjtBQU01QmdDLGtCQUFVO0FBTmtCLE9BQTlCOztBQVNBO0FBQ0EsYUFDRWxGLGNBQWMsS0FBZCxFQUFxQjtBQUNuQjJFLGFBQUssZUFEYztBQUVuQkosZUFBT1EsaUJBRlk7QUFHbkJJLGtCQUFVLENBQ1JuRixjQUFjLEtBQWQsRUFBcUI7QUFDbkIyRSxlQUFLLFlBRGM7QUFFbkJWLGVBQUssS0FBS21CLGdCQUZTO0FBR25CYixpQkFBT3hELFFBSFk7QUFJbkIrRDtBQUptQixTQUFyQixDQURRLEVBT1I5RSxjQUFjLEtBQWQsRUFBcUI7QUFDbkIyRSxlQUFLLGNBRGM7QUFFbkI7QUFDQUcscUJBQVcsVUFIUTtBQUluQlAsaUJBQU9VLHFCQUpZO0FBS25CRSxvQkFBVSxLQUFLdkQsS0FBTCxDQUFXdUQ7QUFMRixTQUFyQixDQVBRLEVBY1IsS0FBS0UscUJBQUwsRUFkUTtBQUhTLE9BQXJCLENBREY7QUFzQkQ7Ozs7RUFoTW9DdEYsYTs7ZUFBbEIyQixTOzs7QUFtTXJCQSxVQUFVNEQsV0FBVixHQUF3QixXQUF4QjtBQUNBNUQsVUFBVWQsU0FBVixHQUFzQkEsU0FBdEI7QUFDQWMsVUFBVUosWUFBVixHQUF5QkEsWUFBekI7QUFDQUksVUFBVUgsaUJBQVYsR0FBOEJBLGlCQUE5QiIsImZpbGUiOiJzdGF0aWMtbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cbmltcG9ydCB7UHVyZUNvbXBvbmVudCwgY3JlYXRlRWxlbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi91dGlscy9hdXRvYmluZCc7XG5cbmltcG9ydCB7Z2V0SW50ZXJhY3RpdmVMYXllcklkcywgc2V0RGlmZlN0eWxlfSBmcm9tICcuLi91dGlscy9zdHlsZS11dGlscyc7XG5pbXBvcnQgaXNJbW11dGFibGVNYXAgZnJvbSAnLi4vdXRpbHMvaXMtaW1tdXRhYmxlLW1hcCc7XG5cbmltcG9ydCBXZWJNZXJjYXRvclZpZXdwb3J0IGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuXG5pbXBvcnQgTWFwYm94IGZyb20gJy4uL21hcGJveC9tYXBib3gnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG5jb25zdCBUT0tFTl9ET0NfVVJMID0gJ2h0dHBzOi8vdWJlci5naXRodWIuaW8vcmVhY3QtbWFwLWdsLyMvRG9jdW1lbnRhdGlvbi9nZXR0aW5nLXN0YXJ0ZWQvYWJvdXQtbWFwYm94LXRva2Vucyc7XG5jb25zdCBOT19UT0tFTl9XQVJOSU5HID0gJ0EgdmFsaWQgQVBJIGFjY2VzcyB0b2tlbiBpcyByZXF1aXJlZCB0byB1c2UgTWFwYm94IGRhdGEnO1xuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuY29uc3QgVU5BVVRIT1JJWkVEX0VSUk9SX0NPREUgPSA0MDE7XG5cbmNvbnN0IHByb3BUeXBlcyA9IE9iamVjdC5hc3NpZ24oe30sIE1hcGJveC5wcm9wVHlwZXMsIHtcbiAgLyoqIFRoZSBNYXBib3ggc3R5bGUuIEEgc3RyaW5nIHVybCBvciBhIE1hcGJveEdMIHN0eWxlIEltbXV0YWJsZS5NYXAgb2JqZWN0LiAqL1xuICBtYXBTdHlsZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgUHJvcFR5cGVzLnN0cmluZyxcbiAgICBQcm9wVHlwZXMub2JqZWN0XG4gIF0pLFxuICAvKiogVGhlcmUgYXJlIGtub3duIGlzc3VlcyB3aXRoIHN0eWxlIGRpZmZpbmcuIEFzIHN0b3BnYXAsIGFkZCBvcHRpb24gdG8gcHJldmVudCBzdHlsZSBkaWZmaW5nLiAqL1xuICBwcmV2ZW50U3R5bGVEaWZmaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgLyoqIFdoZXRoZXIgdGhlIG1hcCBpcyB2aXNpYmxlICovXG4gIHZpc2libGU6IFByb3BUeXBlcy5ib29sXG59KTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgTWFwYm94LmRlZmF1bHRQcm9wcywge1xuICBtYXBTdHlsZTogJ21hcGJveDovL3N0eWxlcy9tYXBib3gvbGlnaHQtdjgnLFxuICBwcmV2ZW50U3R5bGVEaWZmaW5nOiBmYWxzZSxcbiAgdmlzaWJsZTogdHJ1ZVxufSk7XG5cbmNvbnN0IGNoaWxkQ29udGV4dFR5cGVzID0ge1xuICB2aWV3cG9ydDogUHJvcFR5cGVzLmluc3RhbmNlT2YoV2ViTWVyY2F0b3JWaWV3cG9ydClcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRpY01hcCBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuICBzdGF0aWMgc3VwcG9ydGVkKCkge1xuICAgIHJldHVybiBNYXBib3ggJiYgTWFwYm94LnN1cHBvcnRlZCgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fcXVlcnlQYXJhbXMgPSB7fTtcbiAgICBpZiAoIVN0YXRpY01hcC5zdXBwb3J0ZWQoKSkge1xuICAgICAgdGhpcy5jb21wb25lbnREaWRNb3VudCA9IG5vb3A7XG4gICAgICB0aGlzLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSBub29wO1xuICAgICAgdGhpcy5jb21wb25lbnREaWRVcGRhdGUgPSBub29wO1xuICAgICAgdGhpcy5jb21wb25lbnRXaWxsVW5tb3VudCA9IG5vb3A7XG4gICAgfVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBhY2Nlc3NUb2tlbkludmFsaWQ6IGZhbHNlXG4gICAgfTtcbiAgICBhdXRvYmluZCh0aGlzKTtcbiAgfVxuXG4gIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlld3BvcnQ6IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IHttYXBTdHlsZX0gPSB0aGlzLnByb3BzO1xuXG4gICAgdGhpcy5fbWFwYm94ID0gbmV3IE1hcGJveChPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICBjb250YWluZXI6IHRoaXMuX21hcGJveE1hcCxcbiAgICAgIG9uRXJyb3I6IHRoaXMuX21hcGJveE1hcEVycm9yLFxuICAgICAgbWFwU3R5bGU6IGlzSW1tdXRhYmxlTWFwKG1hcFN0eWxlKSA/IG1hcFN0eWxlLnRvSlMoKSA6IG1hcFN0eWxlXG4gICAgfSkpO1xuICAgIHRoaXMuX21hcCA9IHRoaXMuX21hcGJveC5nZXRNYXAoKTtcbiAgICB0aGlzLl91cGRhdGVRdWVyeVBhcmFtcyhtYXBTdHlsZSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5fbWFwYm94LnNldFByb3BzKG5ld1Byb3BzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBTdHlsZSh0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICAvLyB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydCh0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICAvLyBTYXZlIHdpZHRoL2hlaWdodCBzbyB0aGF0IHdlIGNhbiBjaGVjayB0aGVtIGluIGNvbXBvbmVudERpZFVwZGF0ZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgd2lkdGg6IHRoaXMucHJvcHMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgLy8gU2luY2UgTWFwYm94J3MgbWFwLnJlc2l6ZSgpIHJlYWRzIHNpemUgZnJvbSBET01cbiAgICAvLyB3ZSBtdXN0IHdhaXQgdG8gcmVhZCBzaXplIHVudGlsIGFmdGVyIHJlbmRlciAoaS5lLiBoZXJlIGluIFwiZGlkVXBkYXRlXCIpXG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZSh0aGlzLnN0YXRlLCB0aGlzLnByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX21hcGJveC5maW5hbGl6ZSgpO1xuICAgIHRoaXMuX21hcGJveCA9IG51bGw7XG4gICAgdGhpcy5fbWFwID0gbnVsbDtcbiAgfVxuXG4gIC8vIEV4dGVybmFsIGFwcHMgY2FuIGFjY2VzcyBtYXAgdGhpcyB3YXlcbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICAvKiogVXNlcyBNYXBib3gnc1xuICAgICogcXVlcnlSZW5kZXJlZEZlYXR1cmVzIEFQSSB0byBmaW5kIGZlYXR1cmVzIGF0IHBvaW50IG9yIGluIGEgYm91bmRpbmcgYm94LlxuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvYXBpLyNNYXAjcXVlcnlSZW5kZXJlZEZlYXR1cmVzXG4gICAgKiBUbyBxdWVyeSBvbmx5IHNvbWUgb2YgdGhlIGxheWVycywgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLlxuICAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfFtbTnVtYmVyLCBOdW1iZXJdLCBbTnVtYmVyLCBOdW1iZXJdXX0gZ2VvbWV0cnkgLVxuICAgICogICBQb2ludCBvciBhbiBhcnJheSBvZiB0d28gcG9pbnRzIGRlZmluaW5nIHRoZSBib3VuZGluZyBib3hcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbWV0ZXJzIC0gcXVlcnkgb3B0aW9uc1xuICAgICovXG4gIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhnZW9tZXRyeSwgcGFyYW1ldGVycykge1xuICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gcGFyYW1ldGVycyB8fCB0aGlzLl9xdWVyeVBhcmFtcztcbiAgICBpZiAocXVlcnlQYXJhbXMubGF5ZXJzICYmIHF1ZXJ5UGFyYW1zLmxheWVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZ2VvbWV0cnksIHF1ZXJ5UGFyYW1zKTtcbiAgfVxuXG4gIC8vIEhvdmVyIGFuZCBjbGljayBvbmx5IHF1ZXJ5IGxheWVycyB3aG9zZSBpbnRlcmFjdGl2ZSBwcm9wZXJ0eSBpcyB0cnVlXG4gIF91cGRhdGVRdWVyeVBhcmFtcyhtYXBTdHlsZSkge1xuICAgIGNvbnN0IGludGVyYWN0aXZlTGF5ZXJJZHMgPSBnZXRJbnRlcmFjdGl2ZUxheWVySWRzKG1hcFN0eWxlKTtcbiAgICB0aGlzLl9xdWVyeVBhcmFtcyA9IHtsYXllcnM6IGludGVyYWN0aXZlTGF5ZXJJZHN9O1xuICB9XG5cbiAgLy8gTm90ZTogbmVlZHMgdG8gYmUgY2FsbGVkIGFmdGVyIHJlbmRlciAoZS5nLiBpbiBjb21wb25lbnREaWRVcGRhdGUpXG4gIF91cGRhdGVNYXBTaXplKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHNpemVDaGFuZ2VkID1cbiAgICAgIG9sZFByb3BzLndpZHRoICE9PSBuZXdQcm9wcy53aWR0aCB8fCBvbGRQcm9wcy5oZWlnaHQgIT09IG5ld1Byb3BzLmhlaWdodDtcblxuICAgIGlmIChzaXplQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fbWFwLnJlc2l6ZSgpO1xuICAgICAgLy8gdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQodGhpcy5fbWFwLnRyYW5zZm9ybSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZU1hcFN0eWxlKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IG1hcFN0eWxlID0gbmV3UHJvcHMubWFwU3R5bGU7XG4gICAgY29uc3Qgb2xkTWFwU3R5bGUgPSBvbGRQcm9wcy5tYXBTdHlsZTtcbiAgICBpZiAobWFwU3R5bGUgIT09IG9sZE1hcFN0eWxlKSB7XG4gICAgICBpZiAoaXNJbW11dGFibGVNYXAobWFwU3R5bGUpKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnByZXZlbnRTdHlsZURpZmZpbmcpIHtcbiAgICAgICAgICB0aGlzLl9tYXAuc2V0U3R5bGUobWFwU3R5bGUudG9KUygpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXREaWZmU3R5bGUob2xkTWFwU3R5bGUsIG1hcFN0eWxlLCB0aGlzLl9tYXApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9tYXAuc2V0U3R5bGUobWFwU3R5bGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpO1xuICAgIH1cbiAgfVxuXG4gIF9tYXBib3hNYXBMb2FkZWQocmVmKSB7XG4gICAgdGhpcy5fbWFwYm94TWFwID0gcmVmO1xuICB9XG5cbiAgLy8gSGFuZGxlIG1hcCBlcnJvclxuICBfbWFwYm94TWFwRXJyb3IoZXZ0KSB7XG4gICAgY29uc3Qgc3RhdHVzQ29kZSA9IGV2dC5lcnJvciAmJiBldnQuZXJyb3Iuc3RhdHVzIHx8IGV2dC5zdGF0dXM7XG4gICAgaWYgKHN0YXR1c0NvZGUgPT09IFVOQVVUSE9SSVpFRF9FUlJPUl9DT0RFICYmICF0aGlzLnN0YXRlLmFjY2Vzc1Rva2VuSW52YWxpZCkge1xuICAgICAgLy8gTWFwYm94IHRocm93cyB1bmF1dGhvcml6ZWQgZXJyb3IgLSBpbnZhbGlkIHRva2VuXG4gICAgICBjb25zb2xlLmVycm9yKE5PX1RPS0VOX1dBUk5JTkcpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICB0aGlzLnNldFN0YXRlKHthY2Nlc3NUb2tlbkludmFsaWQ6IHRydWV9KTtcbiAgICB9XG4gIH1cblxuICBfcmVuZGVyTm9Ub2tlbldhcm5pbmcoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuYWNjZXNzVG9rZW5JbnZhbGlkKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRvcDogMFxuICAgICAgfTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtrZXk6ICd3YXJuaW5nJywgaWQ6ICduby10b2tlbi13YXJuaW5nJywgc3R5bGV9LCBbXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnaDMnLCB7a2V5OiAnaGVhZGVyJ30sIE5PX1RPS0VOX1dBUk5JTkcpLFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtrZXk6ICd0ZXh0J30sICdGb3IgaW5mb3JtYXRpb24gb24gc2V0dGluZyB1cCB5b3VyIGJhc2VtYXAsIHJlYWQnKSxcbiAgICAgICAgICBjcmVhdGVFbGVtZW50KCdhJywge2tleTogJ2xpbmsnLCBocmVmOiBUT0tFTl9ET0NfVVJMfSwgJ05vdGUgb24gTWFwIFRva2VucycpXG4gICAgICAgIF0pXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtjbGFzc05hbWUsIHdpZHRoLCBoZWlnaHQsIHN0eWxlLCB2aXNpYmxlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbWFwQ29udGFpbmVyU3R5bGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdHlsZSwge3dpZHRoLCBoZWlnaHQsIHBvc2l0aW9uOiAncmVsYXRpdmUnfSk7XG4gICAgY29uc3QgbWFwU3R5bGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdHlsZSwge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICB2aXNpYmlsaXR5OiB2aXNpYmxlID8gJ3Zpc2libGUnIDogJ2hpZGRlbidcbiAgICB9KTtcbiAgICBjb25zdCBvdmVybGF5Q29udGFpbmVyU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICB0b3A6IDAsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xuICAgIH07XG5cbiAgICAvLyBOb3RlOiBhIHN0YXRpYyBtYXAgc3RpbGwgaGFuZGxlcyBjbGlja3MgYW5kIGhvdmVyIGV2ZW50c1xuICAgIHJldHVybiAoXG4gICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGtleTogJ21hcC1jb250YWluZXInLFxuICAgICAgICBzdHlsZTogbWFwQ29udGFpbmVyU3R5bGUsXG4gICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAga2V5OiAnbWFwLW1hcGJveCcsXG4gICAgICAgICAgICByZWY6IHRoaXMuX21hcGJveE1hcExvYWRlZCxcbiAgICAgICAgICAgIHN0eWxlOiBtYXBTdHlsZSxcbiAgICAgICAgICAgIGNsYXNzTmFtZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICAgIGtleTogJ21hcC1vdmVybGF5cycsXG4gICAgICAgICAgICAvLyBTYW1lIGFzIGludGVyYWN0aXZlIG1hcCdzIG92ZXJsYXkgY29udGFpbmVyXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdvdmVybGF5cycsXG4gICAgICAgICAgICBzdHlsZTogb3ZlcmxheUNvbnRhaW5lclN0eWxlLFxuICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICB9KSxcbiAgICAgICAgICB0aGlzLl9yZW5kZXJOb1Rva2VuV2FybmluZygpXG4gICAgICAgIF1cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuXG5TdGF0aWNNYXAuZGlzcGxheU5hbWUgPSAnU3RhdGljTWFwJztcblN0YXRpY01hcC5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5TdGF0aWNNYXAuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuU3RhdGljTWFwLmNoaWxkQ29udGV4dFR5cGVzID0gY2hpbGRDb250ZXh0VHlwZXM7XG4iXX0=