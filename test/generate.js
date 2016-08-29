/* eslint-env node, mocha */
// Play nice with chai expectations
/* eslint no-unused-expressions: 0 */

// Include external dependencies
var chai = require('chai');
//var fs = require('fs');
//var async = require('async');
//var path = require('path');
//var moment = require('moment');
//var validator = require('hypermedia-validator');
var ZSchema = require('z-schema');
var expect = chai.expect;

// Include local modules
var generator = require('../index');


// Setup
chai.config.includeStack = true;

describe('Generate', function parserSuite() {
  it("should combine car and parts schemas", function test(done) {
    var data = {
      make: "Audi",
      model: "A6",
      engine: "4 cylinder",
      wheel: {
        color: "black"
      },
      color: "gray"
    };
    generator.generate('test/data/car.yaml', function onGenerated(err, schema) {
      //log({schema});
      if (err) {
        console.log(err);
      }
      expect(schema).to.have.property('$schema');
      //log({err, schema});
      var validator = new ZSchema({});
      var valid = validator.validate(data, schema);
      var errors;
      var error;
      if (valid !== true) {
        errors = validator.getLastErrors();
        log({errors});
        error = new Error("data not valid against schema:" + JSON.stringify(errors));
        error.detail = errors;
      }
      done(error);
    });
  });

  it("should create schema for array of cars", function test(done) {
    var data = [
        {
          make: "Audi",
          model: "A6",
          engine: "6 cylinder",
          wheel: {
            color: "black"
          },
          color: "gray"
        },
        {
          make: "Scion",
          model: "xA",
          engine: "4 cylinder",
          wheel: {
            color: "silver"
          },
          color: "green"
        }
    ];
    generator.generate('test/data/cars.yaml', function onGenerated(err, schema) {
      //log({schema});
      if (err) {
        console.log(err);
      }
      expect(schema).to.have.property('$schema');
      //log({err, schema});
      var validator = new ZSchema({});
      var valid = validator.validate(data, schema);
      var errors;
      var error;
      if (valid !== true) {
        errors = validator.getLastErrors();
        log({errors});
        error = new Error("data not valid against schema:" + JSON.stringify(errors));
        error.detail = errors;
      }
      done(error);
    });
  });

  it("should work with versions", function test(done) {
    var data = {
      make: "Audi",
      model: "A6",
      engine: "4 cylinder",
      wheel: {
        color: "black"
      },
      color: "gray"
    };
    generator.generate('test/data/car-1.0.yaml', function onGenerated(err, schema) {
      //log({schema});
      if (err) {
        console.log(err);
      }
      expect(schema).to.have.property('$schema');
      //log({err, schema});
      var validator = new ZSchema({});
      var valid = validator.validate(data, schema);
      var errors;
      var error;
      if (valid !== true) {
        errors = validator.getLastErrors();
        log({errors});
        error = new Error("data not valid against schema:" + JSON.stringify(errors));
        error.detail = errors;
      }
      done(error);
    });
  });
});

/*
res: { crc: 45355,
  length: 97,
  tagId: 1,
  dateParts:
   { year: 2016,
     month: 2,
     day: 9,
     hour: 22,
     minute: 15,
     second: 24,
     milliseconds: 0,
     offset: -480 },
  dataLength: 4,
  data: <Buffer 00 00 00 00>,
  staticPayload: <Buffer >,
  localTimeOffset: -480 }
  */

function log() {
  console.dir.call(null, ...arguments, {depth: null});
}
