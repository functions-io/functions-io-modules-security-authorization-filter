"use strict";

module.exports.config = {
    hasPermissionModuleName: "@functions-io-modules/security.haspermission.mongo",
    hasPermissionModuleVersion: "1.*",
    roleAdminName: "root"
};

module.exports.process = function(data, context){
    return new Promise(async function (resolve, reject){
        try {
            if (context && context.manifestObj){
                if (context.manifestObj.packageObj && context.manifestObj.packageObj.public){
                    resolve(true);
                }
                else{
                    try {
                        if (context.security && context.security.tokenUser){
                            let messageInvoke = {};
                            messageInvoke.roles = context.security.tokenUser.roles || [];
                            messageInvoke.permission = context.manifestObj.moduleName;
    
                            if (messageInvoke.roles.indexOf(module.exports.config.roleAdminName) >= 0){
                                resolve(true);
                            }
                            else{
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
                                            reject(errObj);
            
                                        }
                                    },function(errInvoke){
                                        reject(errInvoke);
                                    });
                            }
                        }
                        else{
                            let errObj = {};
                            errObj.code = 401;
                            errObj.name = "FunctionsErrorSecurityUnauthorized";
                            errObj.data = {};
                            errObj.data.message = "Credential required";
                            reject(errObj);
                        }                    
                    }
                    catch (errTry2) {
                        reject(errTry2);
                    }
                }
            }
            else{
                let errObj = {};
                errObj.code = 401;
                errObj.name = "FunctionsErrorSecurityUnauthorized";
                errObj.data = {};
                errObj.data.message = "Internal context and manifest required";
                reject(errObj);
            }
        }
        catch (errTry) {
            reject(errTry);
        }
    });
};