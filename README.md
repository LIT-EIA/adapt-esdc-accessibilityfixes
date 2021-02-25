# MathJax (College version!)

An extension to load [MathJax](https://www.mathjax.org) into Adapt.

## Installation

* In this extension the default configuration for MathJax is as follows:
```json
"_mathJax": {
	"_inlineConfig": {
		"extensions": [
			"tex2jax.js"
		],
		"jax": [
			"input/TeX",
			"output/HTML-CSS"
		]
	},
	"_src": "//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js"
}
```
* If this needs to be overridden, add the above to `config.json` and modify where required.
* With [Adapt CLI](https://github.com/adaptlearning/adapt-cli) installed, run `adapt install mathJax`. Alternatively, download the ZIP and extract into the src > extensions directory.
* Run an appropriate Grunt task.

### Usage

* With the default configuation, equations are processed in LaTeX format.
* In JSON, surround LaTeX equations with `\\(` and `\\)` for inline mode or `\\[` and `\\]` for display mode.
* Example of inline mode:
```
\\(x^n + y^n = z^n\\)
```
* Example of display mode (rendered in a separate block):
```
\\[f(x) = \\frac{1}{1+x}\\]
```
* When directly editing in the authoring tool, backslashes do *not* have to be escaped with an additional backslash (`\`). The above 'inline mode' example would therefore be entered as:
```
\(x^n + y^n = z^n\)
```
* The Adapt loading screen is shown while MathJax is processing.

### Attributes

Attribute | Type | Description | Default
--------- | ---- | ----------- | -------
`_inlineConfig` | Object | In-line [configuration](http://docs.mathjax.org/en/latest/options/index.html#configuration) for MathJax | `{ "extensions": [ "tex2jax.js" ], "jax": [ "input/TeX", "output/HTML-CSS" ] }`
`_src` | String | The URL to the copy of MathJax which should be loaded | `"//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js"`
