// ================================================
//		Adapt ESDC Accessibility fixes script
// ================================================

// -------------------------------------------------------------------------
//
//		Important Variables - variables which we want quick access 
//		to without people having to understand the rest of the code
//
// -------------------------------------------------------------------------

//topnav button order
var topNavButtons = [
    ".skip-nav-link",
    ".navigation-back-button",
    ".navigation-home-button",
    ".languagepicker-icon",
    ".pagelevelprogress-navigation",
    ".navigation-drawer-toggle-button",
    ".navigation-close-button"
];
//Specify which item in the array above should start aligning to the right.
var navSplitValue = 3;

//Utility variables
var popupIsOpened = false;
var displayAriaLevelsOnPage = false;
var showFocusableItemsInPopups = false;
var lastHeaderLevelBeforeClickedButton = 0;

// -------------------------------------------------------------------------
//
//		TABLE OF CONTENTS
//
// -------------------------------------------------------------------------

// [!!] - Startup functions
//      [!!01] STARTUP - Event and Mutation listeners
//      [!!02] STARTUP - Accessibility fix runners
//
// [**] - Global fixes
//      [**01] GLOBAL FIXES - Stop auto translate
//      [**02] GLOBAL FIXES - <a> anchor tag link fixes
//      [**03] GLOBAL FIXES - Alt tags for <img> and tags with role="img"
//      [**04] GLOBAL FIXES - Navigation bar tab order
//      [**05] GLOBAL FIXES - Popups
//      [**06] GLOBAL FIXES - Temporary fixes
//      [**07] GLOBAL FIXES - <a> auto apply target="_blank" for mailto
//
// [^^] - Menu fixes
//      [^^01] MENU FIXES - Check menu header levels    
//      
// [$$] - page fixes
//		[$$01] PAGE FIXES - for all question components
//		[$$02] PAGE FIXES - Component - adapt-contrib-mcq - 3.0.0
//		[$$03] PAGE FIXES - Component - adapt-contrib-gmcq - 4.0.0
//		[$$04] PAGE FIXES - Component - adapt-contrib-matching - 3.0.1
//		[$$05] PAGE FIXES - Component - adapt-contrib-openTextInput - 1.2.11
//		[$$06] PAGE FIXES - Component - adapt-contrib-accordion - 4.0.0
//		[$$07] PAGE FIXES - Component - adapt-contrib-media - 4.1.1
//		[$$08] PAGE FIXES - Component - adapt-expose - 1.1.4
//		[$$09] PAGE FIXES - Component - adapt-quicknav - 3.2.0
//		[$$10] PAGE FIXES - Component - adapt-contrib-narrative - 5.0.2
//		[$$11] PAGE FIXES - Component - adapt-contrib-hotgraphic - 4.3.0
//		[$$12] PAGE FIXES - Component - adapt-hotgrid - 3.2.0
//		[$$13] PAGE FIXES - Component - adapt-contrib-slider - 2.4.0
//		[$$14] PAGE FIXES - header Levels    

// [%%] - Utility fixes
//		[%%01] UTILITY - Keyboard listener
//		[%%02] UTILITY - Check if object has a given attribute
//		[%%03] UTILITY - Pure Javascript document ready function
//		[%%04] UTILITY - Show aria levels above headers (for QA purposes)
//		[%%05] UTILITY - add first and last focusable item styles to dom    


// [!!] STARTUP !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// -------------------------------------------------------------------------
//
//	    [!!01] STARTUP - Event and Mutation listeners
//
// -------------------------------------------------------------------------

//run global fixes when document is ready
docReady(function() {
    if (isIE()) {
        $('.clearfix').css('display', 'block')
    } else {
        globalfixes();
    }
});

var htmlobserver = new MutationObserver(observehtml);
var headerobserver = new MutationObserver(observeheaders);
var initialPageLoadingFlag = true;

//Set properties that trigger htmlobserver
function setObservers() {
    htmlobserver.disconnect();

    var observerOptions = { attributes: true, attributeFilter: ['class', 'data-location', 'style'] };
    var object_htmlTag = document.documentElement;
    var object_Spinner = $('.loading')[0];
    var object_htmlTag2 = document.getElementsByClassName('drawer')[0];
    htmlobserver.observe(object_htmlTag, observerOptions);
    htmlobserver.observe(object_Spinner, observerOptions);
    htmlobserver.observe(object_htmlTag2, observerOptions);

}

