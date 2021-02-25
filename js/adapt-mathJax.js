define([ "core/js/adapt" ], function(Adapt) {

	function loadScript(scriptObject, callback) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');

		script.type = scriptObject.type || 'text/javascript';

		if (scriptObject.src) {
			script.src = scriptObject.src;
		}

		if (scriptObject.text) {
			script.text = scriptObject.text;
		}

		if (callback) {
			// Then bind the event to the callback function.
			// There are several events for cross browser compatibility.
			script.onreadystatechange = callback;
			script.onload = callback;
		}

		// Append the <script> tag.
		head.appendChild(script);
	}

	function setUpMathJax() {
		Adapt.wait ? Adapt.wait.begin() : Adapt.trigger("plugin:beginWait");

		var config = Adapt.config.get("_Adapt-accessibilityfixes");
		var inlineConfig = config ? config._inlineConfig : {
				/*"extensions": [ "tex2jax.js" ],
				"jax": [ "input/TeX", "output/HTML-CSS" ]*/
		};
		var src = config ? config._src : "./assets/Adapt-accessibilityfixes.js";

		loadScript({ 
			/*type: "text/x-mathjax-config",
			text: "MathJax.Hub.Config(" + JSON.stringify(inlineConfig) + ");"*/
		});

		loadScript({ src: 'assets/mathJaxInit.js' }, function() {
			loadScript({ src: src }, function() {
				Adapt.wait ? Adapt.wait.end() : Adapt.trigger("plugin:endWait");
			});
		});
	}


	Adapt.once("app:dataReady", setUpMathJax).on({

	});

});
