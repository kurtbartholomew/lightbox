(function(global) {
  // if only caring about HTML5, could use template element instead
  // could also put this in a display:none textarea on dom
  var templateHTML = '<a href="#" data-lightbox data-lightbox-group={groupId}>'+
                       '<img src={src} alt={alttext} />' +
                     '</a>'
  
  // ======================== XHR FUNCTIONS ===============================
  // TODO: Modularize and place elsewhere
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
      src: json.images.fixed_height_small.url || "",
      alttext: json.slug || "",
      title: json.slug || "",
      groupId: json.groupId || 1
    }
  }
  
  global.constructPhotoGalleryViaAPI = constructPhotoGalleryViaAPI;

})(window);
