var GmapsAutoComplete = {
  geocoder: null,
  map: null,
  marker: null,
  inputField: null,
  errorField: null,
  positionOutputter: null,
  updateUI: null,
  updateMap: null,
  region: null,

  // initialise the google maps objects, and add listeners
  mapElem: document.getElementById("gmaps-canvas"), 
  zoomLevel: 2, 
  mapType: google.maps.MapTypeId.ROADMAP,
  pos: [51.751724, -1.255284],
  inputField: '#gmaps-input-address',
  errorField: '#gmaps-error',
  positionOutputter: this.defaultPositionOutputter,

  init: function(opts){
    opts = opts || {};

    defaultOptions = {
      mapElem: "#gmaps-canvas", 
      zoomLevel: 2, 
      mapType: google.maps.MapTypeId.ROADMAP,
      pos: [51.751724, -1.255284],
      inputField: '#gmaps-input-address',
      errorField: '#gmaps-error',
      positionOutputter: this.defaultPositionOutputter,
      updateUI : this.defaultUpdateUI,
      updateMap : this.defaultUpdateMap
    };

    $.extend(opts, defaultOptions);

    var pos = opts['pos'];
    var lat = pos[0];
    var lng = pos[1];

    var mapType = opts['mapType'];
    var mapElem = null;
    
    if (opts['mapElem']) {
      mapElem = $(opts['mapElem']).get(0);  
    }
    
    var zoomLevel = opts['zoomLevel'];
    
    this.inputField = opts['inputField'];
    this.errorField = opts['#gmaps-error'];

    this.positionOutputter = opts['positionOutputter'];
    this.updateUI = opts['updateUI'];
    this.updateMap = opts['updateMap'];

    // center of the universe
    var latlng = new google.maps.LatLng(lat, lng);

    var options = {
      zoom: zoomLevel,
      center: latlng,
      mapTypeId: mapType
    };

    // the geocoder object allows us to do latlng lookup based on address
    geocoder = new google.maps.Geocoder();

    var self = this;

    if (typeof(mapElem) == 'undefined') {
      self.showError("Map element " + opts['mapElem'] + " could not be resolved!");
    }

    if (!mapElem) { return }
    
    // create our map object
    this.map = new google.maps.Map(mapElem, options);

    if (!this.map) { return }

    // the marker shows us the position of the latest address
    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true
    });

    self.addMapListeners(this.marker, this.map);
  },

  addMapListeners: function(marker, map) {
    self = this;
    // event triggered when marker is dragged and dropped
    google.maps.event.addListener(marker, 'dragend', function() {
      self.geocodeLookup( 'latLng', marker.getPosition() );
    });

    // event triggered when map is clicked
    google.maps.event.addListener(map, 'click', function(event) {
      marker.setPosition(event.latLng)
      self.geocodeLookup( 'latLng', event.latLng  );
    });
  },

  // move the marker to a new position, and center the map on it
  defaultUpdateMap: function( geometry ) {
    var map = this.map;
    var marker = this.marker;

    if (map) {
      map.fitBounds( geometry.viewport )
    }

    if (marker) {
      marker.setPosition( geometry.location )  
    }
  },

  // fill in the UI elements with new position data
  defaultUpdateUI: function( address, latLng ) {
    $(this.inputField).autocomplete("close");
    $(this.inputField).val(address);

    this.positionOutputter(latLng);
  },

  defaultPositionOutputter: function(latLng) {
    $('#gmaps-output-latitude').html(latLng.lat());
    $('#gmaps-output-longitude').html(latLng.lng());    
  },

  // Query the Google geocode object
  //
  // type: 'address' for search by address
  //       'latLng'  for search by latLng (reverse lookup)
  //
  // value: search query
  //
  // update: should we update the map (center map and position marker)?
  geocodeLookup: function( type, value, update ) {
    // default value: update = false
    update = typeof update !== 'undefined' ? update : false;

    request = {};
    request[type] = value;
    var self = this;

    geocoder.geocode(request, performGeocode);
  },

  performGeocode: function(results, status) {
    $(self.errorField).html('');
    if (status == google.maps.GeocoderStatus.OK) {
      self.geocodeSuccess(results);
    } else {
      self.geocodeFailure(type, value);
    };
  },

  geocodeSuccess: function(results) {
    // Google geocoding has succeeded!
    if (results[0]) {
      // Always update the UI elements with new location data
      this.updateUI( results[0].formatted_address,
                 results[0].geometry.location )

      // Only update the map (position marker and center map) if requested
      if( update ) { this.updateMap( results[0].geometry ) }
    } else {
      // Geocoder status ok but no results!?
      this.showError( this.geocodeErrorMsg() );
    }
  },

  geocodeFailure: function(type, value) {
    // Google Geocoding has failed. Two common reasons:
    //   * Address not recognised (e.g. search for 'zxxzcxczxcx')
    //   * Location doesn't map to address (e.g. click in middle of Atlantic)
    if( type == 'address' ) {
      // User has typed in an address which we can't geocode to a location
      this.showError( this.invalidAddressMsg(value) );
    } else {
      // User has clicked or dragged marker to somewhere that Google can't do a reverse lookup for
      // In this case we display a warning, clear the address box, but fill in LatLng
      this.showError( this.noAddressFoundMsg() );
      this.updateUI('', value)
    }    
  },

  geocodeErrorMsg: function() {
    "Sorry, something went wrong. Try again!"
  },

  invalidAddressMsg: function(value) {
    "Sorry! We couldn't find " + value + ". Try a different search term, or click the map."
  },

  noAddressFoundMsg: function() {
    "Woah... that's pretty remote! You're going to have to manually enter a place name."
  },

  showError: function(msg) {    
    $(this.errorField).html(msg);
    $(this.errorField).show();

    setTimeout(function(){
      $(this.errorField).hide();
    }, 1000);
  },

  // initialise the jqueryUI autocomplete element
  autoCompleteInit: function (opts) {
    opts = opts || {};
    this.region = opts['region'] || 'DK';
    // console.log('inputField', this.inputField);

    var self = this;

    $(this.inputField).autocomplete({
      // source is the list of input options shown in the autocomplete dropdown.
      // see documentation: http://jqueryui.com/demos/autocomplete/
      source: self.autoCompleteSource,
      // event triggered when drop-down option selected
      select: function(event,ui){
        self.updateUI(  ui.item.value, ui.item.geocode.geometry.location )
        self.updateMap( ui.item.geocode.geometry )
      }
    });

    // triggered when user presses a key in the address box
    $(self.inputField).bind('keydown', this.keyDownHandler);
  }, // autocomplete_init

  keyDownHandler: function(event) {
    if(event.keyCode == 13) {
      this.geocodeLookup( 'address', $(self.inputField).val(), true );

      // ensures dropdown disappears when enter is pressed
      $(this.inputField).autocomplete("disable")
    } else {
      // re-enable if previously disabled above
      $(this.inputField).autocomplete("enable")
    }
  },

  // self grants access to caller scope
  autoCompleteSource: function(request,response) {
    // https://developers.google.com/maps/documentation/geocoding/#RegionCodes
    var region_postfix = ''
    var region = self.region;

    if (region) {
      region_postfix = ', ' + region
    }

    geocode_opts = {'address': request.term + region_postfix }

    // the geocode method takes an address or LatLng to search for
    // and a callback function which should process the results into
    // a format accepted by jqueryUI autocomplete
    geocoder.geocode(geocode_opts, function(results, status) {
      response($.map(results, function(item) {
        return {
          label: item.formatted_address, // appears in dropdown box
          value: item.formatted_address, // inserted into input element when selected
          geocode: item                  // all geocode data: used in select callback event
        }
      }));
    })
  }  
}
