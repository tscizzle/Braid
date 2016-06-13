angular.module('helperService', [])

    .factory('helpers', [function() {

        return {
            softRefreshObjectList: function(oldObjs, newObjs) {
                /* Update the first argument to match the second argument.
                   Preserve the references in the first list by using the same
                   objects when possible and just overwriting their keys.
                   Identify objects by their _id. */
                var resultingObjList = [];

                var oldObjsIdMap = {};
                _.each(oldObjs, function(obj) {
                    oldObjsIdMap[obj._id] = obj;
                });

                _.each(newObjs, function(newObj) {
                    var correspondingOldObj = oldObjsIdMap[newObj._id];
                    if (correspondingOldObj) {
                        // clear out the old obj and put in the keys/values from the new obj
                        for (var key in correspondingOldObj) delete correspondingOldObj[key];
                        for (var key in newObj) correspondingOldObj[key] = newObj[key];
                        resultingObjList.push(correspondingOldObj);
                    } else {
                        resultingObjList.push(newObj);
                    };
                });

                return resultingObjList;
            }
        };

    }]);
