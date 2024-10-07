import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, find, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const KEY = { DOWN: 40, UP: 38, ENTER: 13 };

const hintList = [
  { section: 'Action Types', list: [
    { category: 'Action Types', index: 0, position: 0, value: 'animal', label: 'animal' },
    { category: 'Action Types', index: 1, position: 1, value: 'plant', label: 'plant' },
    { category: 'Action Types', index: 2, position: 2, value: 'mineral', label: 'mineral' } ] } ];

module('Integration | Component | SearchWithModifiers::SearchModifiers', function(hooks) {
  setupRenderingTest(hooks);

  test('renders', async function(assert) {
    await render(hbs`
      <SearchWithModifiers::SearchModifiers />
    `);
    assert.ok(find('.search-modifiers'));
  });

  test('displays hintList', async function(assert) {
    this.set('hintList', hintList);

    await render(hbs`
      <SearchWithModifiers::SearchModifiers @hintList={{hintList}}/>
    `);

    assert.deepEqual(
      findAll('.search-modifier-value').map(el => el.textContent.trim()),
      ['animal', 'plant', 'mineral']);
  });

  test('list current item works', async function(assert) {
    this.set('hintList', hintList);

    let model = null;
    this.set('changeTokenModel', (value) => { model = value });

    await render(hbs`
      <SearchWithModifiers::SearchModifiers
          @keyScope="testScope"
          @onSelect={{action changeTokenModel}}
          @hintList={{hintList}}/>
    `);

    assert.strictEqual(null, find('.search-modifier.highlighted'), 'Expected nothing to be selected');

    let target = find('[data-test-list-keyboard-navigator]');
    target.focus();

    await triggerKeyEvent(target, 'keydown', KEY.DOWN);
    assert.ok(findAll('.search-modifier')[0].classList.contains('highlighted'), 'Expected the first item to be selected');

    await triggerKeyEvent(target, 'keydown', KEY.DOWN);
    assert.ok(findAll('.search-modifier')[1].classList.contains('highlighted'), 'Expected the second item to be selected');

    await triggerKeyEvent(target, 'keydown', KEY.UP);
    assert.ok(findAll('.search-modifier')[0].classList.contains('highlighted'), 'Expected the first item to be selected');

    await triggerKeyEvent(target, 'keydown', KEY.ENTER);
    assert.deepEqual(model, { category: 'Action Types', label: 'animal', value: 'animal', index: 0, position: 0 }, 'Expected model to have been set');
  });
});
