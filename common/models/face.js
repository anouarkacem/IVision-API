'use strict';

module.exports = function (Face) {

    // Custom Detect Face Remote Method
    Face.remoteMethod(
        'detect',
        {
            http: { path: '/detect', verb: 'post' },
            accepts: [
                { arg: 'req', type: 'object', 'http': { source: 'req' } },
                { arg: 'res', type: 'object', 'http': { source: 'res' } }
            ],
            returns: [
                {arg: 'body', type: 'file', root: true},
                {arg: 'Content-Type', type: 'string', http: { target: 'header' }}
              ]
        }
    );

    /**
     * Upload Image, save data and return processed Image
     * 
     * @param {Object} req Http Request Object contains Form Data (Img)
     * @param {Object} res Http Response Object
     * @param {Function} cb Remote Method callback function returns reponse to the client
     */

    Face.detect = function (req, res, cb) {

        const Container = Face.app.models.Container;
        let CONTAINERS_URL = '/api/containers/';

        /**
         * @param {String} Face.name Container name : Face
         * @callback function returns err or the file object
         */

        Container.upload(Face.name, req, res, function (err, fileObj) {
            if (err) {
                cb(null, err);
            } else {
                const fileInfo = fileObj.files.file[0];
                // Create/Save Image Data in MongoDB
                Face.create({
                    name: fileInfo.name,
                    type: fileInfo.type,
                    container: fileInfo.container,
                    url: CONTAINERS_URL + fileInfo.container + '/download/' + fileInfo.name
                }, function (err, obj) {
                    if (err !== null) {
                        cb(err);
                    } else {
                        // Detect Face by drawing a Recatangle
                        detect(fileInfo)
                        .then(function(response) {
                            if (response === 1) {
                                cb(null, {
                                    message: 'Face detected successfully',
                                    url: obj.url
                                });
                            }
                        })   
                    }
                });
            }
        });
    }
    
};

/**
 * Detect Face in a Rectangle
 * 
 * @param {Object} file image file to be processed
 */

function detect(file) {

    // Required Libraries
    const path = require('path');
    const cv = require('opencv');

    const filePath = path.resolve('files/'+file.container+'/'+file.name);
    
    var COLOR = [0, 255, 0];
    var thickness = 2;

    return new Promise(function(resolve, reject) {
        // Read image from the given path and return it
        cv.readImage(filePath, function(err, im) {

            if (err) reject(err);
            if (im.width() < 1 || im.height() < 1) reject('Image has no size');

            // Detect face, draw a green rectangle and save image
            im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {

            if (err) reject(err);
        
            for (var i = 0; i < faces.length; i++) {
                var face = faces[i];
                im.rectangle([face.x, face.y], [face.width, face.height], COLOR, 2);
            }

            const ims = im.save('./files/Face/Downloads/'+ file.name);
            resolve(ims);
            });
        
        });
    });
}