window.onload = function whenDocumentReady(event) {
  // constructPhotoGalleryViaAPI('.photo-gallery',
  //   'http://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC',
  //   {limit:5}
  // )
  constructPhotoGalleryViaAPI('.photo-gallery',
    'results.json',
    {},
    function initLightBox() {
      lightbox.init();
    }
  )


}
