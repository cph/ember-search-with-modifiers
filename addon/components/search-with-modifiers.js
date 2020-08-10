import Component from '@glimmer/component';
import { next } from '@ember/runloop';
import { action } from '@ember/object';
import KEY from 'ember-search-with-modifiers/utils/keycodes';
import { prepareConfig } from 'ember-search-with-modifiers/utils/search';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';

const HINT_LIMIT = 32; // Arbitrary
const SECTION_LIMIT = 5; // Hints per section when more than one section displayed

export default class SearchWithModifiersComponent extends Component {
  @tracked _query = '';
  @tracked activeToken = null;

  #lastQuery = '';

  constructor() {
    super(...arguments);
    this.query = this.args.query;
    this.#lastQuery = this.query;
  }

  get query() { return this._query; }
  set query(value) {
    this._query = value;
    this.args.valueChange && this.args.valueChange(value);
  }

  get isQueryBlank() { return isEmpty(this.query); }
  get isHintListEmpty() { return this.hintList.length === 0; }

  get tokenConfig() {
    return prepareConfig(this.args.configHash);
  }

  get showModifierList() {
    if (this.isHintListEmpty) { return false; }
    const type = this.activeToken?.type;
    return type && (type !== 'space');
  }

  get hintList() {
    const { activeToken } = this;
    const hints = activeToken?.hints;
    if (!hints) { return []; }

    const hintsBySection = hints.reduce(function(sum, listItem) {
      let section = listItem.section || activeToken?.sectionTitle;
      if (sum[section]) {
        if (sum[section].length < HINT_LIMIT) {
          sum[section].push(listItem);
        }
      } else {
        sum[section] = [listItem];
      }
      return sum;
    }, {});

    const sections = Object.keys(hintsBySection);

    let hintList = sections.map(function(section) {
      let list = hintsBySection[section];
      if (sections.length > 1) {
        list = list.slice(0, SECTION_LIMIT);
      }
      return { section, list };
    });

    if (this.isQueryBlank) {
      let examples = this.args.sampleQueries;
      hintList = [
        { section: 'How to Search', list: examples.map(function({ query, label }) {
          return {
            value: query,
            label,
            modifier: true,
            searchOnEnter: true,
            section: 'How to Search' } }) }
      ].concat(hintList);
    }

    return hintList;
  }


  _performSearch() {
    this.#lastQuery = this.query;
    this.args.enter && this.args.enter();
  }

  @action
  onKeyDown({ keyCode }) {
    if (keyCode === KEY.ESCAPE) {
      this.query = this.#lastQuery;
    }
  }

  @action
  updateInternalQuery() {
    if (this.query === this.args.query) { return; }
    this.query = this.args.query;
  }

  @action
  didSelectModifier(model) {
    const { activeToken } = this;
    next(()=> {
      activeToken.model = model;

      if (model.searchOnEnter) {
        next(()=> { this.performSearch(); });
      }
    });
  }

  @action
  valueDidChange(newValue) {
    this.query = newValue;
  }

  @action
  updateActiveToken(newToken) {
    this.activeToken = newToken;
  }

  @action
  performSearch() {
    this._performSearch();
  }
}
