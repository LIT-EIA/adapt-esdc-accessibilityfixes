// ================================================
//
//		Adapt ESDC Accessibility fixes script
//
// ================================================



// -------------------------------------------------------------------------
//
//		Update listeners - functions which decide when to run fixes
//
// -------------------------------------------------------------------------

//Startup update
//-----------------------------------------------------------------------------
window.setTimeout(function(){

}, 500);


//event listener for changes in Adapt page. It checks the "data-location" 
//attribute of the html tag for updates.
//-----------------------------------------------------------------------------
var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
	if (mutation.type == "attributes" && mutation.attributeName == "data-location") {
		setTimeout(accessibilityfixes, 200);
		}
	});
});

//Note: document.documentElement is a pointer to the <html> node
//it can be replaced with a selector like document.getElementById("id") 
//to target other tags.
//-----------------------------------------------------------------------------
observer.observe(document.documentElement, {
	attributes: true
});

//This function runs anytime anything in the DOM (inside #wrapper) is modified
//DON'T DO IT !
//-----------------------------------------------------------------------------
$('#wrapper').on('DOMSubtreeModified', function(){


});





// -------------------------------------------------------------------------
//
//		Accessibility fixes - grouped by global fixes, fixes for the menu 
//      only and fixes for all other pages of the course
//
// -------------------------------------------------------------------------

function accessibilityfixes (){
	
	// -------------
	// GLOBAL FIXES
	// -------------

	//Tab order of buttons in the top navigation bar
	var buttonArray = [];
	$(".navigation-inner button").each(function(i){
		buttonArray.push([i, $(this).position().left]);		
	});
	buttonArray.sort(sortmulti(1, comparator, false));
	for (var j=0; j < buttonArray.length; j++){
	$(".navigation-inner button").eq(buttonArray[j][0]).attr("tabindex", j+1);

	//target blank to external sites (ignore local hrefs)
	//-----------------------------------------------------------------------------
	$( 'a' ).each(function() {
  		if( location.hostname === this.hostname || !this.hostname.length ) {
  		} else {
     		$(this).attr('target', '_blank');
  		}
	});

	//Standard ARIA label conversions and control of aria hidden attributes
	//-----------------------------------------------------------------------------	
	$('img').each(function(){
		
		// if image has already has alt
		if ($(this).hasAttr('alt')){
			//do nothing
		}
		
		//if img has aria-label, convert to alt
		else if ($(this).hasAttr('aria-label')){
			$(this).attr("alt", $(this).attr("aria-label"));
			$(this).removeAttr("aria-label");		
		}
		
		//image had neither aria-label or alt, add an empty alt
		else{
			
			$(this).attr('alt', '');
		}
		
		// if image has aria-hidden, remove it.
		if ($(this).attr('aria-hidden') == 'true'){
			$(this).removeAttr('aria-hidden');
		}
		
	});
	
	// ----------------
	// 
	// ----------------	


	
	if($('#adapt').attr('data-location') == 'course'){
	// ----------------
	// MENU FIXES
	// ----------------



		
	// ----------------
	// 
	// ----------------	
	}



	}else {
	// ------------------
	// COURSE PAGE FIXES
	// ------------------

		// multiple choice label fix
		//-----------------------------------------------------------------------------
		let multiChoiceComponents = $(".mcq-component");
		multiChoiceComponents.each(function(i){
			let label = $(this).attr("data-adapt-id") + "qlabel";
			$(".mcq-body-inner > p").attr("id", label);
			$(".mcq-widget").attr("aria-labelledby", label);
		});

		//Matching questions fix
		//-----------------------------------------------------------------------------
		$(".matching-select-container").each(function(k){
			var glabel = $(this).parents().find('.matching-component').attr("data-adapt-id")+'_qlabel_'+k;
			$(this).find(".dropdown__inner").attr('id', glabel);
			$(this).find("button").attr('aria-labelledby', glabel);
		});
		
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

		//remove tooltips from buttons
		//-----------------------------------------------------------------------------
		$("button").removeAttr("tooltip");
		
		
	// ----------------
	// 
	// ----------------	
	}
	
}





// -------------------------------------------------------------------------
//
//		Utility functions
//
// -------------------------------------------------------------------------

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

//Check if object has given attribute
Object.prototype.hasAttr = function(attr) {
    if(this.attr) {
        var _attr = this.attr(attr);
    } else {
        var _attr = this.getAttribute(attr);
    }
    return (typeof _attr !== "undefined" && _attr !== false && _attr !== null);      
};