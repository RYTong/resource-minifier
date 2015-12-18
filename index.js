/**
 * Minify EMP resource dev files.
 * @module resource-minifier
 * @type {object}
 */

var fs = require('fs');
var del = require('del');
var path = require('path');
var Zip = require('adm-zip');
var _ = require('underscore');
var mkdir = require('mkdir-p');
var css = require('./lib/css-parser');
var iterateFiles = require('iterate-files');


var minifier = {};
minifier.stat = {
  _css : 0,
  css : 0,
  _lua : 0,
  lua : 0,
  html : 0,
  _html : 0,
  n: 0
};


/**
 * Minify files in directory or ZIP.
 * @param {string} from - The source directory/zip file path.
 * @param {string} to - The dest directory path if provided.
 */
minifier.minify = function(from, to) {
  from = from && path.resolve(from);
  if(fs.lstatSync(from).isDirectory()) {
    to = to && path.resolve(to) || (from+'-min');
    console.log('minify', from, 'to', to);
    minifyDir(from, to);
  } else {
    to = to && path.join(path.resolve(to), path.basename(from));
    console.log('minify', from, 'to', to||'MEMORY');
    if (path.extname(from) === '.zip') {
      minifyZip(from, to);
    } else {
      throw('only directory or .zip file supported!');
    }
  }
}

/** Minify CSS data */
minifier.minifyCSS = function(data) {
  try {
    minifier.stat._css += data.length;
    var out = css.stringify(css.parse(data));
    minifier.stat.css += out.length;
    return out;
  } catch(e) {
    throw('['+e.name+'] '+e.line+'行'+e.column+'列附近：' + e.message);
  }
}

/** Minify LUA data */
minifier.minifyLUA = function(data) {
  minifier.stat._lua += data.length;
  data = _.map(data.split('\n'), function(s) {
    s = s.trim();
    if (this.comment) {
      if (/\]\]/.test(s)){
        this.comment = false;
      }
      return '';
    } else {
      if (/^--.*/.test(s)) {
        if (/^---*\[\[/.test(s) && !/\]\]/.test(s)) this.comment = true;
        return '';
      } else return s;
    }
    return s;
  }, {});
  data = _.filter(data, function(s) { return !!s; });
  minifier.stat.n += data.length;
  var out = data.join('\n');
  minifier.stat.lua += out.length;
  return out;
}

/** Minify HTML data */
minifier.minifyHTML = function(data) {
  minifier.stat._html += data.length;
  data = _.map(data.split('\n'), function(s) {
    s = s.trim();
    if (this.hcomment) {
      if (/-->/.test(s)){
        this.hcomment = false;
      }
      return '';
    } else if (this.lcomment) {
      if (/\]\]/.test(s)){
        this.lcomment = false;
      }
      return '';
    } else {
      if (/^--.*/.test(s)) { // in lua comment
        if (/^---*\[\[/.test(s) && !/\]\]/.test(s)) this.lcomment = true;
        return '';
      } else if (/^<!--.*/.test(s)) { // in html comment
        if (!/-->/.test(s)) this.hcomment = true; // multi-line html comment
        return '';
      }
       return s;
    }
    return s;
  }, {});
  data = _.filter(data, function(s) { return !!s; });
  minifier.stat.n += data.length;
  var out = data.join('\n');
  minifier.stat.html += out.length;
  return out;
}

module.exports= minifier;



/** Internal functions */

/* Minify directory */
function minifyDir(from, to) {
  // init `to` directory
  del.sync(to, {force:true});
  mkdir(to);

  // process
  iterateFiles(from, function (filename) {
    var extname = filename.match('\.[a-zA-Z0-9]*$')[0];
    var basename = path.basename(filename);
    var destdir = path.join(to, path.dirname(filename.replace(from, '')));
    var destname = path.join(destdir, basename);

    mkdir(destdir, function(err) {
      if (err && err.code !== 'EEXIST') {
        console.log('[ERROR] mkdir:', destdir, ':', err);
      } else {
        switch(extname) {
          case '.css':
            processCSS(filename, destname);
            break;
          case '.lua':
            processLUA(filename, destname);
            break;
          case '.div':
          case '.html':
          case '.xhtml':
            processHTML(filename, destname);
            break;
          default:
            fs.createReadStream(filename).pipe(fs.createWriteStream(destname));
            break;
        }
      }
    });
  }, function (err) {
    if (err) {
      console.log('sorry, fatal error found:', err)
    }
  });
}

function minifyZip(from, to) {
  var zip = new Zip(from);
  var zipout = new Zip();

  _.each(zip.getEntries(), function(entry) {
    if (!entry.isDirectory) {
      var extname = entry.name.match('\.[a-zA-Z0-9]*$')[0];
      switch(extname) {
        case '.css':
          var data = entry.getData().toString('utf8');
          data = minifier.minifyCSS(data);
          zipout.addFile(entry.entryName, new Buffer(data));
          break;
        case '.lua':
          var data = entry.getData().toString('utf8');
          data = minifier.minifyLUA(data);
          zipout.addFile(entry.entryName, new Buffer(data));
          break;
        default:
          zipout.addFile(entry.entryName, entry.getData());
          break;
      }
    }
  });

  if (to) {
    del.sync(to, {force:true});
    mkdir(path.dirname(to));
    zipout.writeZip(to);
  } else {
    return zipout.toBuffer();
  }
}

function processCSS(srcfile, destfile) {
  fs.readFile(srcfile, 'utf8', function(err, data) {
    if (err) throw(err);
    var minified = minifier.minifyCSS(data);
    fs.writeFile(destfile, minified, 'utf8', function(err) {
      if (err) throw(err);
    });
  });
}

function processLUA(srcfile, destfile) {
  fs.readFile(srcfile, 'utf8', function(err, data) {
    if (err) throw(err);
    data = minifier.minifyLUA(data);
    fs.writeFile(destfile, data, 'utf8', function(err) {
      if (err) throw(err);
    });
  });
}

function processHTML(srcfile, destfile) {
  fs.readFile(srcfile, 'utf8', function(err, data) {
    if (err) throw(err);
    data = minifier.minifyHTML(data);
    fs.writeFile(destfile, data, 'utf8', function(err) {
      if (err) throw(err);
    });
  });
}
