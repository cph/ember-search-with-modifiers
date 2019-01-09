# ember-search-with-modifiers

[![Build Status](https://travis-ci.org/cph/ember-search-with-modifiers.svg)](https://travis-ci.org/cph/ember-search-with-modifiers)

A search box that can be configured to allow autocompleting modifier lists


## Installation

```
ember install ember-search-with-modifiers
```


## Usage

###### Example:

```htmlbars
{{#search-with-modifiers
    query=query
    enter=(action "search")
    focusOnInput=(action "focusOnInput")
    sampleQueries=sampleQueries
    configHash=searchContext.config as |x|}}

  {{x.search-box
      focused=(mut searchFocused)
      onFocus=(action "showSearchHelpsOnFocus")
      onEscPressed=(action "hideSearchHelps")
      onDownPressed=(action "focusOnResults")
      placeholder=placeholder}}

  {{#if showSearchHelps}}
    {{x.modifier-list
        focused=(mut resultsFocused)
        focusOnInput=(action "focusOnInput")}}

  {{else if isSearching}}
    <div class="searching">{{t "search.message.searching"}}</div>
  {{else}}
    {{!-- search results --}}
  {{/if}}
{{/search-with-modifiers}}
```


## License

This project is licensed under the [MIT License](LICENSE.md).
