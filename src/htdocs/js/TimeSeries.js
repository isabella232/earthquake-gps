/* global Dygraph, MOUNT_PATH, STATION */
'use strict';


var Xhr = require('util/Xhr');

/**
 * Class for creating Kinematic TimeSeries plots
 *
 * @param options {Object}
 */
var TimeSeries = function (options) {
  var _this,
      _initialize,

      _blockRedraw,
      _color,
      _direction,
      _el,
      _graph,
      _graphs,

      _draw,
      _getDateString,
      _loadData;


  _this = {};

  _initialize = function (options) {
    options = options || {};
    _color = options.color;
    _direction = options.direction;
    _el = options.el || document.createElement('div');
    _graphs = options.graphs || [];

    _blockRedraw = false;

    _loadData();
  };


  /**
   * Draw timeseries using Dygraph library; add timeseries to array of graphs
   *
   * @param data {String}
   */
  _draw = function (data) {
    _graph = new Dygraph(_el, data, {
      animatedZooms: true,
      axes: {
        x: {
          valueFormatter: function(num/*, opts, seriesName, dygraph, row, col*/) {
            return _getDateString(new Date(num));
          }
        }
      },
      color: _color,
      digitsAfterDecimal: 4,
      gridLinePattern: [3, 3],
      height: 200,
      labelsDivWidth: 300,
      panEdgeFraction: 0.1,
      sigFigs: 2,
      title: _direction.capitalize(),
      ylabel: 'm',

      // sync xrange of graphs (zooming and panning)
      drawCallback: function(graph, is_initial) {
        var xrange;

        if (_blockRedraw || is_initial) {
          return;
        }

        _blockRedraw = true;
        xrange = graph.xAxisRange();
        for (var i = 0; i < _graphs.length; i ++) {
          if (_graphs[i] === graph) {
            continue;
          }
          _graphs[i].updateOptions({
            dateWindow: xrange
          });
        }
        _blockRedraw = false;
      },

      // show legend on all graphs on mouseover
      highlightCallback: function(/*event, x, points, row, seriesName*/) {
        for (var i = 0; i < _graphs.length; i ++) {
          _graphs[i].setSelection(arguments[3]);
        }
      },

      // clear legends on mouseout
      unhighlightCallback: function(/*event*/) {
        for (var i = 0; i < _graphs.length; i ++) {
          _graphs[i].clearSelection();
        }
      },

      // enable reset link when zoomed in
      zoomCallback: function(/*minDate, maxDate, yRanges*/) {
        document.querySelector('.reset').classList.remove('disabled');
      }
    });

    _graphs.push(_graph);
  };

  /**
   * Get formatted date string
   *
   * @param d {Date}
   *
   * @return {String}
   */
  _getDateString = function (d) {
    function pad (n) {
      return (n < 10 ? '0' + n : n);
    }

    return d.getFullYear() + '-' +
      pad(d.getMonth() + 1) + '-' +
      pad(d.getDate()) + ' ' +
      pad(d.getHours()) + ':' +
      pad(d.getMinutes()) + ':' +
      pad(d.getSeconds()) + ' UTC';
  };

  /**
   * Load kinematic data via Xhr
   */
  _loadData = function () {
    Xhr.ajax({
      url: MOUNT_PATH + '/_getKinematic.txt.php?direction=' + _direction + '&station=' + STATION,
      success: _draw,
      error: function (status) {
        console.log(status);
      }
    });
  };

  /**
   * Reset timeseries to initial zoom
   */
  _this.reset = function () {
    _graph.updateOptions({
      dateWindow: null,
      valueRange: null
    });
  };

  /**
   * Pan timeseries left and right when it's zoomed in
   *
   * @param direction {Int}
   *    1 or -1
   */
  _this.pan = function(direction) {
    var amount,
        desired_range,
        scale,
        x;

    x = _graph.xAxisRange();
    scale = x[1] - x[0];
    amount = scale * 0.25 * direction;
    desired_range = [
      x[0] + amount,
      x[1] + amount
    ];

    _graph.updateOptions({
      dateWindow: desired_range
    });
  };

  _initialize(options);
  options = null;
  return _this;
};

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.substring(1);
};

module.exports = TimeSeries;
