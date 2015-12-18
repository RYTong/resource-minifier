var minifier = require('./index');

var FROM = '/Users/kingbo/src/rytongwork/ebank-boc/public/www/resource_dev.0';
// var TO = '/Users/kingbo/src/rytongwork/ebank-boc/public/www/resource_dev';
var ZIP = '/Users/kingbo/src/rytongwork/ebank-boc/public/www/resource_dev.0.zip';

minifier.minify(FROM, '/Users/kingbo/src/rytongwork/ebank-boc/public/www/resource_dev');

process.on('exit', function() {
  console.log('--------stat--------');
  var beforeCSS = minifier.stat._css/1024;
  var afterCSS = minifier.stat.css/1024;
  var ratioCSS = minifier.stat.css/minifier.stat._css;
  console.log('CSS:', beforeCSS+'KB ->', afterCSS+'KB  ratio:', ratioCSS);
  var beforeLUA = minifier.stat._lua/1024;
  var afterLUA = minifier.stat.lua/1024;
  var ratioLUA = minifier.stat.lua/minifier.stat._lua;
  console.log('LUA:', beforeLUA+'KB ->', afterLUA+'KB  ratio:', ratioLUA);
  var beforeHTML = minifier.stat._html/1024;
  var afterHTML = minifier.stat.html/1024;
  var ratioHTML = minifier.stat.html/minifier.stat._html;
  console.log('HTML:', beforeHTML+'KB ->', afterHTML+'KB  ratio:', ratioHTML);
  var before = (minifier.stat._html+minifier.stat._css+minifier.stat._lua)/1024;
  var after = (minifier.stat.html+minifier.stat.css+minifier.stat.lua)/1024;
  var ratio = after/before;
  console.log('ALL:', before+'KB ->', after+'KB  ratio:', ratio);
  console.log('n:', (minifier.stat.n/1024)+'KB');
});
