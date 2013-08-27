jQuery ->
    completer = new GmapsCompleter
        inputField: '#gmaps-input-address'
        errorField: '#gmaps-error'

    completer.autoCompleteInit
        country: "us"
