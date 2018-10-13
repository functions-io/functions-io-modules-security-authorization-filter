"use strict";

const core = require("functions-io-core");
const invokeFactory = core.buildInvokeFactory();
const context = invokeFactory.buildContext();

const moduleTest = require("../");

var message1 = {};
message1.manifest = {};
message1.manifest.name = "@functions-io-labs/math.sum";

context.security = {};
context.security.tokenUser = {};
context.security.tokenUser.roles = ["papel1", "papel2"];
context.manifestObj = {};
context.manifestObj.packageObj = {};
context.manifestObj.packageObj.public = false;

moduleTest.process(message1, context).then(function(result){
    console.log("sucess! ", result);
}, function(err){
    console.log("err! ", err);
})