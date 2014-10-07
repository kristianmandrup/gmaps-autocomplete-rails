module.exports = class GeoCoder implements ErrorHandler, Debugger
  (@completer) ->

  # Query the Google geocode object
  #
  # type: 'address' for search by address
  #       'latLng'  for search by latLng (reverse lookup)
  #
  # value: search query
  #
  # update: should we update the map (center map and position marker)?
  lookup: (@type, @value, @update) ->
    # default value: update = false
    @update ||= false

    request = {}
    request[@type] = @value

    @geocoder.geocode request, @geocode

  # default callback for geocode result
  geocode: (results, status) ->
    @debug 'geocode', status
    if @geocoded(status) then @success(results) else @failure(@type, @value)

  geocoded: (status) ->
    status == google.maps.GeocoderStatus.OK

  parse: (results) ->
    result = results[0]
    return void unless result

    # Google geocoding has succeeded!
    address:  result.formatted_address
    location: result.geometry.location
    position: result.geometry

  success: (results) ->
    @debug 'success', results
    found(@parse results) or none-found

  found: (result) ->
    return unless result
    # Always update the UI elements with new location data
    @display result.address, result.location

    # Only update the map (position marker and center map) if requested
    @update-map(result.position) if @update


  none-found: ->
    # Geocoder status ok but no results!?
    @error @geocodeErrorMsg()

  failure: (error) ->
    @debug 'failure', error.type

    # Google Geocoding has failed. Two common reasons:
    #   * Address not recognised (e.g. search for 'zxxzcxczxcx')
    #   * Location doesn't map to address (e.g. click in middle of Atlantic)
    if (type == 'address')
      # User has typed in an address which we can't geocode to a location
      @error @invalidAddressMsg(error.value)
    else
      # User has clicked or dragged marker to somewhere that Google can't do a reverse lookup for
      # In this case we display a warning, clear the address box, but fill in LatLng
      @error @noAddressFoundMsg()
      @display '', error.value