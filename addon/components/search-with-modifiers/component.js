import Component from '@ember/component';
import layout from './template';
import { empty, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import { observer, computed } from '@ember/object';
import KEY from '../../utils/keycodes';
import { prepareConfig } from '../../utils/search';
import { typeOf } from '@ember/utils';

const VERBOSE = false;
const doNothing = function() {};

export default Component.extend({
  layout,
  logger: service(),
  classNames: ['search'],
  'data-test-search': true,
  configHash: Object.freeze({}),
  isQueryBlank: empty('query'),
  isHintListEmpty: equal('hintList.length', 0),
  _lastQuery: '',
  sampleQueries: Object.freeze([]),

  tokenConfig: computed('configHash', function() {
    return prepareConfig(this.get('configHash'));
  }),

  showModifierList: computed('activeToken.type', 'isHintListEmpty', function() {
    if(this.get('isHintListEmpty')) { return false; }
    let type = this.get('activeToken.type');
    return type && (type !== 'space');
  }),

  hintList: computed('activeToken.hints', 'sampleQueries.[]', function() {
    let token = this.get('activeToken');
    let hints = this.get('activeToken.hints');
    if(!hints) { return []; }

    let limit = 32; // <-- TODO: arbitrary
    let hintsBySection = hints.reduce(function(sum, listItem) {
      let section = listItem.section || token.get('sectionTitle');
      if(sum[section]) {
        if(sum[section].length < limit) {
          sum[section].push(listItem);
        }
      } else {
        sum[section] = [listItem];
      }
      return sum;
    }, {});

    let sections = Object.keys(hintsBySection);

    let hintList = sections.map(function(section) {
      let list = hintsBySection[section];
      if(sections.length > 1) {
        list = list.slice(0, 5);
      }
      return { section, list };
    });

    if(this.get('isQueryBlank')) {
      let examples = this.get('sampleQueries');
      hintList = [
        { section: 'How to Search', list: examples.map(function({query, label}) {
          return {
            value: query,
            label,
            modifier: true,
            searchOnEnter: true,
            section: 'How to Search' } }) }
      ].concat(hintList);
    }

    return hintList;
  }),


  _performSearch() {
    this.set('_lastQuery', this.get('query'));
    this.getAction('enter')();
  },


  keyDown({ keyCode }) {
    if(keyCode === KEY.ESCAPE) {
      this.set('query', this.get('_lastQuery'));
    }
  },


  notifyValueChange: observer('query', function() {
    this.getAction('valueChange')(this.get('query'));
  }),


  actions: {
    didSelectModifier(model) {
      if(VERBOSE) {
        this.get('logger').debug('[search-with-modifiers|didSelectModifier]');
      }
      let token = this.get('activeToken');
      next(()=> {
        token.set('model', model);

        if(model.searchOnEnter) {
          next(()=> {
            this.send('performSearch');
          });
        }
      });
    },

    valueDidChange(newValue) {
      if(VERBOSE) {
        this.get('logger').debug(`[search-with-modifiers|valueDidChange] '${newValue}'`);
      }
      this.set('query', newValue);
    },

    updateActiveToken(newToken) {
      if(VERBOSE) {
        this.get('logger').debug(`[search-with-modifiers|updateActiveToken] ${newToken && newToken.get('fullText')}`);
      }
      this.set('activeToken', newToken);
    },

    performSearch() {
      if(VERBOSE) {
        this.get('logger').debug('[search-with-modifiers|performSearch]');
      }
      this._performSearch();
    }
  },

  getAction(actionName) {
    return typeOf(this.get(actionName)) === 'function' ? this.get(actionName) : doNothing;
  }
});
