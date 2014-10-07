module.exports = class Displayer
  (@completer) ->
    @map     = @completer.map
    @element = @completer.config.element
    @marker  = @completer.marker

  # move the marker to a new position, and center the map on it
  updateMap: (geometry) ->
    @map.fitBounds(geometry.viewport) if @map
    @marker.setPosition(geometry.location) if @marker

  # fill in the UI elements with new position data
  updateUI: (address, position, geocoderResponse) ->
    $(@element.input).autocomplete 'close'

    @debug 'country', @country
    @debug 'geocoderResponse', geocoderResponse

    address.replace ', ' + country, ''
    updateAdr = address

    @debug 'update address', updateAdr

    $(@element.input).val updateAdr
    @positionOutputter position

  positionOutputter: (position) ->
    $(@element.latitude).html position.lat()
    $(@element.longitude).html position.lng()