(function(global) {
  // if only caring about HTML5, could use template element instead
  // could also put this in a display:none textarea on dom
  var templateHTML = '<a href="#" original-src={originalSrc} data-lightbox data-lightbox-group={groupId}>'+
                       '<img src={src} alt={alttext} />' +
                     '</a>';

  // ================= Photo Gallery Construction Functions ============ 

  function constructPhotoGalleryViaAPI(pageAnchorSelector, url, options, callback) {
    try {
      retrieveAPIResults(url, options, function handleResults(response){
        if(response.results) {
          constructImageGallery(pageAnchorSelector, response.results);
        }
        // TODO: Robustly handle presence of response.error
        callback();
      });
    } catch(e) {
      // TODO: Log output of failure to log aggregator
      console.log(e);
    }
  }

  function constructImageGallery(pageAnchorSelector, results) {
    var rootElement = document.createElement('div');

    if(results === undefined) {
      rootElement.appendChild(document.createTextNode('Sorry! Didn\'t work!'));
    } else {
      results.groupId = Math.floor(Math.random() * 100);
      rootElement = document.querySelector(pageAnchorSelector);
      if(rootElement) {
        for(var i = 0; i < results.data.length; i++) {
          rootElement.appendChild(createPhotoGalleryElement(results.data[i]));
        }
      } else {
        throw Error("selector for placement of gallery was invalid");
      }
    }
  }
  
  function createPhotoGalleryElement(resultData) {
    return window.createElementFromTemplate(templateHTML, resultData, extractGiphyAttrs);
  }

  function extractGiphyAttrs(json) {
    return {
      originalSrc: json.images.original.url || "",
      src: json.images.fixed_height_small.url || "",
      alttext: json.slug || "",
      title: json.slug || "",
      groupId: json.groupId || 1,
    }
  }
  
  global.constructPhotoGalleryViaAPI = constructPhotoGalleryViaAPI;

})(window);
