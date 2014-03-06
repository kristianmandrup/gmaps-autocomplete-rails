var GmapsCompleter, GmapsCompleterDefaultAssist,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

GmapsCompleter = (function() {
  GmapsCompleter.prototype.geocoder = null;

  GmapsCompleter.prototype.map = null;

  GmapsCompleter.prototype.marker = null;

  GmapsCompleter.prototype.inputField = null;

  GmapsCompleter.prototype.errorField = null;

  GmapsCompleter.prototype.positionOutputter = null;

  GmapsCompleter.prototype.updateUI = null;

  GmapsCompleter.prototype.updateMap = null;

  GmapsCompleter.prototype.region = null;

  GmapsCompleter.prototype.country = null;

  GmapsCompleter.prototype.debugOn = false;

  GmapsCompleter.prototype.mapElem = null;

  GmapsCompleter.prototype.zoomLevel = 2;

  GmapsCompleter.prototype.mapType = null;

  GmapsCompleter.prototype.pos = [0, 0];

  GmapsCompleter.prototype.inputField = '#gmaps-input-address';

  GmapsCompleter.prototype.errorField = '#gmaps-error';

  function GmapsCompleter(opts) {
    this.keyDownHandler = __bind(this.keyDownHandler, this);
    this.performGeocode = __bind(this.performGeocode, this);
    this.init(opts);
  }

  GmapsCompleter.prototype.init = function(opts) {
    var callOpts, completerAssistClass, error, lat, latlng, lng, mapElem, mapOptions, mapType, pos, self, zoomLevel;
    opts = opts || {};
    callOpts = $.extend(true, {}, opts);
    this.debugOn = opts['debugOn'];
    this.debug('init(opts)', opts);
    completerAssistClass = opts['assist'];
    try {
      this.assist = new completerAssistClass;
    } catch (_error) {
      error = _error;
      this.debug('assist error', error, opts['assist']);
    }
    this.assist || (this.assist = new GmapsCompleterDefaultAssist);
    this.defaultOptions = opts['defaultOptions'] || this.assist.options;
    opts = $.extend(true, {}, this.defaultOptions, opts);
    this.positionOutputter = opts['positionOutputter'] || this.assist.positionOutputter;
    this.updateUI = opts['updateUI'] || this.assist.updateUI;
    this.updateMap = opts['updateMap'] || this.assist.updateMap;
    this.geocodeErrorMsg = opts['geocodeErrorMsg'] || this.assist.geocodeErrorMsg;
    this.geocodeErrorMsg = opts['geocodeErrorMsg'] || this.assist.geocodeErrorMsg;
    this.noAddressFoundMsg = opts['noAddressFoundMsg'] || this.assist.noAddressFoundMsg;
    pos = opts['pos'];
    lat = pos[0];
    lng = pos[1];
    mapType = opts['mapType'];
    mapElem = null;
    this.mapElem = $("gmaps-canvas");
    if (opts['mapElem']) {
      this.mapElem = $(opts['mapElem']).get(0);
    }
    this.mapType = google.maps.MapTypeId.ROADMAP;
    zoomLevel = opts['zoomLevel'];
    this.inputField = opts['inputField'];
    this.errorField = opts['#gmaps-error'];
    this.debugOn = opts['debugOn'];
    this.debug('called with opts', callOpts);
    this.debug('final completerAssist', this.completerAssist);
    this.debug('defaultOptions', this.defaultOptions);
    this.debug('options after merge with defaults', opts);
    latlng = new google.maps.LatLng(lat, lng);
    this.debug('lat,lng', latlng);
    mapOptions = {
      zoom: zoomLevel,
      center: latlng,
      mapTypeId: mapType
    };
    this.debug('map options', mapOptions);
    this.geocoder = new google.maps.Geocoder();
    self = this;
    if (typeof this.mapElem === 'undefined') {
      this.showError("Map element " + opts['mapElem'] + " could not be resolved!");
    }
    this.debug('mapElem', this.mapElem);
    if (!this.mapElem) {
      return;
    }
    this.map = new google.maps.Map(this.mapElem, mapOptions);
    if (!this.map) {
      return;
    }
    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true
    });
    return self.addMapListeners(this.marker, this.map);
  };

  GmapsCompleter.prototype.debug = function(label, obj) {
    if (!this.debugOn) {
      return;
    }
    return console.log(label, obj);
  };

  GmapsCompleter.prototype.addMapListeners = function(marker, map) {
    var self;
    self = this;
    google.maps.event.addListener(marker, 'dragend', function() {
      return self.geocodeLookup('latLng', marker.getPosition());
    });
    return google.maps.event.addListener(map, 'click', function(event) {
      marker.setPosition(event.latLng);
      return self.geocodeLookup('latLng', event.latLng);
    });
  };

  GmapsCompleter.prototype.geocodeLookup = function(type, value, update) {
    var request;
    this.update || (this.update = false);
    request = {};
    request[type] = value;
    return this.geocoder.geocode(request, this.performGeocode);
  };

  GmapsCompleter.prototype.performGeocode = function(results, status) {
    this.debug('performGeocode', status);
    $(this.errorField).html('');
    if (status === google.maps.GeocoderStatus.OK) {
      return this.geocodeSuccess(results);
    } else {
      return this.geocodeFailure(type, value);
    }
  };

  GmapsCompleter.prototype.geocodeSuccess = function(results) {
    this.debug('geocodeSuccess', results);
    if (results[0]) {
      this.updateUI(results[0].formatted_address, results[0].geometry.location);
      if (this.update) {
        return this.updateMap(results[0].geometry);
      }
    } else {
      return this.showError(this.geocodeErrorMsg());
    }
  };

  GmapsCompleter.prototype.geocodeFailure = function(type, value) {
    this.debug('geocodeFailure', type);
    if (type === 'address') {
      return this.showError(this.invalidAddressMsg(value));
    } else {
      this.showError(this.noAddressFoundMsg());
      return this.updateUI('', value);
    }
  };

  GmapsCompleter.prototype.showError = function(msg) {
    $(this.errorField).html(msg);
    $(this.errorField).show();
    return setTimeout(function() {
      return $(this.errorField).hide();
    }, 1000);
  };

  GmapsCompleter.prototype.autoCompleteInit = function(opts) {
    var autocompleteOpts, defaultAutocompleteOpts, self;
    opts = opts || {};
    this.region = opts['region'] || this.defaultOptions['region'];
    this.country = opts['country'] || this.defaultOptions['country'];
    this.debug('region', this.region);
    self = this;
    autocompleteOpts = opts['autocomplete'] || {};
    defaultAutocompleteOpts = {
      select: function(event, ui) {
        self.updateUI(ui.item.value, ui.item.geocode.geometry.location);
        return self.updateMap(ui.item.geocode.geometry);
      },
      source: function(request, response) {
        var address, geocodeOpts, region, region_postfix;
        region_postfix = '';
        region = self.region;
        if (region) {
          region_postfix = ', ' + region;
        }
        address = request.term + region_postfix;
        self.debug('geocode address', address);
        geocodeOpts = {
          'address': address
        };
        return self.geocoder.geocode(geocodeOpts, function(results, status) {
          return response($.map(results, function(item) {
            var uiAddress;
            uiAddress = item.formatted_address.replace(", " + self.country, '');
            return {
              label: uiAddress,
              value: uiAddress,
              geocode: item
            };
          }));
        });
      }
    };
    autocompleteOpts = $.extend(true, defaultAutocompleteOpts, autocompleteOpts);
    $(this.inputField).autocomplete(autocompleteOpts);
    return $(this.inputField).bind('keydown', this.keyDownHandler);
  };

  GmapsCompleter.prototype.keyDownHandler = function(event) {
    if (event.keyCode === 13) {
      this.geocodeLookup('address', $(this.inputField).val(), true);
      return $(this.inputField).autocomplete("disable");
    } else {
      return $(this.inputField).autocomplete("enable");
    }
  };

  return GmapsCompleter;

})();

