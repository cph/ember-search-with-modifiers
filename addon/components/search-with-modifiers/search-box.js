import Component from '@glimmer/component';
import { run } from '@ember/runloop';
import { action } from '@ember/object';
import Token from 'ember-search-with-modifiers/models/token';
import KEY from 'ember-search-with-modifiers/utils/keycodes';
import { tokenize, setCursor } from 'ember-search-with-modifiers/utils/search';
import { tracked } from '@glimmer/tracking';

const NAVIGATIONAL_KEYS = [
  KEY.UP,
  KEY.DOWN,
  KEY.LEFT,
  KEY.RIGHT,
  KEY.HOME,
  KEY.END
];

function stringifyTokens(tokens) {
  return tokens.reduce(function(sum, token) {
    sum += token.fullText;
    return sum;
  }, '');
}

export default class SearchBoxComponent extends Component {
  @tracked cursorLocation = -1;
  @tracked _value = '';

  #mainInput;
  #background;
  #valueWas = '';
  #cachedTokens = null;
  #lastActiveToken = null;

  constructor() {
    super(...arguments);
    this._value = this.args.value;
    this.activeToken;
  }

  get maxlength() {
    return this.args.maxlength || 250;
  }

  // Tokens must be cached for autocomplete to work, since the activeToken
  // is modified in place, and then the new value is generated based on it
  // still being modified in the context of the tokens array.
  get tokens() {
    if (this.#cachedTokens === null || this.#valueWas !== this._value) {
      this.#cachedTokens = tokenize(this._value, this.args.tokenConfig);
      this.#valueWas = this._value;
    }
    return this.#cachedTokens;
  }

  get activeToken() {
    const { activeTokenIndex, tokens } = this;
    let activeToken;
    if (activeTokenIndex > -1) {
      activeToken = tokens[activeTokenIndex];
    } else if (tokens.length === 0 && this.cursorLocation < 1) {
      activeToken = new Token({ configHash: this.args.tokenConfig, fullText: '+' });
    }
    this.notifyOnActiveTokenChanged(activeToken);
    return activeToken;
  }

  get activeTokenIndex() {
    const { cursorLocation, tokens } = this;
    let sumIndex = 0;
    let token, startIndex, endIndex;
    let length = tokens.length;
    for (var i = 0; i < length; i++) {
      token = tokens[i];
      startIndex = sumIndex;
      endIndex = token.length + startIndex;
      sumIndex = endIndex;
      if (startIndex < cursorLocation && cursorLocation <= endIndex) {
        return i;
      }
    }
    return -1;
  }

  get hintValue() {
    return this.isLastTokenSelected ? this.activeToken?.hint : null;
  }

  get isLastTokenSelected() {
    const tokensCount = this.tokens.length;
    return tokensCount > 0 && (tokensCount - 1) === this.activeTokenIndex;
  }

  get isCursorAtEndOfInput() {
    return this.cursorLocation === this._value.length;
  }

  get backgroundText() {
    let text = [];
    this.tokens.forEach(token => {
      const { fullText } = token;
      if (['default', 'modifier-list', 'space'].indexOf(token.type) > -1) {
        text.push(fullText);
      } else if (token.isValueValid) {
        text.push(`<span class='search-box-hint'>${fullText}</span>`);
      } else {
        text.push(`<span class='search-box-hint incomplete'>${fullText}</span>`);
      }
    });
    text.push(`<span class="search-box-hint-value">${this.hintValue || ''}</span>`);
    return text.join('');
  }



  @action
  onMouseScroll(/* e */) {
    this.scrollBackgroundToMatchInput();
  }

  @action
  focusMainInput(el) {
    if (this.args.focused) { el.focus(); }
  }

  @action
  registerMainInput(el) {
    this.#mainInput = el;
  }

  @action
  deregisterMainInput() {
    this.#mainInput = null;
  }

  @action
  registerBackground(el) {
    this.#background = el;
  }

  @action deregisterBackground() {
    this.#background = null;
  }

  @action
  onKeyDown(e) {
    let { keyCode } = e;

    if (keyCode === KEY.ENTER) {
      e.preventDefault();
      this.args.onSearchTriggered && this.args.onSearchTriggered();
    }

    if(keyCode === KEY.DOWN) {
      e.preventDefault();
      this.args.onDownPressed && this.args.onDownPressed();
    }

    if(keyCode === KEY.ESCAPE) {
      this.args.onEscPressed && this.args.onEscPressed();
    }

    // There are a number of keypress scenarios that will cause an input
    // field to scroll when the text exceeds the width of the field:
    //
    //   1. Pressing Home or End
    //   2. Pressing Cmd+Right (Mac) or Ctrl+Right (PC)
    //   3. Pasting in text that's longer than the field
    //   4. Typing at the end of the field
    //   5. Pressing and holding the Left or Right keys
    //
    // In these events, we need to update the position of .search-box-hints
    // to match the input field.
    //
    //
    //
    // It would, in theory, be ideal to call `scrollBackgroundToMatchInput`
    // on the keyUp event because, on keyDown, browsers have not yet scrolled
    // and redrawn the input field in response to the event.
    //
    // However, there are a number of scenarios where this will not work:
    //
    //   1. On the Mac, 'keyUp' events for (e.g. arrow keys or V for paste)
    //      are suppressed while the Command key is pressed.
    //
    //   2. When the user presses and holds a key down, the 'keyDown'
    //      event is fired repeatedly, but 'keyUp' events are not.
    //
    // In both of these cases, Firefox will still raise the 'keyPress'
    // event but other browsers will not.
    //
    //
    //
    // For this reason, we have to rely on `keyDown` to get the background
    // position of the element right; but it will do no good to call
    // `scrollBackgroundToMatchInput` immediately.
    //
    // We set two timeouts for calling this method: one without a delay
    // because this works for most browsers and gives a snappier feeling
    // and one with a short delay because, when the first timeout is
    // called, 9 times out of 10, Firefox for Mac has not yet redrawn
    // the input field.

    window.setTimeout(() => {
      this.scrollBackgroundToMatchInput();
    });
    window.setTimeout(() => {
      this.scrollBackgroundToMatchInput();
    }, 50);

    if (keyCode === KEY.TAB || keyCode === KEY.RIGHT || keyCode === KEY.END) {
      if (this.isCursorAtEndOfInput) {
        const { activeToken } = this;
        if (activeToken && activeToken.autoComplete()) {
          if (e.shiftKey) { return; } // Allow shift-tab to do its thing
          e.preventDefault();
          this.autocompleteOnTab(activeToken);
        }
      }
    }
  }

