/* global network */ // passed via var embedded in html page

'use strict';

var L = require('leaflet'),
    Util = require('util/Util');

require('leaflet.label');

var _DEFAULTS = {
  alt: 'GPS station'
};
var _SHAPES = {
  continuous: 'square',
  campaign: 'triangle'
};
var _LAYERNAMES = {
  blue: 'Past 3 days',
  red: 'Over 14 days ago',
  orange: '8&ndash;14 days ago',
  yellow: '4&ndash;7 days ago'
};

/**
 * Factory for Stations overlay
 *
 * @param data {String}
 *        contents of geojson file containing stations
 * @param options {Object}
 *        Leaflet Marker options
 *
 * @return {Object}
 *         Leaflet featureGroup
 */
var StationsLayer = function (data, options) {
  var _this,
      _initialize,

      _bounds,
      _icons,
      _popups,

      _getColor,
      _getIcon,
      _onEachFeature,
      _pointToLayer;

  _this = L.featureGroup();

  _initialize = function () {
    options = Util.extend(_DEFAULTS, options);
    _this.layers = {};

    _bounds = new L.LatLngBounds();
    _icons = {};
    _popups = {};

    L.geoJson(data, {
      onEachFeature: _onEachFeature,
      pointToLayer: _pointToLayer
    });
  };

  /**
   * Get icon color
   *
   * @param days {Integer}
   *        days since station last updated
   *
   * @return color {String}
   */
  _getColor = function (days) {
    var color = 'red'; //default

    if (days > 14) {
      color = 'red';
    } else if (days > 7) {
      color = 'orange';
    } else if (days > 3) {
      color = 'yellow';
    } else if (days >= 0) {
      color = 'blue';
    }

    return color;
  };

  /**
   * Get Leaflet icon for station
   *
   * @param days {Integer}
   * @param type {String}
   *        'campaign' or 'continuous'
   *
   * @return _icons[key] {Object}
   *         Leaflet Icon
   */
  _getIcon = function (key) {
    var icon_options;

    // Don't recreate existing icons
    if (!_icons[key]) {
      icon_options = {
        iconSize: [20, 30],
        iconAnchor: [10, 14],
        popupAnchor: [0.5, -10],
        labelAnchor: [5, -4],
        iconUrl: '/monitoring/gps/img/pin-s-' + key + '.png',
        iconRetinaUrl: '/monitoring/gps/img/pin-s-' + key + '-2x.png'
      };

      _icons[key] = L.icon(icon_options);
    }

    return _icons[key];
  };

  /**
   * Leaflet GeoJSON option: called on each created feature layer. Useful for
   * attaching events and popups to features.
   */
  _onEachFeature = function (feature, layer) {
    var data,
        label,
        popup,
        popupTemplate;

    data = {
      lat: Math.round(feature.geometry.coordinates[1] * 1000) / 1000,
      lon: Math.round(feature.geometry.coordinates[0] * 1000) / 1000,
      network: network,
      station: feature.properties.station.toUpperCase()
    };
    popupTemplate = '<div class="popup station">' +
        '<h1>Station {station}</h1>' +
        '<span>({lat}, {lon})</span>' +
        '<p>{network}</p>' +
      '</div>';
    popup = L.Util.template(popupTemplate, data);
    label = feature.properties.station.toUpperCase();

    layer.bindPopup(popup).bindLabel(label, {
      pane: 'popupPane'
    });

    // Store popup so it can be accessed by getPopup()
    _popups[data.station] = popup;
  };

  /**
   * Leaflet GeoJSON option: used for creating layers for GeoJSON points
   *
   * @return marker {Object}
   *         Leaflet marker
   */
  _pointToLayer = function (feature, latlng) {
    var color,
        key,
        marker,
        name,
        shape;

    color = _getColor(feature.properties.days);
    shape = _SHAPES[feature.properties.type];
    key = shape + '+' + color;
    name = _LAYERNAMES[color];

    options.icon = _getIcon(key);
    marker = L.marker(latlng, options);

    // Group stations in separate layers by type
    if (!_this.layers[name]) {
      _this.layers[name] = L.layerGroup();
      _this.addLayer(_this.layers[name]);
    }
    _this.layers[name].addLayer(marker);

    _bounds.extend(latlng);

    return marker;
  };

  /**
   * Get bounds for station layers
   *
   * @return {Object}
   *         Leaflet latLngBounds
   */
  _this.getBounds = function () {
    return _bounds;
  };

  /**
   * Get popup for station
   *
   * @return {String}
   *         Popup content
   */
  _this.getPopup = function (station) {
    return _popups[station];
  };

  _initialize();

  return _this;
};

L.stationsLayer = StationsLayer;

module.exports = StationsLayer;
