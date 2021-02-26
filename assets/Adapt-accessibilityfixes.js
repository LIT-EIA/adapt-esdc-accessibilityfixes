// ================================================
//
//
//		Adapt ESDC Accessibility fixes script
//
//
// ================================================

// -------------------------------------------------------------------------
//
//		Update listeners - functions which decide when to run fixes
//
// -------------------------------------------------------------------------

//https://www.smashingmagazine.com/2019/04/mutationobserver-api-guide/
/*Observer functions - define what to observe
//Note: document.documentElement is a pointer to the <html> node
//-----------------------------------------------------------------------------
//all possible options
let options = {
  childList: false,						//turn on to check if child nodes of a specific node gets modified
  attributes: true,						//turn on to check if the attributes of a node get altered
  characterData: false,					//turn on to check if the text inside a node changes
  subtree: false,						//turn on to have the observer run on all child nodes in the node
  attributeFilter: ['class', 'data-location'],		//specify attributes to look at, ignore others
  attributeOldValue: false,				//keeps a log of the node's observed attributes' last data
  characterDataOldValue: false			//keeps a log of the node's observed text data's last value
};
//-----------------------------------------------------------------------------
//intercepts and records the mutations before they are processed by observer callback function
let myRecords = htmlObserver.takeRecords(); 
*/

//-----------------------------------------------------------------------------
let htmlobserver = new MutationObserver(observehtml);

function observehtml(mutations) 
{
	for(let mutation of mutations){
		if(mutation.type == 'attributes')
		{
			if(mutation.attributeName == 'data-location'){
				//console.log('the data-location attribute of <html> has been changed!');
				
				setTimeout(allfixes(), 200); 
			}
			else if(mutation.attributeName == 'class'){
				//console.log('the class attribute of <html> has been changed!');
				
				if ($('html').hasClass('notify')){
					console.log("a popup has been opened!");
					trapinsidepopup();
				}
				
			}
		}
	}
}

let options = {attributes: true, attributeFilter: ['class', 'data-location']};
htmlobserver.observe(document.documentElement, options);


//run page fixes once 500 ms after the window was opened
//-----------------------------------------------------------------------------
window.setTimeout(function(){
	allfixes();
}, 1500);

//This function runs anytime anything in the DOM (inside #wrapper) is modified
//DON'T DO IT !
//-----------------------------------------------------------------------------
//$('#wrapper').on('DOMSubtreeModified', function(){});


// -------------------------------------------------------------------------
//
//		Accessibility fixes - grouped by global fixes, fixes for the menu 
//      only and fixes for all other pages of the course
//
// -------------------------------------------------------------------------

function allfixes()
{
	globalfixes();
	($('#adapt').attr('data-location') == 'course') ? menufixes() : pagefixes();
}

function globalfixes(){
	
	// -------------
	// GLOBAL FIXES
	// -------------
	
	//Tab order of buttons in the top navigation bar
	var buttonArray = [];
	$('.navigation-inner button').each(function(i){
		buttonArray.push([i, $(this).position().left]);	
	});
	buttonArray.sort(sortmulti(1, comparator, false));
	for (var j=0; j < buttonArray.length; j++){
		$('.navigation-inner button').eq(buttonArray[j][0]).attr('tabindex', j+1);
	}

	//target blank to external sites (ignore local hrefs)
	//-----------------------------------------------------------------------------

	$('a').filter(function() {
		return this.hostname && this.hostname !== location.hostname;
	}).attr('target', '_blank');
	
	
	//img alt tag and aria-hidden fixes
	//-----------------------------------------------------------------------------	
	
	$('img').each(function(){
		
		//if img doesn't have an alt tag, create an empty one
		if (!(hasAttr($(this), 'alt'))){
			$(this).attr('alt', '');
		}
		
		//if img has an aria-label, copy into alt tag and remove aria-label
		if (hasAttr($(this),'aria-label')){
			$(this).attr('alt', $(this).attr('aria-label'));
			$(this).removeAttr('aria-label');		
		}
		
		// if image has aria-hidden, remove it.
		if ($(this).attr('aria-hidden') == 'true'){
			$(this).removeAttr('aria-hidden');
		}	
	});
	
	//add aria live to component instructions so learner will be alerted if they change	
	//Note that aria-live added by JS typically doesn't function well...
	//aria-live doesn't work with attribute changes
	//https://bitsofco.de/using-aria-live/
	
	//Not working - V 20200226
	console.log($('.component-instruction-inner').html());
	$('.component-instruction-inner').attr('role', 'alert');
	$('.component-instruction-inner').attr('aria-live', 'polite');
	
	// ----------------
	// 
	// ----------------	

}

function menufixes(){
	// ----------------
	// MENU FIXES
	// ----------------

		//Weeee

		
	// ----------------
	// 
	// ----------------	
}

function pagefixes(){

	// ------------------
	// COURSE PAGE FIXES
	// ------------------

	// multiple choice label fix
	//-----------------------------------------------------------------------------
	let multiChoiceComponents = $('.mcq-component');
	multiChoiceComponents.each(function(){
		let label = $(this).attr('data-adapt-id') + 'qlabel';
		$('.mcq-body-inner > p').attr('id', label);
		$('.mcq-widget').attr('aria-labelledby', label);
	});
		
	//Matching questions fix
	//-----------------------------------------------------------------------------
	$('.matching-select-container').each(function(k){
		var glabel = $(this).parents().find('.matching-component').attr('data-adapt-id')+'_qlabel_'+k;
		$(this).find('.dropdown__inner').attr('id', glabel);
		$(this).find('button').attr('aria-labelledby', glabel);
	});
		
	//Accordion component accessibility fixes
	//-----------------------------------------------------------------------------
	$('.accordion-component').each(function(){
		var parentID = $(this).attr('data-adapt-id');
		$('.accordion-item-title').each(function(i){
			var blockid = 'accord-' + i + '-' + parentID;
			$(this).attr('aria-controls', blockid);
			$(this).next().attr('id', blockid);
		});
	});

	//remove tooltips from buttons
	//-----------------------------------------------------------------------------
	$('button').removeAttr('tooltip');
		
		
	// ----------------
	// 
	// ----------------		
}

	// ----------------
	// OTHER FIXES
	// ----------------

function trapinsidepopup(){
	//add trap code here
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
function hasAttr(obj, attr) {
	
	let _attr = (obj.attr) ? obj.attr(attr) : obj.getAttribute(attr);
    return (typeof _attr !== 'undefined' && _attr !== false && _attr !== null);      

}