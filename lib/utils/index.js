'use strict';

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

        if( !schema.hasOwnProperty(elem) ) {
            schema[elem] = {};
        }
        schema = schema[elem];
    }

    var value = null;
    if (schema.hasOwnProperty(pList[len-1]) ){
        value = schema[pList[len-1]];
    }
    return value;
};

exports.toBool = function(s) {
    var b;

    if (typeof(s) === 'string') {
        switch(s.toLowerCase()) {
            case 't':
            case 'true':
            case '1':
            case 'yes':
            case 'y':
                b = true;
                break;
            case 'f':
            case 'false':
            case '0':
            case 'no':
            case 'n':
            case '':
                b = false;
                break;
        }
    } else if (typeof(s) == 'number') {
        b = Boolean(s);
    } else if (typeof(s) == 'boolean') {
        b = s;
    }

    return b;
};