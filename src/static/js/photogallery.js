(function(global) {
  function retrieveAPIResults(apiUrl, options) {
    var request = new XMLHttpRequest();
    
    options = options || {};
    apiUrl = populateAdditionalOptions(apiUrl, options)

    request.onreadystatechange = responseHandler;
    request.open('GET', apiUrl);
    request.send();
  }
  
  // potentially problematic since it makes the an assumption about the presence of request
  function responseHandler() {
    if(request && request.readyState === XMLHttpRequest.DONE) {
      if(request.status === 200) {
        try {
          var jsonResponse = JSON.parse(request.responseText);
        } catch(e) {
          throw Error("JSON response from API was malformed");
        }
        return JSON.parse(request.responseText);
      } else {
        throw Error("Unable to complete api request. An error has occurred. " + request.statusText);
      }
    }
  }

  function populateAdditionalOptions(apiUrl, options) {
    var optionString = "";
    for(var optionName in options) {
      optionString += "&" + optionName + "=" + options[optionName];
    }
    return apiUrl + optionString;
  }

  function constructPhotoGalleryViaAPI(pageAnchorSelector, url, options) {
    var results = retrieveAPIResults(url, options);
    constructImageGallery(pageAnchorSelector, apiResults);
  }

  function constructImageGallery(results) {
    
  }
  
  global.constructPhotoGalleryViaAPI = constructPhotoGalleryViaAPI;

})(window);
