require "gmaps-autocomplete-rails/version"

module GmapsAutoComplete
  module Rails
    class Engine < ::Rails::Engine
      initializer 'static_assets.load_static_assets' do |app|
        app.middleware.use ::ActionDispatch::Static, "#{root}/vendor"
      end
    end
  end
end
