import { tracked } from '@glimmer/tracking';
import ListSource from './modifier-adapter';
import { unquoted, normalized } from 'ember-search-with-modifiers/utils/search';

export default class Token {
  @tracked modifier = '';
  @tracked value = '';
  @tracked configHash = {};

  #eventsHash = {};

  constructor(attrs) {
    Object.keys(attrs).forEach(key => this[key] = attrs[key]);
  }

  get config() {
    const { configHash, modifier, value } = this;

    if (modifier) {
      return configHash[modifier.toLowerCase()];
    } else if (value && (value !== ' ')) {
      return configHash['_default'];
    }

    return null;
  }

  get type() { return this.config?.type || 'space'; }

  get sectionTitle() { return this.config?.sectionTitle; }
  get content() { return this.config?.content; }

  get fullText() {
    const { value, modifier } = this;
    return `${modifier}${value}`;
  }
  set fullText(val) {
    if (this.configHash) {
      let modifier = '';
      if (val.substr(0, 1) === '+') {
        modifier = '+';
      } else {
        for (let k in this.configHash) {
          if (val.substr(0, k.length) === k) {
            modifier = k;
            break;
          }
        }
      }

      const value = modifier ? val.substr(modifier.length) : val;
      this.modifier = modifier;
      this.value = value;
    }
  }

  get length() { return this.fullText.length; }

  get firstHint() {
    const value = this.normalizedValue;
    return this.hints.find(function(hint) {
      return value.length === 0 || normalized(ListSource.serialize(hint)).indexOf(value) === 0;
    });
  }

  get subHint() {
    if (this.isValueValid && this.value.match(/"$/)) { return null; }

    const value = this.value.toLowerCase();
    if (value.length === 0) { return null; }

    const firstHint = this.firstHint;
    if (firstHint === undefined) { return null; }

    const hint = typeof firstHint === 'string' ? firstHint : ListSource.serialize(firstHint);
    if (hint && normalized(hint).indexOf(normalized(value)) === 0) {
      return unquoted(hint).substr(normalized(value).length);
    }

    return null;
  }

  get hint() {
    return this.value.length > 0 ? this.subHint : this.config?.defaultHint;
  }

  get hints() {
    return ListSource.getHints(this.value, this.content) || [];
  }

  get model() {
    if (this.isValueValid) {
      return ListSource.deserialize(this.normalizedValue, this.content);
    }
    return null;
  }
  set model(newModel) {
    let val = ListSource.serialize(newModel);
    if (newModel.fullText || newModel.modifier) {
      this.fullText = val;
    } else {
      this.value = val;
    }
    this.trigger('modelAssigned', this);
  }

  get normalizedValue() {
    return normalized(this.value);
  }

  get isValueValid() {
    return ListSource.validate(this.value, this.content);
  }

  autoComplete() {
    const { firstHint, subHint } = this;

    if (firstHint && subHint) {
      const hintValue = typeof firstHint === 'string' ? firstHint : firstHint.value;
      if (firstHint.modifier) {
        this.fullText = hintValue;
      } else {
        this.value = hintValue;
      }
      return true;
    }
    return false;
  }

  on(eventName, callback) {
    const callbacks = this.#eventsHash[eventName] || [];
    const index = callbacks.indexOf(callback);
    if (index < 0) { this.#eventsHash[eventName] = callbacks.concat([ callback ]); }
  }

  off(eventName, callback) {
    const callbacks = this.#eventsHash[eventName] || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) { callbacks.splice(index, 1); }
  }

  trigger(eventName, ...args) {
    const callbacks = this.#eventsHash[eventName] || [];
    callbacks.forEach(callback => callback(...args));
  }
}
