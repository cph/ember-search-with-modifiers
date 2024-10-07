import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { prepareConfig } from 'ember-search-with-modifiers/utils/search';
import Token from 'ember-search-with-modifiers/models/token';

module('Unit | token', function(hooks) {
  setupTest(hooks);

  const configHash = prepareConfig({
   "before:": {
     type: 'date',
     defaultHint: 'a date',
   },

   "category:": {
     type: 'list',
     defaultHint: 'type',
     sectionTitle: 'Action Types',
     content: [
       {value: 'animal', label: 'animal'},
       {value: 'plant', label: 'plant'},
       {value: 'mineral', label: 'mineral'},
       {value: 'quoted type', label: 'quoted type'},
       {value: 'quoted type 2', label: 'quoted type 2'}
     ]
   }
  });

  test('token list type works', function(assert) {
    let token = new Token({ configHash, fullText: 'category:plant' });

    assert.equal(token.type, 'list');
    assert.equal(token.modifier, 'category:');
    assert.equal(token.value, 'plant');

    token.fullText = 'category:pla';

    assert.equal(token.value, 'pla');
    assert.equal(token.subHint, 'nt');
    assert.equal(token.hint, 'nt');
    assert.notOk(token.isValueValid);
    assert.deepEqual(token.hints, [
      { value: 'plant', label: 'plant' },
    ]);

    assert.ok(token.autoComplete());

    assert.equal(token.value, 'plant');
    assert.notOk(token.subHint);
    assert.notOk(token.hint);
    assert.ok(token.isValueValid);

    token.value = '';

    assert.equal(token.fullText, 'category:');
    assert.deepEqual(token.hints, [
      { value: 'animal', label: 'animal' },
      { value: 'plant', label: 'plant' },
      { value: 'mineral', label: 'mineral' },
      { value: '"quoted type"', label: 'quoted type' },
      { value: '"quoted type 2"', label: 'quoted type 2' }
    ]);
  });

  test('token list type works with quoted tokens', function(assert) {
    let token = new Token({ configHash, fullText: 'category:"quoted type"' });

    assert.equal(token.type, 'list', 'should identify the type');
    assert.equal(token.modifier, 'category:', 'should identify the category');
    assert.equal(token.value, '"quoted type"', 'should identify the value');

    [ 'category:quo', // Without an initial quote mark
      'category:"quo' // With an initial quote mark
    ].forEach(function(value) {
      token.fullText = value;

      assert.equal(token.value, value.substr(9), 'should identify the value');
      assert.equal(token.normalizedValue, 'quo', 'should identify the value without quotes');
      assert.equal(token.subHint, 'ted type', 'supply the rest of the matched value as `subHint`');
      assert.equal(token.hint, 'ted type', 'supply the rest of the matched value as `hint`');
      assert.notOk(token.isValueValid, 'isValueValid should be false');
      assert.deepEqual(token.hints, [
        {value: '"quoted type"', label: 'quoted type'},
        {value: '"quoted type 2"', label: 'quoted type 2'}
      ]);

      assert.ok(token.autoComplete());

      assert.equal(token.fullText, 'category:"quoted type"', 'quote the value in fullText');
      assert.equal(token.value, '"quoted type"', 'should fill in the quoted type on autocomplete');
      assert.notOk(token.subHint, 'should not have value for `subHint` when fullText ends with a "');
      assert.notOk(token.hint, 'should not have value for `hint` when fullText ends with a "');
      assert.ok(token.isValueValid, 'should be a valid value');
    });
  });
});
