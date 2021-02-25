// ================================================
//
//		Adapt ESDC Accessibility fixes script
//		v.1.1.0
//		2021-01-22
//
// ================================================

//event listener for changes in Adapt page. It checks the "data-location" 
//attribute of the html tag for updates.
//-----------------------------------------------------------------------------

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		if (mutation.type == "attributes" && mutation.attributeName == "data-location") {
			accessibilityfixes();
			setTimeout(accessibilityfixes, 500);
			setTimeout(accessibilityfixes, 1000);
			setTimeout(accessibilityfixes, 1500);
			setTimeout(accessibilityfixes, 3000);
			setTimeout(accessibilityfixes, 10000);
		}
	});
});

//Note: document.documentElement is a pointer to the <html> node
//it can be replaced with a selector like document.getElementById("id") 
//to target other tags.
observer.observe(document.documentElement, {
	attributes: true
});


//run accessibility script once on page load
$(document).ready(function(){
	accessibilityfixes();
});

//also run it on: all DOM loaded
document.addEventListener("DOMContentLoaded", function(){
    accessibilityfixes();
});

//also run it on: page fully loaded
window.addEventListener("load", function(){
    accessibilityfixes();
});


//function to fix accessibility issues
//-----------------------------------------------------------------------------
function accessibilityfixes()
{
	//Not an accessibility fix, just nice to have
	//Force all links to open in a new window / tab
	//-------------------------------------------------------------------------
	$("a").prop("target", "_blank");
	
	//change all aria-labels on images to Alt tags
	//-----------------------------------------------------------------------------
	$("img").each(function(){
		$(this).attr("alt", $(this).attr("aria-label"));
		$(this).removeAttr("aria-label");
	});
	
	//remove tooltips from buttons
	//-----------------------------------------------------------------------------
	$("button").removeAttr("tooltip");
	
	//fix for heading tab orders
	//-----------------------------------------------------------------------------
	var buttonArray = [];
	$(".navigation-inner button").each(function(i){
		buttonArray.push([i, $(this).position().left]);		
	});
	buttonArray.sort(sortmulti(1, comparator, false));
	for (var j=0; j < buttonArray.length; j++){
		$(".navigation-inner button").eq(buttonArray[j][0]).attr("tabindex", j+1);
	}
	
	//General fixes for all question types
	//-----------------------------------------------------------------------------
	
	//Narrative component accessibility fixes
	//-----------------------------------------------------------------------------
	
	//Accordion component accessibility fixes
	//-----------------------------------------------------------------------------
	
	$(".accordion-component").each(function(){
		var parentID = $(this).attr("data-adapt-id");
		$(".accordion-item-title").each(function(i){
			var blockid = "accord-" + i + "-" + parentID;
			$(this).attr("aria-controls", blockid);
			$(this).next().attr('id', blockid);
		});
	});
	
	//Matching Question accessibility fixes
	//-----------------------------------------------------------------------------
	
	//Multiple Choice Question accessibility fixes
	//-----------------------------------------------------------------------------
	
	//Graphical Multiple Choice Question accessibility fixes
	//-----------------------------------------------------------------------------
}



//utility functions
//=============================================================

//sort a multidimensional array
//-----------------------------------------------------------------------------
function comparator(a, b) {
	//Syntax: (condition) ? true action : false action
    return (a === b) ? 0 : (a < b) ? -1 : 1
}

function sortmulti(n, comparatorFunction, reverse) {
    return function(first, second) {
        if (reverse === true) {
            return comparatorFunction(second[n], first[n]);
        } else {
            return comparatorFunction(first[n], second[n]);
        }
    }
}