//Set properties that trigger headerobserver
function setHeaderObservers(objects) {

    //console.log('setting header observers on ' + objects.length + 'headers');
    headerobserver.disconnect();
    var headerObserverOptions = { attributes: true, attributeFilter: ['class'] };

    objects.each(function(item) {
        headerobserver.observe(objects[item], headerObserverOptions);
    })
}

//Actions to run when htmlobserver is triggered
function observehtml(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type == 'attributes') {
            if (mutation.attributeName == 'data-location') {
                //console.log('the data-location attribute of an observed object has changed!');
                setTimeout(globalfixes(), 200);
                displayAriaLevels();
                initialPageLoadingFlag = true; //page changed, reset initial loading flag
            } else if (mutation.attributeName == 'class') {
                //console.log("A class has been modified in the <html> tag!");
                if (IsPopup()) {
                    //console.log("It's a popup!");
                    popupfixes();
                    StartKBTrap(FindPopup(), false);
                } else {
                    //Spaghetti code to stop
                    StartKBTrap(null, true);
                }
            } else if (mutation.attributeName == 'style') {
                //console.log('The inline style of an observed object has changed!');
                if ($('.loading').css('display') == 'none' && initialPageLoadingFlag) {

                    //console.log('Running initial fixes! ###############');
                    initialFixes();
                    initialPageLoadingFlag = false; //stop running after first run
                }
            }
        }
    });
}

//Actions to run when headerobserver is triggered
function observeheaders(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.attributeName == 'class') {
            //console.log('The class of an observed header has changed!');
            checkHeaderLevels();
        }
    });
}

// -------------------------------------------------------------------------
//
//      [!!02] STARTUP - Accessibility fix runners
//
// -------------------------------------------------------------------------
//Fixes which should only be run once when a page loads
//runs only once the Adapt "loading" logo is gone
function initialFixes() {
    addKeyboardListener();
    destroyMediaPlayers();
    showFirstAndLastFocus();
    globalfixes();
    focuspageload();
}

//Fixes which apply to both menu and pages
//this function also detects if user is crrently in a menu or a page
function globalfixes() {
    setObservers();
    stopAutoTranslate();
    setNavigationTabOrder()
    linkfixes();
    altFixes();
    tempFixes();
    mailtoFix();

    //if menu page, run menufixes, else run page fixes
    ($('#adapt').attr('data-location') == 'course') ? menufixes(): pagefixes();
}

//Fixes that only apply to menus
function menufixes() {

    checkMenuHeaderLevels();
    //glossaryfix(); What was this? no associated function. Remove if no longer needed
}

//Fixes that apply to pages
function pagefixes() {

    checkHeaderLevels();
    updatePopupHeaderLevels();

    globalQuestionComponentFixes();
    componentMultiChoiceFixes();
    componentGraphicalMultiChoiceFixes();
    componentMatchingQuestionFixes();
    componentOpenTextInputFixes();
    componentAccordionFixes();
    componentMediaFixes();
    componentExposeFixes();
    componentQuickNavFixes();
    componentNarrativeFixes();
    componentHotGraphicFixes();
    componentHotGridFixes();
    componentSliderFixes();
}



// [**] GLOBAL FIXES *******************************************************

// -------------------------------------------------------------------------
//
//		[**01] GLOBAL FIXES - Stop auto translate
//
// -------------------------------------------------------------------------
function stopAutoTranslate() {
    // notranslate chrome
    $('body').addClass('notranslate');
    // notranslate Edge
    $('body').attr('translate', 'no');
}

/// fix initial page focus
function focuspageload() {
    $("head").focus();
    //$('.accessibility .navigation .skip-nav-link').focus();
}

// -------------------------------------------------------------------------
//
//		[**02] GLOBAL FIXES - <a> anchor tag link fixes
//
// -------------------------------------------------------------------------
function linkfixes() {
    //add target = _blank to all external links
    $('a').filter(function() {
        return this.hostname && this.hostname !== location.hostname;
    }).attr('target', '_blank');
}

