Displayer       = require './displayer'
AutoCompleter   = require './auto-completer'
GeoCoder        = require './geocoder'

Debugger        = require './debugger'
ErrorHandler    = require './error-handler'

module.exports = class GmapsCompleter implements ErrorHandler, Debugger, Listeners
  (options = {}) ->
    @configure!
    @

  config-helpers: ->
    for helper in ['displayer', 'autoCompleter', 'geocoder']
      @[helper] = options[helper] or @defaults[helper]!

  defaults:
    displayer: ->
      new Displayer(@)
    auto-completer: ->
      new AutoCompleter
    geocoder: ->
      new GeoCoder(@)

  configure: ->
    @config <<< options
    @config-helpers!

    @debug-on     = @config.debug
    @lat          = @config.map.lat
    @lng          = @config.map.lng
    @input-field  = $ config.element.input
    @error-field  = $ config.element.error
    @geocoder     = new google.maps.Geocoder
    @

  map-element: ->
    @map   = $ config.element.map
    unless @map
      @error("Map element " + config.element.map + " could not be resolved!")

  config:
    map:
      zoom: 2
      type: google.maps.MapTypeId.ROADMAP
      position:
        lat: 0
        lng: 0

    element:
      map:        '#gmaps-canvas'
      input:      '#gmaps-input-address'
      error:      '#gmaps-error'
      latitude:   '#gmaps-output-latitude'
      longitude:  '#gmaps-output-longitude'

    debug: false
