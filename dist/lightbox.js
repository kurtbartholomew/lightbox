(function(global){
  
  // ====================== Event Handling and Delegation =============================  
  var _eventHandlers = {};

  function on(mainSelector, eventId, watchSelectors, listenerFunc) {
    var allSelected = document.querySelectorAll(mainSelector);
    for(var i = 0; i < allSelected.length; i++) {
      var current = allSelected[i];
      var handler = function(event) {
        var matchingChildNodes = document.querySelectorAll(mainSelector+" "+watchSelectors);
        var target = event.target;
        
        traverseUpwardsAndCallIfFound(matchingChildNodes, target, listenerFunc, allSelected[i]);
      };
      if(_eventHandlers[current] === undefined) {
        _eventHandlers[current] = {};
      }
      if(_eventHandlers[current][eventId] === undefined) {
        _eventHandlers[current][eventId] = [];
      }
      _eventHandlers[current][eventId].push(handler);
      allSelected[i].addEventListener(eventId, handler);
    }
  }

  function traverseUpwardsAndCallIfFound(nodes, target, func, parent) {
    for(var j = 0; j < nodes.length; j++) {
      var childNode = nodes[j];
      var currentTarget = target;
      while(currentTarget !== childNode && currentTarget !== parent && currentTarget !== document.body) {
        currentTarget = currentTarget.parentNode;
      }
      if(currentTarget === childNode) {
        func.call(childNode, event);
        break;
      }
    }
  }
  
  function off(mainSelector, eventId, func) {
    var allSelected = document.querySelectorAll(mainSelector);
    var clear = func === undefined;
    for(var i = 0; i < allSelected.length; i++) {
      var current = allSelected[i];
      if(_eventHandlers[current] && _eventHandlers[current][eventId]) {
        if(clear) {
          for(var j = 0; j < _eventHandlers[current][eventId].length; j++) {
            current.removeEventListener(eventId, _eventHandlers[current][eventId][j]);
          }
          _eventHandlers[current][eventId] = [];
        } else {
          var index = _eventHandlers[current][eventId].indexOf(func);
          if(index > -1) {
            current.removeEventListener(eventId, func);
            _eventHandlers[current][eventId].splice(index,1);
          }
        }
      }
    }
  }

  // ==============================================================

  // ================== TEMPLATE FUNCTIONS ========================
  function createElementFromTemplate(templateHTMLString, templateData, attrExtractor) {
    var div = document.createElement('div');
    var fullHTMLString = replaceAttributesInTemplate(
      templateHTMLString,
      attrExtractor === undefined ? templateData : attrExtractor(templateData)
    )
    // TODO: Handle IE edge cases for use of innerHTML with tables
    div.innerHTML = fullHTMLString;
    return div.firstChild;
  }

  function replaceAttributesInTemplate(template, attrOptions) {
   return template.replace(/\{(\w+)\}/gi, function(match, attr) {
     if (attrOptions[attr] !== undefined) {
       return attrOptions[attr];
     }
     return match;
   });
  }

  // ==============================================================
  
  // ======================== XHR FUNCTIONS ===============================
  // TODO: Leverage localStorage if detected to avoid unneeded xhr's

  function retrieveAPIResults(apiUrl, options, callback) {
    var request = new XMLHttpRequest();
    
    options = options || {};
    apiUrl = populateAdditionalOptions(apiUrl, options)
    
    // TODO: Abstract responseHandler out to be more robust
    request.onreadystatechange = function responseHandler() {
      if(request && request.readyState === XMLHttpRequest.DONE) {
        var response = {};
        if(request.status === 200) {
          try {
            response.results = JSON.parse(request.responseText);
          } catch(e) {
            response.error = "Unable to parse JSON. Response is likely malformed. " + e.toString();
          }
        } else {
          response.error = "Unable to complete api request. An error has occurred. " + request.statusText;
        }
        callback(response);
      }
    }
    request.open('GET', apiUrl);
    request.send();
  }
  
  function populateAdditionalOptions(apiUrl, options) {
    var optionString = "";
    for(var optionName in options) {
      optionString += "&" + optionName + "=" + options[optionName];
    }
    return apiUrl + optionString;
  }

  // ===================================================================
  

  function addClassToNode(node, classNamme) {
    if(node.className.indexOf(classNamme) === -1) {
      node.className = node.className + " " + classNamme;
    }
  }

  function removeClassFromNode(node, classNamme) {
    if(node.className.indexOf(classNamme) > -1) {
      node.className = (node.className.replace(classNamme,' ')).trim();
    }
  }

  global.off = off;
  global.on = on;
  global.createElementFromTemplate = createElementFromTemplate;
  global.retrieveAPIResults = retrieveAPIResults;
  global.addClassToNode = addClassToNode;
  global.removeClassFromNode = removeClassFromNode;

})(window);
;(function(global) {
  var LIGHTBOX_INIT_ATTRIBUTE = 'data-lightbox';
  var LIGHTBOX_GROUP_ATTRIBUTE = 'data-lightbox-group';
  var OVERLAY_CLASS_NAME = 'lightbox-overlay';
  var LIGHTBOX_CLASS_NAME = 'lightbox-main';
  var LIGHTBOX_CLOSE_BUTTON_CLASS = 'lightbox-close';
  var CURRENT_IMAGE_CONTAINER_CLASS = 'lightbox-image-container';
  var GROUP_IMAGE_CONTAINER_CLASS = 'lightbox-group-container';
  var CURRENT_IMAGE_CLASS = 'lightbox-image-current';
  var LIGHTBOX_GROUP_CLASS = 'lightbox-group-image';
  var CURRENT_ACTIVE_IMAGE_IN_GROUP_CLASS = 'lightbox-group-image__current';
  var PREV_GROUP_IMAGE_TRIGGER_CLASS = 'lightbox-previous-image';
  var NEXT_GROUP_IMAGE_TRIGGER_CLASS = 'lightbox-next-image';
  var CURRENT_IMAGE_DESCRIPTION_CLASS = 'lightbox-image-current-desc'

  var templateHTML = '<div class={lightboxClassName}>'+
                        '<div class={lightboxExitClassName}>X</div>' +
                        '<div class={currentImageContainerClassName}>' +
                          '<div class={previousGroupImageTriggerClassName}>'+
                            '<span></span>'+
                          '</div>' +
                          '<div class={nextGroupImageTriggerClassName}>'+
                            '<span></span>'+
                          '</div>' +
                        '</div>' +
                        '<div class={currentImageDescriptionClassName}>'+
                        '</div>'+
                        '<ul class={groupImageContainerClassName}></ul>' +
                     '</div>';
  
  var mainImageHTML = '<img class={currentImageClassName} src={src} alt={text} />';

  var groupImagesHTML = '<li class={imageGroupClassName} >'+
                          '<img src={src} alt={text} desc={desc} />'+
                        '</li>';

  if(global.lightbox) {
    // store possibly defined lightbox
    global._lightbox = global.lightbox;
  }
  
  // ================== INITIALIZATION  START ============================

  // TODO: Abstract out grouping functionality for clarity
  
  var lightboxGroups;
  
  /**
   * Find all dom nodes with lightbox attributes, sort them
   * in groups, and attach listeners to display a lightbox
   * @param  {Object} config Options for additional configuration
   * @return {undefined}
   */
  var initLightBoxListeners = function(config) {
    var internalGroupCounter = 0;

    // find clickable anchors to open a lightbox
    var allLightboxes = document.querySelectorAll('[' + LIGHTBOX_INIT_ATTRIBUTE + ']');
    
    lightboxGroups = {};
    // organize lightboxes by group
    for(var i = 0; i < allLightboxes.length; i++) {
      var node = allLightboxes[i];
      if(node['attributes'][LIGHTBOX_GROUP_ATTRIBUTE] !== undefined &&
         node['attributes'][LIGHTBOX_GROUP_ATTRIBUTE]['nodeValue'] !== undefined) {
        var group = node['attributes'][LIGHTBOX_GROUP_ATTRIBUTE]['nodeValue'];
        if (lightboxGroups[group] === undefined) {
          lightboxGroups[group] = [];
        }
        lightboxGroups[group].push(node);
      }
    }
    
    // populate all single lightboxes with a lightbox group to normalize functionality
    for(var j = 0; j < allLightboxes.length; j++) {
      var node = allLightboxes[j];
      if(node['attributes'][LIGHTBOX_GROUP_ATTRIBUTE] === undefined) {
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
    document.body.removeEventListener('keydown',handleLightboxKeyPress);
    on('body','click','[' + LIGHTBOX_INIT_ATTRIBUTE + ']', handleLightboxClick);
    document.body.addEventListener('keydown',handleLightboxKeyPress);
    initBaseComponentsIfNeeded();
  };
  
  function initBaseComponentsIfNeeded() {
    addOverlay();
    addLightboxContainer();
  }

  function addOverlay() {
    var node = document.querySelector('.' + OVERLAY_CLASS_NAME);
    if(!node) {
      node = document.createElement('div');
      node.className = OVERLAY_CLASS_NAME;
      document.body.appendChild(node);
    }
  }

  function addLightboxContainer() {
    var node = document.querySelector('.' + LIGHTBOX_CLASS_NAME);
    if(!node) {
      var lightboxContainer = createElementFromTemplate(templateHTML, {
        lightboxClassName: LIGHTBOX_CLASS_NAME,
        lightboxExitClassName: LIGHTBOX_CLOSE_BUTTON_CLASS,
        currentImageContainerClassName: CURRENT_IMAGE_CONTAINER_CLASS,
        groupImageContainerClassName: GROUP_IMAGE_CONTAINER_CLASS,
        previousGroupImageTriggerClassName: PREV_GROUP_IMAGE_TRIGGER_CLASS,
        nextGroupImageTriggerClassName: NEXT_GROUP_IMAGE_TRIGGER_CLASS,
        currentImageDescriptionClassName: CURRENT_IMAGE_DESCRIPTION_CLASS
      });
      document.body.appendChild(lightboxContainer);
      var closeButton = document.querySelector('.' + LIGHTBOX_CLOSE_BUTTON_CLASS);
      closeButton.removeEventListener('click', handleLightboxCloseClick);
      closeButton.addEventListener('click', handleLightboxCloseClick);
      var previousImageButton = document.querySelector('.'+PREV_GROUP_IMAGE_TRIGGER_CLASS);
      var nextImageButton = document.querySelector('.'+NEXT_GROUP_IMAGE_TRIGGER_CLASS);
      previousImageButton.removeEventListener('click', handlePreviousImageClick);
      previousImageButton.addEventListener('click', handlePreviousImageClick);
      nextImageButton.removeEventListener('click', handleNextImageClick);
      nextImageButton.addEventListener('click', handleNextImageClick);
    }
  }

  // ================== INITIALIZATION END =========================
  
  // ================== INTERACTION START ==========================
  
  function handleLightboxCloseClick(){
    hideLightbox();
  }

  function handleLightboxKeyPress(event) {
    var overlayNode = document.querySelector('.' + OVERLAY_CLASS_NAME);
    if(isVisible(overlayNode)) {
      if(event.keyCode === 27) {
        hideLightbox();
      }
      if(event.keyCode === 37) {
        handlePreviousImageKeyPress();
      }
      if(event.keyCode === 39) {
        handleNextImageKeyPress();
      }
    }
  }

  function handlePreviousImageKeyPress() {
    var imageNode = findPreviousImageNodeInGroup();
    if(imageNode) {
      makeNewImageCurrentImage(imageNode);
    }
  }

  function handleNextImageKeyPress() {
    var imageNode = findNextImageNodeInGroup();
    if(imageNode) {
      makeNewImageCurrentImage(imageNode);
    }
  }

  function handlePreviousImageClick() {
    var imageNode = findPreviousImageNodeInGroup();
    if(imageNode) {
      makeNewImageCurrentImage(imageNode);
    }
  }

  function handleNextImageClick() {
    var imageNode = findNextImageNodeInGroup();
    if(imageNode) {
      makeNewImageCurrentImage(imageNode);
    }
  }

  function handleLightboxClick(event) {
    event.preventDefault();
    displayOverlay();
    displayLightboxContainer();
    renderCurrentImageAndGroup(this);
  }

  function handleImageGroupClick() {
    makeNewImageCurrentImage(this);
  }

  function displayOverlay() {
    var overlayNode = document.querySelector('.' + OVERLAY_CLASS_NAME);
    document.body.style.overflowY = 'hidden';
    removeClassFromNode(overlayNode, 'fadeOut');
    addClassToNode(overlayNode,'fadeIn');
  }

  function displayLightboxContainer() {
    var lightboxMain = document.querySelector('.' + LIGHTBOX_CLASS_NAME);
    lightboxMain.style.top = 0;
  }

  function hideLightbox() {
    var overlayNode = document.querySelector('.' + OVERLAY_CLASS_NAME);
    var lightboxMain = document.querySelector('.' + LIGHTBOX_CLASS_NAME);
    removeClassFromNode(overlayNode, 'fadeIn');
    addClassToNode(overlayNode, 'fadeOut');
    lightboxMain.style.top = '-100%';
    document.body.style.overflowY = 'auto';
  }
  
  // ==================== INTERACTION END =========================
  
  // ==================== HELPER METHODS START ====================
  
  function isVisible(node) {
    return !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length);
  }

  function getImageGroupNodes() {
    var groupImagesSelector = '.' + GROUP_IMAGE_CONTAINER_CLASS + ' > .' + LIGHTBOX_GROUP_CLASS;
    return document.querySelectorAll(groupImagesSelector);
  }

  function getCurrentImageNode() {
    var currentImageSelector = '.' + CURRENT_IMAGE_CONTAINER_CLASS + ' .' + CURRENT_IMAGE_CLASS;
    return document.querySelector(currentImageSelector);
  }

  function getCurrentImageContainerNode() {
    var containerSelector = '.' + LIGHTBOX_CLASS_NAME + ' .' + CURRENT_IMAGE_CONTAINER_CLASS;
    return document.querySelector(containerSelector);
  }

  function getImageGroupContainerNode() {
    var containerSelector = '.' + LIGHTBOX_CLASS_NAME + ' .' + GROUP_IMAGE_CONTAINER_CLASS;
    return document.querySelector(containerSelector);
  }

  function getCurrentImageDescriptionNode() {
    var descriptionSelector = '.' + LIGHTBOX_CLASS_NAME + ' .' + CURRENT_IMAGE_DESCRIPTION_CLASS;
    return document.querySelector(descriptionSelector);
  }
  
  function findNextImageNodeInGroup() {
    var imageNodes = getImageGroupNodes();
    var currentImageNode = getCurrentImageNode();
    var index = -1;
    for(var i = 0; i < imageNodes.length; i++) {
      if(imageNodes[i].firstChild.getAttribute('src') === currentImageNode.getAttribute('src')) {
        index = i;
      }
    }
    if(index > -1 && imageNodes.length > index) {
      return imageNodes[index+1];
    } else {
      return undefined;
    }
  }

  function findPreviousImageNodeInGroup() {
    var imageNodes = getImageGroupNodes();
    var currentImageNode = getCurrentImageNode();
    var index = -1;
    for(var i = 0; i < imageNodes.length; i++) {
      if(imageNodes[i].firstChild.getAttribute('src') === currentImageNode.getAttribute('src')) {
        index = i;
      }
    }
    if(index > -1 && index > 0) {
      return imageNodes[index-1];
    } else {
      return undefined;
    }
  }


  // ==================== HELPER METHODS END ======================

  // ================== RENDER START ==========================
  
  // state held to tell if we should rerender or not
  var lastGroupFocused = undefined;
  
  function renderCurrentImageAndGroup(selectedNode) {
    renderInitialCurrentImage(selectedNode);
    renderGroupImages(selectedNode);
  }
  
  /**
   * Changes source on current main image in lightbox
   * and moves active class to correct image in group gallery
   * @param  {NodeElement} newImageNode newly selected current image
   * @return {undefined} ]
   */
  function makeNewImageCurrentImage(newImageNode) {
    var groupImageNodes = getImageGroupNodes();
    var currentImageNode = getCurrentImageNode();
    var descriptionNode = getCurrentImageDescriptionNode();
    var lightboxMain = document.querySelector('.' + LIGHTBOX_CLASS_NAME);
    var description = newImageNode.firstChild.getAttribute('desc');
    
    for(var i = 0; i < groupImageNodes.length; i++) {
      var node = groupImageNodes[i];
      removeClassFromNode(node, CURRENT_ACTIVE_IMAGE_IN_GROUP_CLASS);
      if(node === newImageNode) {
        addClassToNode(newImageNode, CURRENT_ACTIVE_IMAGE_IN_GROUP_CLASS);
        currentImageNode.setAttribute('src', node.firstChild.getAttribute('src'));
        descriptionNode.innerText = description;
        lightboxMain.scrollTop = 0;
      }
    }
  }
  

  // TODO: Add event listeners for next and previous images
  // to this for following methods (handleNextImageClick, handlePreviousImageClick)
  function renderInitialCurrentImage(node) {
    var imgSource = node.getAttribute('original-src');
    var description = node.getAttribute('desc');
    var currentImageNode = createElementFromTemplate(mainImageHTML, {
      currentImageClassName: CURRENT_IMAGE_CLASS,
      src: imgSource
    });
    var lightboxImageContainer = getCurrentImageContainerNode();
    var currentDescription = getCurrentImageDescriptionNode();
    var currentImage = getCurrentImageNode();
    if(currentImage) {
      lightboxImageContainer.removeChild(getCurrentImageNode());
    }
    currentDescription.innerText = description;
    lightboxImageContainer.appendChild(currentImageNode);
  }
  
  // TODO: Create reset method to reset active image if group is the same
  function renderGroupImages(node) {
    var imageGroup = node.getAttribute('data-lightbox-group');
    var imageNodesInGroup = lightboxGroups[imageGroup];

    var groupImagesContainer = getImageGroupContainerNode();
    off('.' + GROUP_IMAGE_CONTAINER_CLASS,'click','.' + LIGHTBOX_GROUP_CLASS, handleImageGroupClick);
    groupImagesContainer.innerHTML = '';

    if(imageNodesInGroup.length < 2) { return; }

    for(var i = 0; i < imageNodesInGroup.length; i++) {
      var currentNode = imageNodesInGroup[i];
      var imgSource = currentNode.getAttribute('original-src');
      var description = currentNode.getAttribute('desc');
      var currentImageNode = createElementFromTemplate(groupImagesHTML, {
        imageGroupClassName: LIGHTBOX_GROUP_CLASS,
        src: imgSource,
        desc: description
      });
      
      if(imgSource === node.getAttribute('original-src')) {
        addClassToNode(currentImageNode,CURRENT_ACTIVE_IMAGE_IN_GROUP_CLASS);
      }

      // potentially a reflow concern but modern browsers batch appends well
      groupImagesContainer.appendChild(currentImageNode);
    }
    on('.' + GROUP_IMAGE_CONTAINER_CLASS,'click','.' + LIGHTBOX_GROUP_CLASS, handleImageGroupClick);
  }

  // ================== RENDER END ============================
  global.lightbox = {
    init: initLightBoxListeners
  }

})(window);
