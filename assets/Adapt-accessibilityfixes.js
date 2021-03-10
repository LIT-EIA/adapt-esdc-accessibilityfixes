// ================================================
//
//
//		Adapt ESDC Accessibility fixes script
//
//
// ================================================

// -------------------------------------------------------------------------
//
//		Important Variables - variables which we want quick access 
//		to without people having to understand the rest of the code
//
// -------------------------------------------------------------------------

//Labels dictionary object
var theLabels = new Object();
theLabels = {
	'Play' : 'Jouer',
	'Pause' : 'Pause',
	'Time Slider' : 'Curseur de temps',
	'Fullscreen' : 'Plein écran',
	'Volume Slider' : 'Curseur de volume',
	'Mute' : 'Sourdine',
	'Unmute' : 'Activer le son',
	'volinstr-en' : 'Use Up/Down Arrow keys to increase or decrease volume',
	'volinstr-fr' : 'Utilisez les touches fléchées haut / bas pour augmenter ou diminuer le volume'
};

// -------------------------------------------------------------------------
//
//		Update listeners - functions which decide when to run fixes
//
// -------------------------------------------------------------------------

//*** Need stricter rules, code is running every time page scrolls? */

let htmlobserver = new MutationObserver(observehtml);
let mediaobserver = new MutationObserver(observemedia);
var initialPageLoadingFlag = true;

function observehtml(mutations) 
{
	for(let mutation of mutations){
		if(mutation.type == 'attributes')
		{
			if(mutation.attributeName == 'data-location'){
				console.log('the data-location attribute of an observed object has changed!');
				
				setTimeout(allfixes(), 200);
				initialPageLoadingFlag  = true; //page changed, reset initial loading flag
			}
			else if(mutation.attributeName == 'class'){
				console.log('the class attribute of an observed object has changed!');
				
				if ($('html').hasClass('notify')){
					console.log("a popup has been opened!");
					trapinsidepopup();
				}				
			}
			else if(mutation.attributeName == 'style'){
				console.log('The inline style of an observed object has changed!')

				//If the loading wheel is gone, run all fixes (page really fully loaded)
				if( $('.loading').css('display') == 'none' && initialPageLoadingFlag)
				{
					allfixes();
					initialPageLoadingFlag = false; //stop running after first run
				}
			}
		}
	}
}

function observemedia(mutations) 
{
	for(let mutation of mutations){
		if(mutation.attributeName == 'title'){
			console.log('The aria-label or title of an observed object has changed!')
			
			if($('html').attr('lang') == 'en'){ 
				//Change to FR in final *************************************
				mediaobserver.disconnect();
				frenchifyMediaLabels();
				setmMediaObservers();
			}
		}
	}
}


//Set observers to run all fixes or specific fixes after different events.
function setObservers()
{
	htmlobserver.disconnect();

	let observerOptions = {attributes: true, attributeFilter: ['class', 'data-location', 'style']};
	let object_htmlTag = document.documentElement;
	let object_Spinner = $('.loading')[0];
	htmlobserver.observe(object_htmlTag, observerOptions);
	htmlobserver.observe(object_Spinner, observerOptions);
}

function setmMediaObservers()
{
	mediaobserver.disconnect();

	let mediaObserverOptions = {attributes: true, attributeFilter: ['title']};
	let object_MediaComponentPlay = $('.mejs-playpause-button button');
	let object_MediaComponentMute = $('.mejs-volume-button button');
	
	object_MediaComponentPlay.each(function(item){
		mediaobserver.observe(object_MediaComponentPlay[item], mediaObserverOptions); 
	});
	object_MediaComponentMute.each(function(item){
		mediaobserver.observe(object_MediaComponentMute[item], mediaObserverOptions); 
	});
}

//enable observers when doc is ready
docReady(function(){
	frenchifyMediaLabels();
	setObservers();
	setmMediaObservers();
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
	setmMediaObservers();

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

	//fix links
	linkfixes();
	
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
	// Expose fixes
	$('.expose-component').each(function(){
		//remove empty button
		$(this).find('.expose-item-button').remove();
		//assign clickable div proper role
		$(this).find('.expose-item-cover').attr('role', 'button');
		// make tabbable
		$(this).find('.expose-item-cover').attr('tabindex', '0');
		//aria states between for proper toggle indication to assistive technology
		$(this).find('.expose-item-cover').attr('aria-pressed', 'false');
		//need to add aria-pressed true when pressed or not possibly via click/toggle function
		//note that fade is added to this element which could be used to detect div state
	})

	//remove tooltips from buttons
	//-----------------------------------------------------------------------------
	$('.quicknav-widget').find('button').hover(function() {
		$(this).removeAttr('tooltip');
	});
	// remove disabled button in quicknavigation from dom
	$('.quicknav button.disabled').remove();
	
	
	//Hotgraphic pin title checker
	let hotgraphicPins = $('.hotgraphic-graphic-pin');
	hotgraphicPins.each(function(){

		if($(this).find('.aria-label').html() == "."){
			$(this).prepend('<p style="color:red; font-weight:bold;">VEUILLEZ AJOUTER UN TITRE / PLEASE ADD A PIN TITLE</p>')
		}
	});

	// ----------------
	// 
	// ----------------		
}

	// ----------------
	// OTHER FIXES
	// ----------------

// Code to trap tabbing between a start and end object
function trapinsidepopup(){
	// first we clear up disabled element present in the dom notification
	$('.notify-popup-inner').find("button[disabled='disabled']").remove();
	//hotgraphic specific fix
	$('.hotgraphic-popup-toolbar.component-item-color.clearfix').insertBefore($('.hotgraphic-popup-inner.clearfix'));
	$('.notify.hotgraphic .a11y-focusguard.a11y-ignore.a11y-ignore-focus').remove();


	//establish tab elements and list it for a navigation loop (locked)
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

	// fix links
	linkfixes();
}

function linkfixes(){

	//target blank to external sites (ignore local hrefs)
	//-----------------------------------------------------------------------------

	$('a').filter(function() {
		return this.hostname && this.hostname !== location.hostname;
	}).attr('target', '_blank');
}

function frenchifyMediaLabels()
{
	//Media component label fixes
	$('.media-component').each(function(){
		let playpauseButton = $(this).find('.mejs-playpause-button button');
		let timeSlider = $(this).find('.mejs-time-slider');
		let fullscreenButton = $(this).find('.mejs-fullscreen-button button');
		let volumeButton = $(this).find('.mejs-volume-button button');
		let volumeSlider = $(this).find('.mejs-volume-slider');
		let volumeInstructions = $(this).find('.mejs-volume-button .mejs-offscreen');

		//Verified!
		playpauseButton.attr('title', theLabels[playpauseButton.attr('title')]);
		playpauseButton.attr('aria-label', theLabels[playpauseButton.attr('aria-label')]);

		//ToFix:
		//Changing itself back to Time Slider while playing *******************
		timeSlider.attr('aria-label',theLabels['Time Slider']); 

		//Verified!
		fullscreenButton.attr('title', theLabels['Fullscreen']); 
		fullscreenButton.attr('aria-label', theLabels['Fullscreen']);

		//Verified!
		volumeButton.attr('title', theLabels[volumeButton.attr('title')]);
		volumeButton.attr('aria-label', theLabels[volumeButton.attr('title')]);

		//Verified!
		volumeSlider.attr('aria-label', theLabels['Volume Slider']);

		//Verified!
		volumeInstructions.html(theLabels['volinstr-fr']);
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