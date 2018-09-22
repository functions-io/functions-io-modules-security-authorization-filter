"use strict";

module.config = {
    hasPermissionModuleName: "@functions-io-modules/security.haspermission.mongo",
    hasPermissionModuleVersion: "1.*"
};

module.exports = function(message, context){
    return new Promise(async function (resolve, reject){
        try {
            if ((message.manifest) && (message.manifest.packageObj) && (message.manifest.packageObj.public)){
                resolve();
            }
            else{
                if ((context) && (context.security) && (context.security.tokenUser)){
                    let messageInvoke = {};
                    messageInvoke.roles = context.security.tokenUser.roles || [];
                    messageInvoke.permission = message.manifest.name;
                    context.invokeAsync(module.config.hasPermissionModuleName, module.config.hasPermissionModuleVersion, messageInvoke)
                        .then(function(isPermission){
                            if (isPermission){
                                resolve(isPermission);
                            }
                            else{
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
                else{
                    errObj.code = 401;
                    errObj.name = "FunctionsErrorSecurityUnauthorized";
                    errObj.data = {};
                    errObj.data.message = "Credential required";
                    reject(errObj);
                }
            }
        }
        catch (errTry) {
            reject(errTry);
        }
    });
};