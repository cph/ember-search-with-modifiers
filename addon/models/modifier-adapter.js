import { get } from '@ember/object';
import { A } from '@ember/array';
import { normalized, getMatch } from '../utils/search';

export default {
  serialize(model) {
    return model && get(model, 'value');
  },

  deserialize(label, list) {
    if(list) {
      return A(list).findBy('value', label);
    } else {
      return label;
    }
  },

  validate(string, list) {
    if(list) {
      let normalizedString = normalized(string);
      return A(list).any(function(item) {
        return normalized(this.serialize(item)) === normalizedString;
      }, this);
    } else {
      return string;
    }
  },

  getHints(string, list) {
    if(list && list.length) {
      let labelMatches = getMatch(string, list, 'label');
      let valueMatches = getMatch(string, list, 'value');

      let matches = A(labelMatches.concat(valueMatches))
        .uniq()
        .filter((item) => (item.value !== string));

      if(matches.length) {
        return matches;
      }
    }
    return [];
  }
};
