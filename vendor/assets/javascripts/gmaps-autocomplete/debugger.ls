module.exports =
  debugOn: false

  debug: (label, obj) ->
    return if not @debugOn
    console.log label, obj
