'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assign = require('object-assign');
var fs = require('fs');

var JsxstylePlugin = function () {
  function JsxstylePlugin() {
    _classCallCheck(this, JsxstylePlugin);
  }

  _createClass(JsxstylePlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var writtenFiles = {};
      compiler.jsxstylePluginEnabled = true;

      compiler.resolvers.normal.plugin('file', function (request, callback) {
        var generatedCss = compiler.jsxstyle && compiler.jsxstyle[request.request];

        if (generatedCss && !writtenFiles[request.request]) {
          // TODO: This is so unbelievably bad, but I believe webpack's path
          // resolving is broken because it resolves loaders relative to the
          // resolved path of the file, not the request.
          fs.writeFile(request.request, generatedCss, function (err) {
            if (err) {
              return callback(err);
            }
            writtenFiles[request.request] = true;

            return callback();
          });
        } else {
          return callback();
        }
      });

      compiler.plugin('done', function () {
        for (var path in writtenFiles) {
          fs.unlinkSync(path);
        }
      });
    }
  }]);

  return JsxstylePlugin;
}();

module.exports = JsxstylePlugin;