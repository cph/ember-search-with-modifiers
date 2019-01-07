import Token from '../models/token';
import { typeOf } from '@ember/utils';
import { get, getProperties } from '@ember/object';
import { copy } from 'ember-copy';
import { w as toWords } from '@ember/string';
import unaccent from './unaccent';



// Had trouble with
//
//    import escapeForRegExp from 'escape-string-regexp';
//
// so inlining that method and moving forward...
const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
function escapeForRegExp(str) {
  if(typeof str !== 'string') throw new TypeError('Expected a string');
  return str.replace(matchOperatorsRe, '\\$&');
}



export function sanitizeTokens(tokens) {
  return tokens.reduce(function(sum, token) {
    let t = sanitizeToken(token);
    if(t) {
      if(sum[t.modifier]) {
        sum[t.modifier].push(t);
      } else {
        sum[t.modifier] = [t];
      }
    }
    return sum;
  }, Object.create(null));
}

export function sanitizeToken(token) {
  let type = get(token, 'type');
  if(type !== 'space' && type !== 'default') {
    return getProperties(token, 'model', 'fullText', 'modifier', 'value');
  }
  return null;
}

export function getDefaultContent(configHash, modifiersList) {
  let key, config, list, compositeValue;
  let allList = [];
  let mapContent = function(item) {
    if(typeOf(item) === 'string') {
      item = { value: item };
    }

    if(toWords(item.value).length > 1) {
      item.value = `"${item.value}"`;
    }

    return item;
  };

  for(key in configHash) {
    config = configHash[key];
    if(config.type === 'list' && config.content) {
      config.content = config.content.map(mapContent);
      list = config.content.map(function(item) {
        compositeValue = item.value;

        // When the modifier is a field-modifier, separate it from its value with a space
        compositeValue = key === '#' ? `#${compositeValue}` : `${key} ${compositeValue}`;

        return {
          label: item.label,
          value: compositeValue,
          fullText: true,
          section: config.sectionTitle
        };
      });
      allList = allList.concat(list);
    }
  }
  var modifiers = modifiersList.map(function(item) {
    item.section = 'Narrow your Search';
    return item;
  });
  return modifiers.concat(allList);
}

function getAllModifiers(configHash) {
  let modifiers = [];
  for(let key in configHash) {
    let config = configHash[key];
    let section = config.type === 'date' ? 'time' : 'others';
    modifiers.push({
      value: key,
      label: config.defaultHint,
      modifier: true,
      section
    });
  }
  return modifiers;
}

export function tokenize(text, configHash) {
  if(!text) return [];

  let tokens = [];
  let value = '';
  let modifier = '';
  let mode = 'default';

  for(let i = 0; i <= text.length; i++) {
    var character = text[i];

    if(!character) {
      if(modifier !== '' || value.length > 0) {
        tokens.push(Token.create({ configHash, modifier, value }));
      }
      return tokens;
    }

    switch(mode) {
      case 'default':
        if(character === '"') mode = 'in-quote';

        if(modifier !== '') {

          if(character === ' ' && (/[^ ]/.test(value) || modifier === '#')) {
            tokens.push(Token.create({ configHash, modifier, value }));
            modifier = '';
            value = '';
            mode = 'whitespace';
          }

          value += character;

        } else {

          if(character === ' ') {
            if(value.length > 0) {
              tokens.push(Token.create({ configHash, modifier, value }));
              modifier = '';
              value = '';
            }
            mode = 'whitespace';
          }

          value += character;

          if(configHash[value.toLowerCase()] !== undefined) {
            modifier = value;
            value = '';
          }
        }
        break;

      case 'whitespace':
        if(character !== ' ') {
          if(modifier !== '' || value.length > 0) {
            tokens.push(Token.create({ configHash, modifier, value }));
            modifier = '';
            value = '';
          }
          mode = 'default';
        }

        value += character;
        break;

      case 'in-quote':
        if(character === '"') mode = 'default';
        value += character;
        break;
    }
  }
}

export function prepareConfig(configHash) {
  configHash = copy(configHash, true);
  let modifiers = getAllModifiers(configHash);
  configHash['+'] = { type: 'modifier-list', content: modifiers };
  configHash['_default'] = {
    type: 'default', content: getDefaultContent(configHash, modifiers)
  };
  return configHash;
}

export function deserializeQueryString(string, configHash) {
  return sanitizeTokens(tokenize(string, configHash));
}

export function unquoted(value) {
  return value.replace(/"/g, '');
}

export function normalized(value) {
  return unquoted(unaccent(value)).replace(/^ */, '').toLowerCase();
}

export function getMatch(subString, array, key) {
  let regex = new RegExp(`\\b${escapeForRegExp(normalized(subString))}`, 'i');
  return array
    .filter(function(string) {
      if(key) { string = string[key]; }
      if(!string) { return false; }
      return subString.length < string.length && regex.test(normalized(string));
    });
}

export function setCursor(node, pos) {
  if(node) {
    if(node.createTextRange) {
      var textRange = node.createTextRange();
      textRange.collapse(true);
      textRange.moveEnd('character', pos);
      textRange.moveStart('character', pos);
      textRange.select();

      // This forces the browser to scroll to the cursor
      node.blur();
      node.focus();
      return true;
    } else if(node.setSelectionRange) {
      node.setSelectionRange(pos, pos);

      // This forces the browser to scroll to the cursor
      node.blur();
      node.focus();
      return true;
    }
  }
  return false;
}
