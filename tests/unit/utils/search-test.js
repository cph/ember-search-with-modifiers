import { assert } from 'chai';
import { it, describe } from 'mocha';
import { tokenize } from 'ember-search-with-modifiers/utils/search';

describe('Unit | Utility | search', function() {
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
      return `${token.get('fullText')}(${token.get('type')})`;
    }).join('');
  }

  describe('tokenize', function() {
    it('treats words as spaces', function() {
      assert.equal(tokenizeAndDescribe('hello'), 'hello(space)');
    });

    it('splits words', function() {
      assert.equal(tokenizeAndDescribe('hello world'), 'hello(space) (space)world(space)');
    });

    it('consolidates spaces', function() {
      assert.equal(tokenizeAndDescribe('hello  world'), 'hello(space)  (space)world(space)');
    });

    it('keeps quoted phrases together', function() {
      assert.equal(tokenizeAndDescribe('"hello world"'), '"hello world"(space)');
    });

    it('handles half-quoted phrases', function() {
      assert.equal(tokenizeAndDescribe('"hello'), '"hello(space)');
    });

    it('identifies field-modifiers', function() {
      assert.equal(tokenizeAndDescribe('hello fruit:'), 'hello(space) (space)fruit:(field)');
    });

    it('identifies symbol-modifiers', function() {
      assert.equal(tokenizeAndDescribe('#fruits'), '#fruits(symbol)');
    });

    it('treats completed modifiers as a single token', function() {
      assert.equal(tokenizeAndDescribe('hello fruit:apple'), 'hello(space) (space)fruit:apple(field)');
    });

    it('permits spaces between a field-modifier and its value', function() {
      assert.equal(tokenizeAndDescribe('hello fruit:  apple'), 'hello(space) (space)fruit:  apple(field)');
    });

    it('does not permit spaces between a symbol-modifier and its value', function() {
      assert.equal(tokenizeAndDescribe('# fruits'), '#(symbol) (space)fruits(space)');
    });

    it('accepts quoted phrases as values for modifiers', function() {
      assert.equal(tokenizeAndDescribe('fruit: "apple"'), 'fruit: "apple"(field)');
    });

    it('treats space after text after modifiers as a token break', function() {
      assert.equal(tokenizeAndDescribe('fruit: apple hello'), 'fruit: apple(field) (space)hello(space)');
    });

    it('treats broken modifiers as a single token', function() {
      assert.equal(tokenizeAndDescribe('hello fruit:grape'), 'hello(space) (space)fruit:grape(field)');
    });
  });
});
