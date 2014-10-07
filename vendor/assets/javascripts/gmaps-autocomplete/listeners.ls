module.exports =
  keyDownHandler: (event) =>
    if (event.keyCode == 13)
      @lookup 'address', @input-field.val(), true
      # ensures dropdown disappears when enter is pressed
      @input-field.autocomplete "disable"
    else
      # re-enable if previously disabled above
      @inputField.autocomplete "enable"

  addMapListeners: (marker, map) ->
    self = @;
    # event triggered when marker is dragged and dropped
    google.maps.event.addListener marker, 'dragend', ->
      self.geocodeLookup 'latLng', marker.getPosition()

    # event triggered when map is clicked
    google.maps.event.addListener map, 'click', (event) ->
      marker.setPosition event.latLng
      self.geocodeLookup 'latLng', event.latLng
