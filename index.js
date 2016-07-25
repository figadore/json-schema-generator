/* eslint-env node */
/* eslint no-sync: 0 */
"use strict";

// Include external dependencies
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var clone = require('clone');

// Include local modules

// Setup

/**
 * Generate a schema from a .yaml file
 *
 * References are resolved using the component before the '#' in a '$ref'
 * property, using that component as the file name, searching the directory of
 * the .yaml file generating the schema. Subschemas definitions are compiled
 * into the top level schema, preventing circular references and nested and
 * duplicated schemas
 */
class Generator {
  /**
   * Constructor
   *
   * @param {object}      schema         JSON schema object
   * @param {object|null} topLevelSchema Schema to compile references into
   * @param {string}      schemaDir      Directory to find schema files in
   */
  constructor(schema, topLevelSchema, schemaDir) {
    this.schemaDir = schemaDir;
    // Keep a list of references and their replacements
    this.references = {};
    // Clone it so the original object isn't modified (useful if used elsewhere)
    this.compiled = clone(schema);
    // If no top level schema specified, this is the top level
    this.topLevelSchema = this.compiled;
    if (topLevelSchema) {
      this.topLevelSchema = topLevelSchema;
    }
    this.references[schema.id] = '#';
    // preserve uncompiled schema?
    this.original = schema;
  }

  resolveReferences(callback) {
    recursiveMap(this.compiled, [], (stack, key, value) => {
      // 'this' bound to most recently called context. arrow function
      // preserves it for when called outside the class
      this.compile(stack, key, value);
    });

    callback(null, this.compiled);
  }

  /**
   * Resolve references to external schemas and compile them into the top
   * level schema
   *
   * @param {array}  stack
   * @param {string} key
   * @param {mixed}  value
   */
  compile(stack, key, value) {
    if (key === "$ref") {
      let reference = parseReference(value);
      if (reference.object === '#') {
        // references self
        return;
      } else if (this.references[reference.object]) {
        // Reference is already compiled into main schema
          // Replace reference to external schema with one to local definition
        this.replaceReference(stack, reference);
      } else {
        // Fetch reference and compile into main schema
        let data = fs.readFileSync(path.join(this.schemaDir, reference.object + ".yaml"));
        let schema = yaml.safeLoad(data);

        //this.compiled.definitions[reference.object] = schema; //TODO replace with compiled schema
        let generator = new Generator(schema, this.compiled, this.schemaDir);
        generator.resolveReferences((err, compiled) => {
          // Add compiled schema to definitions of top level schema
          this.topLevelSchema.definitions[reference.object] = compiled;
          // Store new path in list of resolved references
          this.references[schema.id] = "#/definitions/" + schema.id;
          // Replace reference to external schema with one to local definition
          this.replaceReference(stack, reference);
        });
      }
    }
  }

  /**
   * Replace string reference to external schema with one pointing to local definition
   *
   * @param {string[]} stack     Properties path to reference
   * @param {object}   reference Parsed reference
   */
  replaceReference(stack, reference) {
    let updatable = this.compiled;
    for (let i = 0; i < stack.length; i++) {
      updatable = updatable[stack[i]];
    }
    updatable.$ref = "#/definitions/" + reference.object;
    if (reference.path) {
      updatable.$ref += reference.path;
    }
  }
}

/**
 * Send each key/value pair to a function
 *
 * @param {object}   object Object to recurse
 * @param {array}    stack  Path to current node in object
 * @param {function} fn     Function to send key/values to
 */
function recursiveMap(object, stack, fn) {
  for (let i in object) {
    if (object.hasOwnProperty(i)) {
      if (typeof object[i] === "object") {
        let newStack = clone(stack);
        newStack.push(i);
        recursiveMap(object[i], newStack, fn);
      } else {
        fn(stack, i, object[i]);
      }
    }
  }
}

/**
 * Parse a reference into component parts and properties
 *
 * @param {string} value
 *
 * @returns {object}
 */
function parseReference(value) {
  var parsed = {
    original: value
  };
  var parts = value.split('#');
  parsed.parts = parts;
  if (parts[0] === "" && parts.length === 2) {
    // Reference self
    parsed.object = "#";
    parsed.path = parts[1];
  } else if (parts.length === 1) {
    // Reference external top level object
    parsed.object = parts[0];
  } else if (parts.length === 2) {
    // Reference external object's sub-object
    parsed.object = parts[0];
    parsed.path = parts[1];
  } else {
    // More than one '#' found. This shouldn't happen if yaml files are valid
    throw new Error("More than one '#' found in reference value: " + value);
  }
  return parsed;
}

function log() {
  console.dir.call(null, ...arguments, {depth: null});
}

// Public
module.exports = {
  generate: function generate(fileName, callback) {
    fs.readFile(fileName, function onFileRead(err, data) {
      if (err) {
        return callback(err);
      }
      var schema = yaml.safeLoad(data);
      var schemaDir = path.dirname(fileName);
      var generator = new Generator(schema, null, schemaDir);
      return generator.resolveReferences(callback);
    });
  }
};
