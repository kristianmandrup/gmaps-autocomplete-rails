class GmapsCompleter
  geocoder: null
  map: null
  marker: null
  inputField: null
  errorField: null
  positionOutputter: null
  updateUI: null
  updateMap: null
  region: null
  country: null
  debugOn: false

  # initialise the google maps objects, and add listeners
  mapElem: null
  zoomLevel: 2
  mapType: null
  pos: [0, 0]
  inputField: '#gmaps-input-address'
  errorField: '#gmaps-error'

  constructor: (opts) ->
    @init opts

  init: (opts) ->
    opts      = opts || {}
    callOpts  = $.extend true, {}, opts

    @debugOn    = opts['debugOn']

    @debug 'init(opts)', opts

    completerAssistClass = opts['assist']

    try
      @assist = new completerAssistClass

    catch error
      @debug 'assist error', error, opts['assist']

    @assist ||= new GmapsCompleterDefaultAssist

    @defaultOptions = opts['defaultOptions'] || @assist.options
    opts  = $.extend true, {}, @defaultOptions, opts

    @positionOutputter  = opts['positionOutputter'] || @assist.positionOutputter
    @updateUI           = opts['updateUI'] || @assist.updateUI
    @updateMap          = opts['updateMap'] || @assist.updateMap

    @geocodeErrorMsg    = opts['geocodeErrorMsg'] || @assist.geocodeErrorMsg
    @geocodeErrorMsg    = opts['geocodeErrorMsg'] || @assist.geocodeErrorMsg
    @noAddressFoundMsg  = opts['noAddressFoundMsg'] || @assist.noAddressFoundMsg

    pos   = opts['pos']
    lat   = pos[0]
    lng   = pos[1]

    mapType   = opts['mapType']
    mapElem   = null
    @mapElem  =  $("gmaps-canvas")

    @mapElem  = $(opts['mapElem']).get(0) if opts['mapElem']
    @mapType  = google.maps.MapTypeId.ROADMAP

    zoomLevel = opts['zoomLevel']
    scrollwheel = opts['scrollwheel']

    @inputField = opts['inputField']
    @errorField = opts['#gmaps-error']
    @debugOn    = opts['debugOn']

    @debug 'called with opts',  callOpts
    @debug 'final completerAssist', @completerAssist
    @debug 'defaultOptions',    @defaultOptions
    @debug 'options after merge with defaults', opts

    # center of the universe
    latlng = new google.maps.LatLng(lat, lng)
    @debug 'lat,lng', latlng

    mapOptions =
      zoom: zoomLevel
      scrollwheel: scrollwheel
      center: latlng
      mapTypeId: mapType

    @debug 'map options', mapOptions

    # the geocoder object allows us to do latlng lookup based on address
    @geocoder = new google.maps.Geocoder()

    self = @

    if typeof(@mapElem) == 'undefined'
      @showError("Map element " + opts['mapElem'] + " could not be resolved!")

    @debug 'mapElem', @mapElem

    return if not @mapElem

    # create our map object
    @map = new google.maps.Map @mapElem, mapOptions

    return if not @map

    # the marker shows us the position of the latest address
    @marker = new google.maps.Marker(
      map: @map
      draggable: true
    )

    self.addMapListeners @marker, @map

  debug: (label, obj) ->
    return if not @debugOn
    console.log label, obj

  addMapListeners: (marker, map) ->
    self = @;
    # event triggered when marker is dragged and dropped
    google.maps.event.addListener marker, 'dragend', ->
      self.geocodeLookup 'latLng', marker.getPosition()

    # event triggered when map is clicked
    google.maps.event.addListener map, 'click', (event) ->
      marker.setPosition event.latLng
      self.geocodeLookup 'latLng', event.latLng


  # Query the Google geocode object
  #
  # type: 'address' for search by address
  #       'latLng'  for search by latLng (reverse lookup)
  #
  # value: search query
  #
  # update: should we update the map (center map and position marker)?
  geocodeLookup: ( type, value, update ) ->
    # default value: update = false
    @update ||= false

    request = {}
    request[type] = value

    @geocoder.geocode request, @performGeocode

  performGeocode: (results, status) =>
    @debug 'performGeocode', status

    $(@errorField).html ''

    if (status == google.maps.GeocoderStatus.OK) then @geocodeSuccess(results) else @geocodeFailure(type, value)

  geocodeSuccess: (results) ->
    @debug 'geocodeSuccess', results

    # Google geocoding has succeeded!
    if results[0]
      # Always update the UI elements with new location data
      @updateUI results[0].formatted_address, results[0].geometry.location

      # Only update the map (position marker and center map) if requested
      @updateMap(results[0].geometry) if @update

    else
      # Geocoder status ok but no results!?
      @showError @geocodeErrorMsg()

  geocodeFailure: (type, value) ->
    @debug 'geocodeFailure', type

    # Google Geocoding has failed. Two common reasons:
    #   * Address not recognised (e.g. search for 'zxxzcxczxcx')
    #   * Location doesn't map to address (e.g. click in middle of Atlantic)
    if (type == 'address')
      # User has typed in an address which we can't geocode to a location
      @showError @invalidAddressMsg(value)
    else
      # User has clicked or dragged marker to somewhere that Google can't do a reverse lookup for
      # In this case we display a warning, clear the address box, but fill in LatLng
      @showError @noAddressFoundMsg()
      @updateUI '', value

  showError: (msg) ->
    $(@errorField).html(msg)
    $(@errorField).show()

    setTimeout( ->
      $(@errorField).hide()
    , 1000)

  # initialise the jqueryUI autocomplete element
  autoCompleteInit: (opts) ->
    opts      = opts || {}
    @region   = opts['region']  || @defaultOptions['region']
    @country  = opts['country'] || @defaultOptions['country']
    @debug 'region', @region

    self = @

    autocompleteOpts = opts['autocomplete'] || {}

    defaultAutocompleteOpts =
      # event triggered when drop-down option selected
      select: (event,ui) ->
        self.updateUI  ui.item.value, ui.item.geocode.geometry.location
        self.updateMap ui.item.geocode.geometry
      # source is the list of input options shown in the autocomplete dropdown.
      # see documentation: http://jqueryui.com/demos/autocomplete/
      source: (request,response) ->
        # https://developers.google.com/maps/documentation/geocoding/#RegionCodes
        region_postfix  = ''
        region          = self.region

        region_postfix = ', ' + region if region
        address = request.term + region_postfix

        self.debug 'geocode address', address

        geocodeOpts = { address: address, componentRestrictions: { country: region || '' } }

        # the geocode method takes an address or LatLng to search for
        # and a callback function which should process the results into
        # a format accepted by jqueryUI autocomplete
        self.geocoder.geocode(geocodeOpts, (results, status) ->
          response(
            $.map(results, (item) ->
              uiAddress = item.formatted_address.replace ", " + self.country, ''
              # var uiAddress = item.formatted_address;
              {
              label: uiAddress # appears in dropdown box
              value: uiAddress # inserted into input element when selected
              geocode: item    # all geocode data: used in select callback event
              }
            )
          )
        )

    autocompleteOpts = $.extend true, defaultAutocompleteOpts, autocompleteOpts

    $(@inputField).autocomplete(autocompleteOpts)

    # triggered when user presses a key in the address box
    $(@inputField).bind 'keydown', @keyDownHandler
    # autocomplete_init

  keyDownHandler: (event) =>
    if (event.keyCode == 13)
      @geocodeLookup 'address', $(@inputField).val(), true
      # ensures dropdown disappears when enter is pressed
      $(@inputField).autocomplete "disable"
    else
      # re-enable if previously disabled above
      $(@inputField).autocomplete "enable"


