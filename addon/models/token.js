import EmberObject, { computed } from '@ember/object';
import Evented from '@ember/object/evented';
import ListSource from './modifier-adapter';
import { unquoted, normalized } from '../utils/search';
import { reads } from '@ember/object/computed';

export default EmberObject.extend(Evented, {
  modifier: '',
  value: '',
  configHash: Object.freeze({}),

  config: computed('configHash', 'modifier', 'value', function() {
    let configHash = this.get('configHash');
    let modifier = this.get('modifier');
    let value = this.get('value');

    if(modifier) {
      return configHash[modifier.toLowerCase()];
    } else if(value && (value !== ' ')) {
      return configHash['_default'];
    }
  }),

  type: computed('config.type', function() {
    return this.get('config.type') || 'space';
  }),

  sectionTitle: reads('config.sectionTitle'),
  content: reads('config.content'),

  fullText: computed('modifier', 'value', 'configHash', {
    get() {
      let { value, modifier } = this.getProperties('value', 'modifier');
      return `${modifier}${value}`;
    },
    set(key, val) {
      let configs = this.get('configHash');
      if(configs) {
        let modifier;
        if(val.substr(0, 1) === '+') {
          modifier = '+';
        } else {
          for(let k in configs) {
            if(val.substr(0, k.length) === k) {
              modifier = k;
              break;
            }
          }
        }
        if(modifier) {
          let value = val.substr(modifier.length);
          this.set('modifier', modifier);
          this.set('value', value);
        } else if(val) {
          this.set('value', val);
        }
      }
      return val;
    }
  }),

  length: reads('fullText.length'),

  firstHint: computed('value', 'hints', function() {
    let value = this.get('normalizedValue');
    return this.get('hints').find(function(hint) {
      return value.length === 0 || normalized(ListSource.serialize(hint)).indexOf(value) === 0;
    });
  }),

  subHint: computed('value', 'firstHint', function() {
    if(this.get('isValueValid') && this.get('value').match(/"$/)) {
      return null;
    }
    let value = this.get('value').toLowerCase();
    if(value.length === 0) {
      return null;
    }
    let firstHint = this.get('firstHint');
    if(firstHint === undefined) {
      return null;
    }
    let hint = typeof firstHint === 'string' ? firstHint : ListSource.serialize(firstHint);
    if(hint && normalized(hint).indexOf(normalized(value)) === 0) {
      return unquoted(hint).substr(normalized(value).length);
    }
  }),

  hint: computed('subHint', 'config.defaultHint', 'value', function() {
    return this.get('value').length ?
      this.get('subHint') : this.get('config.defaultHint');
  }),

  hints: computed('value', function() {
    return ListSource.getHints(this.get('value'), this.get('content')) || [];
  }),

  model: computed('value', 'isValueValid', {
    set(key, newModel) {
      let val = ListSource.serialize(newModel);
      if(newModel.fullText || newModel.modifier) {
        this.set('fullText', val);
        this.trigger('modelAssigned');
        return null;
      } else {
        this.set('value', val);
      }
      this.trigger('modelAssigned');
      return newModel;
    },
    get() {
      if(this.get('isValueValid')) {
        return ListSource.deserialize(this.get('normalizedValue'), this.get('content'));
      } else {
        return null;
      }
    }
  }),

  normalizedValue: computed('value', function() {
    return normalized(this.get('value'));
  }),

  isValueValid: computed('value', function() {
    return ListSource.validate(this.get('value'), this.get('content'));
  }),

  autoComplete() {
    let hint = this.get('firstHint');
    let subHint = this.get('subHint');

    if(hint && subHint) {
      let hintValue = typeof hint === 'string' ? hint : hint.value;
      if(hint.modifier) {
        this.set('fullText', hintValue);
      } else {
        this.set('value', hintValue);
      }
      return true;
    }
    return false;
  }
});
