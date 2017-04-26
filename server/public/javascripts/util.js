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
