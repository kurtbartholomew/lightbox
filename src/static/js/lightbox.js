(function(global) {
  var LIGHTBOX_INIT_ATTRIBUTE = "data-lightbox";
  var LIGHTBOX_GROUP_ATTRIBUTE = "data-lightbox-group";
  var OVERLAY_CLASS_NAME = "lightbox-overlay";
  var LIGHTBOX_CLASS_NAME = "lightbox-main";
  var LIGHTBOX_CLOSE_BUTTON_CLASS = "lightbox-close";
  var CURRENT_IMAGE_CONTAINER_CLASS = "lightbox-image-container";
  var GROUP_IMAGE_CONTAINER_CLASS = "lightbox-group-container";
  var CURRENT_IMAGE_CLASS = "lightbox-image-current";
  var LIGHTBOX_GROUP_CLASS = "lightbox-group-image";
  var CURRENT_ACTIVE_IMAGE_IN_GROUP_CLASS = 'lightbox-group-image__current';

  var templateHTML = '<div class="{lightboxClassName}">'+
                        '<div class={lightboxExitClassName}>X</div>' +
                        '<div class={currentImageContainerClassName}></div>' +
                        '<ul class={groupImageContainerClassName}></ul>' +
                     '</div>';
  
  var mainImageHTML = '<img class={currentImageClassName} src={src} alt={text} />';

  var groupImagesHTML = '<li class={imageGroupClassName}>'+
                          '<img src={src} alt={text}'+
                        '</li>';

  if(global.lightbox) {
    // store possibly defined lightbox
    global._lightbox = global.lightbox;
  }
  
  // ================== INITIALIZATION  START ============================

  // TODO: Abstract out grouping functionality for clarity
  
  var lightboxGroups;

  var initLightBoxListeners = function(config) {
    var internalGroupCounter = 0;

    // find clickable anchors to open a lightbox
    var allLightboxes = document.querySelectorAll('[' + LIGHTBOX_INIT_ATTRIBUTE + ']');
    
    lightboxGroups = {};
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
        lightboxExitClassName: LIGHTBOX_CLOSE_BUTTON_CLASS,
        currentImageContainerClassName: CURRENT_IMAGE_CONTAINER_CLASS,
        groupImageContainerClassName: GROUP_IMAGE_CONTAINER_CLASS
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
    displayOverlay();
    displayLightboxContainer();
    renderCurrentImageAndGroup(this);
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
  
  // state held to tell if we should rerender or not
  var lastGroupFocused = undefined;

  function renderCurrentImageAndGroup(selectedNode) {
    console.log(selectedNode);
    renderCurrentImage(selectedNode);
    renderGroupImages(selectedNode);
  }

  function renderCurrentImage(node) {
    var imgSource = node.getAttribute('original-src');
    var currentImageNode = createElementFromTemplate(mainImageHTML, {
      currentImageClassName: CURRENT_IMAGE_CLASS,
      src: imgSource,
      text: ""
    });
    var containerSelector = "." + LIGHTBOX_CLASS_NAME + " ." + CURRENT_IMAGE_CONTAINER_CLASS;
    var lightboxImageContainer = document.querySelector(containerSelector);
    lightboxImageContainer.innerHTML = '';
    lightboxImageContainer.appendChild(currentImageNode);
  }

  function renderGroupImages(node) {
    var imageGroup = node.getAttribute('data-lightbox-group');
    var imageNodesInGroup = lightboxGroups[imageGroup];

    var containerSelector = "." + LIGHTBOX_CLASS_NAME + " ." + GROUP_IMAGE_CONTAINER_CLASS;
    var groupImagesContainer = document.querySelector(containerSelector);
    groupImagesContainer.innerHTML = '';

    for(var i = 0; i < imageNodesInGroup.length; i++) {
      var currentNode = imageNodesInGroup[i];
      var imgSource = currentNode.getAttribute('original-src');
      var currentImageNode = createElementFromTemplate(groupImagesHTML, {
        imageGroupClassName: LIGHTBOX_GROUP_CLASS,
        src: imgSource,
        text: "",
      });
      
      if(imgSource === node.getAttribute('original-src')) {
        addClassToNode(currentImageNode,CURRENT_ACTIVE_IMAGE_IN_GROUP_CLASS);
      }

      // potentially a reflow concern but modern browsers batch appends well
      groupImagesContainer.appendChild(currentImageNode);
    }
  }

  // ================== RENDER END ============================
  global.lightbox = {
    init: initLightBoxListeners
  }

})(window);
