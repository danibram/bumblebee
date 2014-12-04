exports.setValueOfNestedObjectByPath = function (obj, path, value) {
    var schema = obj;  // a moving reference to internal objects within obj
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) schema[elem] = {}
        schema = schema[elem];
    }

    schema[pList[len-1]] = value;
};

exports.getValueOfNestedObjectByPath = function (obj, path) {
    var schema = obj;  // a moving reference to internal objects within obj
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) {
            schema[elem] = {}
        }
        schema = schema[elem];
    }
    var value = null;
    if (schema[pList[len-1]]){
        value = schema[pList[len-1]];
    }
    return value;
};