  @action
  onKeyUp(e) {
    let { keyCode, target } = e;

    if (NAVIGATIONAL_KEYS.includes(keyCode)) {
      this.cursorLocation = target.selectionStart;
    }
  }

  @action
  updateInternalValue() {
    if (this.args.value !== this._value) {
      this._value = this.args.value;
    }
  }

  @action
  syncValueToInput() {
    if (!this.#mainInput) { return; }
    this.#mainInput.value = this._value;

    this.args.onValueChanged && this.args.onValueChanged(this._value);
    window.setTimeout(() => {
      this.cursorLocation = this.#mainInput.selectionStart;
      this.scrollBackgroundToMatchInput();
      this.activeToken;
    });
  }

  @action
  updateValue() {
    if (!this.#mainInput) { return; }

    this._value = this.#mainInput.value;
    this.args.onValueChanged && this.args.onValueChanged(this._value);
    window.setTimeout(() => {
      this.cursorLocation = this.#mainInput.selectionStart;
      this.scrollBackgroundToMatchInput();
    });
  }

  @action
  updateInputAfterChangingTokenModel(activeToken) {
    if (!activeToken) { return; }

    const { tokens, isLastTokenSelected } = this;

    // When the user has typed nothing at all, we're showing the
    // the list of modifiers - the hints for the pseudo-token '+'.
    if (tokens.length === 0) {
      this._value = stringifyTokens([ activeToken ]);
    }

    if (activeToken.isValueValid && isLastTokenSelected) {
      this._value = stringifyTokens([ ...this.tokens, new Token({ fullText: ' ' }) ]);
    }

    const cursorLocation = this.getTokenEndCursorPos(activeToken) + (!activeToken.isValueValid ? 0 : 1);
    this.setCursor(cursorLocation);
  }

  @action
  acquireFocus() {
    if (this.args.focused) { this.#mainInput.focus(); }
  }

  @action
  didPaste({ target }) {
    run.next(this, function() { this._value = target.value; });
  }

  @action
  didCut({ target }) {
    run.next(this, function() { this._value = target.value; });
  }

  @action
  didClick({ target }) {
    this.cursorLocation = target.selectionStart;
    this.scrollBackgroundToMatchInput();
    this.args.onClick && this.args.onClick();
  }

  @action
  didReceiveFocus() {
    // HACK: Needs to be run on the next iteration of the loop thanks to IE.
    // If it doesn't, then IE registers selectionStart as the end of the
    // _placeholder_ text, leading to an inability to discern an activeToken
    // and handle the null state gracefully.
    run.next(this, () => { this.cursorLocation = this.#mainInput.selectionStart; });
    this.args.onFocusIn && this.args.onFocusIn();
  }

  @action
  didLoseFocus() {
    // In Chrome (and Chrome only), when the input field loses focus,
    // Chrome scrolls the field all the way left. The other browsers
    // don't do this, but for Chrome's sake, we'll ensure that the
    // background span's position is synced with the input field's.
    window.setTimeout(() => { this.scrollBackgroundToMatchInput(); });
    this.args.onFocusOut && this.args.onFocusOut();
  }




  setCursor(newLocation) {
    this.cursorLocation = newLocation;
    run.schedule('afterRender', () => {
      this.#mainInput.focus();
      setCursor(this.#mainInput, newLocation);
    });
  }

  scrollBackgroundToMatchInput() {
    if (this.#background && this.#mainInput) {
      this.#background.scrollLeft = this.#mainInput.scrollLeft;
    }
  }

  autocompleteOnTab(activeToken) {
    const { isLastTokenSelected } = this;
    let cursorLocation = this.getTokenEndCursorPos(activeToken);
    let newValue;
    if (activeToken.value) {
      if (isLastTokenSelected) {
        newValue = stringifyTokens([ ...this.tokens, new Token({ fullText: ' ' }) ]);
      }
      cursorLocation += 1;
    }

    newValue = newValue || stringifyTokens(this.tokens);
    this._value = newValue;
    this.setCursor(cursorLocation);
  }

  getTokenEndCursorPos(token) {
    const { tokens } = this;
    let sum = 0;
    for (var i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      sum += t.length;
      if (t === token) { break; }
    }
    return sum;
  }

  notifyOnActiveTokenChanged(activeToken) {
    if (this.#lastActiveToken === activeToken) { return; }
    if (this.#lastActiveToken) { this.#lastActiveToken.off('modelAssigned', this.updateInputAfterChangingTokenModel); }
    if (activeToken) { activeToken.on('modelAssigned', this.updateInputAfterChangingTokenModel); }
    this.args.onActiveTokenChanged && this.args.onActiveTokenChanged(activeToken);
    this.#lastActiveToken = activeToken;
  }

}
