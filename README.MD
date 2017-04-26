# Lightbox 

Lightbox is a javascript utility that uses class based attributes to create a lightbox gallery of images.

## Usage

Include lightbox.css in the head of your html like below:

```
<link rel="stylesheet" href="lightbox.css">
```

and the javascript files util.js and lightbox.js at the end of the body element like below:

```
<script src="util.js"></script>
<script src="lightbox.js"></script>

To access your images in a lightbox, initialize the images using the following html attributes:

```
<a href="#" desc="" original-src="" data-lightbox data-lightbox-group="4">
  <img src="" alt="" />
</a>
```

* **desc**: The description displayed under the image within the lightbox.
* **original-src**: (**Required**) The image (typically full-size) displayed in the lightbox.
* **data-lightbox**: (**Required**) Utilized by js to initialize lightbox.
* **data-lightbox-group**: If specified, allows navigate only within specified groups. Default behavior is to put all images in a different group.
* **src**: (**Required**) The source of the image shown as a thumbnail.
* **alt**: Alternate text for the image. Include this for accessibility.

Finally, call the lightbox init method once the dom has been loaded:
```
window.onload = function whenDocumentReady(event) {
  lightbox.init();
}
```
