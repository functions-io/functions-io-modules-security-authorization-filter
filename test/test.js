"use strict";

const core = require("functions-io-core");
const invokeFactory = core.buildInvokeFactory();
const context = invokeFactory.buildContext();

const assert = require("assert");
const moduleTest = require("../");

var message1 = {};
message1.username = "admin";
message1.password = "123";

moduleTest(message1, context).then(function(result){
    assert.strictEqual(typeof(result), "string");
}, function(err){
    assert.strictEqual(err, null);
})