// -------------------------------------------------------------------------
//
//      [**03] GLOBAL FIXES - Alt tags for <img> and tags with role="img"
//
// -------------------------------------------------------------------------
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
        if ($(this).attr('aria-hidden') === 'true') {
            //console.log($(this).attr('src'));
            $(this).removeAttr('aria-hidden');
        }

        // check if img is in narrative component
        if ($(this).parents('.narrative-component').length == 1) {
            var widget = $(this).closest('.narrative-widget');
            var imgIndex = $(this).parents('.narrative-slider-graphic').attr('data-index');
            var altText = widget.find('div.narrative-content-item[data-index="' + imgIndex + '"]>div.aria-label').attr('aria-label');
            $(this).attr('alt', altText)
        }
    });

    //for any div with role="img", if the aria-label is empty, set it to aria-hidden
    $('div[role="img"]').each(function() {
        if ($(this).attr('aria-label') === "") {
            $(this).attr('aria-hidden', true);
        }
    });
}

// -------------------------------------------------------------------------
//
//		[**04] GLOBAL FIXES - Navigation bar tab order
//
// -------------------------------------------------------------------------
function setNavigationTabOrder() {
    //Tab order of buttons in the top navigation bar
    var buttonArray = [];
    var appliedLeftMargin = false;

    for (var i = 0; i < topNavButtons.length; i++) {
        //if the button exists, add it to the buttonArray
        if ($(topNavButtons[i]).length > 0) {
            var nextBtn = $(".navigation-inner").find(topNavButtons[i]);

            if (i >= navSplitValue && !appliedLeftMargin) {
                appliedLeftMargin = true;
                nextBtn.css("margin-left", "auto");
            } else {
                nextBtn.css("margin-left", "20px");
            }

            nextBtn.removeAttr("tabindex");
            buttonArray.push(nextBtn);
        }
    }

    for (var i = 0; i < buttonArray.length; i++) {
        buttonArray[i].detach();
        $(".navigation-inner").append(buttonArray[i]);
    }
}

// -------------------------------------------------------------------------
//
//		[**05] GLOBAL FIXES - Popups
//
// -------------------------------------------------------------------------
var modal;
var focusableElements;
var firstFocusableElement;
var lastFocusableElement;

function popupfixes() {
    if ($('html').hasClass('notify')) {

        popupIsOpened = true;
        $('.notify-popup-inner *[aria-level]').attr('aria-level', Number(lastHeaderLevelBeforeClickedButton) + 1);
        $('.notify-popup-inner *[aria-level]').attr('aria-disabled', 'true');

        displayAriaLevels();
        globalfixes();

    } else {
        popupIsOpened = false;
    }
}

//Is a popup opened?
function IsPopup() {

    //console.log("SHIIIIT" + $('.drawer').not('.display-none').length);
    if ($('.notify-popup').length > 0 || $('.drawer').not('.display-none').length > 0) {
        //console.log('it is a popup!');
        return (true);
    } else {
        return false;
    }
}

//Find the popup and return a handler to it
function FindPopup() {

    //Find which popup was opened

    if ($('.notify-popup').length > 0) {
        //console.log("The popup's type is: NOTIFY-POPUP");
        var thePopup = $('.notify-popup');
    } else if ($('.drawer').not('.display-none').length > 0) {
        //console.log("The popup's type is: DRAWER");
        var thePopup = $('.drawer');

        $('.a11y-focusguard').remove();
        $('.drawer-inner .aria-label').remove();

        $('.pagelevelprogress-navigation').on("click", function() {

            setTimeout(function() {
                $('.pagelevelprogress-inner .aria-label').remove();
                $('.drawer-close').focus();
            }, 50);
        })
        $('.pagelevelprogress-navigation').on("keydown", function() {

            setTimeout(function() {
                $('.pagelevelprogress-inner .aria-label').remove();
                $('.drawer-close').focus();
            }, 50);
        })
    }
    //Add listener to close and X of the Popup
    return (thePopup);
}

