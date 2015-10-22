;(function() {
"use strict";

appModule('app.image')

  //
  // http://devdactic.com/complete-image-guide-ionic
  // https://github.com/iblank/ngImgCrop
  // http://stackoverflow.com/questions/6752366/resizing-photo-on-a-canvas-without-losing-the-aspect-ratio
  // http://forum.ionicframework.com/t/impossible-to-resize-image-taken-by-camera/22588/2
  // http://www.ngroutes.com/questions/1b80967/can-you-save-base64-data-as-a-file-with-ngcordova.html
  // http://stackoverflow.com/questions/9902797/phone-gap-camera-orientation
  // http://simonmacdonald.blogspot.ca/2012/07/change-to-camera-code-in-phonegap-190.html  ["correctOrientation"]
  //

  .factory('ImageService', function($cordovaCamera, $q, $log) {

    function optionsForType(type, quality, targetSize) {
      var source;
      switch (type) {
        case 0:
          source = Camera.PictureSourceType.CAMERA;
          break;
        case 1:
          source = Camera.PictureSourceType.PHOTOLIBRARY;
          break;
      }
      return {
        quality: quality, // e.g. 75,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: source,
        allowEdit: false, //true,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: true,  //false,
        targetWidth: targetSize,  // e.g. 500,
        targetHeight: targetSize, // e.g. 500,
        correctOrientation: true  // SEE: simonmacdonald.blogspot.ca/2012/07/change-to-camera-code-in-phonegap-190.html
      };
    }

    var getPicture = function (type, quality, targetSize) {
      return $q(function (resolve, reject) {
        var options = optionsForType(type, quality, targetSize);

        $cordovaCamera.getPicture(options).then(function (imageUrl) {

          $log.debug('ImageService#getPicture, $cordovaCamera.getPicture imageUrl = ' + imageUrl);

          resolve(imageUrl);

        }, function (error) {
          $log.debug('ImageService#getPicture, $cordovaCamera.getPicture error = ' + JSON.stringify(error));

          reject(error);
        });

      });
    };

    var cleanup = function () {
      // Cleanup temp files from the camera's picture taking process. Only needed for Camera.DestinationType.FILE_URI.
      // Returns a promise the result of which is probably ignored.
      return $cordovaCamera.cleanup();
    };

    return {
      getPicture: getPicture,
      cleanup: cleanup
    };
  });
}());
