var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import autobind from '../utils/autobind';

import StaticMap from './static-map';
import { MAPBOX_LIMITS } from '../utils/map-state';
import WebMercatorViewport from 'viewport-mercator-project';

import TransitionManager from '../utils/transition-manager';

import { EventManager } from 'mjolnir.js';
import MapControls from '../utils/map-controls';
import config from '../config';
import deprecateWarn from '../utils/deprecate-warn';

var propTypes = Object.assign({}, StaticMap.propTypes, {
  // Additional props on top of StaticMap

  /** Viewport constraints */
  // Max zoom level
  maxZoom: PropTypes.number,
  // Min zoom level
  minZoom: PropTypes.number,
  // Max pitch in degrees
  maxPitch: PropTypes.number,
  // Min pitch in degrees
  minPitch: PropTypes.number,

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: PropTypes.func,

  /** Viewport transition **/
  // transition duration for viewport change
  transitionDuration: PropTypes.number,
  // TransitionInterpolator instance, can be used to perform custom transitions.
  transitionInterpolator: PropTypes.object,
  // type of interruption of current transition on update.
  transitionInterruption: PropTypes.number,
  // easing function
  transitionEasing: PropTypes.func,
  // transition status update functions
  onTransitionStart: PropTypes.func,
  onTransitionInterrupt: PropTypes.func,
  onTransitionEnd: PropTypes.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: PropTypes.bool,
  // Drag to pan
  dragPan: PropTypes.bool,
  // Drag to rotate
  dragRotate: PropTypes.bool,
  // Double click to zoom
  doubleClickZoom: PropTypes.bool,
  // Multitouch zoom
  touchZoom: PropTypes.bool,
  // Multitouch rotate
  touchRotate: PropTypes.bool,
  // Keyboard
  keyboard: PropTypes.bool,

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
  onHover: PropTypes.func,
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
  onClick: PropTypes.func,

  /** Radius to detect features around a clicked point. Defaults to 0. */
  clickRadius: PropTypes.number,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: PropTypes.func,

  /** Advanced features */
  // Contraints for displaying the map. If not met, then the map is hidden.
  // Experimental! May be changed in minor version updates.
  visibilityConstraints: PropTypes.shape({
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    minPitch: PropTypes.number,
    maxPitch: PropTypes.number
  }),
  // A map control instance to replace the default map controls
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  mapControls: PropTypes.shape({
    events: PropTypes.arrayOf(PropTypes.string),
    handleEvent: PropTypes.func
  })
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? config.CURSOR.GRABBING : isHovering ? config.CURSOR.POINTER : config.CURSOR.GRAB;
};

var defaultProps = Object.assign({}, StaticMap.defaultProps, MAPBOX_LIMITS, TransitionManager.defaultProps, {
  onViewportChange: null,
  onClick: null,
  onHover: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,

  clickRadius: 0,
  getCursor: getDefaultCursor,

  visibilityConstraints: MAPBOX_LIMITS
});

var childContextTypes = {
  viewport: PropTypes.instanceOf(WebMercatorViewport),
  isDragging: PropTypes.bool,
  eventManager: PropTypes.object
};

var InteractiveMap = function (_PureComponent) {
  _inherits(InteractiveMap, _PureComponent);

  _createClass(InteractiveMap, null, [{
    key: 'supported',
    value: function supported() {
      return StaticMap.supported();
    }
  }]);

  function InteractiveMap(props) {
    _classCallCheck(this, InteractiveMap);

    var _this = _possibleConstructorReturn(this, (InteractiveMap.__proto__ || Object.getPrototypeOf(InteractiveMap)).call(this, props));

    autobind(_this);
    // Check for deprecated props
    deprecateWarn(props);

    _this.state = {
      // Whether the cursor is down
      isDragging: false,
      // Whether the cursor is over a clickable feature
      isHovering: false
    };

    // If props.mapControls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    _this._mapControls = props.mapControls || new MapControls();

    _this._eventManager = new EventManager(null, { rightButton: true });
    return _this;
  }

  _createClass(InteractiveMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new WebMercatorViewport(this.props),
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

      this._mapControls.setOptions(Object.assign({}, this.props, {
        onStateChange: this._onInteractiveStateChange,
        eventManager: eventManager
      }));

      this._transitionManager = new TransitionManager(this.props);
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
          var viewport = new WebMercatorViewport(this.props);
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
        var viewport = new WebMercatorViewport(this.props);
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

      return createElement('div', {
        key: 'map-controls',
        ref: this._eventCanvasLoaded,
        style: eventCanvasStyle
      }, createElement(StaticMap, Object.assign({}, this.props, this._transitionManager && this._transitionManager.getViewportInTransition(), {
        visible: this._checkVisibilityConstraints(this.props),
        ref: this._staticMapLoaded,
        children: this.props.children
      })));
    }
  }]);

  return InteractiveMap;
}(PureComponent);

