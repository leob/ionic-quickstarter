;(function () {
  "use strict";

  appModule('app.image')

    //
    // https://github.com/apache/cordova-plugin-file
    // http://www.raymondcamden.com/2014/08/18/PhoneGapCordova-Example-Getting-File-Metadata-and-an-update-to-the-FAQ
    // http://www.html5rocks.com/en/tutorials/file/filesystem/
    // http://community.phonegap.com/nitobi/topics/dataurl_to_png
    //

    .factory('FileManager', function ($q, $log, $cordovaFile, $cordovaFileTransfer, Application) {

      var downloadFile = function(sourceURI, targetDir, targetFile) {

        var deferred = $q.defer();

        $log.debug("FileManager#downloadFile source (original): '" + sourceURI + "'");
        sourceURI = decodeURI(sourceURI);

        var w = Application.logStarted("FileManager#downloadFile source (decoded): '" + sourceURI + "'");

        var targetPath = targetDir + targetFile;
        var trustHosts = true;
        var options = {};

        $cordovaFileTransfer.download(sourceURI, targetPath, options, trustHosts).then(
          function(result) {
            Application.logFinished(w, 'finished, result: ' + JSON.stringify(result));
            deferred.resolve(result);

          }, function(error) {
            Application.logError(w, JSON.stringify(error));
            deferred.reject(error);

          }, function (progress) {
            //$timeout(function () {
            //  $scope.downloadProgress = (progress.loaded / progress.total) * 100;
            //})
          });

        return deferred.promise;
      };

      var getFileInfo = function (baseDir, filePath) {
        var deferred = $q.defer();

        $log.debug("FileManager#checkFile baseDir = '" + baseDir + "', filePath = '" + filePath + "'");

        $cordovaFile.checkFile(baseDir, filePath).then(
          function (fileEntry) {
            fileEntry.getMetadata(
              function (result) {
                deferred.resolve(result);
              },
              function (error) {
                deferred.reject(error);
              }
            );
          },
          function (error) {
            deferred.reject(error);
          }
        );

        return deferred.promise;
      };

      var removeFile = function (baseDir, filePath) {
        $log.debug("FileManager#removeFile baseDir = '" + baseDir + "', filePath = '" + filePath + "'");

        return $cordovaFile.removeFile(baseDir, filePath);
      };

      return {
        downloadFile: downloadFile,
        getFileInfo: getFileInfo,
        removeFile: removeFile
      };
    });
}());
