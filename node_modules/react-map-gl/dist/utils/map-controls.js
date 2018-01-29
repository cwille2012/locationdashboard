'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _mapState = require('./map-state');

var _mapState2 = _interopRequireDefault(_mapState);

var _transition = require('./transition');

var _transitionManager = require('./transition-manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NO_TRANSITION_PROPS = {
  transitionDuration: 0
}; // Copyright (c) 2015 Uber Technologies, Inc.

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

var LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: function transitionEasing(t) {
    return t;
  },
  transitionInterpolator: new _transition.LinearInterpolator(),
  transitionInterruption: _transitionManager.TRANSITION_EVENTS.BREAK
};

// EVENT HANDLING PARAMETERS
var PITCH_MOUSE_THRESHOLD = 5;
var PITCH_ACCEL = 1.2;
var ZOOM_ACCEL = 0.01;

var EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  DOUBLE_TAP: ['doubletap'],
  KEYBOARD: ['keydown']
};

var MapControls = function () {
  /**
   * @classdesc
   * A class that handles events and updates mercator style viewport parameters
   */
  function MapControls() {
    (0, _classCallCheck3.default)(this, MapControls);

    this._state = {
      isDragging: false
    };
    this.events = [];
    this.handleEvent = this.handleEvent.bind(this);
  }

  /**
   * Callback for events
   * @param {hammer.Event} event
   */


  (0, _createClass3.default)(MapControls, [{
    key: 'handleEvent',
    value: function handleEvent(event) {
      this.mapState = this.getMapState();

      switch (event.type) {
        case 'panstart':
          return this._onPanStart(event);
        case 'panmove':
          return this._onPan(event);
        case 'panend':
          return this._onPanEnd(event);
        case 'pinchstart':
          return this._onPinchStart(event);
        case 'pinchmove':
          return this._onPinch(event);
        case 'pinchend':
          return this._onPinchEnd(event);
        case 'doubletap':
          return this._onDoubleTap(event);
        case 'wheel':
          return this._onWheel(event);
        case 'keydown':
          return this._onKeyDown(event);
        default:
          return false;
      }
    }

    /* Event utils */
    // Event object: http://hammerjs.github.io/api/#event-object

  }, {
    key: 'getCenter',
    value: function getCenter(event) {
      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;

      return [x, y];
    }
  }, {
    key: 'isFunctionKeyPressed',
    value: function isFunctionKeyPressed(event) {
      var srcEvent = event.srcEvent;

      return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
    }
  }, {
    key: 'setState',
    value: function setState(newState) {
      (0, _assign2.default)(this._state, newState);
      if (this.onStateChange) {
        this.onStateChange(this._state);
      }
    }

    /* Callback util */
    // formats map state and invokes callback function

  }, {
    key: 'updateViewport',
    value: function updateViewport(newMapState) {
      var extraProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var extraState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var oldViewport = this.mapState.getViewportProps();
      var newViewport = (0, _assign2.default)({}, newMapState.getViewportProps(), extraProps);

      if (this.onViewportChange && (0, _keys2.default)(newViewport).some(function (key) {
        return oldViewport[key] !== newViewport[key];
      })) {
        // Viewport has changed
        this.onViewportChange(newViewport);
      }

      this.setState((0, _assign2.default)({}, newMapState.getInteractiveState(), extraState));
    }
  }, {
    key: 'getMapState',
    value: function getMapState(overrides) {
      return new _mapState2.default((0, _assign2.default)({}, this.mapStateProps, this._state, overrides));
    }

    /**
     * Extract interactivity options
     */

  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      var onChangeViewport = options.onChangeViewport,
          _options$touchZoomRot = options.touchZoomRotate,
          touchZoomRotate = _options$touchZoomRot === undefined ? true : _options$touchZoomRot,
          onViewportChange = options.onViewportChange,
          _options$onStateChang = options.onStateChange,
          onStateChange = _options$onStateChang === undefined ? this.onStateChange : _options$onStateChang,
          _options$eventManager = options.eventManager,
          eventManager = _options$eventManager === undefined ? this.eventManager : _options$eventManager,
          _options$scrollZoom = options.scrollZoom,
          scrollZoom = _options$scrollZoom === undefined ? true : _options$scrollZoom,
          _options$dragPan = options.dragPan,
          dragPan = _options$dragPan === undefined ? true : _options$dragPan,
          _options$dragRotate = options.dragRotate,
          dragRotate = _options$dragRotate === undefined ? true : _options$dragRotate,
          _options$doubleClickZ = options.doubleClickZoom,
          doubleClickZoom = _options$doubleClickZ === undefined ? true : _options$doubleClickZ,
          _options$touchZoom = options.touchZoom,
          touchZoom = _options$touchZoom === undefined ? true : _options$touchZoom,
          _options$touchRotate = options.touchRotate,
          touchRotate = _options$touchRotate === undefined ? false : _options$touchRotate,
          _options$keyboard = options.keyboard,
          keyboard = _options$keyboard === undefined ? true : _options$keyboard;

      // TODO(deprecate): remove this check when `onChangeViewport` gets deprecated

      this.onViewportChange = onViewportChange || onChangeViewport;
      this.onStateChange = onStateChange;
      this.mapStateProps = options;
      if (this.eventManager !== eventManager) {
        // EventManager has changed
        this.eventManager = eventManager;
        this._events = {};
        this.toggleEvents(this.events, true);
      }
      var isInteractive = Boolean(this.onViewportChange);

      // Register/unregister events
      this.toggleEvents(EVENT_TYPES.WHEEL, isInteractive && scrollZoom);
      this.toggleEvents(EVENT_TYPES.PAN, isInteractive && (dragPan || dragRotate));
      this.toggleEvents(EVENT_TYPES.PINCH, isInteractive && touchZoomRotate);
      this.toggleEvents(EVENT_TYPES.DOUBLE_TAP, isInteractive && doubleClickZoom);
      this.toggleEvents(EVENT_TYPES.KEYBOARD, isInteractive && keyboard);

      // Interaction toggles
      this.scrollZoom = scrollZoom;
      this.dragPan = dragPan;
      this.dragRotate = dragRotate;
      this.doubleClickZoom = doubleClickZoom;
      this.touchZoom = touchZoomRotate && touchZoom;
      this.touchRotate = touchZoomRotate && touchRotate;
      this.keyboard = keyboard;
    }
  }, {
    key: 'toggleEvents',
    value: function toggleEvents(eventNames, enabled) {
      var _this = this;

      if (this.eventManager) {
        eventNames.forEach(function (eventName) {
          if (_this._events[eventName] !== enabled) {
            _this._events[eventName] = enabled;
            if (enabled) {
              _this.eventManager.on(eventName, _this.handleEvent);
            } else {
              _this.eventManager.off(eventName, _this.handleEvent);
            }
          }
        });
      }
    }

    /* Event handlers */
    // Default handler for the `panstart` event.

  }, {
    key: '_onPanStart',
    value: function _onPanStart(event) {
      var pos = this.getCenter(event);
      var newMapState = this.mapState.panStart({ pos: pos }).rotateStart({ pos: pos });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `panmove` event.

  }, {
    key: '_onPan',
    value: function _onPan(event) {
      return this.isFunctionKeyPressed(event) || event.rightButton ? this._onPanRotate(event) : this._onPanMove(event);
    }

    // Default handler for the `panend` event.

  }, {
    key: '_onPanEnd',
    value: function _onPanEnd(event) {
      var newMapState = this.mapState.panEnd().rotateEnd();
      return this.updateViewport(newMapState, null, { isDragging: false });
    }

    // Default handler for panning to move.
    // Called by `_onPan` when panning without function key pressed.

  }, {
    key: '_onPanMove',
    value: function _onPanMove(event) {
      if (!this.dragPan) {
        return false;
      }
      var pos = this.getCenter(event);
      var newMapState = this.mapState.pan({ pos: pos });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for panning to rotate.
    // Called by `_onPan` when panning with function key pressed.

  }, {
    key: '_onPanRotate',
    value: function _onPanRotate(event) {
      if (!this.dragRotate) {
        return false;
      }

      var deltaX = event.deltaX,
          deltaY = event.deltaY;

      var _getCenter = this.getCenter(event),
          _getCenter2 = (0, _slicedToArray3.default)(_getCenter, 2),
          centerY = _getCenter2[1];

      var startY = centerY - deltaY;

      var _mapState$getViewport = this.mapState.getViewportProps(),
          width = _mapState$getViewport.width,
          height = _mapState$getViewport.height;

      var deltaScaleX = deltaX / width;
      var deltaScaleY = 0;

      if (deltaY > 0) {
        if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to -1 as we drag upwards
          deltaScaleY = deltaY / (startY - height) * PITCH_ACCEL;
        }
      } else if (deltaY < 0) {
        if (startY > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to 1 as we drag upwards
          deltaScaleY = 1 - centerY / startY;
        }
      }
      deltaScaleY = Math.min(1, Math.max(-1, deltaScaleY));

      var newMapState = this.mapState.rotate({ deltaScaleX: deltaScaleX, deltaScaleY: deltaScaleY });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `wheel` event.

  }, {
    key: '_onWheel',
    value: function _onWheel(event) {
      if (!this.scrollZoom) {
        return false;
      }

      var pos = this.getCenter(event);
      var delta = event.delta;

      // Map wheel delta to relative scale

      var scale = 2 / (1 + Math.exp(-Math.abs(delta * ZOOM_ACCEL)));
      if (delta < 0 && scale !== 0) {
        scale = 1 / scale;
      }

      var newMapState = this.mapState.zoom({ pos: pos, scale: scale });
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS);
    }

    // Default handler for the `pinchstart` event.

  }, {
    key: '_onPinchStart',
    value: function _onPinchStart(event) {
      var pos = this.getCenter(event);
      var newMapState = this.mapState.zoomStart({ pos: pos }).rotateStart({ pos: pos });
      // hack - hammer's `rotation` field doesn't seem to produce the correct angle
      this._state.startPinchRotation = event.rotation;
      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `pinch` event.

  }, {
    key: '_onPinch',
    value: function _onPinch(event) {
      if (!this.touchZoom && !this.touchRotate) {
        return false;
      }

      var newMapState = this.mapState;
      if (this.touchZoom) {
        var scale = event.scale;

        var pos = this.getCenter(event);
        newMapState = newMapState.zoom({ pos: pos, scale: scale });
      }
      if (this.touchRotate) {
        var rotation = event.rotation;
        var startPinchRotation = this._state.startPinchRotation;

        newMapState = newMapState.rotate({ deltaScaleX: -(rotation - startPinchRotation) / 180 });
      }

      return this.updateViewport(newMapState, NO_TRANSITION_PROPS, { isDragging: true });
    }

    // Default handler for the `pinchend` event.

  }, {
    key: '_onPinchEnd',
    value: function _onPinchEnd(event) {
      var newMapState = this.mapState.zoomEnd().rotateEnd();
      this._state.startPinchRotation = 0;
      return this.updateViewport(newMapState, null, { isDragging: false });
    }

    // Default handler for the `doubletap` event.

  }, {
    key: '_onDoubleTap',
    value: function _onDoubleTap(event) {
      if (!this.doubleClickZoom) {
        return false;
      }
      var pos = this.getCenter(event);
      var isZoomOut = this.isFunctionKeyPressed(event);

      var newMapState = this.mapState.zoom({ pos: pos, scale: isZoomOut ? 0.5 : 2 });
      return this.updateViewport(newMapState, LINEAR_TRANSITION_PROPS);
    }

    /* eslint-disable complexity */
    // Default handler for the `keydown` event

  }, {
    key: '_onKeyDown',
    value: function _onKeyDown(event) {
      if (!this.keyboard) {
        return false;
      }
      var funcKey = this.isFunctionKeyPressed(event);
      var mapStateProps = this.mapStateProps;

      var newMapState = void 0;

      switch (event.srcEvent.keyCode) {
        case 189:
          // -
          if (funcKey) {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom - 2 });
          } else {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom - 1 });
          }
          break;
        case 187:
          // +
          if (funcKey) {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom + 2 });
          } else {
            newMapState = this.getMapState({ zoom: mapStateProps.zoom + 1 });
          }
          break;
        case 37:
          // left
          if (funcKey) {
            newMapState = this.getMapState({ bearing: mapStateProps.bearing - 15 });
          } else {
            newMapState = this.mapState.pan({ pos: [100, 0], startPos: [0, 0] });
          }
          break;
        case 39:
          // right
          if (funcKey) {
            newMapState = this.getMapState({ bearing: mapStateProps.bearing + 15 });
          } else {
            newMapState = this.mapState.pan({ pos: [-100, 0], startPos: [0, 0] });
          }
          break;
        case 38:
          // up
          if (funcKey) {
            newMapState = this.getMapState({ pitch: mapStateProps.pitch + 10 });
          } else {
            newMapState = this.mapState.pan({ pos: [0, 100], startPos: [0, 0] });
          }
          break;
        case 40:
          // down
          if (funcKey) {
            newMapState = this.getMapState({ pitch: mapStateProps.pitch - 10 });
          } else {
            newMapState = this.mapState.pan({ pos: [0, -100], startPos: [0, 0] });
          }
          break;
        default:
          return false;
      }
      return this.updateViewport(newMapState, LINEAR_TRANSITION_PROPS);
    }
    /* eslint-enable complexity */

  }]);
  return MapControls;
}();

