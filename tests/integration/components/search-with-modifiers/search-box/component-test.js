import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { prepareConfig } from 'ember-search-with-modifiers/utils/search';

module('Integration | Component | SearchWithModifiers::SearchBox', function(hooks) {
  setupRenderingTest(hooks);

  const configHash = {
   "category:": {
     type: 'list',
     defaultHint: 'type',
     sectionTitle: 'Action Types',
     content: [
       {value: 'animal', label: 'animal'},
       {value: 'plant', label: 'plant'},
       {value: 'mineral', label: 'mineral'}
     ]
   }
  };

  test('highlights modifiers', async function(assert) {
    this.set('query', '');
    this.set('cursorLocation', -1);
    this.set('tokenConfig', prepareConfig(configHash));
    await render(hbs`
      <SearchWithModifiers::SearchBox
        @tokenConfig={{tokenConfig}}
        @cursorLocation={{cursorLocation}}
        @value={{query}}/>
    `);

    this.set('query', 'category:');
    this.set('cursorLocation', this.query.length);
    assert.equal(find('.search-box-input').value, 'category:');
    assert.equal(find('.search-box-hints .search-box-hint.incomplete').textContent.trim(), 'category:',
      'The modifier should be incomplete when it is the active token');

    this.set('query', 'category: ');
    this.set('cursorLocation', this.query.length);
    assert.equal(find('.search-box-input').value, 'category: ');
    assert.equal(find('.search-box-hints .search-box-hint.incomplete').textContent.trim(), 'category:',
      'The modifier should be incomplete when it is not the active token');

    this.set('query', 'category:animal');
    this.set('cursorLocation', this.query.length);
    assert.equal(find('.search-box-input').value, 'category:animal');
    assert.notOk(find('.search-box-hints .search-box-hint').classList.contains('incomplete'),
      'The modifier should not be styled incomplete');
  });
});
