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
                    messageInvoke.roles = context.security.tokenUser.roles;
                    messageInvoke.permission = message.manifest.name;

                    context.invokeAsync(module.config.hasPermissionModuleName, module.config.hasPermissionModuleVersion, message.body)
                        .then(function(isPermission){
                            if (isPermission){
                                resolve(isPermission);
                            }
                            else{
                                let errObj = {};
                                errObj.statusCode = 401;
                                errObj.body = "Unauthorized";
                                reject(errObj);
                            }
                        },function(errInvoke){
                            reject(errInvoke);
                        });
                }
                else{
                    let errObj = {};
                    errObj.code = 403;
                    errObj.name = "FunctionsSecurityForbidden";
                    errObj.data = errVerify;
                    reject(errObj);
                }
            }
        }
        catch (errTry) {
            reject(errTry);
        }
    });
};