exports.default = MapControls;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tYXAtY29udHJvbHMuanMiXSwibmFtZXMiOlsiTk9fVFJBTlNJVElPTl9QUk9QUyIsInRyYW5zaXRpb25EdXJhdGlvbiIsIkxJTkVBUl9UUkFOU0lUSU9OX1BST1BTIiwidHJhbnNpdGlvbkVhc2luZyIsInQiLCJ0cmFuc2l0aW9uSW50ZXJwb2xhdG9yIiwidHJhbnNpdGlvbkludGVycnVwdGlvbiIsIkJSRUFLIiwiUElUQ0hfTU9VU0VfVEhSRVNIT0xEIiwiUElUQ0hfQUNDRUwiLCJaT09NX0FDQ0VMIiwiRVZFTlRfVFlQRVMiLCJXSEVFTCIsIlBBTiIsIlBJTkNIIiwiRE9VQkxFX1RBUCIsIktFWUJPQVJEIiwiTWFwQ29udHJvbHMiLCJfc3RhdGUiLCJpc0RyYWdnaW5nIiwiZXZlbnRzIiwiaGFuZGxlRXZlbnQiLCJiaW5kIiwiZXZlbnQiLCJtYXBTdGF0ZSIsImdldE1hcFN0YXRlIiwidHlwZSIsIl9vblBhblN0YXJ0IiwiX29uUGFuIiwiX29uUGFuRW5kIiwiX29uUGluY2hTdGFydCIsIl9vblBpbmNoIiwiX29uUGluY2hFbmQiLCJfb25Eb3VibGVUYXAiLCJfb25XaGVlbCIsIl9vbktleURvd24iLCJvZmZzZXRDZW50ZXIiLCJ4IiwieSIsInNyY0V2ZW50IiwiQm9vbGVhbiIsIm1ldGFLZXkiLCJhbHRLZXkiLCJjdHJsS2V5Iiwic2hpZnRLZXkiLCJuZXdTdGF0ZSIsIm9uU3RhdGVDaGFuZ2UiLCJuZXdNYXBTdGF0ZSIsImV4dHJhUHJvcHMiLCJleHRyYVN0YXRlIiwib2xkVmlld3BvcnQiLCJnZXRWaWV3cG9ydFByb3BzIiwibmV3Vmlld3BvcnQiLCJvblZpZXdwb3J0Q2hhbmdlIiwic29tZSIsImtleSIsInNldFN0YXRlIiwiZ2V0SW50ZXJhY3RpdmVTdGF0ZSIsIm92ZXJyaWRlcyIsIm1hcFN0YXRlUHJvcHMiLCJvcHRpb25zIiwib25DaGFuZ2VWaWV3cG9ydCIsInRvdWNoWm9vbVJvdGF0ZSIsImV2ZW50TWFuYWdlciIsInNjcm9sbFpvb20iLCJkcmFnUGFuIiwiZHJhZ1JvdGF0ZSIsImRvdWJsZUNsaWNrWm9vbSIsInRvdWNoWm9vbSIsInRvdWNoUm90YXRlIiwia2V5Ym9hcmQiLCJfZXZlbnRzIiwidG9nZ2xlRXZlbnRzIiwiaXNJbnRlcmFjdGl2ZSIsImV2ZW50TmFtZXMiLCJlbmFibGVkIiwiZm9yRWFjaCIsImV2ZW50TmFtZSIsIm9uIiwib2ZmIiwicG9zIiwiZ2V0Q2VudGVyIiwicGFuU3RhcnQiLCJyb3RhdGVTdGFydCIsInVwZGF0ZVZpZXdwb3J0IiwiaXNGdW5jdGlvbktleVByZXNzZWQiLCJyaWdodEJ1dHRvbiIsIl9vblBhblJvdGF0ZSIsIl9vblBhbk1vdmUiLCJwYW5FbmQiLCJyb3RhdGVFbmQiLCJwYW4iLCJkZWx0YVgiLCJkZWx0YVkiLCJjZW50ZXJZIiwic3RhcnRZIiwid2lkdGgiLCJoZWlnaHQiLCJkZWx0YVNjYWxlWCIsImRlbHRhU2NhbGVZIiwiTWF0aCIsImFicyIsIm1pbiIsIm1heCIsInJvdGF0ZSIsImRlbHRhIiwic2NhbGUiLCJleHAiLCJ6b29tIiwiem9vbVN0YXJ0Iiwic3RhcnRQaW5jaFJvdGF0aW9uIiwicm90YXRpb24iLCJ6b29tRW5kIiwiaXNab29tT3V0IiwiZnVuY0tleSIsImtleUNvZGUiLCJiZWFyaW5nIiwic3RhcnRQb3MiLCJwaXRjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7Ozs7QUFDQTs7QUFDQTs7OztBQUVBLElBQU1BLHNCQUFzQjtBQUMxQkMsc0JBQW9CO0FBRE0sQ0FBNUIsQyxDQXhCQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFTQSxJQUFNQywwQkFBMEI7QUFDOUJELHNCQUFvQixHQURVO0FBRTlCRSxvQkFBa0I7QUFBQSxXQUFLQyxDQUFMO0FBQUEsR0FGWTtBQUc5QkMsMEJBQXdCLG9DQUhNO0FBSTlCQyww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QUMsQ0FBQyxHQUFGLEVBQU8sQ0FBUCxDQUFOLEVBQWlCcUMsVUFBVSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQTNCLEVBQWxCLENBQWQ7QUFDRDtBQUNEO0FBQ0YsYUFBSyxFQUFMO0FBQVM7QUFDUCxjQUFJSCxPQUFKLEVBQWE7QUFDWG5FLDBCQUFjLEtBQUt0QixXQUFMLENBQWlCLEVBQUM2RixPQUFPM0QsY0FBYzJELEtBQWQsR0FBc0IsRUFBOUIsRUFBakIsQ0FBZDtBQUNELFdBRkQsTUFFTztBQUNMdkUsMEJBQWMsS0FBS3ZCLFFBQUwsQ0FBY21FLEdBQWQsQ0FBa0IsRUFBQ1gsS0FBSyxDQUFDLENBQUQsRUFBSSxHQUFKLENBQU4sRUFBZ0JxQyxVQUFVLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBMUIsRUFBbEIsQ0FBZDtBQUNEO0FBQ0Q7QUFDRixhQUFLLEVBQUw7QUFBUztBQUNQLGNBQUlILE9BQUosRUFBYTtBQUNYbkUsMEJBQWMsS0FBS3RCLFdBQUwsQ0FBaUIsRUFBQzZGLE9BQU8zRCxjQUFjMkQsS0FBZCxHQUFzQixFQUE5QixFQUFqQixDQUFkO0FBQ0QsV0FGRCxNQUVPO0FBQ0x2RSwwQkFBYyxLQUFLdkIsUUFBTCxDQUFjbUUsR0FBZCxDQUFrQixFQUFDWCxLQUFLLENBQUMsQ0FBRCxFQUFJLENBQUMsR0FBTCxDQUFOLEVBQWlCcUMsVUFBVSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQTNCLEVBQWxCLENBQWQ7QUFDRDtBQUNEO0FBQ0Y7QUFDRSxpQkFBTyxLQUFQO0FBNUNGO0FBOENBLGFBQU8sS0FBS2pDLGNBQUwsQ0FBb0JyQyxXQUFwQixFQUFpQzdDLHVCQUFqQyxDQUFQO0FBQ0Q7QUFDRDs7Ozs7O2tCQWxWbUJlLFciLCJmaWxlIjoibWFwLWNvbnRyb2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IE1hcFN0YXRlIGZyb20gJy4vbWFwLXN0YXRlJztcbmltcG9ydCB7TGluZWFySW50ZXJwb2xhdG9yfSBmcm9tICcuL3RyYW5zaXRpb24nO1xuaW1wb3J0IHtUUkFOU0lUSU9OX0VWRU5UU30gZnJvbSAnLi90cmFuc2l0aW9uLW1hbmFnZXInO1xuXG5jb25zdCBOT19UUkFOU0lUSU9OX1BST1BTID0ge1xuICB0cmFuc2l0aW9uRHVyYXRpb246IDBcbn07XG5jb25zdCBMSU5FQVJfVFJBTlNJVElPTl9QUk9QUyA9IHtcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiAzMDAsXG4gIHRyYW5zaXRpb25FYXNpbmc6IHQgPT4gdCxcbiAgdHJhbnNpdGlvbkludGVycG9sYXRvcjogbmV3IExpbmVhckludGVycG9sYXRvcigpLFxuICB0cmFuc2l0aW9uSW50ZXJydXB0aW9uOiBUUkFOU0lUSU9OX0VWRU5UUy5CUkVBS1xufTtcblxuLy8gRVZFTlQgSEFORExJTkcgUEFSQU1FVEVSU1xuY29uc3QgUElUQ0hfTU9VU0VfVEhSRVNIT0xEID0gNTtcbmNvbnN0IFBJVENIX0FDQ0VMID0gMS4yO1xuY29uc3QgWk9PTV9BQ0NFTCA9IDAuMDE7XG5cbmNvbnN0IEVWRU5UX1RZUEVTID0ge1xuICBXSEVFTDogWyd3aGVlbCddLFxuICBQQU46IFsncGFuc3RhcnQnLCAncGFubW92ZScsICdwYW5lbmQnXSxcbiAgUElOQ0g6IFsncGluY2hzdGFydCcsICdwaW5jaG1vdmUnLCAncGluY2hlbmQnXSxcbiAgRE9VQkxFX1RBUDogWydkb3VibGV0YXAnXSxcbiAgS0VZQk9BUkQ6IFsna2V5ZG93biddXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXBDb250cm9scyB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEEgY2xhc3MgdGhhdCBoYW5kbGVzIGV2ZW50cyBhbmQgdXBkYXRlcyBtZXJjYXRvciBzdHlsZSB2aWV3cG9ydCBwYXJhbWV0ZXJzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlXG4gICAgfTtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIHRoaXMuaGFuZGxlRXZlbnQgPSB0aGlzLmhhbmRsZUV2ZW50LmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZm9yIGV2ZW50c1xuICAgKiBAcGFyYW0ge2hhbW1lci5FdmVudH0gZXZlbnRcbiAgICovXG4gIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgdGhpcy5tYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoKTtcblxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgJ3BhbnN0YXJ0JzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBhblN0YXJ0KGV2ZW50KTtcbiAgICBjYXNlICdwYW5tb3ZlJzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBhbihldmVudCk7XG4gICAgY2FzZSAncGFuZW5kJzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBhbkVuZChldmVudCk7XG4gICAgY2FzZSAncGluY2hzdGFydCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QaW5jaFN0YXJ0KGV2ZW50KTtcbiAgICBjYXNlICdwaW5jaG1vdmUnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uUGluY2goZXZlbnQpO1xuICAgIGNhc2UgJ3BpbmNoZW5kJzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBpbmNoRW5kKGV2ZW50KTtcbiAgICBjYXNlICdkb3VibGV0YXAnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uRG91YmxlVGFwKGV2ZW50KTtcbiAgICBjYXNlICd3aGVlbCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25XaGVlbChldmVudCk7XG4gICAgY2FzZSAna2V5ZG93bic6XG4gICAgICByZXR1cm4gdGhpcy5fb25LZXlEb3duKGV2ZW50KTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qIEV2ZW50IHV0aWxzICovXG4gIC8vIEV2ZW50IG9iamVjdDogaHR0cDovL2hhbW1lcmpzLmdpdGh1Yi5pby9hcGkvI2V2ZW50LW9iamVjdFxuICBnZXRDZW50ZXIoZXZlbnQpIHtcbiAgICBjb25zdCB7b2Zmc2V0Q2VudGVyOiB7eCwgeX19ID0gZXZlbnQ7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfVxuXG4gIGlzRnVuY3Rpb25LZXlQcmVzc2VkKGV2ZW50KSB7XG4gICAgY29uc3Qge3NyY0V2ZW50fSA9IGV2ZW50O1xuICAgIHJldHVybiBCb29sZWFuKHNyY0V2ZW50Lm1ldGFLZXkgfHwgc3JjRXZlbnQuYWx0S2V5IHx8XG4gICAgICBzcmNFdmVudC5jdHJsS2V5IHx8IHNyY0V2ZW50LnNoaWZ0S2V5KTtcbiAgfVxuXG4gIHNldFN0YXRlKG5ld1N0YXRlKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLl9zdGF0ZSwgbmV3U3RhdGUpO1xuICAgIGlmICh0aGlzLm9uU3RhdGVDaGFuZ2UpIHtcbiAgICAgIHRoaXMub25TdGF0ZUNoYW5nZSh0aGlzLl9zdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgLyogQ2FsbGJhY2sgdXRpbCAqL1xuICAvLyBmb3JtYXRzIG1hcCBzdGF0ZSBhbmQgaW52b2tlcyBjYWxsYmFjayBmdW5jdGlvblxuICB1cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgZXh0cmFQcm9wcyA9IHt9LCBleHRyYVN0YXRlID0ge30pIHtcbiAgICBjb25zdCBvbGRWaWV3cG9ydCA9IHRoaXMubWFwU3RhdGUuZ2V0Vmlld3BvcnRQcm9wcygpO1xuICAgIGNvbnN0IG5ld1ZpZXdwb3J0ID0gT2JqZWN0LmFzc2lnbih7fSwgbmV3TWFwU3RhdGUuZ2V0Vmlld3BvcnRQcm9wcygpLCBleHRyYVByb3BzKTtcblxuICAgIGlmICh0aGlzLm9uVmlld3BvcnRDaGFuZ2UgJiZcbiAgICAgIE9iamVjdC5rZXlzKG5ld1ZpZXdwb3J0KS5zb21lKGtleSA9PiBvbGRWaWV3cG9ydFtrZXldICE9PSBuZXdWaWV3cG9ydFtrZXldKSkge1xuICAgICAgLy8gVmlld3BvcnQgaGFzIGNoYW5nZWRcbiAgICAgIHRoaXMub25WaWV3cG9ydENoYW5nZShuZXdWaWV3cG9ydCk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZShPYmplY3QuYXNzaWduKHt9LCBuZXdNYXBTdGF0ZS5nZXRJbnRlcmFjdGl2ZVN0YXRlKCksIGV4dHJhU3RhdGUpKTtcbiAgfVxuXG4gIGdldE1hcFN0YXRlKG92ZXJyaWRlcykge1xuICAgIHJldHVybiBuZXcgTWFwU3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5tYXBTdGF0ZVByb3BzLCB0aGlzLl9zdGF0ZSwgb3ZlcnJpZGVzKSk7XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdCBpbnRlcmFjdGl2aXR5IG9wdGlvbnNcbiAgICovXG4gIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnN0IHtcbiAgICAgIC8vIFRPRE8oZGVwcmVjYXRlKTogcmVtb3ZlIHRoaXMgd2hlbiBgb25DaGFuZ2VWaWV3cG9ydGAgZ2V0cyBkZXByZWNhdGVkXG4gICAgICBvbkNoYW5nZVZpZXdwb3J0LFxuICAgICAgLy8gVE9ETyhkZXByZWNhdGUpOiByZW1vdmUgdGhpcyB3aGVuIGB0b3VjaFpvb21Sb3RhdGVgIGdldHMgZGVwcmVjYXRlZFxuICAgICAgdG91Y2hab29tUm90YXRlID0gdHJ1ZSxcblxuICAgICAgb25WaWV3cG9ydENoYW5nZSxcbiAgICAgIG9uU3RhdGVDaGFuZ2UgPSB0aGlzLm9uU3RhdGVDaGFuZ2UsXG4gICAgICBldmVudE1hbmFnZXIgPSB0aGlzLmV2ZW50TWFuYWdlcixcbiAgICAgIHNjcm9sbFpvb20gPSB0cnVlLFxuICAgICAgZHJhZ1BhbiA9IHRydWUsXG4gICAgICBkcmFnUm90YXRlID0gdHJ1ZSxcbiAgICAgIGRvdWJsZUNsaWNrWm9vbSA9IHRydWUsXG4gICAgICB0b3VjaFpvb20gPSB0cnVlLFxuICAgICAgdG91Y2hSb3RhdGUgPSBmYWxzZSxcbiAgICAgIGtleWJvYXJkID0gdHJ1ZVxuICAgIH0gPSBvcHRpb25zO1xuXG4gICAgLy8gVE9ETyhkZXByZWNhdGUpOiByZW1vdmUgdGhpcyBjaGVjayB3aGVuIGBvbkNoYW5nZVZpZXdwb3J0YCBnZXRzIGRlcHJlY2F0ZWRcbiAgICB0aGlzLm9uVmlld3BvcnRDaGFuZ2UgPSBvblZpZXdwb3J0Q2hhbmdlIHx8IG9uQ2hhbmdlVmlld3BvcnQ7XG4gICAgdGhpcy5vblN0YXRlQ2hhbmdlID0gb25TdGF0ZUNoYW5nZTtcbiAgICB0aGlzLm1hcFN0YXRlUHJvcHMgPSBvcHRpb25zO1xuICAgIGlmICh0aGlzLmV2ZW50TWFuYWdlciAhPT0gZXZlbnRNYW5hZ2VyKSB7XG4gICAgICAvLyBFdmVudE1hbmFnZXIgaGFzIGNoYW5nZWRcbiAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyID0gZXZlbnRNYW5hZ2VyO1xuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgICB0aGlzLnRvZ2dsZUV2ZW50cyh0aGlzLmV2ZW50cywgdHJ1ZSk7XG4gICAgfVxuICAgIGNvbnN0IGlzSW50ZXJhY3RpdmUgPSBCb29sZWFuKHRoaXMub25WaWV3cG9ydENoYW5nZSk7XG5cbiAgICAvLyBSZWdpc3Rlci91bnJlZ2lzdGVyIGV2ZW50c1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLldIRUVMLCBpc0ludGVyYWN0aXZlICYmIHNjcm9sbFpvb20pO1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLlBBTiwgaXNJbnRlcmFjdGl2ZSAmJiAoZHJhZ1BhbiB8fCBkcmFnUm90YXRlKSk7XG4gICAgdGhpcy50b2dnbGVFdmVudHMoRVZFTlRfVFlQRVMuUElOQ0gsIGlzSW50ZXJhY3RpdmUgJiYgdG91Y2hab29tUm90YXRlKTtcbiAgICB0aGlzLnRvZ2dsZUV2ZW50cyhFVkVOVF9UWVBFUy5ET1VCTEVfVEFQLCBpc0ludGVyYWN0aXZlICYmIGRvdWJsZUNsaWNrWm9vbSk7XG4gICAgdGhpcy50b2dnbGVFdmVudHMoRVZFTlRfVFlQRVMuS0VZQk9BUkQsIGlzSW50ZXJhY3RpdmUgJiYga2V5Ym9hcmQpO1xuXG4gICAgLy8gSW50ZXJhY3Rpb24gdG9nZ2xlc1xuICAgIHRoaXMuc2Nyb2xsWm9vbSA9IHNjcm9sbFpvb207XG4gICAgdGhpcy5kcmFnUGFuID0gZHJhZ1BhbjtcbiAgICB0aGlzLmRyYWdSb3RhdGUgPSBkcmFnUm90YXRlO1xuICAgIHRoaXMuZG91YmxlQ2xpY2tab29tID0gZG91YmxlQ2xpY2tab29tO1xuICAgIHRoaXMudG91Y2hab29tID0gdG91Y2hab29tUm90YXRlICYmIHRvdWNoWm9vbTtcbiAgICB0aGlzLnRvdWNoUm90YXRlID0gdG91Y2hab29tUm90YXRlICYmIHRvdWNoUm90YXRlO1xuICAgIHRoaXMua2V5Ym9hcmQgPSBrZXlib2FyZDtcbiAgfVxuXG4gIHRvZ2dsZUV2ZW50cyhldmVudE5hbWVzLCBlbmFibGVkKSB7XG4gICAgaWYgKHRoaXMuZXZlbnRNYW5hZ2VyKSB7XG4gICAgICBldmVudE5hbWVzLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50c1tldmVudE5hbWVdICE9PSBlbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzW2V2ZW50TmFtZV0gPSBlbmFibGVkO1xuICAgICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5vbihldmVudE5hbWUsIHRoaXMuaGFuZGxlRXZlbnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5vZmYoZXZlbnROYW1lLCB0aGlzLmhhbmRsZUV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qIEV2ZW50IGhhbmRsZXJzICovXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwYW5zdGFydGAgZXZlbnQuXG4gIF9vblBhblN0YXJ0KGV2ZW50KSB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS5wYW5TdGFydCh7cG9zfSkucm90YXRlU3RhcnQoe3Bvc30pO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBOT19UUkFOU0lUSU9OX1BST1BTLCB7aXNEcmFnZ2luZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBhbm1vdmVgIGV2ZW50LlxuICBfb25QYW4oZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5pc0Z1bmN0aW9uS2V5UHJlc3NlZChldmVudCkgfHwgZXZlbnQucmlnaHRCdXR0b24gP1xuICAgICAgdGhpcy5fb25QYW5Sb3RhdGUoZXZlbnQpIDogdGhpcy5fb25QYW5Nb3ZlKGV2ZW50KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwYW5lbmRgIGV2ZW50LlxuICBfb25QYW5FbmQoZXZlbnQpIHtcbiAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuRW5kKCkucm90YXRlRW5kKCk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIG51bGwsIHtpc0RyYWdnaW5nOiBmYWxzZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciBwYW5uaW5nIHRvIG1vdmUuXG4gIC8vIENhbGxlZCBieSBgX29uUGFuYCB3aGVuIHBhbm5pbmcgd2l0aG91dCBmdW5jdGlvbiBrZXkgcHJlc3NlZC5cbiAgX29uUGFuTW92ZShldmVudCkge1xuICAgIGlmICghdGhpcy5kcmFnUGFuKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuKHtwb3N9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgTk9fVFJBTlNJVElPTl9QUk9QUywge2lzRHJhZ2dpbmc6IHRydWV9KTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgcGFubmluZyB0byByb3RhdGUuXG4gIC8vIENhbGxlZCBieSBgX29uUGFuYCB3aGVuIHBhbm5pbmcgd2l0aCBmdW5jdGlvbiBrZXkgcHJlc3NlZC5cbiAgX29uUGFuUm90YXRlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRyYWdSb3RhdGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB7ZGVsdGFYLCBkZWx0YVl9ID0gZXZlbnQ7XG4gICAgY29uc3QgWywgY2VudGVyWV0gPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3Qgc3RhcnRZID0gY2VudGVyWSAtIGRlbHRhWTtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzLm1hcFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKTtcblxuICAgIGNvbnN0IGRlbHRhU2NhbGVYID0gZGVsdGFYIC8gd2lkdGg7XG4gICAgbGV0IGRlbHRhU2NhbGVZID0gMDtcblxuICAgIGlmIChkZWx0YVkgPiAwKSB7XG4gICAgICBpZiAoTWF0aC5hYnMoaGVpZ2h0IC0gc3RhcnRZKSA+IFBJVENIX01PVVNFX1RIUkVTSE9MRCkge1xuICAgICAgICAvLyBNb3ZlIGZyb20gMCB0byAtMSBhcyB3ZSBkcmFnIHVwd2FyZHNcbiAgICAgICAgZGVsdGFTY2FsZVkgPSBkZWx0YVkgLyAoc3RhcnRZIC0gaGVpZ2h0KSAqIFBJVENIX0FDQ0VMO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZGVsdGFZIDwgMCkge1xuICAgICAgaWYgKHN0YXJ0WSA+IFBJVENIX01PVVNFX1RIUkVTSE9MRCkge1xuICAgICAgICAvLyBNb3ZlIGZyb20gMCB0byAxIGFzIHdlIGRyYWcgdXB3YXJkc1xuICAgICAgICBkZWx0YVNjYWxlWSA9IDEgLSBjZW50ZXJZIC8gc3RhcnRZO1xuICAgICAgfVxuICAgIH1cbiAgICBkZWx0YVNjYWxlWSA9IE1hdGgubWluKDEsIE1hdGgubWF4KC0xLCBkZWx0YVNjYWxlWSkpO1xuXG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnJvdGF0ZSh7ZGVsdGFTY2FsZVgsIGRlbHRhU2NhbGVZfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIE5PX1RSQU5TSVRJT05fUFJPUFMsIHtpc0RyYWdnaW5nOiB0cnVlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgd2hlZWxgIGV2ZW50LlxuICBfb25XaGVlbChldmVudCkge1xuICAgIGlmICghdGhpcy5zY3JvbGxab29tKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IHtkZWx0YX0gPSBldmVudDtcblxuICAgIC8vIE1hcCB3aGVlbCBkZWx0YSB0byByZWxhdGl2ZSBzY2FsZVxuICAgIGxldCBzY2FsZSA9IDIgLyAoMSArIE1hdGguZXhwKC1NYXRoLmFicyhkZWx0YSAqIFpPT01fQUNDRUwpKSk7XG4gICAgaWYgKGRlbHRhIDwgMCAmJiBzY2FsZSAhPT0gMCkge1xuICAgICAgc2NhbGUgPSAxIC8gc2NhbGU7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnpvb20oe3Bvcywgc2NhbGV9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgTk9fVFJBTlNJVElPTl9QUk9QUyk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGluY2hzdGFydGAgZXZlbnQuXG4gIF9vblBpbmNoU3RhcnQoZXZlbnQpIHtcbiAgICBjb25zdCBwb3MgPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnpvb21TdGFydCh7cG9zfSkucm90YXRlU3RhcnQoe3Bvc30pO1xuICAgIC8vIGhhY2sgLSBoYW1tZXIncyBgcm90YXRpb25gIGZpZWxkIGRvZXNuJ3Qgc2VlbSB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IGFuZ2xlXG4gICAgdGhpcy5fc3RhdGUuc3RhcnRQaW5jaFJvdGF0aW9uID0gZXZlbnQucm90YXRpb247XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIE5PX1RSQU5TSVRJT05fUFJPUFMsIHtpc0RyYWdnaW5nOiB0cnVlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGluY2hgIGV2ZW50LlxuICBfb25QaW5jaChldmVudCkge1xuICAgIGlmICghdGhpcy50b3VjaFpvb20gJiYgIXRoaXMudG91Y2hSb3RhdGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlO1xuICAgIGlmICh0aGlzLnRvdWNoWm9vbSkge1xuICAgICAgY29uc3Qge3NjYWxlfSA9IGV2ZW50O1xuICAgICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgICAgbmV3TWFwU3RhdGUgPSBuZXdNYXBTdGF0ZS56b29tKHtwb3MsIHNjYWxlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRvdWNoUm90YXRlKSB7XG4gICAgICBjb25zdCB7cm90YXRpb259ID0gZXZlbnQ7XG4gICAgICBjb25zdCB7c3RhcnRQaW5jaFJvdGF0aW9ufSA9IHRoaXMuX3N0YXRlO1xuICAgICAgbmV3TWFwU3RhdGUgPSBuZXdNYXBTdGF0ZS5yb3RhdGUoe2RlbHRhU2NhbGVYOiAtKHJvdGF0aW9uIC0gc3RhcnRQaW5jaFJvdGF0aW9uKSAvIDE4MH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld01hcFN0YXRlLCBOT19UUkFOU0lUSU9OX1BST1BTLCB7aXNEcmFnZ2luZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBpbmNoZW5kYCBldmVudC5cbiAgX29uUGluY2hFbmQoZXZlbnQpIHtcbiAgICBjb25zdCBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUuem9vbUVuZCgpLnJvdGF0ZUVuZCgpO1xuICAgIHRoaXMuX3N0YXRlLnN0YXJ0UGluY2hSb3RhdGlvbiA9IDA7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUsIG51bGwsIHtpc0RyYWdnaW5nOiBmYWxzZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYGRvdWJsZXRhcGAgZXZlbnQuXG4gIF9vbkRvdWJsZVRhcChldmVudCkge1xuICAgIGlmICghdGhpcy5kb3VibGVDbGlja1pvb20pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IGlzWm9vbU91dCA9IHRoaXMuaXNGdW5jdGlvbktleVByZXNzZWQoZXZlbnQpO1xuXG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnpvb20oe3Bvcywgc2NhbGU6IGlzWm9vbU91dCA/IDAuNSA6IDJ9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgTElORUFSX1RSQU5TSVRJT05fUFJPUFMpO1xuICB9XG5cbiAgLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSAqL1xuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBga2V5ZG93bmAgZXZlbnRcbiAgX29uS2V5RG93bihldmVudCkge1xuICAgIGlmICghdGhpcy5rZXlib2FyZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBmdW5jS2V5ID0gdGhpcy5pc0Z1bmN0aW9uS2V5UHJlc3NlZChldmVudCk7XG4gICAgY29uc3Qge21hcFN0YXRlUHJvcHN9ID0gdGhpcztcbiAgICBsZXQgbmV3TWFwU3RhdGU7XG5cbiAgICBzd2l0Y2ggKGV2ZW50LnNyY0V2ZW50LmtleUNvZGUpIHtcbiAgICBjYXNlIDE4OTogLy8gLVxuICAgICAgaWYgKGZ1bmNLZXkpIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHt6b29tOiBtYXBTdGF0ZVByb3BzLnpvb20gLSAyfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoe3pvb206IG1hcFN0YXRlUHJvcHMuem9vbSAtIDF9KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMTg3OiAvLyArXG4gICAgICBpZiAoZnVuY0tleSkge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoe3pvb206IG1hcFN0YXRlUHJvcHMuem9vbSArIDJ9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7em9vbTogbWFwU3RhdGVQcm9wcy56b29tICsgMX0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzNzogLy8gbGVmdFxuICAgICAgaWYgKGZ1bmNLZXkpIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHtiZWFyaW5nOiBtYXBTdGF0ZVByb3BzLmJlYXJpbmcgLSAxNX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLm1hcFN0YXRlLnBhbih7cG9zOiBbMTAwLCAwXSwgc3RhcnRQb3M6IFswLCAwXX0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOTogLy8gcmlnaHRcbiAgICAgIGlmIChmdW5jS2V5KSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5nZXRNYXBTdGF0ZSh7YmVhcmluZzogbWFwU3RhdGVQcm9wcy5iZWFyaW5nICsgMTV9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS5wYW4oe3BvczogWy0xMDAsIDBdLCBzdGFydFBvczogWzAsIDBdfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM4OiAvLyB1cFxuICAgICAgaWYgKGZ1bmNLZXkpIHtcbiAgICAgICAgbmV3TWFwU3RhdGUgPSB0aGlzLmdldE1hcFN0YXRlKHtwaXRjaDogbWFwU3RhdGVQcm9wcy5waXRjaCArIDEwfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMubWFwU3RhdGUucGFuKHtwb3M6IFswLCAxMDBdLCBzdGFydFBvczogWzAsIDBdfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQwOiAvLyBkb3duXG4gICAgICBpZiAoZnVuY0tleSkge1xuICAgICAgICBuZXdNYXBTdGF0ZSA9IHRoaXMuZ2V0TWFwU3RhdGUoe3BpdGNoOiBtYXBTdGF0ZVByb3BzLnBpdGNoIC0gMTB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld01hcFN0YXRlID0gdGhpcy5tYXBTdGF0ZS5wYW4oe3BvczogWzAsIC0xMDBdLCBzdGFydFBvczogWzAsIDBdfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSwgTElORUFSX1RSQU5TSVRJT05fUFJPUFMpO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgY29tcGxleGl0eSAqL1xufVxuIl19