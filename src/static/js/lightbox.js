(function(global){
  
  var configDefaults = {
    title: "Fancy",
    month: "July",
    day: "Tuesday",
    year: "1983"
  };

  if(global.lightbox) {
    // store possibly defined lightbox
    global._lightbox = global.lightbox;
  }
  
  var initLightBoxListeners = function(config) {
    var lightboxAnchors = document.querySelectorAll('[data-lightbox]');
    var lightboxes = document.querySelectorAll('[data-lightbox-group]');
    
    console.log(lightboxAnchors);
    console.log(lightboxes);

  };

  global.lightbox = {
    init: initLightBoxListeners
  }

})(window);
