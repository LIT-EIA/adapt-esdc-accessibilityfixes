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
    'Play': 'Jouer',
    'Pause': 'Pause',
    'Time Slider': 'Curseur de temps',
    'Fullscreen': 'Plein écran',
    'Volume Slider': 'Curseur de volume',
    'Mute': 'Sourdine',
    'Unmute': 'Activer le son',
    'volinstr-en': 'Use Up/Down Arrow keys to increase or decrease volume',
    'volinstr-fr': 'Utilisez les touches fléchées haut / bas pour augmenter ou diminuer le volume',
    'French': 'Français',
    'English': 'Anglais',
    'None': 'Aucun',
    'Captions/Subtitles': 'Sous-titres codés'
};

var displayAriaLevelsOnPage = true;



// -------------------------------------------------------------------------
//
//		Update listeners - functions which decide when to run fixes
//
// -------------------------------------------------------------------------

//*** Need stricter rules, code is running every time page scrolls? */

let htmlobserver = new MutationObserver(observehtml);
let mediaobserver = new MutationObserver(observemedia);
let timeobserver = new MutationObserver(observetimeslider);
let headerobserver = new MutationObserver(observeheaders);
var initialPageLoadingFlag = true;

function observehtml(mutations) {
    for (let mutation of mutations) {
        if (mutation.type == 'attributes') {
            if (mutation.attributeName == 'data-location') {
                console.log('the data-location attribute of an observed object has changed!');

                setTimeout(allfixes(), 200);
                initialPageLoadingFlag = true; //page changed, reset initial loading flag
                firstRun = true; // reset flag to display aria-levels (), used in displayAriaLevels() function

            } else if (mutation.attributeName == 'class') {
                console.log('the class attribute of an observed object has changed!');

                if ($('html').hasClass('notify')) {
                    console.log("a popup has been opened!");
                    trapinsidepopup();
                    allfixes();
                }
            } else if (mutation.attributeName == 'style') {
                console.log('The inline style of an observed object has changed!');

                //If the loading wheel is gone, run all fixes (page really fully loaded)
                if ($('.loading').css('display') == 'none' && initialPageLoadingFlag) {
                    allfixes();
                    //header level fixes
                    checkHeaderLevels();
                    initialPageLoadingFlag = false; //stop running after first run
                }
            }
        }
    }
}

function observemedia(mutations) {
    for (let mutation of mutations) {
        if (mutation.attributeName == 'title') {
            console.log('The title of an observed object has changed!');

            if ($('html').attr('lang') == 'fr') {
                //Change to FR in final *************************************
                mediaobserver.disconnect();
                frenchifyMediaLabels();
                setMediaObservers();
            }
        }
    }
}

function observetimeslider(mutations) {
    for (let mutation of mutations) {
        if (mutation.attributeName == 'aria-label') {
            console.log('The aria-label of an observed object has changed!');

            if ($('html').attr('lang') == 'fr') {
                timeobserver.disconnect();
                forceTimeSliderLabel();
                setTimeObserver();
            }
        }
    }
}

function observeheaders(mutations) {
    for (let mutation of mutations) {
        if (mutation.attributeName == 'aria-label') {

            //currently never runs
            console.log('The aria-label of an observed header has changed!');
            displayAriaLevels(false);
        }
    }
}

//Set observers to run all fixes or specific fixes after different events.
function setObservers() {
    htmlobserver.disconnect();

    let observerOptions = { attributes: true, attributeFilter: ['class', 'data-location', 'style'] };
    let object_htmlTag = document.documentElement;
    let object_Spinner = $('.loading')[0];
    htmlobserver.observe(object_htmlTag, observerOptions);
    htmlobserver.observe(object_Spinner, observerOptions);
}

function setMediaObservers() {
    mediaobserver.disconnect();

    let mediaObserverOptions = { attributes: true, attributeFilter: ['title'] };
    let object_MediaComponentPlay = $('.mejs-playpause-button button');
    let object_MediaComponentMute = $('.mejs-volume-button button');

    object_MediaComponentPlay.each(function(item) {
        mediaobserver.observe(object_MediaComponentPlay[item], mediaObserverOptions);
    });
    object_MediaComponentMute.each(function(item) {
        mediaobserver.observe(object_MediaComponentMute[item], mediaObserverOptions);
    });
}

