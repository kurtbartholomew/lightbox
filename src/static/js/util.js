(function(global){
  function on(mainSelector, eventId, watchSelectors, listenerFunc) {
    var allSelected = document.querySelectorAll(mainSelector);
    for(var i = 0; i < allSelected.length; i++) {
      allSelected[i].addEventListener(eventId, function(event) {
        var matchingChildNodes = document.querySelectorAll(mainSelector+" "+watchSelectors);
        var target = event.target;
        
        traverseUpwardsAndCallIfFound(matchingChildNodes, target, listenerFunc, allSelected[i]);
      });
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

  window.on = on;

})(window);
