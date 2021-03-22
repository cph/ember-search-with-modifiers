# CHANGELOG

### v0.2.0
* **[breaking]** - Required Node 12+ (#21)
* **[improvement]** - Used GitHub actions for running automated tests (#21)
* **[fix]** - Updated `printf` to address CVE (#21)

### v0.1.0
* **[improvement]** - Refactored to use Glimmer components (#14)
* **[breaking]** - `focused` parameter to both `SearchBox` and `SearchModifiers` components is no longer two-way bound
* **[breaking]** - Made focus action names consistent for both `SearchBox` and `SearchModifiers`: both now have two actions: `onFocusIn` and `onFocusOut`.
* **[breaking]** - `query` parameter to `SearchWithModifiers` component is no longer two-way bound. Use the existing `valueChange` action to observe changes to `query`

### v0.0.3
* **[improvement]** - Removed dependence on jQuery (#4)
* **[improvement]** - Updated ember-mocha (#4)
* **[improvement]** - Removed support for Node 6 (#4)
* **[fix]** - Bumped handlebars to 4.5.3 to address CVE (#5)
* **[fix]** - Bumped jquery (in development) to 3.5.0 to address CVE (#6)
* **[fix]** - Bumped ember-list-keyboard-navigator to 0.0.4 (#6)
* **[improvement]** - Added Changelog