GmapsCompleterDefaultAssist = (function() {
  function GmapsCompleterDefaultAssist() {}

  GmapsCompleterDefaultAssist.prototype.options = {
    mapElem: '#gmaps-canvas',
    zoomLevel: 2,
    mapType: google.maps.MapTypeId.ROADMAP,
    pos: [0, 0],
    inputField: '#gmaps-input-address',
    errorField: '#gmaps-error',
    debugOn: true
  };

  GmapsCompleterDefaultAssist.prototype.updateMap = function(geometry) {
    var map, marker;
    map = this.map;
    marker = this.marker;
    if (map) {
      map.fitBounds(geometry.viewport);
    }
    if (marker) {
      return marker.setPosition(geometry.location);
    }
  };

  GmapsCompleterDefaultAssist.prototype.updateUI = function(address, latLng) {
    var country, inputField, updateAdr;
    inputField = this.inputField;
    country = this.country;
    $(inputField).autocomplete('close');
    this.debug('country', country);
    updateAdr = address.replace(', ' + country, '');
    updateAdr = address;
    this.debug('updateAdr', updateAdr);
    $(inputField).val(updateAdr);
    return this.positionOutputter(latLng);
  };

  GmapsCompleterDefaultAssist.prototype.positionOutputter = function(latLng) {
    $('#gmaps-output-latitude').html(latLng.lat());
    return $('#gmaps-output-longitude').html(latLng.lng());
  };

  GmapsCompleterDefaultAssist.prototype.geocodeErrorMsg = function() {
    return "Sorry, something went wrong. Try again!";
  };

  GmapsCompleterDefaultAssist.prototype.invalidAddressMsg = function(value) {
    return "Sorry! We couldn't find " + value + ". Try a different search term, or click the map.";
  };

  GmapsCompleterDefaultAssist.prototype.noAddressFoundMsg = function() {
    return "Woah... that's pretty remote! You're going to have to manually enter a place name.";
  };

  return GmapsCompleterDefaultAssist;

})();

window.GmapsCompleter = GmapsCompleter;

window.GmapsCompleterDefaultAssist = GmapsCompleterDefaultAssist;
