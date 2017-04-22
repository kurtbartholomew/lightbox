(function(global){
  var LIGHTBOX_INIT_ATTRIBUTE = "data-lightbox";
  var LIGHTBOX_GROUP_ATTRIBUTE = "data-lightbox-group";
  var OVERLAY_CLASS_NAME = "lightbox-overlay";

  if(global.lightbox) {
    // store possibly defined lightbox
    global._lightbox = global.lightbox;
  }
  
  // TODO: Abstract out grouping functionality for clarity
  var initLightBoxListeners = function(config) {
    var internalGroupCounter = 0;

    // find clickable anchors to open a lightbox
    var allLightboxes = document.querySelectorAll('[' + LIGHTBOX_INIT_ATTRIBUTE + ']');
    
    var lightboxGroups = {};
    // organize lightboxes by group
    for(var i = 0; i < allLightboxes.length; i++) {
      var node = allLightboxes[i];
      if(node["attributes"][LIGHTBOX_GROUP_ATTRIBUTE] !== undefined &&
         node["attributes"][LIGHTBOX_GROUP_ATTRIBUTE]["nodeValue"] !== undefined) {
        var group = node["attributes"][LIGHTBOX_GROUP_ATTRIBUTE]["nodeValue"];
        if (lightboxGroups[group] === undefined) {
          lightboxGroups[group] = [];
        }
        lightboxGroups[group].push(node);
      }
    }
    
    // populate all single lightboxes with a lightbox group to normalize functionality
    for(var j = 0; j < allLightboxes.length; j++) {
      var node = allLightboxes[j];
      if(node["attributes"][LIGHTBOX_GROUP_ATTRIBUTE] === undefined) {
        while(internalGroupCounter in lightboxGroups) {
          ++internalGroupCounter;
        }
        node.setAttribute(LIGHTBOX_GROUP_ATTRIBUTE, internalGroupCounter);
        if (lightboxGroups[internalGroupCounter] === undefined) {
          lightboxGroups[internalGroupCounter] = [];
        }
        lightboxGroups[internalGroupCounter].push(node);
      }
    }

    // remove and bind if called multiple times
    off('body','click');
    on('body','click','[' + LIGHTBOX_INIT_ATTRIBUTE + ']', handleLightboxClicks);
    addOverlayIfNeeded();
  };

  function handleLightboxClicks(event) {
    event.preventDefault();
    console.log(this);
    displayOverlay();
  }

  function addOverlayIfNeeded() {
    var overlayNode = document.querySelector("." + OVERLAY_CLASS_NAME);
    if(!overlayNode) {
      overlayNode = document.createElement('div');
      overlayNode.className = OVERLAY_CLASS_NAME;
      document.body.appendChild(overlayNode);
    }
  }

  function displayOverlay() {
    var overlayNode = document.querySelector("." + OVERLAY_CLASS_NAME);
    // Can also be done via class names in the name of extensible styles
    overlayNode.style.display = "block";
    document.body.style.overflowY = "hidden";
  }

  global.lightbox = {
    init: initLightBoxListeners
  }

})(window);