function setTimeObserver() {
    timeobserver.disconnect();
    let timeObserverOptions = { attributes: true, attributeFilter: ['aria-label'] };
    let object_timeSlider = $('.mejs-time-slider');

    object_timeSlider.each(function(item) {
        timeobserver.observe(object_timeSlider[item], timeObserverOptions);
    });
}

function setHeaderObservers(objects) {

    console.log('setting header observers on ' + objects.length + 'headers');
    headerobserver.disconnect();
    let headerObserverOptions = { attributes: true, attributeFilter: ['aria-label'] };

    objects.each(function(item) {
        headerobserver.observe(objects[item], headerObserverOptions);
    })
}

//enable observers when doc is ready
docReady(function() {

    allfixes();
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

function allfixes() {
    console.log('running all fixes');
    //re-initialize observer
    setObservers();
    setMediaObservers();
    setTimeObserver();

    //Run Global fixes
    globalfixes();

    //if menu page, run menufixes, else run page fixes
    ($('#adapt').attr('data-location') == 'course') ? menufixes(): pagefixes();
}

function globalfixes() {

    console.log('  running global fixes');
    // -------------
    // GLOBAL FIXES
    // -------------

    //Tab order of buttons in the top navigation bar
    var buttonArray = [];
    $('.navigation-inner button').each(function(i) {
        buttonArray.push([i, $(this).position().left]);
    });
    buttonArray.sort(sortmulti(1, comparator, false));
    for (var j = 0; j < buttonArray.length; j++) {
        $('.navigation-inner button').eq(buttonArray[j][0]).attr('tabindex', j + 1);
    }

    //anchor tag fixes (links)
    //-----------------------------------------------------------------------------	
    linkfixes();

    //img alt tag and aria-hidden fixes
    //-----------------------------------------------------------------------------	
    altFixes();

    // ----------------
    // 
    // ----------------	
}

function menufixes() {

    console.log('  running menu fixes');
    // ----------------
    // MENU FIXES
    // ----------------

    //Weeee
    $('.menu-item').each(function() {
        //$(this).find('.menu-item-button button').attr('aria-label', $(this).find('.menu-item-title-inner').html());
        //Need to add "view" or "visioner" depending on language
        //Need to consider situation when the button is greyed / visited       
    })

    // ----------------
    // 
    // ----------------	
}

function pagefixes() {

    console.log('  running page fixes');
    // ------------------
    // COURSE PAGE FIXES
    // ------------------

    //Global component fixes
    //-----------------------------------------------------------------------------

    //add aria live to question component instructions so learner will be alerted if they change	
    let allQuestionComponents = $(".question-component");

    allQuestionComponents.each(function() {
        $('.component-instruction-inner').attr('role', 'alert');
        $('.component-instruction-inner').attr('aria-live', 'assertive');
    });

    // multiple choice fixes
    //-----------------------------------------------------------------------------
    let multiChoiceComponents = $('.mcq-component');
    multiChoiceComponents.each(function() {
        //let label = $(this).attr('data-adapt-id') + 'qlabel';
        //$('.mcq-body-inner').attr('id', label);
        //$('.mcq-widget').attr('aria-labelledby', label);

        //Changed the fix to add a fieldset and legend to MCQ. 

        $(this).find('.mcq-inner').wrap("<fieldset></fieldset>");
        $(this).find('.mcq-body-inner').wrap("<legend></legend>");
    });

    // graphical multichoice fixes
    //-----------------------------------------------------------------------------   
    let gmultiChoiceComponents = $('.gmcq-component');
    gmultiChoiceComponents.each(function() {
        $(this).find('.gmcq-inner').wrap("<fieldset></fieldset>");
        $(this).find('.gmcq-body-inner').wrap("<legend></legend>");
    });


    //Matching questions fix
    //-----------------------------------------------------------------------------
    $('.matching-select-container').each(function(k) {
        let glabel = $(this).parents().find('.matching-component').attr('data-adapt-id') + '_qlabel_' + k;
        $(this).find('.dropdown__inner').attr('id', glabel);
        $(this).find('button').attr('aria-labelledby', glabel);
    });


    //Open Textinput fix
    //-----------------------------------------------------------------------------
    $('.openTextInput-inner').each(function(k) {
        let olabel = $(this).parents().find('.openTextInput-component').attr('data-adapt-id') + '_qlabel_' + k;
        $(this).find('.openTextInput-count-characters-container').attr('aria-live', 'polite');
        $(this).find('.openTextInput-instruction-inner').attr('id', olabel);
        $(this).find('.openTextInput-answer-container textarea').attr('aria-labelledby', olabel);
    });

    //Accordion component accessibility fixes
    //-----------------------------------------------------------------------------
    $('.accordion-component').each(function() {
        let parentID = $(this).attr('data-adapt-id');
        $('.accordion-item-title').each(function(i) {
            let blockid = 'accord-' + i + '-' + parentID;
            $(this).attr('aria-controls', blockid);
            $(this).next().attr('id', blockid);
        });
    });

    // video skip to transcript removal
    //-----------------------------------------------------------------------------
    $('.aria-label.js-skip-to-transcript').remove();

    // Expose basic fixes
    //-----------------------------------------------------------------------------
    $('.expose-component').each(function() {
        //remove empty button
        $(this).find('.expose-item-button').remove();
        //assign clickable div proper role
        $(this).find('.expose-item-cover').attr('role', 'button');
        // make tabbable
        $(this).find('.expose-item-cover').attr('tabindex', '0');
        //aria states between for proper toggle indication to assistive technology
        $(this).find('.expose-item-cover').attr('aria-pressed', 'false');
    })

    // Auto focus instructions on empty selection submit
    //-----------------------------------------------------------------------------
    $('.buttons-action').on("click", function() {
        if ($(this).next().attr('disabled') == 'disabled') {
            var componentid = $(this).parents('.component').attr('data-adapt-id');
            var instrfocus = $('.component[data-adapt-id="' + componentid + '"] .component-instruction-inner');
            console.log(instrfocus);

            //Only trigger if instructions exist and not empty
            if (instrfocus.length > 0 && !(instrfocus.html() == "")) {
                $([document.documentElement, document.body]).animate({
                    scrollTop: instrfocus.offset().top - (window.innerHeight / 2)
                }, 200);
            }
        }
    });

    // captions UI fixes when pressing space bar and click to show/hide elements
    $(".mejs-captions-button button").on('keypress', function(e) {
        if (e.which == 13) {
            var getcapcss = $(this).next().css('visibility');
            if (getcapcss == 'visible') {
                $(this).next().css('visibility', 'hidden');
            } else {
                $(this).next().css('visibility', 'visible');
            }
        }
    });

    $(".mejs-captions-button button").click(function() {
        var getcapcss = $(this).next().css('visibility');
        if (getcapcss == 'visible') {
            $(this).next().css('visibility', 'hidden');
        } else {
            $(this).next().css('visibility', 'visible');
        }
    });

    //expose button div needs to react to enter press and change aria status
    $('.expose-item-cover').keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $(this).click();
            return false;
        }
    });

    // aria-pressed toggle for expose
    $('.expose-item-cover').on('click', function() {
        if ($(".expose-item-cover").hasClass("fade")) {
            $(".expose-item-cover").attr('aria-pressed', 'false');
        } else {
            $(".expose-item-cover").attr('aria-pressed', 'true');
        }
    });

    //remove tooltips from buttons
    //-----------------------------------------------------------------------------
    $('.quicknav-widget').find('button').hover(function() {
        $(this).removeAttr('tooltip');
    });
    // remove disabled button in quicknavigation from dom
    // *** Was also removing buttons when using a different lock mechanism, disabled for now
    //$('.quicknav button.disabled').remove();

    //add aria-live to narrative 
    //-----------------------------------------------------------------------------
    $('.narrative-content').attr('aria-live', 'polite');


    //Hotgraphic pin title checker
    //-----------------------------------------------------------------------------
    let hotgraphicPins = $('.hotgraphic-graphic-pin');
    hotgraphicPins.each(function() {

        if ($(this).find('.aria-label').html() == ".") {
            $(this).prepend('<p style="color:red; font-weight:bold;">VEUILLEZ AJOUTER UN TITRE / PLEASE ADD A PIN TITLE</p>')
        }
    });

    //Slider fixes
    //-----------------------------------------------------------------------------

    theSlider = $('.slider-component');
    theSlider.each(function(i) {
        var newid = $(this).attr('data-adapt-id') + "slabel" + i
        $(this).find('.slider-instruction-inner').attr('id', newid);
        $(this).find('.slider-item input').attr('aria-labelledby', newid);
    });

    //Media component fixes
    frenchifyMediaLabels();

    // ----------------
    // 
    // ----------------		
}

