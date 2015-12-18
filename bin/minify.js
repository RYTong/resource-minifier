#!/usr/bin/env node
var has = require('underscore').has;
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var minifier = require('../index');
var c = process.cwd();

if (has(argv, 'f') || has(argv, 'from')) {
  var from = argv.f || argv.from;
  var to = argv.t || argv.to;

  from = path.parse(from).root ? from : path.join(c, from);
  to = to && (path.parse(to).root ? to : path.join(c, to));
  minifier.minify(from, to);
} else if (has(argv, 'v')|| has(argv, 'version')) {
  console.log(require('../package.json').version);
} else {
  console.log(
    "EMP resource dev file minifier.\n",
    "-h --help  Display help information.\n",
    "-f --from=[src]  Speicify source zip file or directory to be minified.\n",
    "-t --to=[dest]  Optional, speicify target directory where minified output in.\n",
    "-v --version  Display current version."
  );
}