//Start keyboard trap on given popup object
function StartKBTrap(object, forceStop) {

    if (!forceStop) {
        if (object != undefined || object != null) {

            //keyboard operable focus hotgrid notify
            $('body').keydown(function(e) {
                if (e.keyCode == 40) {
                    $('.hotgrid-popup').scrollTo($('.hotgrid-popup').scrollTop() + 10);
                    $('.hotgraphic-popup').scrollTo($('.hotgraphic-popup').scrollTop() + 10);
                }
                if (e.keyCode == 38) {
                    $('.hotgrid-popup').scrollTo($('.hotgrid-popup').scrollTop() - 10);
                    $('.hotgraphic-popup').scrollTo($('.hotgraphic-popup').scrollTop() - 10);
                }
            });

            //console.log('Keyboard trap started!');
            focusableElements = object.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').not('.notify-popup-title-inner, .hotgrid-content-title, .hotgraphic-content-title, .disabled, .h1, .h2, .h3, .h4, .h5, .h6').filter(':visible');
            //focusableElements = object.find('button, input, select, textarea, details, [tabindex], a[href]').not('[tabindex = "-1"], [disabled="disabled"]');

            //select the first and last ones

            initialFocusableElement = $('*:focus');
            firstFocusableElement = focusableElements.first();
            lastFocusableElement = focusableElements.last();

            $('.initialfocus').removeClass('initialfocus');
            $('.firstfocus').removeClass('firstfocus');
            $('.lastfocus').removeClass('lastfocus');

            initialFocusableElement.addClass('initialfocus');
            firstFocusableElement.addClass('firstfocus');
            lastFocusableElement.addClass('lastfocus');

            //Drawer focus fixes
            if (object.find('.pagelevelprogress-indicator').length > 0) {
                $('.drawer-close').focus();
            } else if (object.find('.drawer-item').length > 0) {
                firstFocusableElement.focus();
            }

            //lastFocus is initialFocus fix
            var ignoreInitial = false;
            if ($('.lastfocus').hasClass('.initialfocus')) {
                ignoreInitial = true;
                $('.initialfocus').removeClass('initialfocus');
            }

            //Listing of all focusable item
            focusableElements.each(function() {
                //console.log($(this));
            });

            //Bind Keydown event to body
            object.on('keydown', PopupKeyboardHandler);

            function PopupKeyboardHandler(e) {

                if (e.keyCode == 27) {
                    StopKBTrap();

                } else if (e.shiftKey) {
                    if (e.keyCode == 9) {
                        if (firstFocusableElement.is(':focus')) {
                            e.preventDefault();
                            lastFocusableElement.focus();
                        } else if (!ignoreInitial && initialFocusableElement.is(':focus')) {
                            e.preventDefault();
                            lastFocusableElement.focus();
                        }
                    }

                } else {
                    if (lastFocusableElement.is(':focus')) {
                        if (e.keyCode == 9) {
                            e.preventDefault();
                            firstFocusableElement.focus();
                        }
                    }
                }
            }

            object.find('.hotgrid-popup-controls, .hotgraphic-popup-controls').click(function() {
                setTimeout(waitForPageChange, 70);
            });

            function waitForPageChange() {
                //console.log('hotgrid page changed, restarting KB trap');
                StopKBTrap();
                StartKBTrap(FindPopup(), false);
            }
            $('.notify-popup-done, .hotgrid-popup-close, .drawer-close').click(StopKBTrap);
            $('.notify-popup-done, .hotgrid-popup-close, .drawer-close').on('keydown', function(e) {
                //console.log(e.keyCode);
                if (e.keyCode == 13 || e.keyCode == 32) {
                    StopKBTrap();
                }
            });
        }
    } else {
        StopKBTrap();
    }

    //Unbind keyboard Keydown code from body tag
    function StopKBTrap() {
        //console.log('Keyboard trap ended!');

        if (object != undefined || object != null) {
            object.unbind("keypress", PopupKeyboardHandler);
        }
        $('.initialfocus').removeClass('initialfocus');
        $('.firstfocus').removeClass('firstfocus');
        $('.lastfocus').removeClass('lastfocus');
    }

    linkfixes();
}

