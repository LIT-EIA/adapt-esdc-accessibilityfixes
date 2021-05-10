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

var displayAriaLevelsOnPage = false;

var lastHeaderLevelBeforeClickedButton = 0;

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
                //console.log('the data-location attribute of an observed object has changed!');

                setTimeout(allfixes(), 200);
                initialPageLoadingFlag = true; //page changed, reset initial loading flag
                displayAriaLevels(true);

            } else if (mutation.attributeName == 'class') {
                //console.log('the class attribute of an observed object has changed!');

                if ($('html').hasClass('notify')) {
                    console.log("a popup has been opened!");

                    $('.hotgrid-popup .hotgrid-popup-controls, .hotgraphic-popup .hotgraphic-popup-controls').click(function() {
                        console.log('the current popup has just changed pages!');
                        //trapinsidepopup();
                    });

                    trapinsidepopup();
                    $('.notify-popup-inner *[aria-level]').attr('aria-level', Number(lastHeaderLevelBeforeClickedButton) + 1);
                    displayAriaLevels(false);
                    allfixes();


                }
            } else if (mutation.attributeName == 'style') {
                //console.log('The inline style of an observed object has changed!');

                //If the loading wheel is gone, run all fixes (page really fully loaded)
                if ($('.loading').css('display') == 'none' && initialPageLoadingFlag) {
                    allfixes();
                    addKeyboardListener();
                    $('.mejs-captions-button button').next().css('visibility', 'hidden');
                    initialPageLoadingFlag = false; //stop running after first run
                    addClasses();
                }
            }
        }
    }
}

