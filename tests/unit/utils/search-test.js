import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { tokenize } from 'ember-search-with-modifiers/utils/search';

module('Unit | Utility | search', function(hooks) {
  setupTest(hooks);

  function tokenizeAndDescribe(text) {
    let config = {
      '#': {
        type: 'symbol',
        defaultHint: 'hint',
        sectionTitle: 'section',
        content: ['fruits']
      },
      'fruit:': {
        type: 'field',
        defaultHint: 'hint',
        sectionTitle: 'section',
        content: ['apple', 'banana', 'cherry']
      }
    };
    let tokens = tokenize(text, config);
    return tokens.map(function(token) {
      return `${token.fullText}(${token.type})`;
    }).join('');
  }

  module('tokenize', function() {
    test('treats words as spaces', function(assert) {
      assert.equal(tokenizeAndDescribe('hello'), 'hello(space)');
    });

    test('splits words', function(assert) {
      assert.equal(tokenizeAndDescribe('hello world'), 'hello(space) (space)world(space)');
    });

    test('consolidates spaces', function(assert) {
      assert.equal(tokenizeAndDescribe('hello  world'), 'hello(space)  (space)world(space)');
    });

    test('keeps quoted phrases together', function(assert) {
      assert.equal(tokenizeAndDescribe('"hello world"'), '"hello world"(space)');
    });

    test('handles half-quoted phrases', function(assert) {
      assert.equal(tokenizeAndDescribe('"hello'), '"hello(space)');
    });

    test('identifies field-modifiers', function(assert) {
      assert.equal(tokenizeAndDescribe('hello fruit:'), 'hello(space) (space)fruit:(field)');
    });

    test('identifies symbol-modifiers', function(assert) {
      assert.equal(tokenizeAndDescribe('#fruits'), '#fruits(symbol)');
    });

    test('treats completed modifiers as a single token', function(assert) {
      assert.equal(tokenizeAndDescribe('hello fruit:apple'), 'hello(space) (space)fruit:apple(field)');
    });

    test('permits spaces between a field-modifier and its value', function(assert) {
      assert.equal(tokenizeAndDescribe('hello fruit:  apple'), 'hello(space) (space)fruit:  apple(field)');
    });

    test('does not permit spaces between a symbol-modifier and its value', function(assert) {
      assert.equal(tokenizeAndDescribe('# fruits'), '#(symbol) (space)fruits(space)');
    });

    test('accepts quoted phrases as values for modifiers', function(assert) {
      assert.equal(tokenizeAndDescribe('fruit: "apple"'), 'fruit: "apple"(field)');
    });

    test('treats space after text after modifiers as a token break', function(assert) {
      assert.equal(tokenizeAndDescribe('fruit: apple hello'), 'fruit: apple(field) (space)hello(space)');
    });

    test('treats broken modifiers as a single token', function(assert) {
      assert.equal(tokenizeAndDescribe('hello fruit:grape'), 'hello(space) (space)fruit:grape(field)');
    });
  });
});