// ----------------
// OTHER FIXES
// ----------------

// Code to trap tabbing between a start and end object
function trapinsidepopup() {
    // first we clear up disabled element present in the dom notification
    //Disabled, was causing issue #60 https://github.com/MeD-DMC/Adapt-accessibilityfixes/issues/60
    //$('.notify-popup-inner').find("button[disabled='disabled']").remove();

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
    lastTabbable.on('keydown', function(e) {
        if ((e.which === 9 && !e.shiftKey)) {
            e.preventDefault();
            firstTabbable.focus();
        }
    });

    /*redirect first shift+tab to last input*/
    firstTabbable.on('keydown', function(e) {
        if ((e.which === 9 && e.shiftKey)) {
            e.preventDefault();
            lastTabbable.focus();
        }
    });

    // fix links
    linkfixes();
}

function linkfixes() {
    //add target = _blank to all external links
    $('a').filter(function() {
        return this.hostname && this.hostname !== location.hostname;
    }).attr('target', '_blank');
}

function altFixes() {
    $('img').each(function() {

        //if img doesn't have an alt tag, create an empty one
        if (!(hasAttr($(this), 'alt'))) {
            $(this).attr('alt', '');
        }

        //if img has an aria-label, copy into alt tag and remove aria-label
        if (hasAttr($(this), 'aria-label')) {
            $(this).attr('alt', $(this).attr('aria-label'));
            $(this).removeAttr('aria-label');
        }

        // if image has aria-hidden, remove it.
        if ($(this).attr('aria-hidden') == 'true') {
            $(this).removeAttr('aria-hidden');
        }
    });

    //for any div with role="img", if the aria-label is empty, set it to aria-hidden
    $('div[role="img"]').each(function() {
        if ($(this).attr('aria-label') == "") {
            $(this).attr('aria-hidden', true);
        }
    });
}

