"use strict";

if (typeof Uint16Array == "undefined"){
    GLOBAL.Uint16Array = function(length){
        Array.call(this, length);
        for(var i = 0; i < length; ++i)
            this[i] = 0;
    };
}

function Class(){}
Class.extend = function extend(methods){
        function Type(){
            for(var m in methods)
                this[m] = methods[m];
        }
        Type.prototype = this.prototype;

        var result = methods.init;
        result.prototype = new Type(); // inherit this.prototype
        result.prototype.constructor = result; // to see constructor name in diagnostic
        
        result.extend = extend;
        return result;
    };

var impl = {
    extend: Class.extend,
    typeGuard: function(from, to){
        if (!from)
            return from;
        if (!(from instanceof to)){
            var fromStr;
            var toStr;
            
            if (from && from.constructor && from.constructor.name)
                fromStr = "" + from.constructor.name;
            else
                fromStr = "" + from;
            
            if (to.name)
                toStr = "" + to.name;
            else
                toStr = "" + to;
            
            var msg = "typeguard assertion failed";
            if (fromStr || toStr)               
                msg += ": '" + fromStr + "' is not an extension of '" + toStr + "'";
            throw new Error(msg);
        }
        return from;
    },
    makeArray: function(/*dimensions, initializer*/){
        var forward = Array.prototype.slice.call(arguments);
        var result = new Array(forward.shift());
        var i;
        if (forward.length == 1){
            var init = forward[0];
            if (typeof init == "function")
                for(i = 0; i < result.length; ++i)
                    result[i] = init();
            else
                for(i = 0; i < result.length; ++i)
                    result[i] = init;
        }
        else
            for(i = 0; i < result.length; ++i)
                result[i] = this.makeArray.apply(this, forward);
        return result;
    },
    __makeCharArray: function(length){
        var result = new Uint16Array(length);
        result.charCodeAt = function(i){return this[i];};
        return result;
    },
    makeCharArray: function(/*dimensions*/){
        var forward = Array.prototype.slice.call(arguments);
        var length = forward.pop();

        if (!forward.length)
            return this.__makeCharArray(length);

        function makeArray(){
            var forward = Array.prototype.slice.call(arguments);
            var result = new Array(forward.shift());
            var i;
            if (forward.length == 1){
                var init = forward[0];
                for(i = 0; i < result.length; ++i)
                    result[i] = init();
            }
            else
                for(i = 0; i < result.length; ++i)
                    result[i] = makeArray.apply(undefined, forward);
            return result;
        }

        forward.push(this.__makeCharArray.bind(undefined, length));
        return makeArray.apply(undefined, forward);
    },
    makeSet: function(/*...*/){
        var result = 0;
        
        function checkBit(b){
            if (b < 0 || b > 31)
                throw new Error("integers between 0 and 31 expected, got " + b);
        }

        function setBit(b){
            checkBit(b);
            result |= 1 << b;
        }
        
        for(var i = 0; i < arguments.length; ++i){
            var b = arguments[i];
            if (b instanceof Array){
                var from = b[0];
                var to = b[1];
                if (from < to)
                    throw new Error("invalid SET diapason: " + from + ".." + to);
                for(var bi = from; bi <= to; ++bi)
                    setBit(bi);
            }
            else
                setBit(b);
        }
        return result;
    },
    makeRef: function(obj, prop){
        return {set: function(v){ obj[prop] = v; },
                get: function(){ return obj[prop]; }};
    },
    setInclL: function(l, r){return (l & r) == l;},
    setInclR: function(l, r){return (l & r) == r;},
    assignArrayFromString: function(a, s){
        var i;
        for(i = 0; i < s.length; ++i)
            a[i] = s.charCodeAt(i);
        for(i = s.length; i < a.length; ++i)
            a[i] = 0;
    },
    strCmp: function(s1, s2){
        var cmp = 0;
        var i = 0;
        while (!cmp && i < s1.length && i < s2.length){
            cmp = s1.charCodeAt(i) - s2.charCodeAt(i);
            ++i;
        }
        return cmp ? cmp : s1.length - s2.length;
    },
    copy: function(from, to){
        for(var prop in to){
            if (to.hasOwnProperty(prop)){
                var v = from[prop];
                if (v !== null && typeof v == "object")
                    this.copy(v, to[prop]);
                else
                    to[prop] = v;
            }
        }
    },
    clone: function(from){
        var to;
        var len;
        var i;
        var Ctr = from.constructor;
        if (Ctr == Uint16Array){
            len = from.length;
            to = this.__makeCharArray(len);
            for(i = 0; i < len; ++i)
                to[i] = from[i];
        }
        else {
            to = new Ctr();
            if (Ctr == Array)
                len = from.length;
                if (len){
                    if (typeof from[0] != "object")
                        for(i = 0; i < len; ++i)
                            to[i] = from[i];
                    else
                        for(i = 0; i < len; ++i){
                            var o = from[i];
                            if (o !== null)
                                to[i] = this.clone(o);
                        }
                }
            else
                this.copy(from, to);
        }
        return to;
    },
    assert: function(condition){
        if (!condition)
            throw new Error("assertion failed");
    }
};

exports.Class = Class;
exports.dependencies = { 
    "clone": ["copy", "__makeCharArray"] ,
    "makeCharArray": ["__makeCharArray"]
};

for(var e in impl)
    exports[e] = impl[e];
