"use strict";

module.config = {
    hasPermissionModuleName: "@functions-io-modules/security.haspermission.mongo",
    hasPermissionModuleVersion: "1.*",
    roleAdminName: "root"
};

module.exports = function(message, context){
    return new Promise(async function (resolve, reject){
        try {
            if ((message.manifest) && (message.manifest.packageObj) && (message.manifest.packageObj.public)){
                resolve(true);
            }
            else{
                try {
                    if ((context) && (context.security) && (context.security.tokenUser)){
                        let messageInvoke = {};
                        messageInvoke.roles = context.security.tokenUser.roles || [];
                        messageInvoke.permission = message.manifest.name;

                        if (messageInvoke.roles.indexOf(module.config.roleAdminName) >= 0){
                            resolve(true);
                        }
                        else{
                            context.invokeAsync(module.config.hasPermissionModuleName, module.config.hasPermissionModuleVersion, messageInvoke)
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
        catch (errTry) {
            reject(errTry);
        }
    });
};