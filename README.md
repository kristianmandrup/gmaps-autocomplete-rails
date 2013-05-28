# Gmaps autocomplete for Rails

Extracted from [gmaps-autocomplete](https://github.com/rjshade/gmaps-autocomplete) and improved markedly and then packaged for use with Rails as an asset gem :)

See it in action here: [http://rjshade.com/projects/gmaps-autocomplete/](http://rjshade.com/projects/gmaps-autocomplete/)

Some more explanation here: [https://github.com/rjshade/gmaps-autocomplete](https://github.com/rjshade/gmaps-autocomplete)

## Install

In your project `Gemfile`

```ruby
gem 'jquery-rails'
gem 'jquery-ui-rails'
gem 'gmaps-autocomplete-rails'
```

Then run `bundle install`;)

Packed and ready for use with the Asset pipeline :)

Add to javascript manifest file, fx `application.js`

```
//= require jquery_ujs
//= require jquery.ui.all
//= require gmaps-autocomplete
```

Include the google maps script before `application.js`, fx in your layout file:

*Update: Fields with separate Autocomplete instances*

Try `gmaps-auto-complete` a new coffescript class based version, which should allow you to have several fields with separate instances on the same page. As of yet untested, so please help out fixing any bugs/errors.

For more, see [google maps and RoR](http://stackoverflow.com/questions/7466872/google-maps-and-ror-3-1)

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

### Tips

To avoid loading google maps script on all pages, either use turbolinks or alternatively conditionally load it depending on the page. For this you could use a simple `Page` model:

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

Nice ;)

Alternatively perhaps use RequireJS via the `requirejs-rails` gem, and load it "AMD" style, and then use a HTML data attribute to set if the page should load the google map script or not. There are many possibilities and design patterns ;)

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

