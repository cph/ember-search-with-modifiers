import Component from '@ember/component';
import layout from './template';
import { scheduleOnce } from '@ember/runloop';
import { set, get, computed, observer } from '@ember/object';
import { typeOf } from '@ember/utils';
import { A } from '@ember/array';

const doNothing = function() {};

export default Component.extend({
  layout,
  currentIndex: -1,
  classNames: ['search-modifiers'],
  focused: false,

  correctScroll: observer('currentIndex', function() {
    scheduleOnce('afterRender', this, function() {
      let currentIndex = this.get('currentIndex');
      if(currentIndex === -1 || !this.element) return;
      let listItem = this.element.querySelectorAll('div.search-modifier')[currentIndex];
      let list = listItem.parentElement;

      let scroll = list.scrollTop;
      let listHeight = parseFloat(getComputedStyle(list).height.replace('px', ''));

      let itemHeight = listItem.offsetHeight;
      let top = listItem.offsetTop;
      let bottom = top + itemHeight;

      if(top < 0) {
        list.scrollTop = Math.max(0, scroll + top - 8);
      } else if(listHeight < bottom) {
        list.scrollTop = scroll + top - listHeight + itemHeight;
      }
    });
  }),

  select() {
    let list = this.get('flatList');
    let currentIndex = this.get('currentIndex');
    if(currentIndex !== -1) {
      let item = A(list).objectAt(currentIndex);
      this.get('onSelect')(item);
    }
  },

  flatList: computed('hintList.[]', function() {
    return (this.get('hintList') || []).reduce((list, item) => {
      return list.concat(get(item, 'list'));
    }, []);
  }),

  updateLists: observer('hintList.[]', function() {
    this.set('currentIndex', -1);
    let index = 0;
    (this.get('hintList') || []).forEach((section) => {
      get(section, 'list').forEach((listItem) => {
        set(listItem, 'index', index++);
        set(listItem, 'position', get(listItem, 'index'));
        set(listItem, 'category', get(section, 'section'));
      });
    });
  }),

  init() {
    this._super(...arguments);
    this.updateLists();
  },

  didInsertElement() {
    this._super(...arguments);
    if(this.get('focused')) this.element.querySelector('.list-keyboard-navigator').focus();
  },

  actions: {
    selectItem(index) {
      this.set('currentIndex', index);
      this.select();
      return false;
    },

    didPressEnterOnNode(node) {
      this.set('currentIndex', get(node, 'index'));
      this.select();
    },

    didHighlightNode(node) {
      if(node === undefined || node === null) return;
      let hint = A(this.get('flatList')).objectAt(get(node, 'index'));
      this.getAction('onHighlightHint')(hint);
    }
  },

  getAction(actionName) {
    return typeOf(this.get(actionName)) === 'function' ? this.get(actionName) : doNothing;
  }
});
