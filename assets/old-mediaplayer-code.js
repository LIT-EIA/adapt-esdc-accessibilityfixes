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

let mediaobserver = new MutationObserver(observemedia);
let timeobserver = new MutationObserver(observetimeslider);

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

function allfixes() {
    $('.mejs-captions-button button').next().css('visibility', 'hidden');
    frenchifyMediaLabels();
    setMediaObservers();
    setTimeObserver();
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

function otherMediaFixes() {
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
}