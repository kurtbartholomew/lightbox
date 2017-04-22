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
      attrExtractor(templateData)
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

  global.off = off;
  global.on = on;
  global.createElementFromTemplate = createElementFromTemplate;

})(window);