function updatePopupHeaderLevels() {
    $('button').click(function() {

        if (($(this).closest('.narrative-component').length > 0) &&
            ($(this).closest('.narrative-component').find('.narrative-content').css('display') == 'none')) {
            lastHeaderLevelBeforeClickedButton = $(this).closest('div:has(.js-heading-inner[aria-level])').find('.js-heading-inner[aria-level]').attr('aria-level');

        } else {
            //find the nearest parent object which contains an object with an aria-level, then find the object that has an aria level and get its aria level
            lastHeaderLevelBeforeClickedButton = $(this).closest('div:has(div[aria-level])').find('div[aria-level]').attr('aria-level');
        }

    });
}

// -------------------------------------------------------------------------
//
//		[**06] GLOBAL FIXES - Temporary fixes
//      These fixes should be removed and replaced with better options
//      Suchs as CSS edits in the theme.
//
// -------------------------------------------------------------------------
function tempFixes() {
    $("html").append(
        "<style>" +
        "html *:focus, body div:focus, body p:focus, body button:focus, body label:focus, body input:focus, body *:focus" +
        "{" +
        "outline:3px solid #CD1C6A !important;" +
        "}" +
        "</style>"
    );
}

// -------------------------------------------------------------------------
//
//      [**07] GLOBAL FIXES - <a> auto apply target="_blank" for mailto
//
// -------------------------------------------------------------------------
function mailtoFix() {
    $('a').each(function() {
        var str = $(this).attr('href');
        if (str !== undefined && str.indexOf('mailto') !== -1) {
            $(this).attr('target', '_blank');
        }
    });
}

// [^^] MENU FIXES ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// -------------------------------------------------------------------------
//
//		[^^01] MENU FIXES - Check menu header levels
//
// -------------------------------------------------------------------------
function checkMenuHeaderLevels() {
    //Force level of page header to 1
    $('html .course-heading *[aria-level]').attr('aria-level', 1);

    //Force level of menu item titles to 2
    $('html .menu-item-title-inner *[aria-level]').each(function() {
        $(this).attr('aria-level', 2);
    });

    displayAriaLevels();
}

// [$$] PAGE FIXES $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// -------------------------------------------------------------------------
//
//		[$$01] PAGE FIXES - for all question components
//
// -------------------------------------------------------------------------
function globalQuestionComponentFixes() {
    //add aria live to all "question" component instructions so learner will be alerted if they change	
    let allQuestionComponents = $(".question-component");

    allQuestionComponents.each(function() {
        $(this).find('.component-instruction-inner').attr('role', 'alert');
        $(this).find('.component-instruction-inner').attr('aria-live', 'assertive');
    });

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
}

// -------------------------------------------------------------------------
//
//		[$$02] PAGE FIXES - Component - adapt-contrib-mcq - 3.0.0
//
// -------------------------------------------------------------------------
function componentMultiChoiceFixes() {
    let multiChoiceComponents = $('.mcq-component');
    multiChoiceComponents.each(function() {

        if ($(this).find('fieldset').length == 0) {
            $(this).find('.mcq-inner').wrap("<fieldset></fieldset>");
            $(this).find('.mcq-body-inner').wrap("<legend></legend>");
        }
    });
}

// -------------------------------------------------------------------------
//
//		[$$03] PAGE FIXES - Component - adapt-contrib-gmcq - 4.0.0
//
// -------------------------------------------------------------------------
function componentGraphicalMultiChoiceFixes() {
    let gmultiChoiceComponents = $('.gmcq-component');
    gmultiChoiceComponents.each(function() {
        if ($(this).find('fieldset').length == 0) {
            $(this).find('.gmcq-inner').wrap("<fieldset></fieldset>");
            $(this).find('.gmcq-body-inner').wrap("<legend></legend>");
        }

        $(this).find('gmcq-widget component-widget *').attr('tabindex', '-1');
        $(this).find('input').attr('tabindex', '-1');

        $(this).find('.gmcq-item').attr('tabindex', '0');

        $(this).find('.gmcq-item').keypress(function(e) {
            if (e.keyCode === 13 || e.keyCode === 32) {
                e.preventDefault();
                $(this).find("input").click();
            }
        });

    });
    //graphical question focus fix
    //-----------------------------------------------------------------------------

    //Instead, we need an event listener. when input has focus, highlight label.
    //Problem is we can't do it with CSS because the input is after the label

}

