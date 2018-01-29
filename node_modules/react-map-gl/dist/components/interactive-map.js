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

var _staticMap = require('./static-map');

var _staticMap2 = _interopRequireDefault(_staticMap);

var _mapState = require('../utils/map-state');

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

var _transitionManager = require('../utils/transition-manager');

var _transitionManager2 = _interopRequireDefault(_transitionManager);

var _mjolnir = require('mjolnir.js');

var _mapControls = require('../utils/map-controls');

var _mapControls2 = _interopRequireDefault(_mapControls);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _deprecateWarn = require('../utils/deprecate-warn');

var _deprecateWarn2 = _interopRequireDefault(_deprecateWarn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = (0, _assign2.default)({}, _staticMap2.default.propTypes, {
  // Additional props on top of StaticMap

  /** Viewport constraints */
  // Max zoom level
  maxZoom: _propTypes2.default.number,
  // Min zoom level
  minZoom: _propTypes2.default.number,
  // Max pitch in degrees
  maxPitch: _propTypes2.default.number,
  // Min pitch in degrees
  minPitch: _propTypes2.default.number,

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: _propTypes2.default.func,

  /** Viewport transition **/
  // transition duration for viewport change
  transitionDuration: _propTypes2.default.number,
  // TransitionInterpolator instance, can be used to perform custom transitions.
  transitionInterpolator: _propTypes2.default.object,
  // type of interruption of current transition on update.
  transitionInterruption: _propTypes2.default.number,
  // easing function
  transitionEasing: _propTypes2.default.func,
  // transition status update functions
  onTransitionStart: _propTypes2.default.func,
  onTransitionInterrupt: _propTypes2.default.func,
  onTransitionEnd: _propTypes2.default.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: _propTypes2.default.bool,
  // Drag to pan
  dragPan: _propTypes2.default.bool,
  // Drag to rotate
  dragRotate: _propTypes2.default.bool,
  // Double click to zoom
  doubleClickZoom: _propTypes2.default.bool,
  // Multitouch zoom
  touchZoom: _propTypes2.default.bool,
  // Multitouch rotate
  touchRotate: _propTypes2.default.bool,
  // Keyboard
  keyboard: _propTypes2.default.bool,

  /**
     * Called when the map is hovered over.
     * @callback
     * @param {Object} event - The mouse event.
     * @param {[Number, Number]} event.lngLat - The coordinates of the pointer
     * @param {Array} event.features - The features under the pointer, using Mapbox's
     * queryRenderedFeatures API:
     * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
     * To make a layer interactive, set the `interactive` property in the
     * layer style to `true`. See Mapbox's style spec
     * https://www.mapbox.com/mapbox-gl-style-spec/#layer-interactive
     */
  onHover: _propTypes2.default.func,
  /**
    * Called when the map is clicked.
    * @callback
    * @param {Object} event - The mouse event.
    * @param {[Number, Number]} event.lngLat - The coordinates of the pointer
    * @param {Array} event.features - The features under the pointer, using Mapbox's
    * queryRenderedFeatures API:
    * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
    * To make a layer interactive, set the `interactive` property in the
    * layer style to `true`. See Mapbox's style spec
    * https://www.mapbox.com/mapbox-gl-style-spec/#layer-interactive
    */
  onClick: _propTypes2.default.func,

  /** Radius to detect features around a clicked point. Defaults to 0. */
  clickRadius: _propTypes2.default.number,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: _propTypes2.default.func,

  /** Advanced features */
  // Contraints for displaying the map. If not met, then the map is hidden.
  // Experimental! May be changed in minor version updates.
  visibilityConstraints: _propTypes2.default.shape({
    minZoom: _propTypes2.default.number,
    maxZoom: _propTypes2.default.number,
    minPitch: _propTypes2.default.number,
    maxPitch: _propTypes2.default.number
  }),
  // A map control instance to replace the default map controls
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  mapControls: _propTypes2.default.shape({
    events: _propTypes2.default.arrayOf(_propTypes2.default.string),
    handleEvent: _propTypes2.default.func
  })
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? _config2.default.CURSOR.GRABBING : isHovering ? _config2.default.CURSOR.POINTER : _config2.default.CURSOR.GRAB;
};

var defaultProps = (0, _assign2.default)({}, _staticMap2.default.defaultProps, _mapState.MAPBOX_LIMITS, _transitionManager2.default.defaultProps, {
  onViewportChange: null,
  onClick: null,
  onHover: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,

  clickRadius: 0,
  getCursor: getDefaultCursor,

  visibilityConstraints: _mapState.MAPBOX_LIMITS
});

var childContextTypes = {
  viewport: _propTypes2.default.instanceOf(_viewportMercatorProject2.default),
  isDragging: _propTypes2.default.bool,
  eventManager: _propTypes2.default.object
};

var InteractiveMap = function (_PureComponent) {
  (0, _inherits3.default)(InteractiveMap, _PureComponent);
  (0, _createClass3.default)(InteractiveMap, null, [{
    key: 'supported',
    value: function supported() {
      return _staticMap2.default.supported();
    }
  }]);

  function InteractiveMap(props) {
    (0, _classCallCheck3.default)(this, InteractiveMap);

    var _this = (0, _possibleConstructorReturn3.default)(this, (InteractiveMap.__proto__ || (0, _getPrototypeOf2.default)(InteractiveMap)).call(this, props));

    (0, _autobind2.default)(_this);
    // Check for deprecated props
    (0, _deprecateWarn2.default)(props);

    _this.state = {
      // Whether the cursor is down
      isDragging: false,
      // Whether the cursor is over a clickable feature
      isHovering: false
    };

    // If props.mapControls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    _this._mapControls = props.mapControls || new _mapControls2.default();

    _this._eventManager = new _mjolnir.EventManager(null, { rightButton: true });
    return _this;
  }

  (0, _createClass3.default)(InteractiveMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new _viewportMercatorProject2.default(this.props),
        isDragging: this.state.isDragging,
        eventManager: this._eventManager
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventManager = this._eventManager;

      // Register additional event handlers for click and hover
      eventManager.on('mousemove', this._onMouseMove);
      eventManager.on('click', this._onMouseClick);

      this._mapControls.setOptions((0, _assign2.default)({}, this.props, {
        onStateChange: this._onInteractiveStateChange,
        eventManager: eventManager
      }));

      this._transitionManager = new _transitionManager2.default(this.props);
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      this._mapControls.setOptions(nextProps);
      this._transitionManager.processViewportChange(nextProps);
    }
  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map.getMap();
    }
  }, {
    key: 'queryRenderedFeatures',
    value: function queryRenderedFeatures(geometry, options) {
      return this._map.queryRenderedFeatures(geometry, options);
    }

    // Checks a visibilityConstraints object to see if the map should be displayed

  }, {
    key: '_checkVisibilityConstraints',
    value: function _checkVisibilityConstraints(props) {
      var capitalize = function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
      };

      var visibilityConstraints = props.visibilityConstraints;

      for (var propName in props) {
        var capitalizedPropName = capitalize(propName);
        var minPropName = 'min' + capitalizedPropName;
        var maxPropName = 'max' + capitalizedPropName;

        if (minPropName in visibilityConstraints && props[propName] < visibilityConstraints[minPropName]) {
          return false;
        }
        if (maxPropName in visibilityConstraints && props[propName] > visibilityConstraints[maxPropName]) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: '_getFeatures',
    value: function _getFeatures(_ref2) {
      var pos = _ref2.pos,
          radius = _ref2.radius;

      var features = void 0;
      if (radius) {
        // Radius enables point features, like marker symbols, to be clicked.
        var size = radius;
        var bbox = [[pos[0] - size, pos[1] + size], [pos[0] + size, pos[1] - size]];
        features = this._map.queryRenderedFeatures(bbox);
      } else {
        features = this._map.queryRenderedFeatures(pos);
      }
      return features;
    }
  }, {
    key: '_onInteractiveStateChange',
    value: function _onInteractiveStateChange(_ref3) {
      var _ref3$isDragging = _ref3.isDragging,
          isDragging = _ref3$isDragging === undefined ? false : _ref3$isDragging;

      if (isDragging !== this.state.isDragging) {
        this.setState({ isDragging: isDragging });
      }
    }

    // HOVER AND CLICK

  }, {
    key: '_getPos',
    value: function _getPos(event) {
      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;

      return [x, y];
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      if (!this.state.isDragging) {
        var pos = this._getPos(event);
        var features = this._getFeatures({ pos: pos, radius: this.props.clickRadius });

        var isHovering = features && features.length > 0;
        if (isHovering !== this.state.isHovering) {
          this.setState({ isHovering: isHovering });
        }

        if (this.props.onHover) {
          var viewport = new _viewportMercatorProject2.default(this.props);
          event.lngLat = viewport.unproject(pos);
          event.features = features;

          this.props.onHover(event);
        }
      }
    }
  }, {
    key: '_onMouseClick',
    value: function _onMouseClick(event) {
      if (this.props.onClick) {
        var pos = this._getPos(event);
        var viewport = new _viewportMercatorProject2.default(this.props);
        event.lngLat = viewport.unproject(pos);
        event.features = this._getFeatures({ pos: pos, radius: this.props.clickRadius });

        this.props.onClick(event);
      }
    }
  }, {
    key: '_eventCanvasLoaded',
    value: function _eventCanvasLoaded(ref) {
      // This will be called with `null` after unmount, releasing event manager resource
      this._eventManager.setElement(ref);
    }
  }, {
    key: '_staticMapLoaded',
    value: function _staticMapLoaded(ref) {
      this._map = ref;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          getCursor = _props.getCursor;


      var eventCanvasStyle = {
        width: width,
        height: height,
        position: 'relative',
        cursor: getCursor(this.state)
      };

      return (0, _react.createElement)('div', {
        key: 'map-controls',
        ref: this._eventCanvasLoaded,
        style: eventCanvasStyle
      }, (0, _react.createElement)(_staticMap2.default, (0, _assign2.default)({}, this.props, this._transitionManager && this._transitionManager.getViewportInTransition(), {
        visible: this._checkVisibilityConstraints(this.props),
        ref: this._staticMapLoaded,
        children: this.props.children
      })));
    }
  }]);
  return InteractiveMap;
}(_react.PureComponent);

