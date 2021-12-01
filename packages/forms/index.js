'use strict';

module.exports = {
  name: require('./package').name,
  options: {
    'ember-power-select': {
      theme: false
    }
  },

  isDevelopingAddon() { return true; },
  included(includer, ...rest) {
    const app = includer.app || includer;
    const powerSelectOptions = app.options['ember-power-select'] || {};
    powerSelectOptions.theme = false;
    app.options['ember-power-select'] = powerSelectOptions;

    // make sure to include ember-basic-dropdown styles
    app.__skipEmberBasicDropdownStyles = true;
    app.import(
      'node_modules/ember-basic-dropdown/vendor/ember-basic-dropdown.css'
    );

    this._super.included.apply(this, [app, ...rest]);
  },

  // Ember does not call contentFor on nested addons, so we must call it
  // manually.
  contentFor(type, config) {
    const emberPowerSelect = this.addons.find(
      (a) => a.name === 'ember-power-select'
    );
    return emberPowerSelect.contentFor(type, config);
  }
};
