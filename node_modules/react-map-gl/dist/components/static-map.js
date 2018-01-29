'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _autobind = require('../utils/autobind');

var _autobind2 = _interopRequireDefault(_autobind);

var _styleUtils = require('../utils/style-utils');

var _isImmutableMap = require('../utils/is-immutable-map');

var _isImmutableMap2 = _interopRequireDefault(_isImmutableMap);

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

var _mapbox = require('../mapbox/mapbox');

var _mapbox2 = _interopRequireDefault(_mapbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable max-len */
var TOKEN_DOC_URL = 'https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens'; // Copyright (c) 2015 Uber Technologies, Inc.

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

var NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
/* eslint-disable max-len */

function noop() {}

var UNAUTHORIZED_ERROR_CODE = 401;

var propTypes = (0, _assign2.default)({}, _mapbox2.default.propTypes, {
  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]),
  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: _propTypes2.default.bool,
  /** Whether the map is visible */
  visible: _propTypes2.default.bool
});

var defaultProps = (0, _assign2.default)({}, _mapbox2.default.defaultProps, {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  preventStyleDiffing: false,
  visible: true
});

var childContextTypes = {
  viewport: _propTypes2.default.instanceOf(_viewportMercatorProject2.default)
};

var StaticMap = function (_PureComponent) {
  (0, _inherits3.default)(StaticMap, _PureComponent);
  (0, _createClass3.default)(StaticMap, null, [{
    key: 'supported',
    value: function supported() {
      return _mapbox2.default && _mapbox2.default.supported();
    }
  }]);

  function StaticMap(props) {
    (0, _classCallCheck3.default)(this, StaticMap);

    var _this = (0, _possibleConstructorReturn3.default)(this, (StaticMap.__proto__ || (0, _getPrototypeOf2.default)(StaticMap)).call(this, props));

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
    (0, _autobind2.default)(_this);
    return _this;
  }

  (0, _createClass3.default)(StaticMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new _viewportMercatorProject2.default(this.props)
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var mapStyle = this.props.mapStyle;


      this._mapbox = new _mapbox2.default((0, _assign2.default)({}, this.props, {
        container: this._mapboxMap,
        onError: this._mapboxMapError,
        mapStyle: (0, _isImmutableMap2.default)(mapStyle) ? mapStyle.toJS() : mapStyle
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
      var interactiveLayerIds = (0, _styleUtils.getInteractiveLayerIds)(mapStyle);
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
        if ((0, _isImmutableMap2.default)(mapStyle)) {
          if (this.props.preventStyleDiffing) {
            this._map.setStyle(mapStyle.toJS());
          } else {
            (0, _styleUtils.setDiffStyle)(oldMapStyle, mapStyle, this._map);
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
        return (0, _react.createElement)('div', { key: 'warning', id: 'no-token-warning', style: style }, [(0, _react.createElement)('h3', { key: 'header' }, NO_TOKEN_WARNING), (0, _react.createElement)('div', { key: 'text' }, 'For information on setting up your basemap, read'), (0, _react.createElement)('a', { key: 'link', href: TOKEN_DOC_URL }, 'Note on Map Tokens')]);
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

      var mapContainerStyle = (0, _assign2.default)({}, style, { width: width, height: height, position: 'relative' });
      var mapStyle = (0, _assign2.default)({}, style, {
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
      return (0, _react.createElement)('div', {
        key: 'map-container',
        style: mapContainerStyle,
        children: [(0, _react.createElement)('div', {
          key: 'map-mapbox',
          ref: this._mapboxMapLoaded,
          style: mapStyle,
          className: className
        }), (0, _react.createElement)('div', {
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
}(_react.PureComponent);

exports.default = StaticMap;


StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
StaticMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3N0YXRpYy1tYXAuanMiXSwibmFtZXMiOlsiVE9LRU5fRE9DX1VSTCIsIk5PX1RPS0VOX1dBUk5JTkciLCJub29wIiwiVU5BVVRIT1JJWkVEX0VSUk9SX0NPREUiLCJwcm9wVHlwZXMiLCJtYXBTdHlsZSIsIm9uZU9mVHlwZSIsInN0cmluZyIsIm9iamVjdCIsInByZXZlbnRTdHlsZURpZmZpbmciLCJib29sIiwidmlzaWJsZSIsImRlZmF1bHRQcm9wcyIsImNoaWxkQ29udGV4dFR5cGVzIiwidmlld3BvcnQiLCJpbnN0YW5jZU9mIiwiU3RhdGljTWFwIiwic3VwcG9ydGVkIiwicHJvcHMiLCJfcXVlcnlQYXJhbXMiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJjb21wb25lbnREaWRVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInN0YXRlIiwiYWNjZXNzVG9rZW5JbnZhbGlkIiwiX21hcGJveCIsImNvbnRhaW5lciIsIl9tYXBib3hNYXAiLCJvbkVycm9yIiwiX21hcGJveE1hcEVycm9yIiwidG9KUyIsIl9tYXAiLCJnZXRNYXAiLCJfdXBkYXRlUXVlcnlQYXJhbXMiLCJuZXdQcm9wcyIsInNldFByb3BzIiwiX3VwZGF0ZU1hcFN0eWxlIiwic2V0U3RhdGUiLCJ3aWR0aCIsImhlaWdodCIsIl91cGRhdGVNYXBTaXplIiwiZmluYWxpemUiLCJnZW9tZXRyeSIsInBhcmFtZXRlcnMiLCJxdWVyeVBhcmFtcyIsImxheWVycyIsImxlbmd0aCIsInF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyIsImludGVyYWN0aXZlTGF5ZXJJZHMiLCJvbGRQcm9wcyIsInNpemVDaGFuZ2VkIiwicmVzaXplIiwib2xkTWFwU3R5bGUiLCJzZXRTdHlsZSIsInJlZiIsImV2dCIsInN0YXR1c0NvZGUiLCJlcnJvciIsInN0YXR1cyIsImNvbnNvbGUiLCJzdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsImtleSIsImlkIiwiaHJlZiIsImNsYXNzTmFtZSIsIm1hcENvbnRhaW5lclN0eWxlIiwidmlzaWJpbGl0eSIsIm92ZXJsYXlDb250YWluZXJTdHlsZSIsIm92ZXJmbG93IiwiY2hpbGRyZW4iLCJfbWFwYm94TWFwTG9hZGVkIiwiX3JlbmRlck5vVG9rZW5XYXJuaW5nIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7OztBQUNBOzs7O0FBRUE7O0FBQ0E7Ozs7QUFFQTs7OztBQUVBOzs7Ozs7QUFFQTtBQUNBLElBQU1BLGdCQUFnQix5RkFBdEIsQyxDQS9CQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFjQSxJQUFNQyxtQkFBbUIseURBQXpCO0FBQ0E7O0FBRUEsU0FBU0MsSUFBVCxHQUFnQixDQUFFOztBQUVsQixJQUFNQywwQkFBMEIsR0FBaEM7O0FBRUEsSUFBTUMsWUFBWSxzQkFBYyxFQUFkLEVBQWtCLGlCQUFPQSxTQUF6QixFQUFvQztBQUNwRDtBQUNBQyxZQUFVLG9CQUFVQyxTQUFWLENBQW9CLENBQzVCLG9CQUFVQyxNQURrQixFQUU1QixvQkFBVUMsTUFGa0IsQ0FBcEIsQ0FGMEM7QUFNcEQ7QUFDQUMsdUJBQXFCLG9CQUFVQyxJQVBxQjtBQVFwRDtBQUNBQyxXQUFTLG9CQUFVRDtBQVRpQyxDQUFwQyxDQUFsQjs7QUFZQSxJQUFNRSxlQUFlLHNCQUFjLEVBQWQsRUFBa0IsaUJBQU9BLFlBQXpCLEVBQXVDO0FBQzFEUCxZQUFVLGlDQURnRDtBQUUxREksdUJBQXFCLEtBRnFDO0FBRzFERSxXQUFTO0FBSGlELENBQXZDLENBQXJCOztBQU1BLElBQU1FLG9CQUFvQjtBQUN4QkMsWUFBVSxvQkFBVUMsVUFBVjtBQURjLENBQTFCOztJQUlxQkMsUzs7OztnQ0FDQTtBQUNqQixhQUFPLG9CQUFVLGlCQUFP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S21CLGdCQUZTO0FBR25CYixpQkFBT3hELFFBSFk7QUFJbkIrRDtBQUptQixTQUFyQixDQURRLEVBT1IsMEJBQWMsS0FBZCxFQUFxQjtBQUNuQkgsZUFBSyxjQURjO0FBRW5CO0FBQ0FHLHFCQUFXLFVBSFE7QUFJbkJQLGlCQUFPVSxxQkFKWTtBQUtuQkUsb0JBQVUsS0FBS3ZELEtBQUwsQ0FBV3VEO0FBTEYsU0FBckIsQ0FQUSxFQWNSLEtBQUtFLHFCQUFMLEVBZFE7QUFIUyxPQUFyQixDQURGO0FBc0JEOzs7OztrQkFoTWtCM0QsUzs7O0FBbU1yQkEsVUFBVTRELFdBQVYsR0FBd0IsV0FBeEI7QUFDQTVELFVBQVVaLFNBQVYsR0FBc0JBLFNBQXRCO0FBQ0FZLFVBQVVKLFlBQVYsR0FBeUJBLFlBQXpCO0FBQ0FJLFVBQVVILGlCQUFWLEdBQThCQSxpQkFBOUIiLCJmaWxlIjoic3RhdGljLW1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5pbXBvcnQge1B1cmVDb21wb25lbnQsIGNyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi4vdXRpbHMvYXV0b2JpbmQnO1xuXG5pbXBvcnQge2dldEludGVyYWN0aXZlTGF5ZXJJZHMsIHNldERpZmZTdHlsZX0gZnJvbSAnLi4vdXRpbHMvc3R5bGUtdXRpbHMnO1xuaW1wb3J0IGlzSW1tdXRhYmxlTWFwIGZyb20gJy4uL3V0aWxzL2lzLWltbXV0YWJsZS1tYXAnO1xuXG5pbXBvcnQgV2ViTWVyY2F0b3JWaWV3cG9ydCBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcblxuaW1wb3J0IE1hcGJveCBmcm9tICcuLi9tYXBib3gvbWFwYm94JztcblxuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuY29uc3QgVE9LRU5fRE9DX1VSTCA9ICdodHRwczovL3ViZXIuZ2l0aHViLmlvL3JlYWN0LW1hcC1nbC8jL0RvY3VtZW50YXRpb24vZ2V0dGluZy1zdGFydGVkL2Fib3V0LW1hcGJveC10b2tlbnMnO1xuY29uc3QgTk9fVE9LRU5fV0FSTklORyA9ICdBIHZhbGlkIEFQSSBhY2Nlc3MgdG9rZW4gaXMgcmVxdWlyZWQgdG8gdXNlIE1hcGJveCBkYXRhJztcbi8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmNvbnN0IFVOQVVUSE9SSVpFRF9FUlJPUl9DT0RFID0gNDAxO1xuXG5jb25zdCBwcm9wVHlwZXMgPSBPYmplY3QuYXNzaWduKHt9LCBNYXBib3gucHJvcFR5cGVzLCB7XG4gIC8qKiBUaGUgTWFwYm94IHN0eWxlLiBBIHN0cmluZyB1cmwgb3IgYSBNYXBib3hHTCBzdHlsZSBJbW11dGFibGUuTWFwIG9iamVjdC4gKi9cbiAgbWFwU3R5bGU6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgIFByb3BUeXBlcy5zdHJpbmcsXG4gICAgUHJvcFR5cGVzLm9iamVjdFxuICBdKSxcbiAgLyoqIFRoZXJlIGFyZSBrbm93biBpc3N1ZXMgd2l0aCBzdHlsZSBkaWZmaW5nLiBBcyBzdG9wZ2FwLCBhZGQgb3B0aW9uIHRvIHByZXZlbnQgc3R5bGUgZGlmZmluZy4gKi9cbiAgcHJldmVudFN0eWxlRGlmZmluZzogUHJvcFR5cGVzLmJvb2wsXG4gIC8qKiBXaGV0aGVyIHRoZSBtYXAgaXMgdmlzaWJsZSAqL1xuICB2aXNpYmxlOiBQcm9wVHlwZXMuYm9vbFxufSk7XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIE1hcGJveC5kZWZhdWx0UHJvcHMsIHtcbiAgbWFwU3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2xpZ2h0LXY4JyxcbiAgcHJldmVudFN0eWxlRGlmZmluZzogZmFsc2UsXG4gIHZpc2libGU6IHRydWVcbn0pO1xuXG5jb25zdCBjaGlsZENvbnRleHRUeXBlcyA9IHtcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFdlYk1lcmNhdG9yVmlld3BvcnQpXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0aWNNYXAgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcbiAgc3RhdGljIHN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gTWFwYm94ICYmIE1hcGJveC5zdXBwb3J0ZWQoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX3F1ZXJ5UGFyYW1zID0ge307XG4gICAgaWYgKCFTdGF0aWNNYXAuc3VwcG9ydGVkKCkpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50RGlkTW91bnQgPSBub29wO1xuICAgICAgdGhpcy5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gbm9vcDtcbiAgICAgIHRoaXMuY29tcG9uZW50RGlkVXBkYXRlID0gbm9vcDtcbiAgICAgIHRoaXMuY29tcG9uZW50V2lsbFVubW91bnQgPSBub29wO1xuICAgIH1cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgYWNjZXNzVG9rZW5JbnZhbGlkOiBmYWxzZVxuICAgIH07XG4gICAgYXV0b2JpbmQodGhpcyk7XG4gIH1cblxuICBnZXRDaGlsZENvbnRleHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZpZXdwb3J0OiBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKVxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCB7bWFwU3R5bGV9ID0gdGhpcy5wcm9wcztcblxuICAgIHRoaXMuX21hcGJveCA9IG5ldyBNYXBib3goT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywge1xuICAgICAgY29udGFpbmVyOiB0aGlzLl9tYXBib3hNYXAsXG4gICAgICBvbkVycm9yOiB0aGlzLl9tYXBib3hNYXBFcnJvcixcbiAgICAgIG1hcFN0eWxlOiBpc0ltbXV0YWJsZU1hcChtYXBTdHlsZSkgPyBtYXBTdHlsZS50b0pTKCkgOiBtYXBTdHlsZVxuICAgIH0pKTtcbiAgICB0aGlzLl9tYXAgPSB0aGlzLl9tYXBib3guZ2V0TWFwKCk7XG4gICAgdGhpcy5fdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgIHRoaXMuX21hcGJveC5zZXRQcm9wcyhuZXdQcm9wcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwU3R5bGUodGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgLy8gdGhpcy5fdXBkYXRlTWFwVmlld3BvcnQodGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgLy8gU2F2ZSB3aWR0aC9oZWlnaHQgc28gdGhhdCB3ZSBjYW4gY2hlY2sgdGhlbSBpbiBjb21wb25lbnREaWRVcGRhdGVcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodFxuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIC8vIFNpbmNlIE1hcGJveCdzIG1hcC5yZXNpemUoKSByZWFkcyBzaXplIGZyb20gRE9NXG4gICAgLy8gd2UgbXVzdCB3YWl0IHRvIHJlYWQgc2l6ZSB1bnRpbCBhZnRlciByZW5kZXIgKGkuZS4gaGVyZSBpbiBcImRpZFVwZGF0ZVwiKVxuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUodGhpcy5zdGF0ZSwgdGhpcy5wcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9tYXBib3guZmluYWxpemUoKTtcbiAgICB0aGlzLl9tYXBib3ggPSBudWxsO1xuICAgIHRoaXMuX21hcCA9IG51bGw7XG4gIH1cblxuICAvLyBFeHRlcm5hbCBhcHBzIGNhbiBhY2Nlc3MgbWFwIHRoaXMgd2F5XG4gIGdldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwO1xuICB9XG5cbiAgLyoqIFVzZXMgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEkgdG8gZmluZCBmZWF0dXJlcyBhdCBwb2ludCBvciBpbiBhIGJvdW5kaW5nIGJveC5cbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jTWFwI3F1ZXJ5UmVuZGVyZWRGZWF0dXJlc1xuICAgICogVG8gcXVlcnkgb25seSBzb21lIG9mIHRoZSBsYXllcnMsIHNldCB0aGUgYGludGVyYWN0aXZlYCBwcm9wZXJ0eSBpbiB0aGVcbiAgICAqIGxheWVyIHN0eWxlIHRvIGB0cnVlYC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXXxbW051bWJlciwgTnVtYmVyXSwgW051bWJlciwgTnVtYmVyXV19IGdlb21ldHJ5IC1cbiAgICAqICAgUG9pbnQgb3IgYW4gYXJyYXkgb2YgdHdvIHBvaW50cyBkZWZpbmluZyB0aGUgYm91bmRpbmcgYm94XG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1ldGVycyAtIHF1ZXJ5IG9wdGlvbnNcbiAgICAqL1xuICBxdWVyeVJlbmRlcmVkRmVhdHVyZXMoZ2VvbWV0cnksIHBhcmFtZXRlcnMpIHtcbiAgICBjb25zdCBxdWVyeVBhcmFtcyA9IHBhcmFtZXRlcnMgfHwgdGhpcy5fcXVlcnlQYXJhbXM7XG4gICAgaWYgKHF1ZXJ5UGFyYW1zLmxheWVycyAmJiBxdWVyeVBhcmFtcy5sYXllcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBxdWVyeVBhcmFtcyk7XG4gIH1cblxuICAvLyBIb3ZlciBhbmQgY2xpY2sgb25seSBxdWVyeSBsYXllcnMgd2hvc2UgaW50ZXJhY3RpdmUgcHJvcGVydHkgaXMgdHJ1ZVxuICBfdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpIHtcbiAgICBjb25zdCBpbnRlcmFjdGl2ZUxheWVySWRzID0gZ2V0SW50ZXJhY3RpdmVMYXllcklkcyhtYXBTdHlsZSk7XG4gICAgdGhpcy5fcXVlcnlQYXJhbXMgPSB7bGF5ZXJzOiBpbnRlcmFjdGl2ZUxheWVySWRzfTtcbiAgfVxuXG4gIC8vIE5vdGU6IG5lZWRzIHRvIGJlIGNhbGxlZCBhZnRlciByZW5kZXIgKGUuZy4gaW4gY29tcG9uZW50RGlkVXBkYXRlKVxuICBfdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBzaXplQ2hhbmdlZCA9XG4gICAgICBvbGRQcm9wcy53aWR0aCAhPT0gbmV3UHJvcHMud2lkdGggfHwgb2xkUHJvcHMuaGVpZ2h0ICE9PSBuZXdQcm9wcy5oZWlnaHQ7XG5cbiAgICBpZiAoc2l6ZUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX21hcC5yZXNpemUoKTtcbiAgICAgIC8vIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KHRoaXMuX21hcC50cmFuc2Zvcm0pO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVNYXBTdHlsZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBtYXBTdHlsZSA9IG5ld1Byb3BzLm1hcFN0eWxlO1xuICAgIGNvbnN0IG9sZE1hcFN0eWxlID0gb2xkUHJvcHMubWFwU3R5bGU7XG4gICAgaWYgKG1hcFN0eWxlICE9PSBvbGRNYXBTdHlsZSkge1xuICAgICAgaWYgKGlzSW1tdXRhYmxlTWFwKG1hcFN0eWxlKSkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wcmV2ZW50U3R5bGVEaWZmaW5nKSB7XG4gICAgICAgICAgdGhpcy5fbWFwLnNldFN0eWxlKG1hcFN0eWxlLnRvSlMoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0RGlmZlN0eWxlKG9sZE1hcFN0eWxlLCBtYXBTdHlsZSwgdGhpcy5fbWFwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbWFwLnNldFN0eWxlKG1hcFN0eWxlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3VwZGF0ZVF1ZXJ5UGFyYW1zKG1hcFN0eWxlKTtcbiAgICB9XG4gIH1cblxuICBfbWFwYm94TWFwTG9hZGVkKHJlZikge1xuICAgIHRoaXMuX21hcGJveE1hcCA9IHJlZjtcbiAgfVxuXG4gIC8vIEhhbmRsZSBtYXAgZXJyb3JcbiAgX21hcGJveE1hcEVycm9yKGV2dCkge1xuICAgIGNvbnN0IHN0YXR1c0NvZGUgPSBldnQuZXJyb3IgJiYgZXZ0LmVycm9yLnN0YXR1cyB8fCBldnQuc3RhdHVzO1xuICAgIGlmIChzdGF0dXNDb2RlID09PSBVTkFVVEhPUklaRURfRVJST1JfQ09ERSAmJiAhdGhpcy5zdGF0ZS5hY2Nlc3NUb2tlbkludmFsaWQpIHtcbiAgICAgIC8vIE1hcGJveCB0aHJvd3MgdW5hdXRob3JpemVkIGVycm9yIC0gaW52YWxpZCB0b2tlblxuICAgICAgY29uc29sZS5lcnJvcihOT19UT0tFTl9XQVJOSU5HKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7YWNjZXNzVG9rZW5JbnZhbGlkOiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgX3JlbmRlck5vVG9rZW5XYXJuaW5nKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmFjY2Vzc1Rva2VuSW52YWxpZCkge1xuICAgICAgY29uc3Qgc3R5bGUgPSB7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDBcbiAgICAgIH07XG4gICAgICByZXR1cm4gKFxuICAgICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7a2V5OiAnd2FybmluZycsIGlkOiAnbm8tdG9rZW4td2FybmluZycsIHN0eWxlfSwgW1xuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2gzJywge2tleTogJ2hlYWRlcid9LCBOT19UT0tFTl9XQVJOSU5HKSxcbiAgICAgICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7a2V5OiAndGV4dCd9LCAnRm9yIGluZm9ybWF0aW9uIG9uIHNldHRpbmcgdXAgeW91ciBiYXNlbWFwLCByZWFkJyksXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnYScsIHtrZXk6ICdsaW5rJywgaHJlZjogVE9LRU5fRE9DX1VSTH0sICdOb3RlIG9uIE1hcCBUb2tlbnMnKVxuICAgICAgICBdKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7Y2xhc3NOYW1lLCB3aWR0aCwgaGVpZ2h0LCBzdHlsZSwgdmlzaWJsZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IG1hcENvbnRhaW5lclN0eWxlID0gT2JqZWN0LmFzc2lnbih7fSwgc3R5bGUsIHt3aWR0aCwgaGVpZ2h0LCBwb3NpdGlvbjogJ3JlbGF0aXZlJ30pO1xuICAgIGNvbnN0IG1hcFN0eWxlID0gT2JqZWN0LmFzc2lnbih7fSwgc3R5bGUsIHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgdmlzaWJpbGl0eTogdmlzaWJsZSA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nXG4gICAgfSk7XG4gICAgY29uc3Qgb3ZlcmxheUNvbnRhaW5lclN0eWxlID0ge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgdG9wOiAwLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbidcbiAgICB9O1xuXG4gICAgLy8gTm90ZTogYSBzdGF0aWMgbWFwIHN0aWxsIGhhbmRsZXMgY2xpY2tzIGFuZCBob3ZlciBldmVudHNcbiAgICByZXR1cm4gKFxuICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBrZXk6ICdtYXAtY29udGFpbmVyJyxcbiAgICAgICAgc3R5bGU6IG1hcENvbnRhaW5lclN0eWxlLFxuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICAgIGtleTogJ21hcC1tYXBib3gnLFxuICAgICAgICAgICAgcmVmOiB0aGlzLl9tYXBib3hNYXBMb2FkZWQsXG4gICAgICAgICAgICBzdHlsZTogbWFwU3R5bGUsXG4gICAgICAgICAgICBjbGFzc05hbWVcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgICBrZXk6ICdtYXAtb3ZlcmxheXMnLFxuICAgICAgICAgICAgLy8gU2FtZSBhcyBpbnRlcmFjdGl2ZSBtYXAncyBvdmVybGF5IGNvbnRhaW5lclxuICAgICAgICAgICAgY2xhc3NOYW1lOiAnb3ZlcmxheXMnLFxuICAgICAgICAgICAgc3R5bGU6IG92ZXJsYXlDb250YWluZXJTdHlsZSxcbiAgICAgICAgICAgIGNoaWxkcmVuOiB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgfSksXG4gICAgICAgICAgdGhpcy5fcmVuZGVyTm9Ub2tlbldhcm5pbmcoKVxuICAgICAgICBdXG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cblxuU3RhdGljTWFwLmRpc3BsYXlOYW1lID0gJ1N0YXRpY01hcCc7XG5TdGF0aWNNYXAucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuU3RhdGljTWFwLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcblN0YXRpY01hcC5jaGlsZENvbnRleHRUeXBlcyA9IGNoaWxkQ29udGV4dFR5cGVzO1xuIl19