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
    var internalGroupCounter = 0;

    // find clickable anchors to open a lightbox
    var allLightboxes = document.querySelectorAll('[data-lightbox]');
    
    var lightboxGroups = {};
    // organize lightboxes by group
    // TODO: Abstract out grouping functionality for clarity
    for(var i = 0; i < allLightboxes.length; i++) {
      var node = allLightboxes[i];
      if(node["attributes"]["data-lightbox-group"] !== undefined &&
         node["attributes"]["data-lightbox-group"]["nodeValue"] !== undefined) {
        var group = node["attributes"]["data-lightbox-group"]["nodeValue"];
        if (lightboxGroups[group] === undefined) {
          lightboxGroups[group] = [];
        }
        lightboxGroups[group].push(node);
      }
    }
    
    // populate all single lightboxes with a lightbox group to normalize functionality
    for(var j = 0; j < allLightboxes.length; j++) {
      var node = allLightboxes[j];
      if(node["attributes"]["data-lightbox-group"] === undefined) {
        while(internalGroupCounter in lightboxGroups) {
          ++internalGroupCounter;
        }
        node.setAttribute("data-lightbox-group", internalGroupCounter);
        if (lightboxGroups[internalGroupCounter] === undefined) {
          lightboxGroups[internalGroupCounter] = [];
        }
        lightboxGroups[internalGroupCounter].push(node);
      }
    }

    on('body','click','[data-lightbox]', handleLightboxClicks);

  };

  function handleLightboxClicks(event) {
    event.preventDefault();
    
  }

  global.lightbox = {
    init: initLightBoxListeners
  }

})(window);
