import { assert } from 'chai';
import { it, describe } from 'mocha';
import { prepareConfig } from 'ember-search-with-modifiers/utils/search';
import Token from 'ember-search-with-modifiers/models/token';

describe('Unit | token', function() {
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

  it('token list type works', function() {
    let token = Token.create({ configHash, fullText: 'category:plant' });

    assert.equal(token.get('type'), 'list');
    assert.equal(token.get('modifier'), 'category:');
    assert.equal(token.get('value'), 'plant');

    token.set('fullText', 'category:pla');

    assert.equal(token.get('value'), 'pla');
    assert.equal(token.get('subHint'), 'nt');
    assert.equal(token.get('hint'), 'nt');
    assert.notOk(token.get('isValueValid'));
    assert.deepEqual(token.get('hints'), [
      {value: 'plant', label: 'plant'},
    ]);

    assert.ok(token.autoComplete());

    assert.equal(token.get('value'), 'plant');
    assert.notOk(token.get('subHint'));
    assert.notOk(token.get('hint'));
    assert.ok(token.get('isValueValid'));

    token.set('value', '');

    assert.equal(token.get('fullText'), 'category:');
    assert.deepEqual(token.get('hints'), [
      {value: 'animal', label: 'animal'},
      {value: 'plant', label: 'plant'},
      {value: 'mineral', label: 'mineral'},
      {value: '"quoted type"', label: 'quoted type'},
      {value: '"quoted type 2"', label: 'quoted type 2'}
    ]);
  });

  it('token list type works with quoted tokens', function() {
    let token = Token.create({ configHash, fullText: 'category:"quoted type"' });

    assert.equal(token.get('type'), 'list', 'should identify the type');
    assert.equal(token.get('modifier'), 'category:', 'should identify the category');
    assert.equal(token.get('value'), '"quoted type"', 'should identify the value');

    [ 'category:quo', // Without an initial quote mark
      'category:"quo' // With an initial quote mark
    ].forEach(function(value) {
      token.set('fullText', value);

      assert.equal(token.get('value'), value.substr(9), 'should identify the value');
      assert.equal(token.get('normalizedValue'), 'quo', 'should identify the value without quotes');
      assert.equal(token.get('subHint'), 'ted type', 'supply the rest of the matched value as `subHint`');
      assert.equal(token.get('hint'), 'ted type', 'supply the rest of the matched value as `hint`');
      assert.notOk(token.get('isValueValid'), 'isValueValid should be false');
      assert.deepEqual(token.get('hints'), [
        {value: '"quoted type"', label: 'quoted type'},
        {value: '"quoted type 2"', label: 'quoted type 2'}
      ]);

      assert.ok(token.autoComplete());

      assert.equal(token.get('fullText'), 'category:"quoted type"', 'quote the value in fullText');
      assert.equal(token.get('value'), '"quoted type"', 'should fill in the quoted type on autocomplete');
      assert.notOk(token.get('subHint'), 'should not have value for `subHint` when fullText ends with a "');
      assert.notOk(token.get('hint'), 'should not have value for `hint` when fullText ends with a "');
      assert.ok(token.get('isValueValid'), 'should be a valid value');
    });
  });
});