function checkHeaderLevels() {
    //header level warnings

    console.log('Checking headers!');
    var prevLevel = 0;
    var foundTheH1 = false;

    //pass 1 - Set all header levels to 5, 
    //this sets any headers inside components to 5 regardless of their classes
    $('html *[aria-level]').each(function() {
        $(this).attr('aria-level', '5');
        $(this).attr('data-level-type', '5');
        $(this).attr('data-set-level', '0');
    });

    //pass 2 - Set all header levels as they should be if all headers were used
    var pageElementTypes = ['.page-title', '.article-title', '.block-title', '.component-title'];

    for (var i = 0; i < 5; i++) {
        $(pageElementTypes[i] + ' .js-heading-inner').each(function() {
            $(this).attr('aria-level', i + 1);
            $(this).attr('data-level-type', i + 1);
        });
    }

    //pass 3 - Fix headers if some are missing
    var allAriaLevels = $('html *[aria-level]');
    var lastTypeEncounterKey = [0, 1, 2, 3, 4, 5, 6];

    for (var i = 0; i < (allAriaLevels.length - 2); i++) {

        var currType = Number(allAriaLevels[i].getAttribute('data-level-type'));
        var nextType = Number(allAriaLevels[i + 1].getAttribute('data-level-type'));

        var currLevel = Number(allAriaLevels[i].getAttribute('aria-level'));
        var nextLevel = Number(allAriaLevels[i + 1].getAttribute('aria-level'));

        console.log('comparing element type ' + pageElementTypes[currType - 1] + ' to element type ' + pageElementTypes[nextType - 1]);
        console.log('comparing ' + currLevel + ' with ' + nextLevel + ' = ' + (nextLevel - currLevel));

        //the next level is the same type as the current one. Make sure they match
        if (currType == nextType) {
            allAriaLevels[i + 1].setAttribute('aria-level', currLevel);
            allAriaLevels[i + 1].setAttribute('data-set-level', currLevel);

            console.log('comparing two of the same item, make sure they match. ' + allAriaLevels[i].getAttribute('aria-level') + ' & ' + allAriaLevels[i + 1].getAttribute('aria-level'));
            lastTypeEncounterKey[nextType] = currLevel;
        }

        //if the current type is higher level than the next one, make sure the next one doesn't skip a level
        else if (currType < nextType) {

            console.log('comparing an element of higher level with a lower one');
            if (nextLevel - currLevel > 1) {
                allAriaLevels[i + 1].setAttribute('aria-level', currLevel + 1);
                allAriaLevels[i + 1].setAttribute('data-set-level', currLevel + 1);
                lastTypeEncounterKey[nextType] = currLevel + 1;
                console.log('the next level had higher difference than 2! Changed to ' + allAriaLevels[i + 1].getAttribute('aria-level'));
            }
        }
        //if the current level was lower than the next one, set the next one to its desired level 
        //(the same level as the last time the same type of element was encountered)
        else if (currType > nextType) {
            console.log('comparing an element of lower level with a higher.');
            console.log('setting to same as last time ' + pageElementTypes[nextType - 1] + ' was encountered ' + lastTypeEncounterKey[nextType]);
            allAriaLevels[i + 1].setAttribute('aria-level', lastTypeEncounterKey[nextType]);
            allAriaLevels[i + 1].setAttribute('data-set-level', lastTypeEncounterKey[nextType]);
        }

        console.log('--------------------------------------------');
    }


    //WARNING - WHEN VISITED, IT RESETS ARIA-LEVELS TO THE VALUE IN THE JSON
    //pass 4 - setup change event listeners to keep headers at set levels
    setHeaderObservers(allAriaLevels);
    //Observers set but never trigger? to fix


    //pass 5 - fix modal header levels

    //comment out if not needed, for QA purposes
    displayAriaLevels(true);
}

