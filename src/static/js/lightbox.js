(function(global){
  var LIGHTBOX_INIT_ATTRIBUTE = "data-lightbox";
  var LIGHTBOX_GROUP_ATTRIBUTE = "data-lightbox-group";
  var OVERLAY_CLASS_NAME = "lightbox-overlay";
  var LIGHTBOX_CLASS_NAME = "lightbox-main";
  var LIGHTBOX_CLOSE_BUTTON_CLASS = "lightbox-close";
  var LIGHTBOX_CLOSE_BUTTON_CLASS = "lightbox-close";
  var CURRENT_IMAGE_CLASS = "lightbox-image__current";

  var templateHTML = '<div class="{lightboxClassName}">'+
                     '<div class={lightboxExitClassName}>X</div>'
                     '</div>';
  
  var mainImageHTML = '<div class="{lightboxClassName}">'+
                      '<div class={lightboxExitClassName}>X</div>'
                      '</div>';

  if(global.lightbox) {
    // store possibly defined lightbox
    global._lightbox = global.lightbox;
  }
  
  // ================== INITIALIZATION  START ============================

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
    initBaseComponentsIfNeeded();
  };

  function initBaseComponentsIfNeeded() {
    addOverlay();
    addLightboxContainer();
  }

  function addOverlay() {
    var node = document.querySelector("." + OVERLAY_CLASS_NAME);
    if(!node) {
      node = document.createElement('div');
      node.className = OVERLAY_CLASS_NAME;
      document.body.appendChild(node);
    }
  }

  function addLightboxContainer() {
    var node = document.querySelector("." + LIGHTBOX_CLASS_NAME);
    if(!node) {
      var lightboxContainer = createElementFromTemplate(templateHTML, {
        lightboxClassName: LIGHTBOX_CLASS_NAME,
        lightboxExitClassName: LIGHTBOX_CLOSE_BUTTON_CLASS
      });
      document.body.appendChild(lightboxContainer);
      var closeButton = document.querySelector("." + LIGHTBOX_CLOSE_BUTTON_CLASS);
      closeButton.addEventListener('click', handleLightboxClose);
    }
  }

  // ================== INITIALIZATION END =========================
  
  // ================== INTERACTION START ==========================
  
  function handleLightboxClose(){
    hideLightbox();
  }

  function handleLightboxClicks(event) {
    event.preventDefault();
    console.log(this);
    displayOverlay();
    displayLightboxContainer();
  }

  function displayOverlay() {
    var overlayNode = document.querySelector("." + OVERLAY_CLASS_NAME);
    // Can also be done via class names in the name of extensible styles
    document.body.style.overflowY = "hidden";
    removeClassFromNode(overlayNode, "fadeOut");
    addClassToNode(overlayNode,"fadeIn");
  }

  function displayLightboxContainer() {
    var lightboxMain = document.querySelector("." + LIGHTBOX_CLASS_NAME);
    removeClassFromNode(lightboxMain, "leaveTop");
    addClassToNode(lightboxMain,"appearFromTop");
  }

  function hideLightbox() {
    var overlayNode = document.querySelector("." + OVERLAY_CLASS_NAME);
    var lightboxMain = document.querySelector("." + LIGHTBOX_CLASS_NAME);
    removeClassFromNode(overlayNode, "fadeIn");
    removeClassFromNode(lightboxMain, "appearFromTop");
    addClassToNode(overlayNode, "fadeOut");
    addClassToNode(lightboxMain, "leaveTop");
    document.body.style.overflowY = "auto";
  }
  
  // ==================== INTERACTION END =========================
  
  // ================== RENDER START ==========================

  // ================== RENDER END ============================
  global.lightbox = {
    init: initLightBoxListeners
  }

})(window);