exports.default = InteractiveMap;


InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
InteractiveMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2ludGVyYWN0aXZlLW1hcC5qcyJdLCJuYW1lcyI6WyJwcm9wVHlwZXMiLCJtYXhab29tIiwibnVtYmVyIiwibWluWm9vbSIsIm1heFBpdGNoIiwibWluUGl0Y2giLCJvblZpZXdwb3J0Q2hhbmdlIiwiZnVuYyIsInRyYW5zaXRpb25EdXJhdGlvbiIsInRyYW5zaXRpb25JbnRlcnBvbGF0b3IiLCJvYmplY3QiLCJ0cmFuc2l0aW9uSW50ZXJydXB0aW9uIiwidHJhbnNpdGlvbkVhc2luZyIsIm9uVHJhbnNpdGlvblN0YXJ0Iiwib25UcmFuc2l0aW9uSW50ZXJydXB0Iiwib25UcmFuc2l0aW9uRW5kIiwic2Nyb2xsWm9vbSIsImJvb2wiLCJkcmFnUGFuIiwiZHJhZ1JvdGF0ZSIsImRvdWJsZUNsaWNrWm9vbSIsInRvdWNoWm9vbSIsInRvdWNoUm90YXRlIiwia2V5Ym9hcmQiLCJvbkhvdmVyIiwib25DbGljayIsImNsaWNrUmFkaXVzIiwiZ2V0Q3Vyc29yIiwidmlzaWJpbGl0eUNvbnN0cmFpbnRzIiwic2hhcGUiLCJtYXBDb250cm9scyIsImV2ZW50cyIsImFycmF5T2YiLCJzdHJpbmciLCJoYW5kbGVFdmVudCIsImdldERlZmF1bHRDdXJzb3IiLCJpc0RyYWdnaW5nIiwiaXNIb3ZlcmluZyIsIkNVUlNPUiIsIkdSQUJCSU5HIiwiUE9JTlRFUiIsIkdSQUIiLCJkZWZhdWx0UHJvcHMiLCJjaGlsZENvbnRleHRUeXBlcyIsInZpZXdwb3J0IiwiaW5zdGFuY2VPZiIsImV2ZW50TWFuYWdlciIsIkludGVyYWN0aXZlTWFwIiwic3VwcG9ydGVkIiwicHJvcHMiLCJzdGF0ZSIsIl9tYXBDb250cm9scyIsIl9ldmVudE1hbmFnZXIiLCJyaWdodEJ1dHRvbiIsIm9uIiwiX29uTW91c2VNb3ZlIiwiX29uTW91c2VDbGljayIsInNldE9wdGlvbnMiLCJvblN0YXRlQ2hhbmdlIiwiX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZSIsIl90cmFuc2l0aW9uTWFuYWdlciIsIm5leHRQcm9wcyIsInByb2Nlc3NWaWV3cG9ydENoYW5nZSIsIl9tYXAiLCJnZXRNYXAiLCJnZW9tZXRyeSIsIm9wdGlvbnMiLCJxdWVyeVJlbmRlcmVkRmVhdHVyZXMiLCJjYXBpdGFsaXplIiwicyIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJwcm9wTmFtZSIsImNhcGl0YWxpemVkUHJvcE5hbWUiLCJtaW5Qcm9wTmFtZSIsIm1heFByb3BOYW1lIiwicG9zIiwicmFkaXVzIiwiZmVhdHVyZXMiLCJzaXplIiwiYmJveCIsInNldFN0YXRlIiwiZXZlbnQiLCJvZmZzZXRDZW50ZXIiLCJ4IiwieSIsIl9nZXRQb3MiLCJfZ2V0RmVhdHVyZXMiLCJsZW5ndGgiLCJsbmdMYXQiLCJ1bnByb2plY3QiLCJyZWYiLCJzZXRFbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJldmVudENhbnZhc1N0eWxlIiwicG9zaXRpb24iLCJjdXJzb3IiLCJrZXkiLCJfZXZlbnRDYW52YXNMb2FkZWQiLCJzdHlsZSIsImdldFZpZXdwb3J0SW5UcmFuc2l0aW9uIiwidmlzaWJsZSIsIl9jaGVja1Zpc2liaWxpdHlDb25zdHJhaW50cyIsIl9zdGF0aWNNYXBMb2FkZWQiLCJjaGlsZHJlbiIsImRpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7QUFDQTs7OztBQUVBOzs7O0FBRUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxZQUFZLHNCQUFjLEVBQWQsRUFBa0Isb0JBQVVBLFNBQTVCLEVBQXVDO0FBQ3ZEOztBQUVBO0FBQ0E7QUFDQUMsV0FBUyxvQkFBVUMsTUFMb0M7QUFNdkQ7QUFDQUMsV0FBUyxvQkFBVUQsTUFQb0M7QUFRdkQ7QUFDQUUsWUFBVSxvQkFBVUYsTUFUbUM7QUFVdkQ7QUFDQUcsWUFBVSxvQkFBVUgsTUFYbUM7O0FBYXZEOzs7OztBQUtBSSxv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QUFLeEQsS0FBTCxDQUFXd0Q7QUFIdkIsT0FGdUIsQ0FBekIsQ0FMRixDQURGO0FBZ0JEOzs7OztrQkEvS2tCMUQsYzs7O0FBa0xyQkEsZUFBZTJELFdBQWYsR0FBNkIsZ0JBQTdCO0FBQ0EzRCxlQUFlL0MsU0FBZixHQUEyQkEsU0FBM0I7QUFDQStDLGVBQWVMLFlBQWYsR0FBOEJBLFlBQTlCO0FBQ0FLLGVBQWVKLGlCQUFmLEdBQW1DQSxpQkFBbkMiLCJmaWxlIjoiaW50ZXJhY3RpdmUtbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQdXJlQ29tcG9uZW50LCBjcmVhdGVFbGVtZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL3V0aWxzL2F1dG9iaW5kJztcblxuaW1wb3J0IFN0YXRpY01hcCBmcm9tICcuL3N0YXRpYy1tYXAnO1xuaW1wb3J0IHtNQVBCT1hfTElNSVRTfSBmcm9tICcuLi91dGlscy9tYXAtc3RhdGUnO1xuaW1wb3J0IFdlYk1lcmNhdG9yVmlld3BvcnQgZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5cbmltcG9ydCBUcmFuc2l0aW9uTWFuYWdlciBmcm9tICcuLi91dGlscy90cmFuc2l0aW9uLW1hbmFnZXInO1xuXG5pbXBvcnQge0V2ZW50TWFuYWdlcn0gZnJvbSAnbWpvbG5pci5qcyc7XG5pbXBvcnQgTWFwQ29udHJvbHMgZnJvbSAnLi4vdXRpbHMvbWFwLWNvbnRyb2xzJztcbmltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCBkZXByZWNhdGVXYXJuIGZyb20gJy4uL3V0aWxzL2RlcHJlY2F0ZS13YXJuJztcblxuY29uc3QgcHJvcFR5cGVzID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljTWFwLnByb3BUeXBlcywge1xuICAvLyBBZGRpdGlvbmFsIHByb3BzIG9uIHRvcCBvZiBTdGF0aWNNYXBcblxuICAvKiogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgLy8gTWF4IHpvb20gbGV2ZWxcbiAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWluIHpvb20gbGV2ZWxcbiAgbWluWm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWF4IHBpdGNoIGluIGRlZ3JlZXNcbiAgbWF4UGl0Y2g6IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE1pbiBwaXRjaCBpbiBkZWdyZWVzXG4gIG1pblBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gIC8qKlxuICAgKiBgb25WaWV3cG9ydENoYW5nZWAgY2FsbGJhY2sgaXMgZmlyZWQgd2hlbiB0aGUgdXNlciBpbnRlcmFjdGVkIHdpdGggdGhlXG4gICAqIG1hcC4gVGhlIG9iamVjdCBwYXNzZWQgdG8gdGhlIGNhbGxiYWNrIGNvbnRhaW5zIHZpZXdwb3J0IHByb3BlcnRpZXNcbiAgICogc3VjaCBhcyBgbG9uZ2l0dWRlYCwgYGxhdGl0dWRlYCwgYHpvb21gIGV0Yy5cbiAgICovXG4gIG9uVmlld3BvcnRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBWaWV3cG9ydCB0cmFuc2l0aW9uICoqL1xuICAvLyB0cmFuc2l0aW9uIGR1cmF0aW9uIGZvciB2aWV3cG9ydCBjaGFuZ2VcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBUcmFuc2l0aW9uSW50ZXJwb2xhdG9yIGluc3RhbmNlLCBjYW4gYmUgdXNlZCB0byBwZXJmb3JtIGN1c3RvbSB0cmFuc2l0aW9ucy5cbiAgdHJhbnNpdGlvbkludGVycG9sYXRvcjogUHJvcFR5cGVzLm9iamVjdCxcbiAgLy8gdHlwZSBvZiBpbnRlcnJ1cHRpb24gb2YgY3VycmVudCB0cmFuc2l0aW9uIG9uIHVwZGF0ZS5cbiAgdHJhbnNpdGlvbkludGVycnVwdGlvbjogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gZWFzaW5nIGZ1bmN0aW9uXG4gIHRyYW5zaXRpb25FYXNpbmc6IFByb3BUeXBlcy5mdW5jLFxuICAvLyB0cmFuc2l0aW9uIHN0YXR1cyB1cGRhdGUgZnVuY3Rpb25zXG4gIG9uVHJhbnNpdGlvblN0YXJ0OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25UcmFuc2l0aW9uSW50ZXJydXB0OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25UcmFuc2l0aW9uRW5kOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogRW5hYmxlcyBjb250cm9sIGV2ZW50IGhhbmRsaW5nICovXG4gIC8vIFNjcm9sbCB0byB6b29tXG4gIHNjcm9sbFpvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBEcmFnIHRvIHBhblxuICBkcmFnUGFuOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gRHJhZyB0byByb3RhdGVcbiAgZHJhZ1JvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIERvdWJsZSBjbGljayB0byB6b29tXG4gIGRvdWJsZUNsaWNrWm9vbTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIE11bHRpdG91Y2ggem9vbVxuICB0b3VjaFpvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBNdWx0aXRvdWNoIHJvdGF0ZVxuICB0b3VjaFJvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIEtleWJvYXJkXG4gIGtleWJvYXJkOiBQcm9wVHlwZXMuYm9vbCxcblxuIC8qKlxuICAgICogQ2FsbGVkIHdoZW4gdGhlIG1hcCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgKiBAY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIFRoZSBtb3VzZSBldmVudC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gZXZlbnQubG5nTGF0IC0gVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludGVyXG4gICAgKiBAcGFyYW0ge0FycmF5fSBldmVudC5mZWF0dXJlcyAtIFRoZSBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlciwgdXNpbmcgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEk6XG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICAqIFRvIG1ha2UgYSBsYXllciBpbnRlcmFjdGl2ZSwgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICAqL1xuICBvbkhvdmVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgLyoqXG4gICAgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIGlzIGNsaWNrZWQuXG4gICAgKiBAY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIFRoZSBtb3VzZSBldmVudC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gZXZlbnQubG5nTGF0IC0gVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludGVyXG4gICAgKiBAcGFyYW0ge0FycmF5fSBldmVudC5mZWF0dXJlcyAtIFRoZSBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlciwgdXNpbmcgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEk6XG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICAqIFRvIG1ha2UgYSBsYXllciBpbnRlcmFjdGl2ZSwgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICAqL1xuICBvbkNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogUmFkaXVzIHRvIGRldGVjdCBmZWF0dXJlcyBhcm91bmQgYSBjbGlja2VkIHBvaW50LiBEZWZhdWx0cyB0byAwLiAqL1xuICBjbGlja1JhZGl1czogUHJvcFR5cGVzLm51bWJlcixcblxuICAvKiogQWNjZXNzb3IgdGhhdCByZXR1cm5zIGEgY3Vyc29yIHN0eWxlIHRvIHNob3cgaW50ZXJhY3RpdmUgc3RhdGUgKi9cbiAgZ2V0Q3Vyc29yOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogQWR2YW5jZWQgZmVhdHVyZXMgKi9cbiAgLy8gQ29udHJhaW50cyBmb3IgZGlzcGxheWluZyB0aGUgbWFwLiBJZiBub3QgbWV0LCB0aGVuIHRoZSBtYXAgaXMgaGlkZGVuLlxuICAvLyBFeHBlcmltZW50YWwhIE1heSBiZSBjaGFuZ2VkIGluIG1pbm9yIHZlcnNpb24gdXBkYXRlcy5cbiAgdmlzaWJpbGl0eUNvbnN0cmFpbnRzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIG1pblpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gICAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtaW5QaXRjaDogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtYXhQaXRjaDogUHJvcFR5cGVzLm51bWJlclxuICB9KSxcbiAgLy8gQSBtYXAgY29udHJvbCBpbnN0YW5jZSB0byByZXBsYWNlIHRoZSBkZWZhdWx0IG1hcCBjb250cm9sc1xuICAvLyBUaGUgb2JqZWN0IG11c3QgZXhwb3NlIG9uZSBwcm9wZXJ0eTogYGV2ZW50c2AgYXMgYW4gYXJyYXkgb2Ygc3Vic2NyaWJlZFxuICAvLyBldmVudCBuYW1lczsgYW5kIHR3byBtZXRob2RzOiBgc2V0U3RhdGUoc3RhdGUpYCBhbmQgYGhhbmRsZShldmVudClgXG4gIG1hcENvbnRyb2xzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIGV2ZW50czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnN0cmluZyksXG4gICAgaGFuZGxlRXZlbnQ6IFByb3BUeXBlcy5mdW5jXG4gIH0pXG59KTtcblxuY29uc3QgZ2V0RGVmYXVsdEN1cnNvciA9ICh7aXNEcmFnZ2luZywgaXNIb3ZlcmluZ30pID0+IGlzRHJhZ2dpbmcgP1xuICBjb25maWcuQ1VSU09SLkdSQUJCSU5HIDpcbiAgKGlzSG92ZXJpbmcgPyBjb25maWcuQ1VSU09SLlBPSU5URVIgOiBjb25maWcuQ1VSU09SLkdSQUIpO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LFxuICBTdGF0aWNNYXAuZGVmYXVsdFByb3BzLCBNQVBCT1hfTElNSVRTLCBUcmFuc2l0aW9uTWFuYWdlci5kZWZhdWx0UHJvcHMsXG4gIHtcbiAgICBvblZpZXdwb3J0Q2hhbmdlOiBudWxsLFxuICAgIG9uQ2xpY2s6IG51bGwsXG4gICAgb25Ib3ZlcjogbnVsbCxcblxuICAgIHNjcm9sbFpvb206IHRydWUsXG4gICAgZHJhZ1BhbjogdHJ1ZSxcbiAgICBkcmFnUm90YXRlOiB0cnVlLFxuICAgIGRvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcblxuICAgIGNsaWNrUmFkaXVzOiAwLFxuICAgIGdldEN1cnNvcjogZ2V0RGVmYXVsdEN1cnNvcixcblxuICAgIHZpc2liaWxpdHlDb25zdHJhaW50czogTUFQQk9YX0xJTUlUU1xuICB9XG4pO1xuXG5jb25zdCBjaGlsZENvbnRleHRUeXBlcyA9IHtcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFdlYk1lcmNhdG9yVmlld3BvcnQpLFxuICBpc0RyYWdnaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgZXZlbnRNYW5hZ2VyOiBQcm9wVHlwZXMub2JqZWN0XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcmFjdGl2ZU1hcCBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuXG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIFN0YXRpY01hcC5zdXBwb3J0ZWQoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGF1dG9iaW5kKHRoaXMpO1xuICAgIC8vIENoZWNrIGZvciBkZXByZWNhdGVkIHByb3BzXG4gICAgZGVwcmVjYXRlV2Fybihwcm9wcyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgLy8gV2hldGhlciB0aGUgY3Vyc29yIGlzIGRvd25cbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgLy8gV2hldGhlciB0aGUgY3Vyc29yIGlzIG92ZXIgYSBjbGlja2FibGUgZmVhdHVyZVxuICAgICAgaXNIb3ZlcmluZzogZmFsc2VcbiAgICB9O1xuXG4gICAgLy8gSWYgcHJvcHMubWFwQ29udHJvbHMgaXMgbm90IHByb3ZpZGVkLCBmYWxsYmFjayB0byBkZWZhdWx0IE1hcENvbnRyb2xzIGluc3RhbmNlXG4gICAgLy8gQ2Fubm90IHVzZSBkZWZhdWx0UHJvcHMgaGVyZSBiZWNhdXNlIGl0IG5lZWRzIHRvIGJlIHBlciBtYXAgaW5zdGFuY2VcbiAgICB0aGlzLl9tYXBDb250cm9scyA9IHByb3BzLm1hcENvbnRyb2xzIHx8IG5ldyBNYXBDb250cm9scygpO1xuXG4gICAgdGhpcy5fZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcihudWxsLCB7cmlnaHRCdXR0b246IHRydWV9KTtcbiAgfVxuXG4gIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlld3BvcnQ6IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpLFxuICAgICAgaXNEcmFnZ2luZzogdGhpcy5zdGF0ZS5pc0RyYWdnaW5nLFxuICAgICAgZXZlbnRNYW5hZ2VyOiB0aGlzLl9ldmVudE1hbmFnZXJcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgZXZlbnRNYW5hZ2VyID0gdGhpcy5fZXZlbnRNYW5hZ2VyO1xuXG4gICAgLy8gUmVnaXN0ZXIgYWRkaXRpb25hbCBldmVudCBoYW5kbGVycyBmb3IgY2xpY2sgYW5kIGhvdmVyXG4gICAgZXZlbnRNYW5hZ2VyLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XG4gICAgZXZlbnRNYW5hZ2VyLm9uKCdjbGljaycsIHRoaXMuX29uTW91c2VDbGljayk7XG5cbiAgICB0aGlzLl9tYXBDb250cm9scy5zZXRPcHRpb25zKE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHtcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IHRoaXMuX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZSxcbiAgICAgIGV2ZW50TWFuYWdlclxuICAgIH0pKTtcblxuICAgIHRoaXMuX3RyYW5zaXRpb25NYW5hZ2VyID0gbmV3IFRyYW5zaXRpb25NYW5hZ2VyKHRoaXMucHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVwZGF0ZShuZXh0UHJvcHMpIHtcbiAgICB0aGlzLl9tYXBDb250cm9scy5zZXRPcHRpb25zKG5leHRQcm9wcyk7XG4gICAgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIucHJvY2Vzc1ZpZXdwb3J0Q2hhbmdlKG5leHRQcm9wcyk7XG4gIH1cblxuICBnZXRNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5nZXRNYXAoKTtcbiAgfVxuXG4gIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhnZW9tZXRyeSwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vIENoZWNrcyBhIHZpc2liaWxpdHlDb25zdHJhaW50cyBvYmplY3QgdG8gc2VlIGlmIHRoZSBtYXAgc2hvdWxkIGJlIGRpc3BsYXllZFxuICBfY2hlY2tWaXNpYmlsaXR5Q29uc3RyYWludHMocHJvcHMpIHtcbiAgICBjb25zdCBjYXBpdGFsaXplID0gcyA9PiBzWzBdLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpO1xuXG4gICAgY29uc3Qge3Zpc2liaWxpdHlDb25zdHJhaW50c30gPSBwcm9wcztcbiAgICBmb3IgKGNvbnN0IHByb3BOYW1lIGluIHByb3BzKSB7XG4gICAgICBjb25zdCBjYXBpdGFsaXplZFByb3BOYW1lID0gY2FwaXRhbGl6ZShwcm9wTmFtZSk7XG4gICAgICBjb25zdCBtaW5Qcm9wTmFtZSA9IGBtaW4ke2NhcGl0YWxpemVkUHJvcE5hbWV9YDtcbiAgICAgIGNvbnN0IG1heFByb3BOYW1lID0gYG1heCR7Y2FwaXRhbGl6ZWRQcm9wTmFtZX1gO1xuXG4gICAgICBpZiAobWluUHJvcE5hbWUgaW4gdmlzaWJpbGl0eUNvbnN0cmFpbnRzICYmXG4gICAgICAgIHByb3BzW3Byb3BOYW1lXSA8IHZpc2liaWxpdHlDb25zdHJhaW50c1ttaW5Qcm9wTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKG1heFByb3BOYW1lIGluIHZpc2liaWxpdHlDb25zdHJhaW50cyAmJlxuICAgICAgICBwcm9wc1twcm9wTmFtZV0gPiB2aXNpYmlsaXR5Q29uc3RyYWludHNbbWF4UHJvcE5hbWVdKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBfZ2V0RmVhdHVyZXMoe3BvcywgcmFkaXVzfSkge1xuICAgIGxldCBmZWF0dXJlcztcbiAgICBpZiAocmFkaXVzKSB7XG4gICAgICAvLyBSYWRpdXMgZW5hYmxlcyBwb2ludCBmZWF0dXJlcywgbGlrZSBtYXJrZXIgc3ltYm9scywgdG8gYmUgY2xpY2tlZC5cbiAgICAgIGNvbnN0IHNpemUgPSByYWRpdXM7XG4gICAgICBjb25zdCBiYm94ID0gW1twb3NbMF0gLSBzaXplLCBwb3NbMV0gKyBzaXplXSwgW3Bvc1swXSArIHNpemUsIHBvc1sxXSAtIHNpemVdXTtcbiAgICAgIGZlYXR1cmVzID0gdGhpcy5fbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhiYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmVhdHVyZXMgPSB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKHBvcyk7XG4gICAgfVxuICAgIHJldHVybiBmZWF0dXJlcztcbiAgfVxuXG4gIF9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2Uoe2lzRHJhZ2dpbmcgPSBmYWxzZX0pIHtcbiAgICBpZiAoaXNEcmFnZ2luZyAhPT0gdGhpcy5zdGF0ZS5pc0RyYWdnaW5nKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtpc0RyYWdnaW5nfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSE9WRVIgQU5EIENMSUNLXG4gIF9nZXRQb3MoZXZlbnQpIHtcbiAgICBjb25zdCB7b2Zmc2V0Q2VudGVyOiB7eCwgeX19ID0gZXZlbnQ7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfVxuXG4gIF9vbk1vdXNlTW92ZShldmVudCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0RyYWdnaW5nKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRQb3MoZXZlbnQpO1xuICAgICAgY29uc3QgZmVhdHVyZXMgPSB0aGlzLl9nZXRGZWF0dXJlcyh7cG9zLCByYWRpdXM6IHRoaXMucHJvcHMuY2xpY2tSYWRpdXN9KTtcblxuICAgICAgY29uc3QgaXNIb3ZlcmluZyA9IGZlYXR1cmVzICYmIGZlYXR1cmVzLmxlbmd0aCA+IDA7XG4gICAgICBpZiAoaXNIb3ZlcmluZyAhPT0gdGhpcy5zdGF0ZS5pc0hvdmVyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzSG92ZXJpbmd9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJvcHMub25Ib3Zlcikge1xuICAgICAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpO1xuICAgICAgICBldmVudC5sbmdMYXQgPSB2aWV3cG9ydC51bnByb2plY3QocG9zKTtcbiAgICAgICAgZXZlbnQuZmVhdHVyZXMgPSBmZWF0dXJlcztcblxuICAgICAgICB0aGlzLnByb3BzLm9uSG92ZXIoZXZlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9vbk1vdXNlQ2xpY2soZXZlbnQpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkNsaWNrKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRQb3MoZXZlbnQpO1xuICAgICAgY29uc3Qgdmlld3BvcnQgPSBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKTtcbiAgICAgIGV2ZW50LmxuZ0xhdCA9IHZpZXdwb3J0LnVucHJvamVjdChwb3MpO1xuICAgICAgZXZlbnQuZmVhdHVyZXMgPSB0aGlzLl9nZXRGZWF0dXJlcyh7cG9zLCByYWRpdXM6IHRoaXMucHJvcHMuY2xpY2tSYWRpdXN9KTtcblxuICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBfZXZlbnRDYW52YXNMb2FkZWQocmVmKSB7XG4gICAgLy8gVGhpcyB3aWxsIGJlIGNhbGxlZCB3aXRoIGBudWxsYCBhZnRlciB1bm1vdW50LCByZWxlYXNpbmcgZXZlbnQgbWFuYWdlciByZXNvdXJjZVxuICAgIHRoaXMuX2V2ZW50TWFuYWdlci5zZXRFbGVtZW50KHJlZik7XG4gIH1cblxuICBfc3RhdGljTWFwTG9hZGVkKHJlZikge1xuICAgIHRoaXMuX21hcCA9IHJlZjtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodCwgZ2V0Q3Vyc29yfSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBldmVudENhbnZhc1N0eWxlID0ge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgIGN1cnNvcjogZ2V0Q3Vyc29yKHRoaXMuc3RhdGUpXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGtleTogJ21hcC1jb250cm9scycsXG4gICAgICAgIHJlZjogdGhpcy5fZXZlbnRDYW52YXNMb2FkZWQsXG4gICAgICAgIHN0eWxlOiBldmVudENhbnZhc1N0eWxlXG4gICAgICB9LFxuICAgICAgICBjcmVhdGVFbGVtZW50KFN0YXRpY01hcCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcyxcbiAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uTWFuYWdlciAmJiB0aGlzLl90cmFuc2l0aW9uTWFuYWdlci5nZXRWaWV3cG9ydEluVHJhbnNpdGlvbigpLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZpc2libGU6IHRoaXMuX2NoZWNrVmlzaWJpbGl0eUNvbnN0cmFpbnRzKHRoaXMucHJvcHMpLFxuICAgICAgICAgICAgcmVmOiB0aGlzLl9zdGF0aWNNYXBMb2FkZWQsXG4gICAgICAgICAgICBjaGlsZHJlbjogdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICAgIH1cbiAgICAgICAgKSlcbiAgICAgIClcbiAgICApO1xuICB9XG59XG5cbkludGVyYWN0aXZlTWFwLmRpc3BsYXlOYW1lID0gJ0ludGVyYWN0aXZlTWFwJztcbkludGVyYWN0aXZlTWFwLnByb3BUeXBlcyA9IHByb3BUeXBlcztcbkludGVyYWN0aXZlTWFwLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbkludGVyYWN0aXZlTWFwLmNoaWxkQ29udGV4dFR5cGVzID0gY2hpbGRDb250ZXh0VHlwZXM7XG4iXX0=