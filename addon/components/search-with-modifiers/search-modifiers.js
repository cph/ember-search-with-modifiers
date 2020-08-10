import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { schedule } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class SearchModifiersComponent extends Component {
  @tracked _currentIndex = -1;

  get currentIndex() { return this._currentIndex; }
  set currentIndex(newValue) {
    this._currentIndex = newValue;
    this.correctScroll();
  }

  get flatList() {
    return (this.args.hintList || []).reduce((list, item) => {
      return list.concat(item.list);
    }, []);
  }

  #element;

  constructor() {
    super(...arguments);
    this.updateLists();
  }

  correctScroll() {
    schedule('afterRender', this, function() {
      const { currentIndex } = this;
      if (currentIndex === -1 || !this.#element) { return; }
      const listItem = this.#element.querySelectorAll('div.search-modifier')[currentIndex];
      const list = listItem.parentElement;

      const scroll = list.scrollTop;
      const listHeight = parseFloat(getComputedStyle(list).height.replace('px', ''));

      const itemHeight = listItem.offsetHeight;
      const top = listItem.offsetTop;
      const bottom = top + itemHeight;

      if (top < 0) {
        list.scrollTop = Math.max(0, scroll + top - 8);
      } else if(listHeight < bottom) {
        list.scrollTop = scroll + top - listHeight + itemHeight;
      }
    });
  }

  select() {
    const { flatList, currentIndex } = this;
    if (currentIndex !== -1 && this.args.onSelect) {
      this.args.onSelect(flatList[currentIndex] || null);
    }
  }

  @action
  registerElement(el) {
    this.#element = el;
  }

  @action
  deregisterElement() {
    this.#element = null;
  }

  @action
  activateFocus() {
    if (!this.#element) { return; }
    this.#element.querySelector('.list-keyboard-navigator').focus();
  }

  @action
  updateLists() {
    this.currentIndex = -1;
    let index = 0;
    (this.args.hintList || []).forEach(section => {
      section.list.forEach(listItem => {
        // Since these properties are used in rendering, they need to be
        // either @tracked or set(); since they're dynamically added,
        // we'll have to go with set().
        set(listItem, 'index', index++);
        set(listItem, 'position', listItem.index);
        set(listItem, 'category', section.section);
      });
    });
  }

  @action
  selectItem(index) {
    this.currentIndex = index;
    this.select();
    return false;
  }

  @action
  didPressEnterOnNode(node) {
    this.currentIndex = node.index;
    this.select();
  }

  @action
  didHighlightNode(node) {
    if (node === undefined || node === null) { return; }
    const hint = this.flatList[node.index];
    this.args.onHighlightHint && this.args.onHighlightHint(hint);
  }
}
