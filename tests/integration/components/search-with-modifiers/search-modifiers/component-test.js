import { assert } from 'chai';
import { it, describe } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, findAll, find, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const KEY = { DOWN: 40, UP: 38, ENTER: 13 };

const hintList = [
  { section: 'Action Types', list: [
    { category: 'Action Types', index: 0, position: 0, value: 'animal', label: 'animal' },
    { category: 'Action Types', index: 1, position: 1, value: 'plant', label: 'plant' },
    { category: 'Action Types', index: 2, position: 2, value: 'mineral', label: 'mineral' } ] } ];

describe('Integration | Component | {{search-with-modifiers/search-modifiers}}', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`
      {{search-with-modifiers/search-modifiers}}
    `);
    assert.exists(find('.search-modifiers'));
  });

  it('displays hintList', async function() {
    this.set('hintList', hintList);

    await render(hbs`
      {{search-with-modifiers/search-modifiers hintList=hintList}}
    `);

    assert.deepEqual(
      findAll('.search-modifier-value').map(el => el.textContent.trim()),
      ['animal', 'plant', 'mineral']);
  });

  it('list current item works', async function() {
    this.set('hintList', hintList);

    let model = null;
    this.set('changeTokenModel', (value) => { model = value });

    await render(hbs`
      {{search-with-modifiers/search-modifiers
        keyScope="testScope"
        onSelect=(action changeTokenModel)
        hintList=hintList}}
    `);

    assert.isNull(find('.search-modifier.highlighted'), 'Expected nothing to be selected');

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