export default InteractiveMap;


InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
InteractiveMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2ludGVyYWN0aXZlLW1hcC5qcyJdLCJuYW1lcyI6WyJQdXJlQ29tcG9uZW50IiwiY3JlYXRlRWxlbWVudCIsIlByb3BUeXBlcyIsImF1dG9iaW5kIiwiU3RhdGljTWFwIiwiTUFQQk9YX0xJTUlUUyIsIldlYk1lcmNhdG9yVmlld3BvcnQiLCJUcmFuc2l0aW9uTWFuYWdlciIsIkV2ZW50TWFuYWdlciIsIk1hcENvbnRyb2xzIiwiY29uZmlnIiwiZGVwcmVjYXRlV2FybiIsInByb3BUeXBlcyIsIk9iamVjdCIsImFzc2lnbiIsIm1heFpvb20iLCJudW1iZXIiLCJtaW5ab29tIiwibWF4UGl0Y2giLCJtaW5QaXRjaCIsIm9uVmlld3BvcnRDaGFuZ2UiLCJmdW5jIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwidHJhbnNpdGlvbkludGVycG9sYXRvciIsIm9iamVjdCIsInRyYW5zaXRpb25JbnRlcnJ1cHRpb24iLCJ0cmFuc2l0aW9uRWFzaW5nIiwib25UcmFuc2l0aW9uU3RhcnQiLCJvblRyYW5zaXRpb25JbnRlcnJ1cHQiLCJvblRyYW5zaXRpb25FbmQiLCJzY3JvbGxab29tIiwiYm9vbCIsImRyYWdQYW4iLCJkcmFnUm90YXRlIiwiZG91YmxlQ2xpY2tab29tIiwidG91Y2hab29tIiwidG91Y2hSb3RhdGUiLCJrZXlib2FyZCIsIm9uSG92ZXIiLCJvbkNsaWNrIiwiY2xpY2tSYWRpdXMiLCJnZXRDdXJzb3IiLCJ2aXNpYmlsaXR5Q29uc3RyYWludHMiLCJzaGFwZSIsIm1hcENvbnRyb2xzIiwiZXZlbnRzIiwiYXJyYXlPZiIsInN0cmluZyIsImhhbmRsZUV2ZW50IiwiZ2V0RGVmYXVsdEN1cnNvciIsImlzRHJhZ2dpbmciLCJpc0hvdmVyaW5nIiwiQ1VSU09SIiwiR1JBQkJJTkciLCJQT0lOVEVSIiwiR1JBQiIsImRlZmF1bHRQcm9wcyIsImNoaWxkQ29udGV4dFR5cGVzIiwidmlld3BvcnQiLCJpbnN0YW5jZU9mIiwiZXZlbnRNYW5hZ2VyIiwiSW50ZXJhY3RpdmVNYXAiLCJzdXBwb3J0ZWQiLCJwcm9wcyIsInN0YXRlIiwiX21hcENvbnRyb2xzIiwiX2V2ZW50TWFuYWdlciIsInJpZ2h0QnV0dG9uIiwib24iLCJfb25Nb3VzZU1vdmUiLCJfb25Nb3VzZUNsaWNrIiwic2V0T3B0aW9ucyIsIm9uU3RhdGVDaGFuZ2UiLCJfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlIiwiX3RyYW5zaXRpb25NYW5hZ2VyIiwibmV4dFByb3BzIiwicHJvY2Vzc1ZpZXdwb3J0Q2hhbmdlIiwiX21hcCIsImdldE1hcCIsImdlb21ldHJ5Iiwib3B0aW9ucyIsInF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyIsImNhcGl0YWxpemUiLCJzIiwidG9VcHBlckNhc2UiLCJzbGljZSIsInByb3BOYW1lIiwiY2FwaXRhbGl6ZWRQcm9wTmFtZSIsIm1pblByb3BOYW1lIiwibWF4UHJvcE5hbWUiLCJwb3MiLCJyYWRpdXMiLCJmZWF0dXJlcyIsInNpemUiLCJiYm94Iiwic2V0U3RhdGUiLCJldmVudCIsIm9mZnNldENlbnRlciIsIngiLCJ5IiwiX2dldFBvcyIsIl9nZXRGZWF0dXJlcyIsImxlbmd0aCIsImxuZ0xhdCIsInVucHJvamVjdCIsInJlZiIsInNldEVsZW1lbnQiLCJ3aWR0aCIsImhlaWdodCIsImV2ZW50Q2FudmFzU3R5bGUiLCJwb3NpdGlvbiIsImN1cnNvciIsImtleSIsIl9ldmVudENhbnZhc0xvYWRlZCIsInN0eWxlIiwiZ2V0Vmlld3BvcnRJblRyYW5zaXRpb24iLCJ2aXNpYmxlIiwiX2NoZWNrVmlzaWJpbGl0eUNvbnN0cmFpbnRzIiwiX3N0YXRpY01hcExvYWRlZCIsImNoaWxkcmVuIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsU0FBUUEsYUFBUixFQUF1QkMsYUFBdkIsUUFBMkMsT0FBM0M7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLFlBQXRCO0FBQ0EsT0FBT0MsUUFBUCxNQUFxQixtQkFBckI7O0FBRUEsT0FBT0Ms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cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQdXJlQ29tcG9uZW50LCBjcmVhdGVFbGVtZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL3V0aWxzL2F1dG9iaW5kJztcblxuaW1wb3J0IFN0YXRpY01hcCBmcm9tICcuL3N0YXRpYy1tYXAnO1xuaW1wb3J0IHtNQVBCT1hfTElNSVRTfSBmcm9tICcuLi91dGlscy9tYXAtc3RhdGUnO1xuaW1wb3J0IFdlYk1lcmNhdG9yVmlld3BvcnQgZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5cbmltcG9ydCBUcmFuc2l0aW9uTWFuYWdlciBmcm9tICcuLi91dGlscy90cmFuc2l0aW9uLW1hbmFnZXInO1xuXG5pbXBvcnQge0V2ZW50TWFuYWdlcn0gZnJvbSAnbWpvbG5pci5qcyc7XG5pbXBvcnQgTWFwQ29udHJvbHMgZnJvbSAnLi4vdXRpbHMvbWFwLWNvbnRyb2xzJztcbmltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCBkZXByZWNhdGVXYXJuIGZyb20gJy4uL3V0aWxzL2RlcHJlY2F0ZS13YXJuJztcblxuY29uc3QgcHJvcFR5cGVzID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljTWFwLnByb3BUeXBlcywge1xuICAvLyBBZGRpdGlvbmFsIHByb3BzIG9uIHRvcCBvZiBTdGF0aWNNYXBcblxuICAvKiogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgLy8gTWF4IHpvb20gbGV2ZWxcbiAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWluIHpvb20gbGV2ZWxcbiAgbWluWm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWF4IHBpdGNoIGluIGRlZ3JlZXNcbiAgbWF4UGl0Y2g6IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE1pbiBwaXRjaCBpbiBkZWdyZWVzXG4gIG1pblBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gIC8qKlxuICAgKiBgb25WaWV3cG9ydENoYW5nZWAgY2FsbGJhY2sgaXMgZmlyZWQgd2hlbiB0aGUgdXNlciBpbnRlcmFjdGVkIHdpdGggdGhlXG4gICAqIG1hcC4gVGhlIG9iamVjdCBwYXNzZWQgdG8gdGhlIGNhbGxiYWNrIGNvbnRhaW5zIHZpZXdwb3J0IHByb3BlcnRpZXNcbiAgICogc3VjaCBhcyBgbG9uZ2l0dWRlYCwgYGxhdGl0dWRlYCwgYHpvb21gIGV0Yy5cbiAgICovXG4gIG9uVmlld3BvcnRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBWaWV3cG9ydCB0cmFuc2l0aW9uICoqL1xuICAvLyB0cmFuc2l0aW9uIGR1cmF0aW9uIGZvciB2aWV3cG9ydCBjaGFuZ2VcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBUcmFuc2l0aW9uSW50ZXJwb2xhdG9yIGluc3RhbmNlLCBjYW4gYmUgdXNlZCB0byBwZXJmb3JtIGN1c3RvbSB0cmFuc2l0aW9ucy5cbiAgdHJhbnNpdGlvbkludGVycG9sYXRvcjogUHJvcFR5cGVzLm9iamVjdCxcbiAgLy8gdHlwZSBvZiBpbnRlcnJ1cHRpb24gb2YgY3VycmVudCB0cmFuc2l0aW9uIG9uIHVwZGF0ZS5cbiAgdHJhbnNpdGlvbkludGVycnVwdGlvbjogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gZWFzaW5nIGZ1bmN0aW9uXG4gIHRyYW5zaXRpb25FYXNpbmc6IFByb3BUeXBlcy5mdW5jLFxuICAvLyB0cmFuc2l0aW9uIHN0YXR1cyB1cGRhdGUgZnVuY3Rpb25zXG4gIG9uVHJhbnNpdGlvblN0YXJ0OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25UcmFuc2l0aW9uSW50ZXJydXB0OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25UcmFuc2l0aW9uRW5kOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogRW5hYmxlcyBjb250cm9sIGV2ZW50IGhhbmRsaW5nICovXG4gIC8vIFNjcm9sbCB0byB6b29tXG4gIHNjcm9sbFpvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBEcmFnIHRvIHBhblxuICBkcmFnUGFuOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gRHJhZyB0byByb3RhdGVcbiAgZHJhZ1JvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIERvdWJsZSBjbGljayB0byB6b29tXG4gIGRvdWJsZUNsaWNrWm9vbTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIE11bHRpdG91Y2ggem9vbVxuICB0b3VjaFpvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBNdWx0aXRvdWNoIHJvdGF0ZVxuICB0b3VjaFJvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIEtleWJvYXJkXG4gIGtleWJvYXJkOiBQcm9wVHlwZXMuYm9vbCxcblxuIC8qKlxuICAgICogQ2FsbGVkIHdoZW4gdGhlIG1hcCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgKiBAY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIFRoZSBtb3VzZSBldmVudC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gZXZlbnQubG5nTGF0IC0gVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludGVyXG4gICAgKiBAcGFyYW0ge0FycmF5fSBldmVudC5mZWF0dXJlcyAtIFRoZSBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlciwgdXNpbmcgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEk6XG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICAqIFRvIG1ha2UgYSBsYXllciBpbnRlcmFjdGl2ZSwgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICAqL1xuICBvbkhvdmVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgLyoqXG4gICAgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIGlzIGNsaWNrZWQuXG4gICAgKiBAY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIFRoZSBtb3VzZSBldmVudC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gZXZlbnQubG5nTGF0IC0gVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludGVyXG4gICAgKiBAcGFyYW0ge0FycmF5fSBldmVudC5mZWF0dXJlcyAtIFRoZSBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlciwgdXNpbmcgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEk6XG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICAqIFRvIG1ha2UgYSBsYXllciBpbnRlcmFjdGl2ZSwgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICAqL1xuICBvbkNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogUmFkaXVzIHRvIGRldGVjdCBmZWF0dXJlcyBhcm91bmQgYSBjbGlja2VkIHBvaW50LiBEZWZhdWx0cyB0byAwLiAqL1xuICBjbGlja1JhZGl1czogUHJvcFR5cGVzLm51bWJlcixcblxuICAvKiogQWNjZXNzb3IgdGhhdCByZXR1cm5zIGEgY3Vyc29yIHN0eWxlIHRvIHNob3cgaW50ZXJhY3RpdmUgc3RhdGUgKi9cbiAgZ2V0Q3Vyc29yOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogQWR2YW5jZWQgZmVhdHVyZXMgKi9cbiAgLy8gQ29udHJhaW50cyBmb3IgZGlzcGxheWluZyB0aGUgbWFwLiBJZiBub3QgbWV0LCB0aGVuIHRoZSBtYXAgaXMgaGlkZGVuLlxuICAvLyBFeHBlcmltZW50YWwhIE1heSBiZSBjaGFuZ2VkIGluIG1pbm9yIHZlcnNpb24gdXBkYXRlcy5cbiAgdmlzaWJpbGl0eUNvbnN0cmFpbnRzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIG1pblpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gICAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtaW5QaXRjaDogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtYXhQaXRjaDogUHJvcFR5cGVzLm51bWJlclxuICB9KSxcbiAgLy8gQSBtYXAgY29udHJvbCBpbnN0YW5jZSB0byByZXBsYWNlIHRoZSBkZWZhdWx0IG1hcCBjb250cm9sc1xuICAvLyBUaGUgb2JqZWN0IG11c3QgZXhwb3NlIG9uZSBwcm9wZXJ0eTogYGV2ZW50c2AgYXMgYW4gYXJyYXkgb2Ygc3Vic2NyaWJlZFxuICAvLyBldmVudCBuYW1lczsgYW5kIHR3byBtZXRob2RzOiBgc2V0U3RhdGUoc3RhdGUpYCBhbmQgYGhhbmRsZShldmVudClgXG4gIG1hcENvbnRyb2xzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIGV2ZW50czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnN0cmluZyksXG4gICAgaGFuZGxlRXZlbnQ6IFByb3BUeXBlcy5mdW5jXG4gIH0pXG59KTtcblxuY29uc3QgZ2V0RGVmYXVsdEN1cnNvciA9ICh7aXNEcmFnZ2luZywgaXNIb3ZlcmluZ30pID0+IGlzRHJhZ2dpbmcgP1xuICBjb25maWcuQ1VSU09SLkdSQUJCSU5HIDpcbiAgKGlzSG92ZXJpbmcgPyBjb25maWcuQ1VSU09SLlBPSU5URVIgOiBjb25maWcuQ1VSU09SLkdSQUIpO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LFxuICBTdGF0aWNNYXAuZGVmYXVsdFByb3BzLCBNQVBCT1hfTElNSVRTLCBUcmFuc2l0aW9uTWFuYWdlci5kZWZhdWx0UHJvcHMsXG4gIHtcbiAgICBvblZpZXdwb3J0Q2hhbmdlOiBudWxsLFxuICAgIG9uQ2xpY2s6IG51bGwsXG4gICAgb25Ib3ZlcjogbnVsbCxcblxuICAgIHNjcm9sbFpvb206IHRydWUsXG4gICAgZHJhZ1BhbjogdHJ1ZSxcbiAgICBkcmFnUm90YXRlOiB0cnVlLFxuICAgIGRvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcblxuICAgIGNsaWNrUmFkaXVzOiAwLFxuICAgIGdldEN1cnNvcjogZ2V0RGVmYXVsdEN1cnNvcixcblxuICAgIHZpc2liaWxpdHlDb25zdHJhaW50czogTUFQQk9YX0xJTUlUU1xuICB9XG4pO1xuXG5jb25zdCBjaGlsZENvbnRleHRUeXBlcyA9IHtcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFdlYk1lcmNhdG9yVmlld3BvcnQpLFxuICBpc0RyYWdnaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgZXZlbnRNYW5hZ2VyOiBQcm9wVHlwZXMub2JqZWN0XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcmFjdGl2ZU1hcCBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuXG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIFN0YXRpY01hcC5zdXBwb3J0ZWQoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGF1dG9iaW5kKHRoaXMpO1xuICAgIC8vIENoZWNrIGZvciBkZXByZWNhdGVkIHByb3BzXG4gICAgZGVwcmVjYXRlV2Fybihwcm9wcyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgLy8gV2hldGhlciB0aGUgY3Vyc29yIGlzIGRvd25cbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgLy8gV2hldGhlciB0aGUgY3Vyc29yIGlzIG92ZXIgYSBjbGlja2FibGUgZmVhdHVyZVxuICAgICAgaXNIb3ZlcmluZzogZmFsc2VcbiAgICB9O1xuXG4gICAgLy8gSWYgcHJvcHMubWFwQ29udHJvbHMgaXMgbm90IHByb3ZpZGVkLCBmYWxsYmFjayB0byBkZWZhdWx0IE1hcENvbnRyb2xzIGluc3RhbmNlXG4gICAgLy8gQ2Fubm90IHVzZSBkZWZhdWx0UHJvcHMgaGVyZSBiZWNhdXNlIGl0IG5lZWRzIHRvIGJlIHBlciBtYXAgaW5zdGFuY2VcbiAgICB0aGlzLl9tYXBDb250cm9scyA9IHByb3BzLm1hcENvbnRyb2xzIHx8IG5ldyBNYXBDb250cm9scygpO1xuXG4gICAgdGhpcy5fZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcihudWxsLCB7cmlnaHRCdXR0b246IHRydWV9KTtcbiAgfVxuXG4gIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlld3BvcnQ6IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpLFxuICAgICAgaXNEcmFnZ2luZzogdGhpcy5zdGF0ZS5pc0RyYWdnaW5nLFxuICAgICAgZXZlbnRNYW5hZ2VyOiB0aGlzLl9ldmVudE1hbmFnZXJcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgZXZlbnRNYW5hZ2VyID0gdGhpcy5fZXZlbnRNYW5hZ2VyO1xuXG4gICAgLy8gUmVnaXN0ZXIgYWRkaXRpb25hbCBldmVudCBoYW5kbGVycyBmb3IgY2xpY2sgYW5kIGhvdmVyXG4gICAgZXZlbnRNYW5hZ2VyLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XG4gICAgZXZlbnRNYW5hZ2VyLm9uKCdjbGljaycsIHRoaXMuX29uTW91c2VDbGljayk7XG5cbiAgICB0aGlzLl9tYXBDb250cm9scy5zZXRPcHRpb25zKE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHtcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IHRoaXMuX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZSxcbiAgICAgIGV2ZW50TWFuYWdlclxuICAgIH0pKTtcblxuICAgIHRoaXMuX3RyYW5zaXRpb25NYW5hZ2VyID0gbmV3IFRyYW5zaXRpb25NYW5hZ2VyKHRoaXMucHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVwZGF0ZShuZXh0UHJvcHMpIHtcbiAgICB0aGlzLl9tYXBDb250cm9scy5zZXRPcHRpb25zKG5leHRQcm9wcyk7XG4gICAgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIucHJvY2Vzc1ZpZXdwb3J0Q2hhbmdlKG5leHRQcm9wcyk7XG4gIH1cblxuICBnZXRNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5nZXRNYXAoKTtcbiAgfVxuXG4gIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhnZW9tZXRyeSwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vIENoZWNrcyBhIHZpc2liaWxpdHlDb25zdHJhaW50cyBvYmplY3QgdG8gc2VlIGlmIHRoZSBtYXAgc2hvdWxkIGJlIGRpc3BsYXllZFxuICBfY2hlY2tWaXNpYmlsaXR5Q29uc3RyYWludHMocHJvcHMpIHtcbiAgICBjb25zdCBjYXBpdGFsaXplID0gcyA9PiBzWzBdLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpO1xuXG4gICAgY29uc3Qge3Zpc2liaWxpdHlDb25zdHJhaW50c30gPSBwcm9wcztcbiAgICBmb3IgKGNvbnN0IHByb3BOYW1lIGluIHByb3BzKSB7XG4gICAgICBjb25zdCBjYXBpdGFsaXplZFByb3BOYW1lID0gY2FwaXRhbGl6ZShwcm9wTmFtZSk7XG4gICAgICBjb25zdCBtaW5Qcm9wTmFtZSA9IGBtaW4ke2NhcGl0YWxpemVkUHJvcE5hbWV9YDtcbiAgICAgIGNvbnN0IG1heFByb3BOYW1lID0gYG1heCR7Y2FwaXRhbGl6ZWRQcm9wTmFtZX1gO1xuXG4gICAgICBpZiAobWluUHJvcE5hbWUgaW4gdmlzaWJpbGl0eUNvbnN0cmFpbnRzICYmXG4gICAgICAgIHByb3BzW3Byb3BOYW1lXSA8IHZpc2liaWxpdHlDb25zdHJhaW50c1ttaW5Qcm9wTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKG1heFByb3BOYW1lIGluIHZpc2liaWxpdHlDb25zdHJhaW50cyAmJlxuICAgICAgICBwcm9wc1twcm9wTmFtZV0gPiB2aXNpYmlsaXR5Q29uc3RyYWludHNbbWF4UHJvcE5hbWVdKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBfZ2V0RmVhdHVyZXMoe3BvcywgcmFkaXVzfSkge1xuICAgIGxldCBmZWF0dXJlcztcbiAgICBpZiAocmFkaXVzKSB7XG4gICAgICAvLyBSYWRpdXMgZW5hYmxlcyBwb2ludCBmZWF0dXJlcywgbGlrZSBtYXJrZXIgc3ltYm9scywgdG8gYmUgY2xpY2tlZC5cbiAgICAgIGNvbnN0IHNpemUgPSByYWRpdXM7XG4gICAgICBjb25zdCBiYm94ID0gW1twb3NbMF0gLSBzaXplLCBwb3NbMV0gKyBzaXplXSwgW3Bvc1swXSArIHNpemUsIHBvc1sxXSAtIHNpemVdXTtcbiAgICAgIGZlYXR1cmVzID0gdGhpcy5fbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhiYm94KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmVhdHVyZXMgPSB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKHBvcyk7XG4gICAgfVxuICAgIHJldHVybiBmZWF0dXJlcztcbiAgfVxuXG4gIF9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2Uoe2lzRHJhZ2dpbmcgPSBmYWxzZX0pIHtcbiAgICBpZiAoaXNEcmFnZ2luZyAhPT0gdGhpcy5zdGF0ZS5pc0RyYWdnaW5nKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtpc0RyYWdnaW5nfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSE9WRVIgQU5EIENMSUNLXG4gIF9nZXRQb3MoZXZlbnQpIHtcbiAgICBjb25zdCB7b2Zmc2V0Q2VudGVyOiB7eCwgeX19ID0gZXZlbnQ7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfVxuXG4gIF9vbk1vdXNlTW92ZShldmVudCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0RyYWdnaW5nKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRQb3MoZXZlbnQpO1xuICAgICAgY29uc3QgZmVhdHVyZXMgPSB0aGlzLl9nZXRGZWF0dXJlcyh7cG9zLCByYWRpdXM6IHRoaXMucHJvcHMuY2xpY2tSYWRpdXN9KTtcblxuICAgICAgY29uc3QgaXNIb3ZlcmluZyA9IGZlYXR1cmVzICYmIGZlYXR1cmVzLmxlbmd0aCA+IDA7XG4gICAgICBpZiAoaXNIb3ZlcmluZyAhPT0gdGhpcy5zdGF0ZS5pc0hvdmVyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzSG92ZXJpbmd9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJvcHMub25Ib3Zlcikge1xuICAgICAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpO1xuICAgICAgICBldmVudC5sbmdMYXQgPSB2aWV3cG9ydC51bnByb2plY3QocG9zKTtcbiAgICAgICAgZXZlbnQuZmVhdHVyZXMgPSBmZWF0dXJlcztcblxuICAgICAgICB0aGlzLnByb3BzLm9uSG92ZXIoZXZlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9vbk1vdXNlQ2xpY2soZXZlbnQpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkNsaWNrKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRQb3MoZXZlbnQpO1xuICAgICAgY29uc3Qgdmlld3BvcnQgPSBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKTtcbiAgICAgIGV2ZW50LmxuZ0xhdCA9IHZpZXdwb3J0LnVucHJvamVjdChwb3MpO1xuICAgICAgZXZlbnQuZmVhdHVyZXMgPSB0aGlzLl9nZXRGZWF0dXJlcyh7cG9zLCByYWRpdXM6IHRoaXMucHJvcHMuY2xpY2tSYWRpdXN9KTtcblxuICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBfZXZlbnRDYW52YXNMb2FkZWQocmVmKSB7XG4gICAgLy8gVGhpcyB3aWxsIGJlIGNhbGxlZCB3aXRoIGBudWxsYCBhZnRlciB1bm1vdW50LCByZWxlYXNpbmcgZXZlbnQgbWFuYWdlciByZXNvdXJjZVxuICAgIHRoaXMuX2V2ZW50TWFuYWdlci5zZXRFbGVtZW50KHJlZik7XG4gIH1cblxuICBfc3RhdGljTWFwTG9hZGVkKHJlZikge1xuICAgIHRoaXMuX21hcCA9IHJlZjtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodCwgZ2V0Q3Vyc29yfSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBldmVudENhbnZhc1N0eWxlID0ge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgIGN1cnNvcjogZ2V0Q3Vyc29yKHRoaXMuc3RhdGUpXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGtleTogJ21hcC1jb250cm9scycsXG4gICAgICAgIHJlZjogdGhpcy5fZXZlbnRDYW52YXNMb2FkZWQsXG4gICAgICAgIHN0eWxlOiBldmVudENhbnZhc1N0eWxlXG4gICAgICB9LFxuICAgICAgICBjcmVhdGVFbGVtZW50KFN0YXRpY01hcCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcyxcbiAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uTWFuYWdlciAmJiB0aGlzLl90cmFuc2l0aW9uTWFuYWdlci5nZXRWaWV3cG9ydEluVHJhbnNpdGlvbigpLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZpc2libGU6IHRoaXMuX2NoZWNrVmlzaWJpbGl0eUNvbnN0cmFpbnRzKHRoaXMucHJvcHMpLFxuICAgICAgICAgICAgcmVmOiB0aGlzLl9zdGF0aWNNYXBMb2FkZWQsXG4gICAgICAgICAgICBjaGlsZHJlbjogdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICAgIH1cbiAgICAgICAgKSlcbiAgICAgIClcbiAgICApO1xuICB9XG59XG5cbkludGVyYWN0aXZlTWFwLmRpc3BsYXlOYW1lID0gJ0ludGVyYWN0aXZlTWFwJztcbkludGVyYWN0aXZlTWFwLnByb3BUeXBlcyA9IHByb3BUeXBlcztcbkludGVyYWN0aXZlTWFwLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbkludGVyYWN0aXZlTWFwLmNoaWxkQ29udGV4dFR5cGVzID0gY2hpbGRDb250ZXh0VHlwZXM7XG4iXX0=