// -------------------------------------------------------------------------
//
//		[$$04] PAGE FIXES - Component - adapt-contrib-matching - 3.0.1
//
// -------------------------------------------------------------------------
function componentMatchingQuestionFixes() {
    $('.matching-select-container').each(function(k) {
        let glabel = $(this).parents().find('.matching-component').attr('data-adapt-id') + '_qlabel_' + k;
        $(this).find('.dropdown__inner').attr('id', glabel);
        $(this).find('button').attr('aria-labelledby', glabel);
    });

    /* //NEEDS FIXING, DOUBLING SOMETIMES
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
    */
}

// -------------------------------------------------------------------------
//
//		[$$05] PAGE FIXES - Component - adapt-contrib-openTextInput - 1.2.11
//
// -------------------------------------------------------------------------
function componentOpenTextInputFixes() {
    $('.openTextInput-inner').each(function(k) {
        let olabel = $(this).parents().find('.openTextInput-component').attr('data-adapt-id') + '_qlabel_' + k;
        $(this).find('.openTextInput-count-characters-container').attr('aria-live', 'polite');
        $(this).find('.openTextInput-instruction-inner').attr('id', olabel);
        $(this).find('.openTextInput-answer-container textarea').attr('aria-labelledby', olabel);
    });
}

// -------------------------------------------------------------------------
//
//		[$$06] PAGE FIXES - Component - adapt-contrib-accordion - 4.0.0
//
// -------------------------------------------------------------------------
function componentAccordionFixes() {
    $('.accordion-component').each(function() {
        let parentID = $(this).attr('data-adapt-id');
        $('.accordion-item-title').each(function(i) {
            let blockid = 'accord-' + i + '-' + parentID;
            $(this).attr('aria-controls', blockid);
            $(this).next().attr('id', blockid);
        });
    });
}

// -------------------------------------------------------------------------
//
//		[$$07] PAGE FIXES - Component - adapt-contrib-media - 4.1.1
//
// -------------------------------------------------------------------------
function componentMediaFixes() {

    var skipBtn = $('.aria-label.js-skip-to-transcript');
    skipBtn.remove();

    //OLD ANCHOR CODE ------ 
    //var skiptxt = skipBtn.attr('aria-label');

    //var parentID = $('.aria-label.js-skip-to-transcript').parents('.component').attr('data-adapt-id');
    //var theParent = $('#' + parentID).find('media-inline-transcript-button').attr('id', parentID + 'TSCPT');

    //var myAtag = '<a href = #' + parentID + 'TSCPT' + '>' + skiptxt + '</a>';

    //$('.aria-label.js-skip-to-transcript').replaceWith(myAtag);
    //$('.media-inline-transcript-button').attr('tabindex', '0');
    //$('.media-transcript-container').attr('tabindex', '0');

    // ---------------------------------------------------------------------------
    //change that to focus to an ID
    //$(".aria-label.js-skip-to-transcript").on("click", function() {
    //    var compid = $(this).parents('.component').attr('data-adapt-id');
    //    $('.' + compid + ' .media-transcript-button-container:first button').focus();
    //});

    // OLD BUTTON CODE ------
    /*   
    var skiptxt = $('.aria-label.js-skip-to-transcript').attr('aria-label');
    $('.aria-label.js-skip-to-transcript').html(skiptxt);
    $('.aria-label.js-skip-to-transcript').removeAttr('aria-label');
    $('.aria-label.js-skip-to-transcript').attr('tabindex', '0');
    $('.media-transcript-container').attr('tabindex', '0');

    $(".aria-label.js-skip-to-transcript").on("click", function() {
        var compid = $(this).parents('.component').attr('data-adapt-id');
        $('.' + compid + ' .media-transcript-button-container:first button').focus();
    });
    */
}

function destroyMediaPlayers() {
    $('video').each(function(k) {

        //console.log('VIDEO PLAYER DESTROYED!');
        var link = $(this).attr('src');
        var track = $(this).children('track').attr('src');
        var poster = $(this).attr('poster');
        var srcLang = $(this).find('track').attr('srclang');
        var trackLabel = (srcLang === "fr") ? "French" : "English";

        var newhtmlplayer = '<video width="100%" height="100%" poster="' + poster + '" controls><source src="' + link + '" type="video/mp4"><track style="z-index:10;" label="' + trackLabel + '" kind="subtitles" srclang="' + srcLang + '" src="' + track + '" type="text/vtt" default></video>'
        $(this).parents('.mejs-container').html(newhtmlplayer);
    });
}