function observemedia(mutations) {
    for (let mutation of mutations) {
        if (mutation.attributeName == 'title') {
            //console.log('The title of an observed object has changed!');

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
            //console.log('The aria-label of an observed object has changed!');

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
        if (mutation.attributeName == 'class') {
            //currently never runs
            //console.log('The class of an observed header has changed!');
            checkHeaderLevels();
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

    //console.log('setting header observers on ' + objects.length + 'headers');
    headerobserver.disconnect();
    let headerObserverOptions = { attributes: true, attributeFilter: ['class'] };

    objects.each(function(item) {
        headerobserver.observe(objects[item], headerObserverOptions);
    })
}

//enable observers when doc is ready
docReady(function() {

    allfixes();
});


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

    // notranslate chrome
    $('body').addClass('notranslate');

    // notranslate Edge
    $('body').attr('translate', 'no');
    //
    checkMenuHeaderLevels();

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
        $(this).find('.component-instruction-inner').attr('role', 'alert');
        $(this).find('.component-instruction-inner').attr('aria-live', 'assertive');
    });

    // multiple choice fixes
    //-----------------------------------------------------------------------------
    let multiChoiceComponents = $('.mcq-component');
    multiChoiceComponents.each(function() {

        if ($(this).find('fieldset').length == 0) {
            $(this).find('.mcq-inner').wrap("<fieldset></fieldset>");
            $(this).find('.mcq-body-inner').wrap("<legend></legend>");
        }
    });

    // graphical multichoice fixes
    //-----------------------------------------------------------------------------   
    let gmultiChoiceComponents = $('.gmcq-component');
    gmultiChoiceComponents.each(function() {
        if ($(this).find('fieldset').length == 0) {
            $(this).find('.gmcq-inner').wrap("<fieldset></fieldset>");
            $(this).find('.gmcq-body-inner').wrap("<legend></legend>");
        }
    });

    //Matching questions fix & feedback fix
    //-----------------------------------------------------------------------------
    $('.matching-select-container').each(function(k) {
        let glabel = $(this).parents().find('.matching-component').attr('data-adapt-id') + '_qlabel_' + k;
        $(this).find('.dropdown__inner').attr('id', glabel);
        $(this).find('button').attr('aria-labelledby', glabel);
    });

    $(".matching-component .buttons-cluster.clearfix button").on("click", function() {
        var compid = $(this).parents('.component').attr('data-adapt-id');
        setTimeout(function() {
            if ($('#adapt').attr('lang') == 'fr') {
                $('.notify-popup-body-inner').prepend("<p>Vous avez sélectionné les éléments suivants :</p><ol class='notifanswer'></ol>");
            } else {
                $('.notify-popup-body-inner').prepend("<p>You have selected the following:</p><ol class='notifanswer'></ol>");
            }
            $('.' + compid + ' .dropdown__inner').each(function(i) {
                var matchanswers = $(this).text();
                $('.notifanswer').append('<li>&nbsp;' + matchanswers + '</li>');
            })
        }, 100);
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

    // video skip to transcript fix
    //-----------------------------------------------------------------------------
    var skiptxt = $('.aria-label.js-skip-to-transcript').attr('aria-label');
    $('.aria-label.js-skip-to-transcript').html(skiptxt);
    $('.aria-label.js-skip-to-transcript').removeAttr('aria-label');
    $('.aria-label.js-skip-to-transcript').attr('tabindex', '0');
    $('.media-transcript-container').attr('tabindex', '0');

    $(".aria-label.js-skip-to-transcript").on("click", function() {
        var compid = $(this).parents('.component').attr('data-adapt-id');
        $('.' + compid + ' .media-transcript-button-container:first button').focus();
    });

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

    //narrative controls comprehensive aria labels
    if ($('html').attr('lang') == 'fr') {
        $('.base.narrative-controls.narrative-control-right').attr('aria-label', 'Diapositive suivante');
        $('.base.narrative-controls.narrative-control-left').attr('aria-label', 'Diapositive précédente');
    } else {
        $('.base.narrative-controls.narrative-control-right').attr('aria-label', 'Next slide');
        $('.base.narrative-controls.narrative-control-left').attr('aria-label', 'Previous slide');
    }

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

    //graphical question fix
    //-----------------------------------------------------------------------------

    //Instead, we need an event listener. when input has focus, highlight label.
    //Problem is we can't do it with CSS because the input is after the label

    //$('.gmcq-component label').attr('tabindex', '0');
    //$('.gmcq-component label').keypress(function() {
    //    $(this).click();
    //});



    //Media component fixes
    frenchifyMediaLabels();

    //header levels
    checkHeaderLevels();
    // ----------------
    // 
    // ----------------	

    $('button').click(function() {
        //find the nearest parent object which contains an object with an aria-level, then find the object that has an aria level and get its aria level
        lastHeaderLevelBeforeClickedButton = $(this).closest('div:has(div[aria-level])').find('div[aria-level]').attr('aria-level');
    });
}

// ----------------
// OTHER FIXES
// ----------------

// Code to trap tabbing between a start and end object

var modal;
var focusableElements;
var firstFocusableElement;
var lastFocusableElement;


function trapinsidepopup() {

    // select the modal
    modal = $('.notify-popup');
    // add all the elements inside modal which you want to make focusable
    focusableElements = modal.find('button, input, select, textarea, details, [tabindex], a[href]').not('[tabindex = "-1"], [disabled="disabled"]');

    //select the first and last ones
    firstFocusableElement = focusableElements.first();
    lastFocusableElement = focusableElements.last();

    console.log(focusableElements);
    console.log(firstFocusableElement + " " + lastFocusableElement + " " + focusableElements.length);
    console.log(firstFocusableElement.attributes);
    console.log(lastFocusableElement.attributes);

    modal.children().removeClass('firstfocus');
    modal.children().removeClass('lastfocus');
    firstFocusableElement.addClass('firstfocus');
    lastFocusableElement.addClass('lastfocus');

    console.log('creating event listener!');

    // fix links
    linkfixes();
}

function addKeyboardListener() {

    console.log('initializing keyboard...');
    document.addEventListener('keydown', function(e) {

        console.log('key pressed! ' + e.key);
        //Change this code to only run while a popup is open
        var declared;
        try {
            focusableElements;
            declared = true;
        } catch (e) {
            declared = false;
        }

        if (declared && firstFocusableElement !== typeof undefined && lastFocusableElement !== typeof undefined) {
            let isTabPressed = e.key === 'Tab' || e.keyCode === 9;
            //console.log("key pressed! " + e.key);
            //console.log(focusableElements.length);

            if (isTabPressed) {
                if (e.shiftKey && firstFocusableElement.is(':focus')) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                } else if (lastFocusableElement.is(':focus')) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    });

}

// On Modal close, stop event listener from firing



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

function checkMenuHeaderLevels() {
    //Force level of page header to 1
    $('html .course-heading *[aria-level]').attr('aria-level', 1);

    //Force level of menu item titles to 2
    $('html .menu-item-title-inner *[aria-level]').each(function() {
        $(this).attr('aria-level', 2);
    });

    displayAriaLevels(false);
}

function checkHeaderLevels() {
    //header level warnings

    //pass 1 - Set all header levels as they should be if all headers were used
    var pageElementTypes = ['.page-title', '.article-title', '.block-title', '.component-title'];

    for (var i = 0; i < 5; i++) {
        $(pageElementTypes[i] + ' .js-heading-inner').each(function() {
            $(this).attr('aria-level', i + 1);
            $(this).attr('data-level-type', i + 1);
        });
    }

    //pass 2 - Fix headers if some are missing
    var allAriaLevels = $('html *[aria-level]');
    var lastTypeEncounterKey = [0, 1, 2, 3, 4, 5, 6];

    for (var i = 0; i < (allAriaLevels.length - 2); i++) {

        var currType = Number(allAriaLevels[i].getAttribute('data-level-type'));
        var nextType = Number(allAriaLevels[i + 1].getAttribute('data-level-type'));

        var currLevel = Number(allAriaLevels[i].getAttribute('aria-level'));
        var nextLevel = Number(allAriaLevels[i + 1].getAttribute('aria-level'));

        //console.log('comparing element type ' + pageElementTypes[currType - 1] + ' to element type ' + pageElementTypes[nextType - 1]);
        //console.log('comparing ' + currLevel + ' with ' + nextLevel + ' = ' + (nextLevel - currLevel));

        //the next level is the same type as the current one. Make sure they match
        if (currType == nextType) {
            allAriaLevels[i + 1].setAttribute('aria-level', currLevel);

            //console.log('comparing two of the same item, make sure they match. ' + allAriaLevels[i].getAttribute('aria-level') + ' & ' + allAriaLevels[i + 1].getAttribute('aria-level'));
            lastTypeEncounterKey[nextType] = currLevel;
        }

        //if the current type is higher level than the next one, make sure the next one doesn't skip a level
        else if (currType < nextType) {

            //console.log('comparing an element of higher level with a lower one');
            if (nextLevel - currLevel > 1) {
                allAriaLevels[i + 1].setAttribute('aria-level', currLevel + 1);
                lastTypeEncounterKey[nextType] = currLevel + 1;
                //console.log('the next level had higher difference than 2! Changed to ' + allAriaLevels[i + 1].getAttribute('aria-level'));
            }
        }
        //if the current level was lower than the next one, set the next one to its desired level 
        //(the same level as the last time the same type of element was encountered)
        else if (currType > nextType) {
            //console.log('comparing an element of lower level with a higher.');
            //console.log('setting to same as last time ' + pageElementTypes[nextType - 1] + ' was encountered ' + lastTypeEncounterKey[nextType]);
            allAriaLevels[i + 1].setAttribute('aria-level', lastTypeEncounterKey[nextType]);
        }

        console.log('--------------------------------------------');
    }

    //pass 3 - setup change event listeners to keep headers at set levels
    setHeaderObservers($('.js-heading'));

    displayAriaLevels(false);
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

function displayAriaLevels() {

    if (displayAriaLevelsOnPage) {
        $('html *[aria-level]').each(function() {
            var checkPar = $(this).find('.medariadebug');
            if (checkPar.length == 0) {
                $(this).append('<p class="medariadebug" style="color:red">aria-level:' + $(this).attr('aria-level') + '</p>');
            } else {
                checkPar.html('aria-level:' + $(this).attr('aria-level'));
            }
        });
    }
}

function addClasses() {
    //$('body').append('<style>' +

    //    '.firstfocus{outline: 2px solid orange;}' +
    //    '.lastfocus{outline: 2px solid green;}' +

    //    '</style>');
}