class GmapsCompleterDefaultAssist
  options:
    mapElem: '#gmaps-canvas'
    zoomLevel: 2
    mapType: google.maps.MapTypeId.ROADMAP
    pos: [0, 0]
    inputField: '#gmaps-input-address'
    errorField: '#gmaps-error'
    debugOn: true

  # move the marker to a new position, and center the map on it
  updateMap: (geometry) ->
    map     = @map
    marker  = @marker

    map.fitBounds(geometry.viewport) if map
    marker.setPosition(geometry.location) if marker

  # fill in the UI elements with new position data
  updateUI: (address, latLng) ->
    inputField = @inputField
    country = @country

    $(inputField).autocomplete 'close'

    @debug 'country', country

    updateAdr = address.replace ', ' + country, ''
    updateAdr = address

    @debug 'updateAdr', updateAdr

    $(inputField).val updateAdr
    @positionOutputter latLng

  positionOutputter: (latLng) ->
    $('#gmaps-output-latitude').html latLng.lat()
    $('#gmaps-output-longitude').html latLng.lng()

  geocodeErrorMsg: ->
    "Sorry, something went wrong. Try again!"

  invalidAddressMsg: (value) ->
    "Sorry! We couldn't find " + value + ". Try a different search term, or click the map."

  noAddressFoundMsg: ->
    "Woah... that's pretty remote! You're going to have to manually enter a place name."

window.GmapsCompleter = GmapsCompleter
window.GmapsCompleterDefaultAssist = GmapsCompleterDefaultAssist