function frenchifyMediaLabels() {
    //Media component label fixes
    $('.media-component').each(function() {
        let playpauseButton = $(this).find('.mejs-playpause-button button');
        let fullscreenButton = $(this).find('.mejs-fullscreen-button button');
        let volumeButton = $(this).find('.mejs-volume-button button');
        let volumeSlider = $(this).find('.mejs-volume-slider');
        let volumeInstructions = $(this).find('.mejs-volume-button .mejs-offscreen');
        let ccOptions = $(this).find('.mejs-captions-selector label');
        let ccButton = $(this).find('.mejs-captions-button button');

        playpauseButton.attr('title', theLabels[playpauseButton.attr('title')]);
        playpauseButton.attr('aria-label', theLabels[playpauseButton.attr('aria-label')]);

        fullscreenButton.attr('title', theLabels['Fullscreen']);
        fullscreenButton.attr('aria-label', theLabels['Fullscreen']);

        volumeButton.attr('title', theLabels[volumeButton.attr('title')]);
        volumeButton.attr('aria-label', theLabels[volumeButton.attr('title')]);

        volumeSlider.attr('aria-label', theLabels['Volume Slider']);
        volumeInstructions.html(theLabels['volinstr-fr']);

        ccOptions.each(function() {
            $(this).html(theLabels[$(this).html()]);
        });

        ccButton.attr('title', theLabels['Captions/Subtitles']);
        ccButton.attr('aria-label', theLabels['Captions/Subtitles']);


    });
}

function forceTimeSliderLabel() {
    //For media player time slider only
    $('.media-component').each(function() {
        let timeSlider = $(this).find('.mejs-time-slider');
        if (timeSlider.attr('aria-label') == 'Time Slider') {
            timeSlider.attr('aria-label', theLabels['Time Slider']);
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

//Check if object has a given attribute
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

//Show aria levels above headers (for QA purposes)

function displayAriaLevels(firstrun) {
    console.log("WEEEEEEEEEEEE" + firstRun);

    if (displayAriaLevelsOnPage) {
        if (firstRun) {
            firstRun = false;
            $('html *[aria-level]').each(function() {
                console.log('Aria-level:' + $(this).attr('aria-level'));
                $(this).append('<p class="medariadebug" style="color:red">aria-level:' + $(this).attr('aria-level') + '</p>');
            });
        } else {
            $('html *[aria-level]').each(function() {
                //$(this).find('.medariadebug').html('Aria-level:' + $(this).attr('aria-level'));
            });
        }
    }
}