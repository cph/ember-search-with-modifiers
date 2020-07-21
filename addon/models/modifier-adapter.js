import { A } from '@ember/array';
import { normalized, getMatch } from 'ember-search-with-modifiers/utils/search';

export default {
  serialize(model) {
    return model && model.value;
  },

  deserialize(label, list) {
    if (list) {
      return list.find(item => item.value === label);
    } else {
      return label;
    }
  },

  validate(string, list) {
    if (list) {
      let normalizedString = normalized(string);
      return list.some(item => {
        return normalized(this.serialize(item)) === normalizedString;
      });
    } else {
      return string;
    }
  },

  getHints(string, list) {
    if (list && list.length > 0) {
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
