# Gmaps autocomplete for Rails

Extracted from [gmaps-autocomplete](https://github.com/rjshade/gmaps-autocomplete) and improved markedly and then packaged for use with Rails as an asset gem :)

## General info

The script is now compiled from Coffeescript and allows you to have multiple fields linked to multiple instances of the `GmapsCompleter` class on the same page.

I recommend that you also check out: [google maps and RoR](http://stackoverflow.com/questions/7466872/google-maps-and-ror-3-1)

## Upgrading

Version 1.3+ now comes only with a class based `GmapsCompleter`. The old static GmapsCompleter container, used in version 1.2 (and below) has been deprecated.

Please upgrade your configuration functionality as demonstrated in the usage/config instructions below.

### Time for a redo!?

In my own humble opinion, this library is in *dire need to be completely redone*. I would love if someone out there was brave enough to refactor (or better redo from scratch!) this library. The time has come.... Thanks ;)

## Install

## Update gem dependencies

In your project `Gemfile`

```ruby
gem 'jquery-rails'
gem 'gmaps-autocomplete-rails'
```

Or to always use the most recent version, use `gem 'gmaps-autocomplete-rails', github: "kristianmandrup/gmaps-autocomplete-rails"``

Then run `bundle install`;)

Packed and ready for use with the Asset pipeline :)

### Update javascript dependencies

Add to javascript manifest file, fx `app/assets/javascripts/application.js`

```
//= require jquery_ujs
//= require gmaps-auto-complete
```

### Update style dependencies

Add to stylesheets manifest file, fx `app/assets/stylesheets/application.css`

```
*= require gmaps-auto-complete
```

Include the google maps script before `application.js`, fx in your layout file:

*application.html.erb*

```erb
<script async defer type="text/javascript" src="https://maps.googleapis.com/maps/api/js?sensor=false"></script>
<%= javascript_include_tag "application" %>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js"></script>
```

Note also that the autocomplete script currently depends on jQuery 1.6+. 
Please feel free to remove this dependency with a pull request :)

### Using Google API keys

[Google API keys](https://developers.google.com/maps/documentation/javascript/get-api-key#get-an-api-key)

```js
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"
  type="text/javascript"></script>
```

Note: Google apparently now requires use of the `HTTPS` protocol. This is enforced to ensure that your key (and location?) is not intercepted. Better safe than sorry ;)

## Customization

If you want to customize the gem to use another autocomplete "engine" than the default (assumed to be *jquery-ui*), then fork the gem and change the following
in the `gmaps-auto-complete.coffee` script to suit your needs and compile to js.

```
# around line 237
    autocompleteOpts = $.extend true, defaultAutocompleteOpts, autocompleteOpts

    $(@inputField).autocomplete(autocompleteOpts)

    # triggered when user presses a key in the address box
    $(@inputField).bind 'keydown', @keyDownHandler
    # autocomplete_init

  keyDownHandler: (event) =>
    if (event.keyCode == 13)
      @geocodeLookup 'address', $(@inputField).val(), true
      # ensures dropdown disappears when enter is pressed
      $(@inputField).autocomplete "disable"
    else
      # re-enable if previously disabled above
      $(@inputField).autocomplete "enable"
```

PS: I'm not sure if this is the only place that requires changes...

## Initialize

Add functionality that is executed after the document (and all scripts) have been fully loaded. Example:

*mypage.js*

```javascript
jQuery(function() {
  var completer;

  completer = new GmapsCompleter({
    inputField: '#gmaps-input-address',
    errorField: '#gmaps-error'
  });

  completer.autoCompleteInit({
    country: "us"
  });
});
```

or using Coffeescript

*mypage.js.coffee*

```
jQuery ->
    completer = new GmapsCompleter
        inputField: '#gmaps-input-address'
        errorField: '#gmaps-error'

    completer.autoCompleteInit
        country: "us"
```

### Configuration options

The constructor function can take a configuration option hash that can configure the specific workings of the `GmapsCompleter`. It uses the following defaults:

```javascript
{
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

* positionOutputter
* updateUI
* updateMap

These methods are used to control how the gmaps data is used to update the UI on the page, such as the position output and map position update. Customize these needed.

The default logic (taken from GmapsCompleterDefaultAssist) is:

```coffeescript
  defaultUpdateMap: (geometry) -> 
    map     = @map
    marker  = @marker

    map.fitBounds(geometry.viewport) if map
    marker.setPosition(geometry.location) if marker

  # fill in the UI elements with new position data
  defaultUpdateUI: (address, latLng) ->
    $(@inputField).autocomplete 'close'

    @debug 'country', @country

    updateAdr = address.replace ', ' + @country, ''
    updateAdr = address

    @debug 'updateAdr', updateAdr

    $(@inputField).val updateAdr
    @positionOutputter latLng

  defaultPositionOutputter: (latLng) ->
    $('#gmaps-output-latitude').html latLng.lat()
    $('#gmaps-output-longitude').html latLng.lng()
```

The default update UI logic removes the country from the address displayed.

## autoCompleteInit

The function `autoCompleteInit`, called on an instance of GmapsCompleter, can takes an option hash. Currently only [region](https://developers.google.com/maps/documentation/geocoding/#RegionCodes), `country`  and `autocomplete` can be used.

Example:

```javascript
autoCompleteInit({region: 'DK', country: 'Denmark'});
```

Will make searches in the DK region and remove `', Denmark'` from the result.

Note: Not sure if this is still useful with the new instance based approach!?

Parameter `autocomplete` allows to configure JQuery autocomplete widget

Example:
```javascript
autoCompleteInit({
  region: 'DK', 
  country: 'Denmark',
  autocomplete: {
    minLength: 4,
    position: {
      my: "center top",
      at: "center bottom"
    }
  }
});
```

## Assist object

The options hash for the constructor can now take an `assist` object as an argument.
The `assist` object can be a class or a simple object containing the following:

```coffeescript
  options:
    mapElem: '#gmaps-canvas'
    zoomLevel: 2
    mapType: google.maps.MapTypeId.ROADMAP
    pos: [0, 0]
    inputField: '#gmaps-input-address'
    errorField: '#gmaps-error'
    debugOn: true  
  
  # update marker and map
  updateMap: (geometry) ->

  # fill in the UI elements with new position data
  updateUI: (address, latLng) ->

  # display current position
  positionOutputter: (latLng) ->

  # optionally also message functions (see below)
```

If you use a class you can use Coffeescript `extends` (see http://coffeescript.org/#classes) to subclass the default implementation. You can then optionally use `super` to call the base implementation.

Example:

```coffeescript
class MyCompleterAssist extends GmapsCompleterDefaultAssist
  updateUI: (address, latLng) ->
    console.log "Doing my own thang!"
    // ...

    super (address, latLng)
```

Usage (config):

```coffeescript
    completer = new GmapsCompleter
        inputField: '#gmaps-my-input-address'
        assist: MyCompleterAssist
```

## Usage with Rails form helpers

Simple form example:

```ruby
= simple_form_for(@post) do |f|
    = f.input :address, :input_html =>{:id => 'gmaps-input-address'}, :placeholder => 'Start typing a place...'
```

## Examples

See `spec/test-gmaps-auto-coffee.html` for an example page using this "plugin". Note that if you set `mapElem` to null or leave out that element on the page, the autocomplete will function without attempting to update the map :)

This is very useful in scenarios where you want to geolocate the address without displaying on the map.

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

Note that you can encapsulate this kind of customization using the `assist` option and an Assist object/class as demonstrated above.

## Customizing messages

The following message functions can be customized, either by passing in the options hash, overriding directly on the GmapsCompleter object or even by using the Assist object/class.

* geocodeErrorMsg: function()
* invalidAddressMsg: function(value)
* noAddressFoundMsg: function()

Example:

```javascript

GmapsCompleter.prototype.geocodeErrorMsg = function() {
  "Geocode error!"
}
```

Here, ensuring that ALL instances of `GmapsCompleter` will use this functionality as the baseline (since overriding the prototype function).

### Localizing messages

For localization/internationalization support, you could customize your Assist object constructor to set the current locale and then have your custom `xMsg` functions use this locale to display the localized message.

## Formtastic example

For [formtastic](https://github.com/justinfrench/formtastic) something like:

```ruby
= semantic_form_for @search do |f|
  = f.input :address, placeholder: 'find address'
  %span#address_error
```

Or,

```ruby
<%= semantic_form_for(@search) do |f| %>
	<%= f.input :pickupAddress, :as => :string, :label => "House/Apt Number and Street", :input_html => { :id => "gmaps-input-address", :style => "width:350px; font-size:14px", :placeholder => "Start typing an address or location" } %>
	...
```

And matching configuration in your javascript:

```javascript
$(document).ready(function() { 
  var completer;
  completer = new GmapsCompleter({inputField: 'form#search #address', errorField: 'form#search #address_error'});
  completer.autoCompleteInit({region: 'DK'});
});
```

### Tips

To avoid loading google maps script on all pages, either use turbolinks or alternatively conditionally load it depending on whether the page needs it. 
For this you could use a simple `Page` model, something like this:

```ruby
class Page
  include ::ActiveModel::Model

  attr_accessor :name, :type, :mode

  def map?
    mode && mode.to_s =~ /location/
  end
```

Then use the Page in the controller

```ruby
class PropertiesController < BaseController
  def show
    @name = params[:id]
    @mode = params[:mode] || 'gallery'
    @page = Page.new name: :property, mode: @mode
  end
end
```

Then use page instance to have fine-grained control over how to display the page!

```erb
<% if @page.map? %>
  <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
<% end %>
<%= javascript_include_tag "application" %>
```

This could fx be integrated into your page layouts (layout files) or similar.

Alternatively perhaps use RequireJS via the `requirejs-rails` gem, and load it "AMD" style, and then use a HTML data attribute to set if the page should load the google map script or not. There are many ways to achieve this...

Enjoy!

## Troubleshooting

`Uncaught ReferenceError: google is not defined`

You must remember to include google maps in your html page before `gmaps-autocomplete` (see *application.html.erb* above).

`<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>`


### Dropdown transparency

Some developers have experiences transparency issues for the autocomplete dropdown. This is a CSS issue which can be fixed as noted in [#14](https://github.com/kristianmandrup/gmaps-autocomplete-rails/issues/14)

```css
.ui-autocomplete {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  float: left;
  display: none;
  min-width: 160px;
  _width: 160px;
  padding: 4px 0;
  margin: 2px 0 0 0;
  list-style: none;
  background-color: #ffffff;
  border-color: #ccc;
  border-color: rgba(0, 0, 0, 0.2);
  border-style: solid;
  border-width: 1px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  -moz-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  -webkit-background-clip: padding-box;
  -moz-background-clip: padding;
  background-clip: padding-box;
  *border-right-width: 2px;
  *border-bottom-width: 2px;

  .ui-menu-item > a.ui-corner-all {
    display: block;
    padding: 3px 15px;
    clear: both;
    font-weight: normal;
    line-height: 18px;
    color: #555555;
    white-space: nowrap;

    &.ui-state-focus, &.ui-state-active {
      color: #ffffff;
      text-decoration: none;
      background-color: #0088cc;
      border-radius: 0px;
      -webkit-border-radius: 0px;
      -moz-border-radius: 0px;
      background-image: none;
    }
  }
}
```

## TODO

* even better class based functionality encapsulation
* possibly remove `autoCompleteInit` ??

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

