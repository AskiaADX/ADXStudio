"use strict";

const Jasmine = require("jasmine");

const jasmine = new Jasmine();

jasmine.loadConfig({
  spec_dir: "spec",
  spec_files: ["**/*[sS]pec.cjs"],
  random: false,
  stopSpecOnExpectationFailure: false
});

jasmine.execute();
