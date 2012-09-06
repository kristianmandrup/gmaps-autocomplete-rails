# Gmaps autocomplete for Rails

Extracted from [gmaps-autocomplete](https://github.com/rjshade/gmaps-autocomplete) and improved markedly and then packaged for use with Rails as an asset gem :)

See it in action here: [rjshade.github.com/gmaps-autocomplete/](http://rjshade.github.com/gmaps-autocomplete/)

Some more explanation here: [rjshade.com/2012/03/30/Google-Maps-autocomplete-with-jQuery-UI](/[http://www.rjshade.com/2012/03/30/Google-Maps-autocomplete-with-jQuery-UI/)

## Use with Rails form helpers

```ruby
= simple_form_for(@post) do |f|
    = f.input :address, :input_html =>{:id => 'gmaps-input-address'}, :placeholder => 'Start typing a place name...'
```

Packed and ready for the Asset pipeline :)

```
//= require gmaps-autocomplete
```

## Usage

```javascript
$(document).ready(function() { 
  GmapsAutoComplete.gmaps_init();
  GmapsAutoComplete.autocomplete_init();
});
```

## Configuration options

`gmaps_init()` take an option hash, using the following defaults:

```javascript
  defaultOptions = {
    mapElem: "#gmaps-canvas", 
    zoomLevel: 2, 
    mapType: google.maps.MapTypeId.ROADMAP,
    pos: [51.751724, -1.255284],
    inputField: '#gmaps-input-address',
    errorField: '#gmaps-error',
    positionOutputter: this.defaultPositionOutputter
  };
```

`autocomplete_init` also takes an option hash, but currently only [region](https://developers.google.com/maps/documentation/geocoding/#RegionCodes) is used.

```javascript
autocomplete_init({region: 'ES'});
```

## TODO

* better Javascript encapsulation
* translation to Coffeescript and use Coffee classes :)

## Contributing to gmaps-autocomplete-rails
 
* Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet.
* Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it.
* Fork the project.
* Start a feature/bugfix branch.
* Commit and push until you are happy with your contribution.
* Make sure to add tests for it. This is important so I don't break it in a future version unintentionally.
* Please try not to mess with the Rakefile, version, or history. If you want to have your own version, or is otherwise necessary, that is fine, but please isolate to its own commit so I can cherry-pick around it.

== Copyright

Copyright (c) 2012 Kristian Mandrup. See LICENSE.txt for
further details.

