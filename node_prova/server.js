var  express = require("express");
var  browserify  = require('browserify-middleware');
var  babelify = require("babelify");
var  browserSync = require('browser-sync');
var  app = express();
var  port = process.env.PORT || 8080;

browserify.settings({
  transform: [babelify.configure({
  })],
  presets: ["es2015", "react"],  
  extensions: ['.js', '.jsx'],
  grep: /\.jsx?$/
});
