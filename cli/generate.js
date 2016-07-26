#!/usr/bin/env node
/* eslint-env node */

// Require external modules
var program = require('commander');

// Require local modules
var packageJson = require(__dirname + '/../package');
var generator = require(__dirname + '/../index');

// Parse command line arguments
program
  .version(packageJson.version)
  .usage('schemagen <fileName>')
  .parse(process.argv);

if (program.args.length === 0) {
  console.error("No fileName arg specified");
  program.outputHelp();
  process.exit(1);
}

if (program.args.length !== 1) {
  console.error("Too many args");
  program.outputHelp();
  process.exit(1);
}

generator.generate(program.args[0], function onGenerated(err, schema) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(JSON.stringify(schema, null, 4));
  process.exit(0);
});