// -------------------------------------------------------------------------
//
//		[$$08] PAGE FIXES - Component - adapt-expose - 1.1.4
//
// -------------------------------------------------------------------------
function componentExposeFixes() {
    $('.expose-component').each(function() {
        $(this).find('.expose-item-button').remove();
        $(this).find('.expose-item-cover').attr('role', 'button');
        $(this).find('.expose-item-cover').attr('tabindex', '0');
        $(this).find('.expose-item-cover').attr('aria-pressed', 'false');
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
}

// -------------------------------------------------------------------------
//
//		[$$09] PAGE FIXES - Component - adapt-quicknav - 3.2.0
//
// -------------------------------------------------------------------------

function componentQuickNavFixes() {
    //remove tooltips from buttons
    //-----------------------------------------------------------------------------
    $('.quicknav-widget').find('button').hover(function() {
        $(this).removeAttr('tooltip');
    });
}

// -------------------------------------------------------------------------
//
//		[$$10] PAGE FIXES - Component - adapt-contrib-narrative - 5.0.2
//
// -------------------------------------------------------------------------
function componentNarrativeFixes() {
    //add aria-live to narrative 
    $('.narrative-content').attr('aria-live', 'polite');

    //narrative controls comprehensive aria labels
    if ($('html').attr('lang') == 'fr') {
        $('.base.narrative-controls.narrative-control-right').attr('aria-label', 'Diapositive suivante');
        $('.base.narrative-controls.narrative-control-left').attr('aria-label', 'Diapositive précédente');
    } else {
        $('.base.narrative-controls.narrative-control-right').attr('aria-label', 'Next slide');
        $('.base.narrative-controls.narrative-control-left').attr('aria-label', 'Previous slide');
    }
}

// -------------------------------------------------------------------------
//
//		[$$11] PAGE FIXES - Component - adapt-contrib-hotgraphic - 4.3.0
//
// -------------------------------------------------------------------------
function componentHotGraphicFixes() {
    //Hotgraphic pin title checker
    let hotgraphicPins = $('.hotgraphic-graphic-pin');
    hotgraphicPins.each(function() {

        if ($(this).find('.aria-label').html() == ".") {
            $(this).prepend('<p style="color:red; font-weight:bold;">VEUILLEZ AJOUTER UN TITRE / PLEASE ADD A PIN TITLE</p>')
        }
    });
}

// -------------------------------------------------------------------------
//
//		[$$12] PAGE FIXES - Component - adapt-hotgrid - 3.2.0
//
// -------------------------------------------------------------------------
function componentHotGridFixes() {
    //Hotrgrid fixes - aria label copy
    let hotGridButtons = $('.component.hotgrid-component .hotgrid-grid-item');
    hotGridButtons.each(function() {
        //copy the labels anytime one is clicked, probably a bit overzealous but works for now
        $(this).click(hotGridCopyLabel());
    });
    // remove generic instruction aria label for how to use hotgrids
    $('.hotgrid-header-inner.component-header-inner .aria-label').remove();
    hotGridCopyLabel();
}

function hotGridCopyLabel() {
    let hotGridButtons = $('.component.hotgrid-component .hotgrid-grid-item');

    hotGridButtons.each(function() {
        let hotGridButtonLabel = $(this).find('.aria-label');
        let hotGridImage = $(this).find('.hotgrid-item-image img');

        //console.log(hotGridButtonLabel.html().replace(/\s+/g, ' ').trim());

        hotGridButtonLabel.attr('aria-hidden', 'true');
        hotGridImage.attr('alt', hotGridButtonLabel.html().replace(/\s+/g, ' ').trim());
    });
}

// -------------------------------------------------------------------------
//
//		[$$13] PAGE FIXES - Component - adapt-contrib-slider - 2.4.0
//
// -------------------------------------------------------------------------
function componentSliderFixes() {
    theSlider = $('.slider-component');
    theSlider.each(function(i) {
        var newid = $(this).attr('data-adapt-id') + "slabel" + i
        $(this).find('.slider-instruction-inner').attr('id', newid);
        $(this).find('.slider-item input').attr('aria-labelledby', newid);
    });
}

// -------------------------------------------------------------------------
//
//		[$$14] PAGE FIXES - header Levels
//
// -------------------------------------------------------------------------
function checkHeaderLevels() {
    //header level warnings

    //pass 1 - Set all header levels as they should be if all headers were used
    var pageElementTypes = ['.page-title', '.article-title', '.block-title', '.component-title'];

    for (var i = 0; i < pageElementTypes.length; i++) {
        $(pageElementTypes[i] + ' .js-heading-inner').each(function() {
            $(this).attr('aria-level', i + 1);
            $(this).attr('data-level-type', i + 1);
        });
    }

    $('.narrative-content-title-inner').each(function() {
        $(this).attr('aria-level', pageElementTypes.length + 1);
        $(this).attr('data-level-type', pageElementTypes.length + 1);
    });

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

        //console.log('--------------------------------------------');
    }

    //pass 3 - setup change event listeners to keep headers at set levels
    setHeaderObservers($('.js-heading'));
    displayAriaLevels();
}



// [%%] UTILITY FUNCTIONS %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// -------------------------------------------------------------------------
//
//		[%%01] UTILITY - Keyboard listener
//
// -------------------------------------------------------------------------
function addKeyboardListener() {

    $(".narrative-widget.component-widget .base.narrative-controls.narrative-control-left, .base.narrative-controls.narrative-control-right, .narrative-progress ").click(function(e) {
        var narelem = this;
        setTimeout(function() {
            focusnar(narelem);
            e.stopPropagation();
        }, 500);

    });

    function focusnar(val) {
        if ($(val).hasClass('narrative-hidden') == true) {
            $(val).parent().find('button:not(.narrative-hidden)').focus();
        } else {
            $(val).focus();
        }
    }

    //Component - Narrative keypress code
    $(".narrative-widget.component-widget *").keydown(function(e) {
        if (e.keyCode == 37 && !($('.base.narrative-controls.narrative-control-left').hasClass("narrative-hidden"))) {
            $('.base.narrative-controls.narrative-control-left')[0].click();
            event.stopPropagation(300);
        } else if (e.keyCode == 39 && !($('.base.narrative-controls.narrative-control-right').hasClass("narrative-hidden"))) {
            $('.base.narrative-controls.narrative-control-right')[0].click();
            event.stopPropagation(300);
        }
    });
}

// -------------------------------------------------------------------------
//
//		[%%02] UTILITY - Check if object has a given attribute
//
// -------------------------------------------------------------------------
function hasAttr(obj, attr) {

    let _attr = (obj.attr) ? obj.attr(attr) : obj.getAttribute(attr);
    return (typeof _attr !== 'undefined' && _attr !== false && _attr !== null);

}

// -------------------------------------------------------------------------
//
//		[%%03] UTILITY - Pure Javascript document ready function
//
// -------------------------------------------------------------------------
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 50);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

// -------------------------------------------------------------------------
//
//		[%%04] UTILITY - Show aria levels above headers (for QA purposes)
//
// -------------------------------------------------------------------------
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
//Wee
// -------------------------------------------------------------------------
//
//		[%%05] UTILITY - add first and last focusable item styles to dom
//
// -------------------------------------------------------------------------
function showFirstAndLastFocus() {

    if (showFocusableItemsInPopups) {
        $('body').append('<style>' +

            '.firstfocus{outline: 2px solid orange;}' +
            '.lastfocus{outline: 2px solid green;}' +

            '</style>');
    }
}

// -------------------------------------------------------------------------
//
//		[%%06] UTILITY - check if browser is IE
//
// -------------------------------------------------------------------------

function isIE() {
    var ua = window.navigator.userAgent;
    var old_ie = ua.indexOf('MSIE ');
    var new_ie = ua.indexOf('Trident/');

    if ((old_ie > -1) || (new_ie > -1)) {
        //console.log('this is IE')
        return true;
    } else {
        //console.log('this is not IE')
        return false;
    }
}
