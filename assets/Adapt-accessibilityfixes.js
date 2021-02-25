// ================================================
//
//		Adapt ESDC Accessibility fixes script
//		v.1.1.1
//		2021-02-25
//
// ================================================


//Startup update
window.setTimeout(function(){

}, 500);


//event listener for changes in Adapt page. It checks the "data-location" 
//attribute of the html tag for updates.
//-----------------------------------------------------------------------------

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
	if (mutation.type == "attributes" && mutation.attributeName == "data-location") {
		setTimeout(pagefix, 200);
		}
	});
});

//Note: document.documentElement is a pointer to the <html> node
//it can be replaced with a selector like document.getElementById("id") 
//to target other tags.
observer.observe(document.documentElement, {
	attributes: true
});

// runs on navigation
function pagefix (){
// write code that applies everywhere here:


	// On menu
	if($('#adapt').attr('data-location') == 'course'){
		
		$('img').each(function(){
	  		if ($(this).attr('aria-hidden') == 'true'){
	    	$(this).removeAttr('aria-hidden');
	    	$(this).attr('alt', '');
      		}
      	});

	    var buttonArray = [];
		$(".navigation-inner button").each(function(i){
			buttonArray.push([i, $(this).position().left]);		
		});
		buttonArray.sort(sortmulti(1, comparator, false));
		for (var j=0; j < buttonArray.length; j++){
		$(".navigation-inner button").eq(buttonArray[j][0]).attr("tabindex", j+1);
	}

	// in a page
	}else {

		// multiple choice label fix
		let multiChoiceComponents = $(".mcq-component");
		multiChoiceComponents.each(function(i){
		let label = $(this).attr("data-adapt-id") + "qlabel";
		alert($(this));
		$(".mcq-body-inner > p").attr("id", label);
		$(".mcq-widget").attr("aria-labelledby", label);
		});

		//Matching questions fix

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
			// if image has aria-hidden, get alt empty instead
			if ($(this).attr('aria-hidden') == 'true'){
			$(this).removeAttr('aria-hidden');
			$(this).attr('alt', '');
			}
			// if image has aria-label, convert to alt
			if($(this).attr('aria-label') == ''){
			$(this).removeAttr('aria-label');
			$(this).attr('alt', '');
			}else {
			$(this).attr("alt", $(this).attr("aria-label"));
			$(this).removeAttr("aria-label");
			}
			// if image has no aria-hidden and alt
			var attr = $(this).attr('alt');
			var attraria = $(this).attr('aria-label');
			if (typeof attr !== typeof undefined && attr !== false){}else {
			if (typeof attraria !== typeof undefined && attraria !== false){}else{$(this).attr('alt', '');}}
		});
	}
}




//Update recursively (don't do it)
$('#wrapper').on('DOMSubtreeModified', function(){


});


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
