module.exports = class AutoCompleter
  (@options = {}) ->
    @region   = options.region
    @country  = options.country

    @options.auto-complete = @defaults <<< @options.auto-complete

  defaults:
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

      geocodeOpts = {'address': address}

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
