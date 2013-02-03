# Gmaps autocomplete for Rails

Extracted from [gmaps-autocomplete](https://github.com/rjshade/gmaps-autocomplete) and improved markedly and then packaged for use with Rails as an asset gem :)

See it in action here: [http://rjshade.com/projects/gmaps-autocomplete/](http://rjshade.com/projects/gmaps-autocomplete/)

Some more explanation here: [https://github.com/rjshade/gmaps-autocomplete](https://github.com/rjshade/gmaps-autocomplete)

## Install

gem 'gmaps-autocomplete-rails'

You will also need:
* gem 'jquery-rails'
* gem 'jquery-ui-rails'

And run `bundle install`;)

Packed and ready for use with the Asset pipeline :)

Add to javascript manifest file, fx `application.js`

```
//= require jquery_ujs
//= require jquery.ui.all
//= require gmaps-autocomplete
```

And include the google maps script before `application.js`, fx in your layout file:

See [google maps and RoR](http://stackoverflow.com/questions/7466872/google-maps-and-ror-3-1)

*application.html.erb*

```erb
<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
<%= javascript_include_tag "application" %>
```

Note also that the autocomplete script depends on jQuery 1.6+.

## Initialize

*application.js*

```javascript
$(document).ready(function() { 
  GmapsAutoComplete.init();
  GmapsAutoComplete.autoCompleteInit();
});
```
or coffeescript

*yourmodel.js.coffee*

```
$ ->
  GmapsAutoComplete.init()
  GmapsAutoComplete.autoCompleteInit()
```

### Configuration options

`init()` can take an option hash, using the following defaults:

```javascript
defaultOptions = {
  mapElem: "#gmaps-canvas", 
  zoomLevel: 2, 
  mapType: google.maps.MapTypeId.ROADMAP,
  pos: [51.751724, -1.255284],
  inputField: '#gmaps-input-address',
  errorField: '#gmaps-error',
  debugOn: false
};
```

### Advanced Configuration

`init()` can take an option hash, using the following defaults:

```javascript
defaultOptions = {
  mapElem: "#gmaps-canvas", 
  zoomLevel: 2, 
  mapType: google.maps.MapTypeId.ROADMAP,
  pos: [51.751724, -1.255284],
  inputField: '#gmaps-input-address',
  errorField: '#gmaps-error',
  debugOn: false
};
```

The following default methods can be replaced by configuration:

```javascript
  positionOutputter: this.defaultPositionOutputter,
  updateUI : this.defaultUpdateUI,
  updateMap : this.defaultUpdateMap
```

`autoCompleteInit` also takes an option hash, but currently only [region](https://developers.google.com/maps/documentation/geocoding/#RegionCodes) and country can be used.

```javascript
autoCompleteInit({region: 'DK', country: 'Denmark'});
```

Will make searches in the DK region and remove `', Denmark'` from the result.

## Use with Rails form helpers

```ruby
= simple_form_for(@post) do |f|
    = f.input :address, :input_html =>{:id => 'gmaps-input-address'}, :placeholder => 'Start typing a place...'
```

## Examples

See `spec/index.html` for an example page using this "plugin". Note that if you set `mapElem`to null or leave out that element on the page, the autocomplete will function without attempting to update the map :)

## Advanced Customization

Some of the prime candidate functions for customization are:

* updateUi
* updateMap

Here the default simple `updateUI` implementation:

```javascript
updateUi: function( address, latLng ) {
  $(this.inputField).autocomplete("close");
  $(this.inputField).val(address);

  this.positionOutputter(latLng);
}
```

Let's enrich the autocomplete fields with a jobs count for "the area" for each address.

```javascript
updateUi: function( address, latLng ) {
  $(this.inputField).autocomplete("close");

  var jobsCount = $.ajax(url: 'jobs/search?address=' + address + '&type=count');

  $(this.inputField).val(address + ' (' + jobsCount + ' jobs)');
}
```

## Customizing messages

For now, directly define your own implementation (override) the following functions directly on GmapsAutoComplete

* geocodeErrorMsg: function()
* invalidAddressMsg: function(value)
* noAddressFoundMsg: function()

Example:

```javascript

GmapsAutoComplete.geocodeErrorMsg = function() {
  "Geocode error!"
}
```

## Formtastic example

For [formtastic](https://github.com/justinfrench/formtastic) something like:

```ruby
= semantic_form_for @search do |f|
  = f.input :address, placeholder: 'find address'
  %span#address_error
```

And matching configuration in your javascript:

```javascript
$(document).ready(function() { 
  GmapsAutoComplete.init({inputField: 'form#search #address', errorField: 'form#search #address_error'});
  GmapsAutoComplete.autoCompleteInit({region: 'DK'});
});
```

Enjoy!

## TODO

* better Javascript encapsulation
* translation to Coffeescript using Coffee classes :)

Please help out with suggestions and improvements etc!

## Contributing to gmaps-autocomplete-rails
 
* Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet.
* Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it.
* Fork the project.
* Start a feature/bugfix branch.
* Commit and push until you are happy with your contribution.
* Make sure to add tests for it. This is important so I don't break it in a future version unintentionally.
* Please try not to mess with the Rakefile, version, or history. If you want to have your own version, or is otherwise necessary, that is fine, but please isolate to its own commit so I can cherry-pick around it.

## Copyright

Copyright (c) 2012 Kristian Mandrup. See LICENSE.txt for
further details.

