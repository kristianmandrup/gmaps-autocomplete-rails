module.exports =
  clear-error: ->
    @error-field.html ''

  error: (msg) ->
    @error-field.html msg
    @error-field.show!

    setTimeout( ->
      @errorField.hide!
    , 1000)
