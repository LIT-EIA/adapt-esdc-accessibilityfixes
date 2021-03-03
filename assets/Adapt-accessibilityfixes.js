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
				console.log('the data-location attribute of an observed object has changed!');
				
				setTimeout(allfixes(), 200);
			}
			else if(mutation.attributeName == 'class'){
				console.log('the class attribute of an observed object has changed!');
				
				if ($('html').hasClass('notify')){
					console.log("a popup has been opened!");
					trapinsidepopup();
				}				
			}
			else if(mutation.attributeName == 'style')
			{
				console.log('The inline style of an observed object has changed!')

				//If the loading wheel is gone, run all fixes (page really fully loaded)
				if( $('.loading').css('display') == 'none' )
				{
					setTimeout(allfixes());
				}
			}
		}
	}
}

//Set observers to run all fixes or specific fixes after different events.
function setObservers()
{
	htmlobserver.disconnect()
	let options = {attributes: true, attributeFilter: ['class', 'data-location', 'style']};
	let loadingSpinner = document.getElementsByClassName('loading')[0];
	htmlobserver.observe(document.documentElement, options);
	htmlobserver.observe(loadingSpinner, options);
}

//enable observers when doc is ready
docReady(function(){
	setObservers();
});

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
	console.log('running all fixes');
	//re-initialize observer
	setObservers();

	//Run Global fixes
	globalfixes();

	//if menu page, run menufixes, else run page fixes
	($('#adapt').attr('data-location') == 'course') ? menufixes() : pagefixes();
}

function globalfixes(){
	
	console.log('  running global fixes');
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


	// ----------------
	// 
	// ----------------	

}

function menufixes(){

	console.log('  running menu fixes');
	// ----------------
	// MENU FIXES
	// ----------------

		//Weeee

		
	// ----------------
	// 
	// ----------------	
}

function pagefixes(){

	console.log('  running page fixes');
	// ------------------
	// COURSE PAGE FIXES
	// ------------------

	//Global component fixes
	//-----------------------------------------------------------------------------
	
	//add aria live to component instructions so learner will be alerted if they change	
	let allComponents = $(".component");

	allComponents.each(function(){
		$('.component-instruction-inner').attr('role', 'alert');
		$('.component-instruction-inner').attr('aria-live', 'assertive');
	});

	// multiple choice fixes
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
		let glabel = $(this).parents().find('.matching-component').attr('data-adapt-id')+'_qlabel_'+k;
		$(this).find('.dropdown__inner').attr('id', glabel);
		$(this).find('button').attr('aria-labelledby', glabel);
	});
		
	//Accordion component accessibility fixes
	//-----------------------------------------------------------------------------
	$('.accordion-component').each(function(){
		let parentID = $(this).attr('data-adapt-id');
		$('.accordion-item-title').each(function(i){
			let blockid = 'accord-' + i + '-' + parentID;
			$(this).attr('aria-controls', blockid);
			$(this).next().attr('id', blockid);
		});
	});

	//remove tooltips from buttons
	//-----------------------------------------------------------------------------
	$('.quicknav-widget').find('button').hover(function() {
		$(this).removeAttr('tooltip');
	});
	
	
	//Hotgraphic pin title checker
	let hotgraphicPins = $('.hotgraphic-graphic-pin');
	hotgraphicPins.each(function(){

		if($(this).find('.aria-label').html() == "."){
			$(this).prepend('<p style="color:red; font-weight:bold;">VEUILLEZ AJOUTER UN TITRE / PLEASE ADD A PIN TITLE</p>')
		}
	});

	//Media component label fixes (INCOMPLETE)
	if($('html').attr('lang') == 'en')
	{
		$('.media-component').each(function(){
			// BORKEN WHEN VIDEO IS PAUSED / RE-PLAYED
			$(this).find('.mejs-playpause-button button').attr('title', 'Jouer'); //Play button title
			$(this).find('.mejs-playpause-button button').attr('aria-label', 'Jouer'); //Play button aria label

			// Reverts back to Time Slider when it plays?
			$(this).find('.mejs-time-slider').attr('aria-label','Curseur de temps'); //Time slider aria-label
			
			//Seems ok!
			$(this).find('.mejs-fullscreen-button button').attr('title', 'Plein écran'); //Full screen button title
			$(this).find('.mejs-fullscreen-button button').attr('aria-label', 'Plein écran'); //Full screen button aria-label


			// BORKEN WHEN VIDEO IS MUTED / UNMUTED
			$(this).find('.mejs-volume-button button').attr('title', 'Sourdine'); //Mute button title
			
			// BORKEN WHEN VIDEO IS MUTED / UNMUTED
			$(this).find('.mejs-volume-button button').attr('aria-label', 'Sourdine'); //Mute button aria-label
			
			//Bork bork this one works
			$(this).find('.mejs-volume-button .mejs-offscreen').html('Utilisez les touches fléchées haut / bas pour augmenter ou diminuer le volume.'); //volume slider
		});
	}
	



	// ----------------
	// 
	// ----------------		
}

	// ----------------
	// OTHER FIXES
	// ----------------

// Code to trap tabbing between a start and end object
function trapinsidepopup(){

	let tabbable = $('.notify-popup-inner').find('select, input, textarea, button, a').filter(':visible');
    let firstTabbable = tabbable.first();
    let lastTabbable = tabbable.last();
    /*set focus on first input*/
    firstTabbable.focus();


    /*redirect last tab to first input*/
    lastTabbable.on('keydown', function (e) {
       if ((e.which === 9 && !e.shiftKey)) {
           e.preventDefault();
           firstTabbable.focus();
       }
    });

    /*redirect first shift+tab to last input*/
    firstTabbable.on('keydown', function (e) {
        if ((e.which === 9 && e.shiftKey)) {
            e.preventDefault();
            lastTabbable.focus();
        }
    });
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

//Pure Javascript document ready function
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}