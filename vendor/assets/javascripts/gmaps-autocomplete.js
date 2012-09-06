var GmapsAutoComplete = {
  geocoder: null,
  map: null,
  marker: null,
  inputField: null,
  errorField: null,
  positionOutputter: null,

  // initialise the google maps objects, and add listeners
  mapElem: document.getElementById("gmaps-canvas"), 
  zoomLevel: 2, 
  mapType: google.maps.MapTypeId.ROADMAP,
  pos: [51.751724, -1.255284],
  inputField: '#gmaps-input-address',
  errorField: '#gmaps-error',
  positionOutputter: this.defaultPositionOutputter,

  gmaps_init: function(opts){
    opts = opts || {};

    defaultOptions = {
      mapElem: "#gmaps-canvas", 
      zoomLevel: 2, 
      mapType: google.maps.MapTypeId.ROADMAP,
      pos: [51.751724, -1.255284],
      inputField: '#gmaps-input-address',
      errorField: '#gmaps-error',
      positionOutputter: this.defaultPositionOutputter
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

    if (mapElem) {
      // create our map object
      this.map = new google.maps.Map(mapElem, options);

      if (this.map) {
        // the marker shows us the position of the latest address
        this.marker = new google.maps.Marker({
          map: this.map,
          draggable: true
        });

        marker = this.marker;

        // event triggered when marker is dragged and dropped
        google.maps.event.addListener(this.marker, 'dragend', function() {
          self.geocode_lookup( 'latLng', marker.getPosition() );
        });

        // event triggered when map is clicked
        google.maps.event.addListener(this.map, 'click', function(event) {
          marker.setPosition(event.latLng)
          self.geocode_lookup( 'latLng', event.latLng  );
        });        
      }
    }
  },

  // move the marker to a new position, and center the map on it
  update_map: function( geometry ) {
    if (this.map) {
      this.map.fitBounds( geometry.viewport )
    }

    if (this.marker) {
      this.marker.setPosition( geometry.location )  
    }
  },

  // fill in the UI elements with new position data
  update_ui: function( address, latLng ) {
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
  geocode_lookup: function( type, value, update ) {
    // default value: update = false
    update = typeof update !== 'undefined' ? update : false;

    request = {};
    request[type] = value;
    var self = this;

    geocoder.geocode({address: request.term, region: 'DK'}, function(results, status) {
      $(self.errorField).html('');
      if (status == google.maps.GeocoderStatus.OK) {
        // Google geocoding has succeeded!
        if (results[0]) {
          // Always update the UI elements with new location data
          self.update_ui( results[0].formatted_address,
                     results[0].geometry.location )

          // Only update the map (position marker and center map) if requested
          if( update ) { update_map( results[0].geometry ) }
        } else {
          // Geocoder status ok but no results!?
          self.showError("Sorry, something went wrong. Try again!");
        }
      } else {
        // Google Geocoding has failed. Two common reasons:
        //   * Address not recognised (e.g. search for 'zxxzcxczxcx')
        //   * Location doesn't map to address (e.g. click in middle of Atlantic)

        if( type == 'address' ) {
          // User has typed in an address which we can't geocode to a location
          self.showError("Sorry! We couldn't find " + value + ". Try a different search term, or click the map." );
        } else {
          // User has clicked or dragged marker to somewhere that Google can't do a reverse lookup for
          // In this case we display a warning, clear the address box, but fill in LatLng
          self.showError("Woah... that's pretty remote! You're going to have to manually enter a place name." );
          self.update_ui('', value)
        }
      };
    });
  },

  showError: function(msg) {    
    $(self.errorField).html(msg);
    $(self.errorField).show();

    setTimeout(function(){
      $(self.errorField).hide();
    }, 1000);
  },

  // initialise the jqueryUI autocomplete element
  autocomplete_init: function (opts) {
    var self = this;
    opts = opts || {};
    var region = opts['region'] || 'DK';

    $(self.inputField).autocomplete({

      // source is the list of input options shown in the autocomplete dropdown.
      // see documentation: http://jqueryui.com/demos/autocomplete/
      source: function(request,response) {

        // https://developers.google.com/maps/documentation/geocoding/#RegionCodes
        console.log('region', region);
        var region_postfix = ''
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
      },

      // event triggered when drop-down option selected
      select: function(event,ui){
        self.update_ui(  ui.item.value, ui.item.geocode.geometry.location )
        self.update_map( ui.item.geocode.geometry )
      }
    });

    // triggered when user presses a key in the address box
    $(self.inputField).bind('keydown', function(event) {
      if(event.keyCode == 13) {
        geocode_lookup( 'address', $(self.inputField).val(), true );

        // ensures dropdown disappears when enter is pressed
        $(self.inputField).autocomplete("disable")
      } else {
        // re-enable if previously disabled above
        $(self.inputField).autocomplete("enable")
      }
    });
  } // autocomplete_init
}
