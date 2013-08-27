(function() {
  jQuery(function() {
    var completer;

    completer = new GmapsCompleter({
      inputField: '#gmaps-input-address',
      errorField: '#gmaps-error'
    });
    return completer.autoCompleteInit({
      country: "us"
    });
  });

}).call(this);
