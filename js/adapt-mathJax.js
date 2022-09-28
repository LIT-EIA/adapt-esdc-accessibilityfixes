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

		// Removed the config get and hardcoded src path inline - Francis
		//var config = Adapt.config.get("_Adapt-accessibilityfixes");
		var src = "./assets/Adapt-accessibilityfixes.js";

		// Seems unecessary? - Francis
		//loadScript({ 
			/*type: "text/x-mathjax-config",
			text: "MathJax.Hub.Config(" + JSON.stringify(inlineConfig) + ");"*/
		//});
		//

		// The script mathJaxInit.js doesn't seem to do anything meaningful anymore - Francis
		//loadScript({ src: 'assets/mathJaxInit.js' }, function() {
			loadScript({ src: src }, function() {
				Adapt.wait ? Adapt.wait.end() : Adapt.trigger("plugin:endWait");
			});
		//});
	}

	// the .on portion of this seems unecessary now
	Adapt.once("app:dataReady", setUpMathJax)//.on({});

});