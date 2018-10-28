"use strict";

module.exports.config = {
    hasPermissionModuleName: "@functions-io-modules/security.haspermission.mongo",
    hasPermissionModuleVersion: "1.*",
    whiteList : ["@functions-io-modules/security.token.generate"]
};

module.exports.process = function(data, context){
    return new Promise(async function (resolve, reject){
        try {
            if (context && context.moduleName){
                if (module.exports.config.whiteList.indexOf(context.moduleName) > -1){
                    resolve(null);
                    return;
                }

                if (context.manifestObj && context.manifestObj.packageObj && context.manifestObj.packageObj.security){
                    let securityObj = context.manifestObj.packageObj.security;
                    if (securityObj.public){
                        resolve(null);
                        return;
                    }
                    if (securityObj.internalOnly){
                        if (context.parentContext){
                            resolve(null);
                            return;
                        }
                        else{
                            let errObj = {};
                            errObj.code = 401;
                            errObj.name = "FunctionsErrorSecurityUnauthorized";
                            errObj.data = {};
                            errObj.data.message = "Internal use only";
                            errObj.data.moduleName = context.moduleName;
                            errObj.data.moduleVersion = context.moduleVersion;
                            reject(errObj);
                            return;
                        }
                    }
                }

                if (context.security && context.security.tokenUser){
                    let messageInvoke = {};
                    messageInvoke.user = {};
                    messageInvoke.user.sub = context.security.tokenUser.sub;
                    messageInvoke.user.scope = context.security.tokenUser.scope;
                    messageInvoke.roles = context.security.tokenUser.roles || null;
                    messageInvoke.permission = context.moduleName;

                    context.invokeAsync(module.exports.config.hasPermissionModuleName, module.exports.config.hasPermissionModuleVersion, messageInvoke)
                        .then(function(isPermission){
                            if (isPermission){
                                resolve(isPermission);
                            }
                            else{
                                let errObj = {};
                                errObj.code = 403;
                                errObj.name = "FunctionsErrorSecurityForbidden";
                                errObj.data = {};
                                errObj.data.message = "Forbidden";
                                errObj.data.moduleName = context.moduleName;
                                errObj.data.moduleVersion = context.moduleVersion;
                                reject(errObj);

                            }
                        },function(errInvoke){
                            reject(errInvoke);
                        });
                }
                else{
                    let errObj = {};
                    errObj.code = 401;
                    errObj.name = "FunctionsErrorSecurityUnauthorized";
                    errObj.data = {};
                    errObj.data.message = "Credential required";
                    errObj.data.moduleName = context.moduleName;
                    errObj.data.moduleVersion = context.moduleVersion;
                    reject(errObj);
                }
            }
            else{
                let errObj = {};
                errObj.code = 401;
                errObj.name = "FunctionsErrorSecurityUnauthorized";
                errObj.data = {};
                errObj.data.message = "Internal context and moduleName attribute required";
                reject(errObj);
            }
        }
        catch (errTry) {
            reject(errTry);
        }
    });
};