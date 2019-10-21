import Component from '@ember/component';
import layout from './template';
import { run } from '@ember/runloop';
import { get, observer, computed } from '@ember/object';
import Token from '../../../models/token';
import KEY from '../../../utils/keycodes';
import { tokenize, setCursor } from '../../../utils/search';
import { typeOf } from '@ember/utils';

const doNothing = function() {};

const NAVIGATIONAL_KEYS = [
  KEY.UP,
  KEY.DOWN,
  KEY.LEFT,
  KEY.RIGHT,
  KEY.HOME,
  KEY.END
];

export default Component.extend({
  layout,
  classNames: ['search-box'],
  cursorLocation: -1,
  maxlength: 250,
  _value: '',
  focused: false,

  init() {
    this._super(...arguments);
    this.updateInternalValue();
    this.get('activeToken');
    this._onTokenModelAssigned = run.bind(this, 'updateInputAfterChangingTokenModel');
  },

  didInsertElement() {
    this._super(...arguments);
    run.schedule('afterRender', this, function() {
      this._mainInput = this.element.querySelector('.search-box-input');
      this._background = this.element.querySelector('.search-box-hints');
      this._mouseWheelListener = run.bind(this, 'onMouseScroll');
      this._mainInput.addEventListener('mousewheel', this._mouseWheelListener);
      this._mainInput.addEventListener('DOMMouseScroll', this._mouseWheelListener);

      if(this.get('focused')) this._mainInput.select().focus();
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    this._mainInput.removeEventListener('mousewheel', this._mouseWheelListener);
    this._mainInput.removeEventListener('DOMMouseScroll', this._mouseWheelListener);
  },

  onMouseScroll(/* e */) {
    this.scrollBackgroundToMatchInput();
  },

  setCursor(newLocation) {
    this.set('cursorLocation', newLocation);
    run.schedule('afterRender', this, function() {
      this._mainInput.focus();
      setCursor(this._mainInput[0], newLocation);
    });
  },

  scrollBackgroundToMatchInput() {
    if(this._background && this._mainInput) {
      this._background.scrollLeft(this._mainInput[0].scrollLeft);
    }
  },



  tokens: computed('_value', 'tokenConfig', function() {
    return tokenize(this.get('_value'), this.get('tokenConfig'));
  }),

  activeToken: computed('activeTokenIndex', 'tokens.[]', 'cursorLocation', function() {
    let activeTokenIndex = this.get('activeTokenIndex');
    let tokens = this.get('tokens');
    if(activeTokenIndex >= 0) {
      return tokens[activeTokenIndex];
    } else if(tokens.length === 0 && this.get('cursorLocation') === 0) {
      return Token.create({ configHash: this.get('tokenConfig'), fullText: '+' });
    }
  }),

  activeTokenIndex: computed('cursorLocation', 'tokens.[]', function() {
    let cursorLocation = this.get('cursorLocation');
    let sumIndex = 0;
    let token, startIndex, endIndex;
    let tokens = this.get('tokens');
    let length = get(tokens, 'length');
    for(var i = 0; i < length; i++) {
      token = tokens[i];
      startIndex = sumIndex;
      endIndex = token.get('length') + startIndex;
      sumIndex = endIndex;
      if(startIndex < cursorLocation && cursorLocation <= endIndex) {
        return i;
      }
    }
    return -1;
  }),

  hintValue: computed('isLastTokenSelected', 'activeToken.hint', function() {
    if(this.get('isLastTokenSelected')) {
      return this.get('activeToken.hint');
    }
  }),

  isLastTokenSelected: computed('activeTokenIndex', 'tokens.length', function() {
    let tokensCount = this.get('tokens.length');
    return tokensCount && (tokensCount - 1) === this.get('activeTokenIndex');
  }),

  isCursorAtEndOfInput: computed('cursorLocation', '_value.length', function() {
    return this.get('cursorLocation') === this.get('_value.length');
  }),



  backgroundText: computed('tokens.[]', 'activeToken', 'hintValue', function() {
    let text = [];
    this.get('tokens').forEach((token) => {
      let fullText = get(token, 'fullText');
      if(['default', 'modifier-list', 'space'].indexOf(get(token, 'type')) >= 0) {
        text.push(fullText);
      } else if(get(token, 'isValueValid')) {
        text.push(`<span class='search-box-hint'>${fullText}</span>`);
      } else {
        text.push(`<span class='search-box-hint incomplete'>${fullText}</span>`);
      }
    });
    text.push(`<span class="search-box-hint-value">${this.get('hintValue') || ''}</span>`);
    return text.join('');
  }),



  keyDown(e) {
    let { keyCode } = e;

    if(keyCode === KEY.ENTER) {
      e.preventDefault();
      this.getAction('onSearchTriggered')();
    }

    if(keyCode === KEY.DOWN) {
      e.preventDefault();
      this.getAction('onDownPressed')();
    }

    if(keyCode === KEY.ESCAPE) {
      this.getAction('onEscPressed')();
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

    if(keyCode === KEY.TAB || keyCode === KEY.RIGHT || keyCode === KEY.END) {
      if(this.get('isCursorAtEndOfInput')) {
        let activeToken = this.get('activeToken');
        if(activeToken && activeToken.autoComplete()) {
          if(e.shiftKey) return; // Allow shift-tab to do its thing
          e.preventDefault();
          this.autocompleteOnTab(activeToken);
        }
      }
    }
  },

  keyUp(e) {
    let { keyCode, target } = e;

    if(NAVIGATIONAL_KEYS.includes(keyCode)) {
      this.set('cursorLocation', target.selectionStart);
    }
  },

  autocompleteOnTab(activeToken) {
    let hasVal = activeToken.get('value');
    let tokens = this.get('tokens');
    let isLastTokenSelected = this.get('isLastTokenSelected');
    let cursorLocation = this.getTokenEndCursorPos(activeToken);
    if(hasVal) {
      if(isLastTokenSelected) {
        tokens.pushObject(Token.create({ fullText: ' ' }));
      }
      cursorLocation += 1;
    }

    this.set('_value', this.getTokensString());
    this.setCursor(cursorLocation);
  },

  getTokensString() {
    let tokens = this.get('tokens');
    return tokens
      .reduce(function(sum, token) {
        sum += token.get('fullText');
        return sum;
      }, '');
  },



  getTokenEndCursorPos(token) {
    let tokens = this.get('tokens');
    let sum = 0;
    let t;
    for(var i = 0; i < tokens.length; i++) {
      t = tokens[i];
      sum += t.get('length');
      if(t === token) { break; }
    }
    return sum;
  },



  updateInternalValue: observer('value', function() {
    if(this.get('value') !== this.get('_value')) {
      this.set('_value', this.get('value'));
    }
  }),



  updateInputAfterChangingTokenModel() {
    let token = this.get('activeToken');
    if(!token) { return; }

    let tokens = this.get('tokens');

    // When the user has typed nothing at all, we're showing the
    // the list of modifiers - the hints for the pseudo-token '+'.
    if(tokens.length === 0) {
      tokens.pushObject(token);
    }

    let isLastTokenSelected = (tokens.length - 1) === this.get('activeTokenIndex');
    let cursorLocation;
    if(token.get('isValueValid') && isLastTokenSelected) {
      tokens.pushObject(Token.create({ fullText: ' ' }));
    }
    cursorLocation = this.getTokenEndCursorPos(token) + (!token.get('isValueValid') ? 0 : 1);

    this.set('_value', this.getTokensString());
    this.setCursor(cursorLocation);
  },



  notifyValueChange: observer('_value', function() {
    this.getAction('onValueChanged')(this.get('_value'));
    window.setTimeout(() => {
      this.set('cursorLocation', this._mainInput.get(0).selectionStart);
      this.scrollBackgroundToMatchInput();
    });
  }),

  notifyOnActiveTokenChanged: observer('activeToken', function() {
    let activeToken = this.get('activeToken');
    if(this._lastActiveToken === activeToken) return;
    if(this._lastActiveToken) { this._lastActiveToken.off('modelAssigned'); }
    if(activeToken) { activeToken.on('modelAssigned', this._onTokenModelAssigned); }
    this.getAction('onActiveTokenChanged')(activeToken);
    this._lastActiveToken = activeToken;
  }),



  acquireFocus: observer('focused', function() {
    if(this.get('focused')) this._mainInput.focus();
  }),



  actions: {
    didPaste({ target }) {
      run.next(this, function() {
        this.set('_value', target.value);
      });
    },

    didCut({ target }) {
      run.next(this, function() {
        this.set('_value', target.value);
      });
    },

    didClick({ target }) {
      this.set('cursorLocation', target.selectionStart);
      this.scrollBackgroundToMatchInput();
      this.getAction('onClick')();
    },

    didReceiveFocus() {
      this.set('focused', true);

      // HACK: Needs to be run on the next iteration of the loop thanks to IE.
      // If it doesn't, then IE registers selectionStart as the end of the
      // _placeholder_ text, leading to an inability to discern an activeToken
      // and handle the null state gracefully.
      run.next(this, () => { this.set('cursorLocation', this._mainInput[0].selectionStart); });
      this.getAction('onFocus')();
    },

    didLoseFocus() {
      this.set('focused', false);

      // In Chrome (and Chrome only), when the input field loses focus,
      // Chrome scrolls the field all the way left. The other browsers
      // don't do this, but for Chrome's sake, we'll ensure that the
      // background span's position is synced with the input field's.
      window.setTimeout(() => {
        this.scrollBackgroundToMatchInput();
      });
    }
  },

  getAction(actionName) {
    return typeOf(this.get(actionName)) === 'function' ? this.get(actionName) : doNothing;
  }
});
