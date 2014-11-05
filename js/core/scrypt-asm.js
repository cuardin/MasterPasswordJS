// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    var data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
if (!Module['thisProgram']) {
  Module['thisProgram'] = './this.program';
}

// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in: 
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at: 
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  STACK_ALIGN: 16,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      // Module is the only 'upvar', which we provide directly. We also provide FS for legacy support.
      var evalled = eval('(function(Module, FS) { return function(' + args.join(',') + '){ ' + source + ' } })')(Module, typeof FS !== 'undefined' ? FS : null);
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func]) {
      sigCache[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return sigCache[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          (((codePoint - 0x10000) / 0x400)|0) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+15)&-16);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+15)&-16); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+15)&-16); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 16))*(quantum ? quantum : 16); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    try {
      func = eval('_' + ident); // explicit lookup
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var stack = 0;
  var JSfuncs = {
    'stackSave' : function() {
      stack = Runtime.stackSave();
    },
    'stackRestore' : function() {
      Runtime.stackRestore(stack);
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        ret = Runtime.stackAlloc((str.length << 2) + 1);
        writeStringToMemory(str, ret);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface. 
  ccall = function ccallFunc(ident, returnType, argTypes, args) {
    var func = getCFunc(ident);
    var cArgs = [];
    assert(returnType !== 'array', 'Return type should not be "array".');
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) JSfuncs['stackRestore']();
    return ret;
  }

  var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }
  var JSsource = {};
  for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
      // Elements of toCsource are arrays of three items:
      // the code, and the return value
      JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
  }

  
  cwrap = function cwrap(ident, returnType, argTypes) {
    argTypes = argTypes || [];
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      funcstr += JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=' + convertCode.returnValue + ';';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    if (!numericArgs) {
      // If we had a stack, restore it
      funcstr += JSsource['stackRestore'].body + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module["cwrap"] = cwrap;
Module["ccall"] = ccall;


function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;


function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;


function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;


function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;


function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var hasLibcxxabi = !!Module['___cxa_demangle'];
  if (hasLibcxxabi) {
    try {
      var buf = _malloc(func.length);
      writeStringToMemory(func.substr(1), buf);
      var status = _malloc(4);
      var ret = Module['___cxa_demangle'](buf, 0, 0, status);
      if (getValue(status, 'i32') === 0 && ret) {
        return Pointer_stringify(ret);
      }
      // otherwise, libcxxabi failed, we can try ours which may return a partial result
    } catch(e) {
      // failure when using libcxxabi, we can try ours which may return a partial result
    } finally {
      if (buf) _free(buf);
      if (status) _free(status);
      if (ret) _free(ret);
    }
  }
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  var final = func;
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    final = parse();
  } catch(e) {
    final += '?';
  }
  if (final.indexOf('?') >= 0 && !hasLibcxxabi) {
    Runtime.warnOnce('warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  }
  return final;
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  return demangleAll(jsStackTrace());
}
Module['stackTrace'] = stackTrace;

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}


var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 134217728;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 64*1024;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module.printErr('Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module["noExitRuntime"] = true or build with -s NO_EXIT_RUNTIME=1');
  }
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools


function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))>>0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))>>0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(563);
  /* global initializers */ __ATINIT__.push();
  

/* memory initializer */ allocate([128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


   
  Module["_i64Subtract"] = _i64Subtract;

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: {
          if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

   
  Module["_i64Add"] = _i64Add;

   
  Module["_memset"] = _memset;

  function ___errno_location() {
      return ___errno_state;
    }

   
  Module["_bitshift64Shl"] = _bitshift64Shl;

  function _abort() {
      Module['abort']();
    }

  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.buffer.byteLength which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },getFileDataAsRegularArray:function (node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr; // Returns a copy of the original data.
        }
        return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
      },getFileDataAsTypedArray:function (node) {
        if (node.contents && node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function (node, newCapacity) {
  
        // If we are asked to expand the size of a file that already exists, revert to using a standard JS array to store the file
        // instead of a typed array. This makes resizing the array more flexible because we can just .push() elements at the back to
        // increase the size.
        if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
          node.contents = MEMFS.getFileDataAsRegularArray(node);
          node.usedBytes = node.contents.length; // We might be writing to a lazy-loaded file which had overridden this property, so force-reset it.
        }
  
        if (!node.contents || node.contents.subarray) { // Keep using a typed array if creating a new storage, or if old one was a typed array as well.
          var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
          if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
          // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
          // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
          // avoid overshooting the allocation cap by a very large margin.
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity); // Allocate new storage.
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
          return;
        }
        // Not using a typed array to back the file storage. Use a standard JS array instead.
        if (!node.contents && newCapacity > 0) node.contents = [];
        while (node.contents.length < newCapacity) node.contents.push(0);
      },resizeFileStorage:function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
          return;
        }
  
        if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
          return;
        }
        // Backing with a JS array.
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) { // Can we just reuse the buffer we are given?
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
          else
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          node.usedBytes = Math.max(node.usedBytes, position+length);
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        if (typeof indexedDB !== 'undefined') return indexedDB;
        var ret = null;
        if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        assert(ret, 'IDBFS used, but indexedDB not supported');
        return ret;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
          // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.chmod(path, entry.mode);
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        var err = FS.nodePermissions(dir, 'x');
        if (err) return err;
        if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
        return 0;
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        if (!PATH.resolve(oldpath)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var err = FS.mayOpen(node, flags);
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device;
        if (typeof crypto !== 'undefined') {
          // for modern web browsers
          var randomBuffer = new Uint8Array(1);
          random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
        } else if (ENVIRONMENT_IS_NODE) {
          // for nodejs
          random_device = function() { return require('crypto').randomBytes(1)[0]; };
        } else {
          // default for ES5 platforms
          random_device = function() { return (Math.random()*256)|0; };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = this;
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperty(node, "usedBytes", {
            get: function() { return this.contents.length; }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          contextHandle = GL.createContext(canvas, contextAttributes);
          if (contextHandle) {
            ctx = GL.getContext(contextHandle).GLctx;
          }
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll': 
            delta = event.detail;
            break;
          case 'mousewheel': 
            delta = event.wheelDelta;
            break;
          case 'wheel': 
            delta = event['deltaY'];
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle;
      }};

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _time(ptr) {
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

   
  Module["_strlen"] = _strlen;

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + TOTAL_STACK;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

  var Math_min = Math.min;
  // EMSCRIPTEN_START_ASM
  var asm = (function(global, env, buffer) {
    'almost asm';
    
    var HEAP8 = new global.Int8Array(buffer);
    var HEAP16 = new global.Int16Array(buffer);
    var HEAP32 = new global.Int32Array(buffer);
    var HEAPU8 = new global.Uint8Array(buffer);
    var HEAPU16 = new global.Uint16Array(buffer);
    var HEAPU32 = new global.Uint32Array(buffer);
    var HEAPF32 = new global.Float32Array(buffer);
    var HEAPF64 = new global.Float64Array(buffer);

  
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var cttz_i8=env.cttz_i8|0;
  var ctlz_i8=env.ctlz_i8|0;

    var __THREW__ = 0;
    var threwValue = 0;
    var setjmpId = 0;
    var undef = 0;
    var nan = +env.NaN, inf = +env.Infinity;
    var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  
    var tempRet0 = 0;
    var tempRet1 = 0;
    var tempRet2 = 0;
    var tempRet3 = 0;
    var tempRet4 = 0;
    var tempRet5 = 0;
    var tempRet6 = 0;
    var tempRet7 = 0;
    var tempRet8 = 0;
    var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var Math_min=env.min;
  var _fflush=env._fflush;
  var _abort=env._abort;
  var ___setErrNo=env.___setErrNo;
  var _sbrk=env._sbrk;
  var _time=env._time;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _sysconf=env._sysconf;
  var ___errno_location=env.___errno_location;
  var tempFloat = 0.0;

  // EMSCRIPTEN_START_FUNCS
  function stackAlloc(size) {
    size = size|0;
    var ret = 0;
    ret = STACKTOP;
    STACKTOP = (STACKTOP + size)|0;
  STACKTOP = (STACKTOP + 15)&-16;
if ((STACKTOP|0) >= (STACK_MAX|0)) abort();

    return ret|0;
  }
  function stackSave() {
    return STACKTOP|0;
  }
  function stackRestore(top) {
    top = top|0;
    STACKTOP = top;
  }

  function setThrew(threw, value) {
    threw = threw|0;
    value = value|0;
    if ((__THREW__|0) == 0) {
      __THREW__ = threw;
      threwValue = value;
    }
  }
  function copyTempFloat(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
  }
  function copyTempDouble(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
    HEAP8[tempDoublePtr+4>>0] = HEAP8[ptr+4>>0];
    HEAP8[tempDoublePtr+5>>0] = HEAP8[ptr+5>>0];
    HEAP8[tempDoublePtr+6>>0] = HEAP8[ptr+6>>0];
    HEAP8[tempDoublePtr+7>>0] = HEAP8[ptr+7>>0];
  }
  function setTempRet0(value) {
    value = value|0;
    tempRet0 = value;
  }
  function getTempRet0() {
    return tempRet0|0;
  }
  
function _scrypt_wrapper($masterPass,$masterpassLen,$masterKeySalt,$masterKeySaltLen,$masterKey) {
 $masterPass = $masterPass|0;
 $masterpassLen = $masterpassLen|0;
 $masterKeySalt = $masterKeySalt|0;
 $masterKeySaltLen = $masterKeySaltLen|0;
 $masterKey = $masterKey|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $masterPass;
 $1 = $masterpassLen;
 $2 = $masterKeySalt;
 $3 = $masterKeySaltLen;
 $4 = $masterKey;
 $5 = $0;
 $6 = $1;
 $7 = $2;
 $8 = $3;
 $9 = $4;
 $10 = (_crypto_scrypt($5,$6,$7,$8,32768,0,8,2,$9,64)|0);
 STACKTOP = sp;return ($10|0);
}
function _libcperciva_SHA256_Init($ctx) {
 $ctx = $ctx|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $ctx;
 $1 = $0;
 $2 = (($1) + 32|0);
 $3 = (($2) + 4|0);
 HEAP32[$3>>2] = 0;
 $4 = $0;
 $5 = (($4) + 32|0);
 HEAP32[$5>>2] = 0;
 $6 = $0;
 HEAP32[$6>>2] = 1779033703;
 $7 = $0;
 $8 = (($7) + 4|0);
 HEAP32[$8>>2] = -1150833019;
 $9 = $0;
 $10 = (($9) + 8|0);
 HEAP32[$10>>2] = 1013904242;
 $11 = $0;
 $12 = (($11) + 12|0);
 HEAP32[$12>>2] = -1521486534;
 $13 = $0;
 $14 = (($13) + 16|0);
 HEAP32[$14>>2] = 1359893119;
 $15 = $0;
 $16 = (($15) + 20|0);
 HEAP32[$16>>2] = -1694144372;
 $17 = $0;
 $18 = (($17) + 24|0);
 HEAP32[$18>>2] = 528734635;
 $19 = $0;
 $20 = (($19) + 28|0);
 HEAP32[$20>>2] = 1541459225;
 STACKTOP = sp;return;
}
function _libcperciva_SHA256_Update($ctx,$in,$len) {
 $ctx = $ctx|0;
 $in = $in|0;
 $len = $len|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $8 = 0, $9 = 0, $bitlen = 0, $r = 0, $src = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $bitlen = sp + 8|0;
 $0 = $ctx;
 $1 = $in;
 $2 = $len;
 $3 = $1;
 $src = $3;
 $4 = $2;
 $5 = ($4|0)==(0);
 if ($5) {
  STACKTOP = sp;return;
 }
 $6 = $0;
 $7 = (($6) + 32|0);
 $8 = (($7) + 4|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = $9 >>> 3;
 $11 = $10 & 63;
 $r = $11;
 $12 = $2;
 $13 = $12 << 3;
 $14 = (($bitlen) + 4|0);
 HEAP32[$14>>2] = $13;
 $15 = $2;
 $16 = $15 >>> 29;
 HEAP32[$bitlen>>2] = $16;
 $17 = (($bitlen) + 4|0);
 $18 = HEAP32[$17>>2]|0;
 $19 = $0;
 $20 = (($19) + 32|0);
 $21 = (($20) + 4|0);
 $22 = HEAP32[$21>>2]|0;
 $23 = (($22) + ($18))|0;
 HEAP32[$21>>2] = $23;
 $24 = (($bitlen) + 4|0);
 $25 = HEAP32[$24>>2]|0;
 $26 = ($23>>>0)<($25>>>0);
 if ($26) {
  $27 = $0;
  $28 = (($27) + 32|0);
  $29 = HEAP32[$28>>2]|0;
  $30 = (($29) + 1)|0;
  HEAP32[$28>>2] = $30;
 }
 $31 = HEAP32[$bitlen>>2]|0;
 $32 = $0;
 $33 = (($32) + 32|0);
 $34 = HEAP32[$33>>2]|0;
 $35 = (($34) + ($31))|0;
 HEAP32[$33>>2] = $35;
 $36 = $2;
 $37 = $r;
 $38 = (64 - ($37))|0;
 $39 = ($36>>>0)<($38>>>0);
 if ($39) {
  $40 = $r;
  $41 = $0;
  $42 = (($41) + 40|0);
  $43 = (($42) + ($40)|0);
  $44 = $src;
  $45 = $2;
  _memcpy(($43|0),($44|0),($45|0))|0;
  STACKTOP = sp;return;
 }
 $46 = $r;
 $47 = $0;
 $48 = (($47) + 40|0);
 $49 = (($48) + ($46)|0);
 $50 = $src;
 $51 = $r;
 $52 = (64 - ($51))|0;
 _memcpy(($49|0),($50|0),($52|0))|0;
 $53 = $0;
 $54 = $0;
 $55 = (($54) + 40|0);
 _SHA256_Transform($53,$55);
 $56 = $r;
 $57 = (64 - ($56))|0;
 $58 = $src;
 $59 = (($58) + ($57)|0);
 $src = $59;
 $60 = $r;
 $61 = (64 - ($60))|0;
 $62 = $2;
 $63 = (($62) - ($61))|0;
 $2 = $63;
 while(1) {
  $64 = $2;
  $65 = ($64>>>0)>=(64);
  if (!($65)) {
   break;
  }
  $66 = $0;
  $67 = $src;
  _SHA256_Transform($66,$67);
  $68 = $src;
  $69 = (($68) + 64|0);
  $src = $69;
  $70 = $2;
  $71 = (($70) - 64)|0;
  $2 = $71;
 }
 $72 = $0;
 $73 = (($72) + 40|0);
 $74 = $src;
 $75 = $2;
 _memcpy(($73|0),($74|0),($75|0))|0;
 STACKTOP = sp;return;
}
function _SHA256_Transform($state,$block) {
 $state = $state|0;
 $block = $block|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0, $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0;
 var $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0, $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0;
 var $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0, $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0;
 var $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0, $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0;
 var $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0, $1073 = 0, $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $1080 = 0, $1081 = 0, $1082 = 0, $1083 = 0, $1084 = 0, $1085 = 0, $1086 = 0, $1087 = 0;
 var $1088 = 0, $1089 = 0, $109 = 0, $1090 = 0, $1091 = 0, $1092 = 0, $1093 = 0, $1094 = 0, $1095 = 0, $1096 = 0, $1097 = 0, $1098 = 0, $1099 = 0, $11 = 0, $110 = 0, $1100 = 0, $1101 = 0, $1102 = 0, $1103 = 0, $1104 = 0;
 var $1105 = 0, $1106 = 0, $1107 = 0, $1108 = 0, $1109 = 0, $111 = 0, $1110 = 0, $1111 = 0, $1112 = 0, $1113 = 0, $1114 = 0, $1115 = 0, $1116 = 0, $1117 = 0, $1118 = 0, $1119 = 0, $112 = 0, $1120 = 0, $1121 = 0, $1122 = 0;
 var $1123 = 0, $1124 = 0, $1125 = 0, $1126 = 0, $1127 = 0, $1128 = 0, $1129 = 0, $113 = 0, $1130 = 0, $1131 = 0, $1132 = 0, $1133 = 0, $1134 = 0, $1135 = 0, $1136 = 0, $1137 = 0, $1138 = 0, $1139 = 0, $114 = 0, $1140 = 0;
 var $1141 = 0, $1142 = 0, $1143 = 0, $1144 = 0, $1145 = 0, $1146 = 0, $1147 = 0, $1148 = 0, $1149 = 0, $115 = 0, $1150 = 0, $1151 = 0, $1152 = 0, $1153 = 0, $1154 = 0, $1155 = 0, $1156 = 0, $1157 = 0, $1158 = 0, $1159 = 0;
 var $116 = 0, $1160 = 0, $1161 = 0, $1162 = 0, $1163 = 0, $1164 = 0, $1165 = 0, $1166 = 0, $1167 = 0, $1168 = 0, $1169 = 0, $117 = 0, $1170 = 0, $1171 = 0, $1172 = 0, $1173 = 0, $1174 = 0, $1175 = 0, $1176 = 0, $1177 = 0;
 var $1178 = 0, $1179 = 0, $118 = 0, $1180 = 0, $1181 = 0, $1182 = 0, $1183 = 0, $1184 = 0, $1185 = 0, $1186 = 0, $1187 = 0, $1188 = 0, $1189 = 0, $119 = 0, $1190 = 0, $1191 = 0, $1192 = 0, $1193 = 0, $1194 = 0, $1195 = 0;
 var $1196 = 0, $1197 = 0, $1198 = 0, $1199 = 0, $12 = 0, $120 = 0, $1200 = 0, $1201 = 0, $1202 = 0, $1203 = 0, $1204 = 0, $1205 = 0, $1206 = 0, $1207 = 0, $1208 = 0, $1209 = 0, $121 = 0, $1210 = 0, $1211 = 0, $1212 = 0;
 var $1213 = 0, $1214 = 0, $1215 = 0, $1216 = 0, $1217 = 0, $1218 = 0, $1219 = 0, $122 = 0, $1220 = 0, $1221 = 0, $1222 = 0, $1223 = 0, $1224 = 0, $1225 = 0, $1226 = 0, $1227 = 0, $1228 = 0, $1229 = 0, $123 = 0, $1230 = 0;
 var $1231 = 0, $1232 = 0, $1233 = 0, $1234 = 0, $1235 = 0, $1236 = 0, $1237 = 0, $1238 = 0, $1239 = 0, $124 = 0, $1240 = 0, $1241 = 0, $1242 = 0, $1243 = 0, $1244 = 0, $1245 = 0, $1246 = 0, $1247 = 0, $1248 = 0, $1249 = 0;
 var $125 = 0, $1250 = 0, $1251 = 0, $1252 = 0, $1253 = 0, $1254 = 0, $1255 = 0, $1256 = 0, $1257 = 0, $1258 = 0, $1259 = 0, $126 = 0, $1260 = 0, $1261 = 0, $1262 = 0, $1263 = 0, $1264 = 0, $1265 = 0, $1266 = 0, $1267 = 0;
 var $1268 = 0, $1269 = 0, $127 = 0, $1270 = 0, $1271 = 0, $1272 = 0, $1273 = 0, $1274 = 0, $1275 = 0, $1276 = 0, $1277 = 0, $1278 = 0, $1279 = 0, $128 = 0, $1280 = 0, $1281 = 0, $1282 = 0, $1283 = 0, $1284 = 0, $1285 = 0;
 var $1286 = 0, $1287 = 0, $1288 = 0, $1289 = 0, $129 = 0, $1290 = 0, $1291 = 0, $1292 = 0, $1293 = 0, $1294 = 0, $1295 = 0, $1296 = 0, $1297 = 0, $1298 = 0, $1299 = 0, $13 = 0, $130 = 0, $1300 = 0, $1301 = 0, $1302 = 0;
 var $1303 = 0, $1304 = 0, $1305 = 0, $1306 = 0, $1307 = 0, $1308 = 0, $1309 = 0, $131 = 0, $1310 = 0, $1311 = 0, $1312 = 0, $1313 = 0, $1314 = 0, $1315 = 0, $1316 = 0, $1317 = 0, $1318 = 0, $1319 = 0, $132 = 0, $1320 = 0;
 var $1321 = 0, $1322 = 0, $1323 = 0, $1324 = 0, $1325 = 0, $1326 = 0, $1327 = 0, $1328 = 0, $1329 = 0, $133 = 0, $1330 = 0, $1331 = 0, $1332 = 0, $1333 = 0, $1334 = 0, $1335 = 0, $1336 = 0, $1337 = 0, $1338 = 0, $1339 = 0;
 var $134 = 0, $1340 = 0, $1341 = 0, $1342 = 0, $1343 = 0, $1344 = 0, $1345 = 0, $1346 = 0, $1347 = 0, $1348 = 0, $1349 = 0, $135 = 0, $1350 = 0, $1351 = 0, $1352 = 0, $1353 = 0, $1354 = 0, $1355 = 0, $1356 = 0, $1357 = 0;
 var $1358 = 0, $1359 = 0, $136 = 0, $1360 = 0, $1361 = 0, $1362 = 0, $1363 = 0, $1364 = 0, $1365 = 0, $1366 = 0, $1367 = 0, $1368 = 0, $1369 = 0, $137 = 0, $1370 = 0, $1371 = 0, $1372 = 0, $1373 = 0, $1374 = 0, $1375 = 0;
 var $1376 = 0, $1377 = 0, $1378 = 0, $1379 = 0, $138 = 0, $1380 = 0, $1381 = 0, $1382 = 0, $1383 = 0, $1384 = 0, $1385 = 0, $1386 = 0, $1387 = 0, $1388 = 0, $1389 = 0, $139 = 0, $1390 = 0, $1391 = 0, $1392 = 0, $1393 = 0;
 var $1394 = 0, $1395 = 0, $1396 = 0, $1397 = 0, $1398 = 0, $1399 = 0, $14 = 0, $140 = 0, $1400 = 0, $1401 = 0, $1402 = 0, $1403 = 0, $1404 = 0, $1405 = 0, $1406 = 0, $1407 = 0, $1408 = 0, $1409 = 0, $141 = 0, $1410 = 0;
 var $1411 = 0, $1412 = 0, $1413 = 0, $1414 = 0, $1415 = 0, $1416 = 0, $1417 = 0, $1418 = 0, $1419 = 0, $142 = 0, $1420 = 0, $1421 = 0, $1422 = 0, $1423 = 0, $1424 = 0, $1425 = 0, $1426 = 0, $1427 = 0, $1428 = 0, $1429 = 0;
 var $143 = 0, $1430 = 0, $1431 = 0, $1432 = 0, $1433 = 0, $1434 = 0, $1435 = 0, $1436 = 0, $1437 = 0, $1438 = 0, $1439 = 0, $144 = 0, $1440 = 0, $1441 = 0, $1442 = 0, $1443 = 0, $1444 = 0, $1445 = 0, $1446 = 0, $1447 = 0;
 var $1448 = 0, $1449 = 0, $145 = 0, $1450 = 0, $1451 = 0, $1452 = 0, $1453 = 0, $1454 = 0, $1455 = 0, $1456 = 0, $1457 = 0, $1458 = 0, $1459 = 0, $146 = 0, $1460 = 0, $1461 = 0, $1462 = 0, $1463 = 0, $1464 = 0, $1465 = 0;
 var $1466 = 0, $1467 = 0, $1468 = 0, $1469 = 0, $147 = 0, $1470 = 0, $1471 = 0, $1472 = 0, $1473 = 0, $1474 = 0, $1475 = 0, $1476 = 0, $1477 = 0, $1478 = 0, $1479 = 0, $148 = 0, $1480 = 0, $1481 = 0, $1482 = 0, $1483 = 0;
 var $1484 = 0, $1485 = 0, $1486 = 0, $1487 = 0, $1488 = 0, $1489 = 0, $149 = 0, $1490 = 0, $1491 = 0, $1492 = 0, $1493 = 0, $1494 = 0, $1495 = 0, $1496 = 0, $1497 = 0, $1498 = 0, $1499 = 0, $15 = 0, $150 = 0, $1500 = 0;
 var $1501 = 0, $1502 = 0, $1503 = 0, $1504 = 0, $1505 = 0, $1506 = 0, $1507 = 0, $1508 = 0, $1509 = 0, $151 = 0, $1510 = 0, $1511 = 0, $1512 = 0, $1513 = 0, $1514 = 0, $1515 = 0, $1516 = 0, $1517 = 0, $1518 = 0, $1519 = 0;
 var $152 = 0, $1520 = 0, $1521 = 0, $1522 = 0, $1523 = 0, $1524 = 0, $1525 = 0, $1526 = 0, $1527 = 0, $1528 = 0, $1529 = 0, $153 = 0, $1530 = 0, $1531 = 0, $1532 = 0, $1533 = 0, $1534 = 0, $1535 = 0, $1536 = 0, $1537 = 0;
 var $1538 = 0, $1539 = 0, $154 = 0, $1540 = 0, $1541 = 0, $1542 = 0, $1543 = 0, $1544 = 0, $1545 = 0, $1546 = 0, $1547 = 0, $1548 = 0, $1549 = 0, $155 = 0, $1550 = 0, $1551 = 0, $1552 = 0, $1553 = 0, $1554 = 0, $1555 = 0;
 var $1556 = 0, $1557 = 0, $1558 = 0, $1559 = 0, $156 = 0, $1560 = 0, $1561 = 0, $1562 = 0, $1563 = 0, $1564 = 0, $1565 = 0, $1566 = 0, $1567 = 0, $1568 = 0, $1569 = 0, $157 = 0, $1570 = 0, $1571 = 0, $1572 = 0, $1573 = 0;
 var $1574 = 0, $1575 = 0, $1576 = 0, $1577 = 0, $1578 = 0, $1579 = 0, $158 = 0, $1580 = 0, $1581 = 0, $1582 = 0, $1583 = 0, $1584 = 0, $1585 = 0, $1586 = 0, $1587 = 0, $1588 = 0, $1589 = 0, $159 = 0, $1590 = 0, $1591 = 0;
 var $1592 = 0, $1593 = 0, $1594 = 0, $1595 = 0, $1596 = 0, $1597 = 0, $1598 = 0, $1599 = 0, $16 = 0, $160 = 0, $1600 = 0, $1601 = 0, $1602 = 0, $1603 = 0, $1604 = 0, $1605 = 0, $1606 = 0, $1607 = 0, $1608 = 0, $1609 = 0;
 var $161 = 0, $1610 = 0, $1611 = 0, $1612 = 0, $1613 = 0, $1614 = 0, $1615 = 0, $1616 = 0, $1617 = 0, $1618 = 0, $1619 = 0, $162 = 0, $1620 = 0, $1621 = 0, $1622 = 0, $1623 = 0, $1624 = 0, $1625 = 0, $1626 = 0, $1627 = 0;
 var $1628 = 0, $1629 = 0, $163 = 0, $1630 = 0, $1631 = 0, $1632 = 0, $1633 = 0, $1634 = 0, $1635 = 0, $1636 = 0, $1637 = 0, $1638 = 0, $1639 = 0, $164 = 0, $1640 = 0, $1641 = 0, $1642 = 0, $1643 = 0, $1644 = 0, $1645 = 0;
 var $1646 = 0, $1647 = 0, $1648 = 0, $1649 = 0, $165 = 0, $1650 = 0, $1651 = 0, $1652 = 0, $1653 = 0, $1654 = 0, $1655 = 0, $1656 = 0, $1657 = 0, $1658 = 0, $1659 = 0, $166 = 0, $1660 = 0, $1661 = 0, $1662 = 0, $1663 = 0;
 var $1664 = 0, $1665 = 0, $1666 = 0, $1667 = 0, $1668 = 0, $1669 = 0, $167 = 0, $1670 = 0, $1671 = 0, $1672 = 0, $1673 = 0, $1674 = 0, $1675 = 0, $1676 = 0, $1677 = 0, $1678 = 0, $1679 = 0, $168 = 0, $1680 = 0, $1681 = 0;
 var $1682 = 0, $1683 = 0, $1684 = 0, $1685 = 0, $1686 = 0, $1687 = 0, $1688 = 0, $1689 = 0, $169 = 0, $1690 = 0, $1691 = 0, $1692 = 0, $1693 = 0, $1694 = 0, $1695 = 0, $1696 = 0, $1697 = 0, $1698 = 0, $1699 = 0, $17 = 0;
 var $170 = 0, $1700 = 0, $1701 = 0, $1702 = 0, $1703 = 0, $1704 = 0, $1705 = 0, $1706 = 0, $1707 = 0, $1708 = 0, $1709 = 0, $171 = 0, $1710 = 0, $1711 = 0, $1712 = 0, $1713 = 0, $1714 = 0, $1715 = 0, $1716 = 0, $1717 = 0;
 var $1718 = 0, $1719 = 0, $172 = 0, $1720 = 0, $1721 = 0, $1722 = 0, $1723 = 0, $1724 = 0, $1725 = 0, $1726 = 0, $1727 = 0, $1728 = 0, $1729 = 0, $173 = 0, $1730 = 0, $1731 = 0, $1732 = 0, $1733 = 0, $1734 = 0, $1735 = 0;
 var $1736 = 0, $1737 = 0, $1738 = 0, $1739 = 0, $174 = 0, $1740 = 0, $1741 = 0, $1742 = 0, $1743 = 0, $1744 = 0, $1745 = 0, $1746 = 0, $1747 = 0, $1748 = 0, $1749 = 0, $175 = 0, $1750 = 0, $1751 = 0, $1752 = 0, $1753 = 0;
 var $1754 = 0, $1755 = 0, $1756 = 0, $1757 = 0, $1758 = 0, $1759 = 0, $176 = 0, $1760 = 0, $1761 = 0, $1762 = 0, $1763 = 0, $1764 = 0, $1765 = 0, $1766 = 0, $1767 = 0, $1768 = 0, $1769 = 0, $177 = 0, $1770 = 0, $1771 = 0;
 var $1772 = 0, $1773 = 0, $1774 = 0, $1775 = 0, $1776 = 0, $1777 = 0, $1778 = 0, $1779 = 0, $178 = 0, $1780 = 0, $1781 = 0, $1782 = 0, $1783 = 0, $1784 = 0, $1785 = 0, $1786 = 0, $1787 = 0, $1788 = 0, $1789 = 0, $179 = 0;
 var $1790 = 0, $1791 = 0, $1792 = 0, $1793 = 0, $1794 = 0, $1795 = 0, $1796 = 0, $1797 = 0, $1798 = 0, $1799 = 0, $18 = 0, $180 = 0, $1800 = 0, $1801 = 0, $1802 = 0, $1803 = 0, $1804 = 0, $1805 = 0, $1806 = 0, $1807 = 0;
 var $1808 = 0, $1809 = 0, $181 = 0, $1810 = 0, $1811 = 0, $1812 = 0, $1813 = 0, $1814 = 0, $1815 = 0, $1816 = 0, $1817 = 0, $1818 = 0, $1819 = 0, $182 = 0, $1820 = 0, $1821 = 0, $1822 = 0, $1823 = 0, $1824 = 0, $1825 = 0;
 var $1826 = 0, $1827 = 0, $1828 = 0, $1829 = 0, $183 = 0, $1830 = 0, $1831 = 0, $1832 = 0, $1833 = 0, $1834 = 0, $1835 = 0, $1836 = 0, $1837 = 0, $1838 = 0, $1839 = 0, $184 = 0, $1840 = 0, $1841 = 0, $1842 = 0, $1843 = 0;
 var $1844 = 0, $1845 = 0, $1846 = 0, $1847 = 0, $1848 = 0, $1849 = 0, $185 = 0, $1850 = 0, $1851 = 0, $1852 = 0, $1853 = 0, $1854 = 0, $1855 = 0, $1856 = 0, $1857 = 0, $1858 = 0, $1859 = 0, $186 = 0, $1860 = 0, $1861 = 0;
 var $1862 = 0, $1863 = 0, $1864 = 0, $1865 = 0, $1866 = 0, $1867 = 0, $1868 = 0, $1869 = 0, $187 = 0, $1870 = 0, $1871 = 0, $1872 = 0, $1873 = 0, $1874 = 0, $1875 = 0, $1876 = 0, $1877 = 0, $1878 = 0, $1879 = 0, $188 = 0;
 var $1880 = 0, $1881 = 0, $1882 = 0, $1883 = 0, $1884 = 0, $1885 = 0, $1886 = 0, $1887 = 0, $1888 = 0, $1889 = 0, $189 = 0, $1890 = 0, $1891 = 0, $1892 = 0, $1893 = 0, $1894 = 0, $1895 = 0, $1896 = 0, $1897 = 0, $1898 = 0;
 var $1899 = 0, $19 = 0, $190 = 0, $1900 = 0, $1901 = 0, $1902 = 0, $1903 = 0, $1904 = 0, $1905 = 0, $1906 = 0, $1907 = 0, $1908 = 0, $1909 = 0, $191 = 0, $1910 = 0, $1911 = 0, $1912 = 0, $1913 = 0, $1914 = 0, $1915 = 0;
 var $1916 = 0, $1917 = 0, $1918 = 0, $1919 = 0, $192 = 0, $1920 = 0, $1921 = 0, $1922 = 0, $1923 = 0, $1924 = 0, $1925 = 0, $1926 = 0, $1927 = 0, $1928 = 0, $1929 = 0, $193 = 0, $1930 = 0, $1931 = 0, $1932 = 0, $1933 = 0;
 var $1934 = 0, $1935 = 0, $1936 = 0, $1937 = 0, $1938 = 0, $1939 = 0, $194 = 0, $1940 = 0, $1941 = 0, $1942 = 0, $1943 = 0, $1944 = 0, $1945 = 0, $1946 = 0, $1947 = 0, $1948 = 0, $1949 = 0, $195 = 0, $1950 = 0, $1951 = 0;
 var $1952 = 0, $1953 = 0, $1954 = 0, $1955 = 0, $1956 = 0, $1957 = 0, $1958 = 0, $1959 = 0, $196 = 0, $1960 = 0, $1961 = 0, $1962 = 0, $1963 = 0, $1964 = 0, $1965 = 0, $1966 = 0, $1967 = 0, $1968 = 0, $1969 = 0, $197 = 0;
 var $1970 = 0, $1971 = 0, $1972 = 0, $1973 = 0, $1974 = 0, $1975 = 0, $1976 = 0, $1977 = 0, $1978 = 0, $1979 = 0, $198 = 0, $1980 = 0, $1981 = 0, $1982 = 0, $1983 = 0, $1984 = 0, $1985 = 0, $1986 = 0, $1987 = 0, $1988 = 0;
 var $1989 = 0, $199 = 0, $1990 = 0, $1991 = 0, $1992 = 0, $1993 = 0, $1994 = 0, $1995 = 0, $1996 = 0, $1997 = 0, $1998 = 0, $1999 = 0, $2 = 0, $20 = 0, $200 = 0, $2000 = 0, $2001 = 0, $2002 = 0, $2003 = 0, $2004 = 0;
 var $2005 = 0, $2006 = 0, $2007 = 0, $2008 = 0, $2009 = 0, $201 = 0, $2010 = 0, $2011 = 0, $2012 = 0, $2013 = 0, $2014 = 0, $2015 = 0, $2016 = 0, $2017 = 0, $2018 = 0, $2019 = 0, $202 = 0, $2020 = 0, $2021 = 0, $2022 = 0;
 var $2023 = 0, $2024 = 0, $2025 = 0, $2026 = 0, $2027 = 0, $2028 = 0, $2029 = 0, $203 = 0, $2030 = 0, $2031 = 0, $2032 = 0, $2033 = 0, $2034 = 0, $2035 = 0, $2036 = 0, $2037 = 0, $2038 = 0, $2039 = 0, $204 = 0, $2040 = 0;
 var $2041 = 0, $2042 = 0, $2043 = 0, $2044 = 0, $2045 = 0, $2046 = 0, $2047 = 0, $2048 = 0, $2049 = 0, $205 = 0, $2050 = 0, $2051 = 0, $2052 = 0, $2053 = 0, $2054 = 0, $2055 = 0, $2056 = 0, $2057 = 0, $2058 = 0, $2059 = 0;
 var $206 = 0, $2060 = 0, $2061 = 0, $2062 = 0, $2063 = 0, $2064 = 0, $2065 = 0, $2066 = 0, $2067 = 0, $2068 = 0, $2069 = 0, $207 = 0, $2070 = 0, $2071 = 0, $2072 = 0, $2073 = 0, $2074 = 0, $2075 = 0, $2076 = 0, $2077 = 0;
 var $2078 = 0, $2079 = 0, $208 = 0, $2080 = 0, $2081 = 0, $2082 = 0, $2083 = 0, $2084 = 0, $2085 = 0, $2086 = 0, $2087 = 0, $2088 = 0, $2089 = 0, $209 = 0, $2090 = 0, $2091 = 0, $2092 = 0, $2093 = 0, $2094 = 0, $2095 = 0;
 var $2096 = 0, $2097 = 0, $2098 = 0, $2099 = 0, $21 = 0, $210 = 0, $2100 = 0, $2101 = 0, $2102 = 0, $2103 = 0, $2104 = 0, $2105 = 0, $2106 = 0, $2107 = 0, $2108 = 0, $2109 = 0, $211 = 0, $2110 = 0, $2111 = 0, $2112 = 0;
 var $2113 = 0, $2114 = 0, $2115 = 0, $2116 = 0, $2117 = 0, $2118 = 0, $2119 = 0, $212 = 0, $2120 = 0, $2121 = 0, $2122 = 0, $2123 = 0, $2124 = 0, $2125 = 0, $2126 = 0, $2127 = 0, $2128 = 0, $2129 = 0, $213 = 0, $2130 = 0;
 var $2131 = 0, $2132 = 0, $2133 = 0, $2134 = 0, $2135 = 0, $2136 = 0, $2137 = 0, $2138 = 0, $2139 = 0, $214 = 0, $2140 = 0, $2141 = 0, $2142 = 0, $2143 = 0, $2144 = 0, $2145 = 0, $2146 = 0, $2147 = 0, $2148 = 0, $2149 = 0;
 var $215 = 0, $2150 = 0, $2151 = 0, $2152 = 0, $2153 = 0, $2154 = 0, $2155 = 0, $2156 = 0, $2157 = 0, $2158 = 0, $2159 = 0, $216 = 0, $2160 = 0, $2161 = 0, $2162 = 0, $2163 = 0, $2164 = 0, $2165 = 0, $2166 = 0, $2167 = 0;
 var $2168 = 0, $2169 = 0, $217 = 0, $2170 = 0, $2171 = 0, $2172 = 0, $2173 = 0, $2174 = 0, $2175 = 0, $2176 = 0, $2177 = 0, $2178 = 0, $2179 = 0, $218 = 0, $2180 = 0, $2181 = 0, $2182 = 0, $2183 = 0, $2184 = 0, $2185 = 0;
 var $2186 = 0, $2187 = 0, $2188 = 0, $2189 = 0, $219 = 0, $2190 = 0, $2191 = 0, $2192 = 0, $2193 = 0, $2194 = 0, $2195 = 0, $2196 = 0, $2197 = 0, $2198 = 0, $2199 = 0, $22 = 0, $220 = 0, $2200 = 0, $2201 = 0, $2202 = 0;
 var $2203 = 0, $2204 = 0, $2205 = 0, $2206 = 0, $2207 = 0, $2208 = 0, $2209 = 0, $221 = 0, $2210 = 0, $2211 = 0, $2212 = 0, $2213 = 0, $2214 = 0, $2215 = 0, $2216 = 0, $2217 = 0, $2218 = 0, $2219 = 0, $222 = 0, $2220 = 0;
 var $2221 = 0, $2222 = 0, $2223 = 0, $2224 = 0, $2225 = 0, $2226 = 0, $2227 = 0, $2228 = 0, $2229 = 0, $223 = 0, $2230 = 0, $2231 = 0, $2232 = 0, $2233 = 0, $2234 = 0, $2235 = 0, $2236 = 0, $2237 = 0, $2238 = 0, $2239 = 0;
 var $224 = 0, $2240 = 0, $2241 = 0, $2242 = 0, $2243 = 0, $2244 = 0, $2245 = 0, $2246 = 0, $2247 = 0, $2248 = 0, $2249 = 0, $225 = 0, $2250 = 0, $2251 = 0, $2252 = 0, $2253 = 0, $2254 = 0, $2255 = 0, $2256 = 0, $2257 = 0;
 var $2258 = 0, $2259 = 0, $226 = 0, $2260 = 0, $2261 = 0, $2262 = 0, $2263 = 0, $2264 = 0, $2265 = 0, $2266 = 0, $2267 = 0, $2268 = 0, $2269 = 0, $227 = 0, $2270 = 0, $2271 = 0, $2272 = 0, $2273 = 0, $2274 = 0, $2275 = 0;
 var $2276 = 0, $2277 = 0, $2278 = 0, $2279 = 0, $228 = 0, $2280 = 0, $2281 = 0, $2282 = 0, $2283 = 0, $2284 = 0, $2285 = 0, $2286 = 0, $2287 = 0, $2288 = 0, $2289 = 0, $229 = 0, $2290 = 0, $2291 = 0, $2292 = 0, $2293 = 0;
 var $2294 = 0, $2295 = 0, $2296 = 0, $2297 = 0, $2298 = 0, $2299 = 0, $23 = 0, $230 = 0, $2300 = 0, $2301 = 0, $2302 = 0, $2303 = 0, $2304 = 0, $2305 = 0, $2306 = 0, $2307 = 0, $2308 = 0, $2309 = 0, $231 = 0, $2310 = 0;
 var $2311 = 0, $2312 = 0, $2313 = 0, $2314 = 0, $2315 = 0, $2316 = 0, $2317 = 0, $2318 = 0, $2319 = 0, $232 = 0, $2320 = 0, $2321 = 0, $2322 = 0, $2323 = 0, $2324 = 0, $2325 = 0, $2326 = 0, $2327 = 0, $2328 = 0, $2329 = 0;
 var $233 = 0, $2330 = 0, $2331 = 0, $2332 = 0, $2333 = 0, $2334 = 0, $2335 = 0, $2336 = 0, $2337 = 0, $2338 = 0, $2339 = 0, $234 = 0, $2340 = 0, $2341 = 0, $2342 = 0, $2343 = 0, $2344 = 0, $2345 = 0, $2346 = 0, $2347 = 0;
 var $2348 = 0, $2349 = 0, $235 = 0, $2350 = 0, $2351 = 0, $2352 = 0, $2353 = 0, $2354 = 0, $2355 = 0, $2356 = 0, $2357 = 0, $2358 = 0, $2359 = 0, $236 = 0, $2360 = 0, $2361 = 0, $2362 = 0, $2363 = 0, $2364 = 0, $2365 = 0;
 var $2366 = 0, $2367 = 0, $2368 = 0, $2369 = 0, $237 = 0, $2370 = 0, $2371 = 0, $2372 = 0, $2373 = 0, $2374 = 0, $2375 = 0, $2376 = 0, $2377 = 0, $2378 = 0, $2379 = 0, $238 = 0, $2380 = 0, $2381 = 0, $2382 = 0, $2383 = 0;
 var $2384 = 0, $2385 = 0, $2386 = 0, $2387 = 0, $2388 = 0, $2389 = 0, $239 = 0, $2390 = 0, $2391 = 0, $2392 = 0, $2393 = 0, $2394 = 0, $2395 = 0, $2396 = 0, $2397 = 0, $2398 = 0, $2399 = 0, $24 = 0, $240 = 0, $2400 = 0;
 var $2401 = 0, $2402 = 0, $2403 = 0, $2404 = 0, $2405 = 0, $2406 = 0, $2407 = 0, $2408 = 0, $2409 = 0, $241 = 0, $2410 = 0, $2411 = 0, $2412 = 0, $2413 = 0, $2414 = 0, $2415 = 0, $2416 = 0, $2417 = 0, $2418 = 0, $2419 = 0;
 var $242 = 0, $2420 = 0, $2421 = 0, $2422 = 0, $2423 = 0, $2424 = 0, $2425 = 0, $2426 = 0, $2427 = 0, $2428 = 0, $2429 = 0, $243 = 0, $2430 = 0, $2431 = 0, $2432 = 0, $2433 = 0, $2434 = 0, $2435 = 0, $2436 = 0, $2437 = 0;
 var $2438 = 0, $2439 = 0, $244 = 0, $2440 = 0, $2441 = 0, $2442 = 0, $2443 = 0, $2444 = 0, $2445 = 0, $2446 = 0, $2447 = 0, $2448 = 0, $2449 = 0, $245 = 0, $2450 = 0, $2451 = 0, $2452 = 0, $2453 = 0, $2454 = 0, $2455 = 0;
 var $2456 = 0, $2457 = 0, $2458 = 0, $2459 = 0, $246 = 0, $2460 = 0, $2461 = 0, $2462 = 0, $2463 = 0, $2464 = 0, $2465 = 0, $2466 = 0, $2467 = 0, $2468 = 0, $2469 = 0, $247 = 0, $2470 = 0, $2471 = 0, $2472 = 0, $2473 = 0;
 var $2474 = 0, $2475 = 0, $2476 = 0, $2477 = 0, $2478 = 0, $2479 = 0, $248 = 0, $2480 = 0, $2481 = 0, $2482 = 0, $2483 = 0, $2484 = 0, $2485 = 0, $2486 = 0, $2487 = 0, $2488 = 0, $2489 = 0, $249 = 0, $2490 = 0, $2491 = 0;
 var $2492 = 0, $2493 = 0, $2494 = 0, $2495 = 0, $2496 = 0, $2497 = 0, $2498 = 0, $2499 = 0, $25 = 0, $250 = 0, $2500 = 0, $2501 = 0, $2502 = 0, $2503 = 0, $2504 = 0, $2505 = 0, $2506 = 0, $2507 = 0, $2508 = 0, $2509 = 0;
 var $251 = 0, $2510 = 0, $2511 = 0, $2512 = 0, $2513 = 0, $2514 = 0, $2515 = 0, $2516 = 0, $2517 = 0, $2518 = 0, $2519 = 0, $252 = 0, $2520 = 0, $2521 = 0, $2522 = 0, $2523 = 0, $2524 = 0, $2525 = 0, $2526 = 0, $2527 = 0;
 var $2528 = 0, $2529 = 0, $253 = 0, $2530 = 0, $2531 = 0, $2532 = 0, $2533 = 0, $2534 = 0, $2535 = 0, $2536 = 0, $2537 = 0, $2538 = 0, $2539 = 0, $254 = 0, $2540 = 0, $2541 = 0, $2542 = 0, $2543 = 0, $2544 = 0, $2545 = 0;
 var $2546 = 0, $2547 = 0, $2548 = 0, $2549 = 0, $255 = 0, $2550 = 0, $2551 = 0, $2552 = 0, $2553 = 0, $2554 = 0, $2555 = 0, $2556 = 0, $2557 = 0, $2558 = 0, $2559 = 0, $256 = 0, $2560 = 0, $2561 = 0, $2562 = 0, $2563 = 0;
 var $2564 = 0, $2565 = 0, $2566 = 0, $2567 = 0, $2568 = 0, $2569 = 0, $257 = 0, $2570 = 0, $2571 = 0, $2572 = 0, $2573 = 0, $2574 = 0, $2575 = 0, $2576 = 0, $2577 = 0, $2578 = 0, $2579 = 0, $258 = 0, $2580 = 0, $2581 = 0;
 var $2582 = 0, $2583 = 0, $2584 = 0, $2585 = 0, $2586 = 0, $2587 = 0, $2588 = 0, $2589 = 0, $259 = 0, $2590 = 0, $2591 = 0, $2592 = 0, $2593 = 0, $2594 = 0, $2595 = 0, $2596 = 0, $2597 = 0, $2598 = 0, $2599 = 0, $26 = 0;
 var $260 = 0, $2600 = 0, $2601 = 0, $2602 = 0, $2603 = 0, $2604 = 0, $2605 = 0, $2606 = 0, $2607 = 0, $2608 = 0, $2609 = 0, $261 = 0, $2610 = 0, $2611 = 0, $2612 = 0, $2613 = 0, $2614 = 0, $2615 = 0, $2616 = 0, $2617 = 0;
 var $2618 = 0, $2619 = 0, $262 = 0, $2620 = 0, $2621 = 0, $2622 = 0, $2623 = 0, $2624 = 0, $2625 = 0, $2626 = 0, $2627 = 0, $2628 = 0, $2629 = 0, $263 = 0, $2630 = 0, $2631 = 0, $2632 = 0, $2633 = 0, $2634 = 0, $2635 = 0;
 var $2636 = 0, $2637 = 0, $2638 = 0, $2639 = 0, $264 = 0, $2640 = 0, $2641 = 0, $2642 = 0, $2643 = 0, $2644 = 0, $2645 = 0, $2646 = 0, $2647 = 0, $2648 = 0, $2649 = 0, $265 = 0, $2650 = 0, $2651 = 0, $2652 = 0, $2653 = 0;
 var $2654 = 0, $2655 = 0, $2656 = 0, $2657 = 0, $2658 = 0, $2659 = 0, $266 = 0, $2660 = 0, $2661 = 0, $2662 = 0, $2663 = 0, $2664 = 0, $2665 = 0, $2666 = 0, $2667 = 0, $2668 = 0, $2669 = 0, $267 = 0, $2670 = 0, $2671 = 0;
 var $2672 = 0, $2673 = 0, $2674 = 0, $2675 = 0, $2676 = 0, $2677 = 0, $2678 = 0, $2679 = 0, $268 = 0, $2680 = 0, $2681 = 0, $2682 = 0, $2683 = 0, $2684 = 0, $2685 = 0, $2686 = 0, $2687 = 0, $2688 = 0, $2689 = 0, $269 = 0;
 var $2690 = 0, $2691 = 0, $2692 = 0, $2693 = 0, $2694 = 0, $2695 = 0, $2696 = 0, $2697 = 0, $2698 = 0, $2699 = 0, $27 = 0, $270 = 0, $2700 = 0, $2701 = 0, $2702 = 0, $2703 = 0, $2704 = 0, $2705 = 0, $2706 = 0, $2707 = 0;
 var $2708 = 0, $2709 = 0, $271 = 0, $2710 = 0, $2711 = 0, $2712 = 0, $2713 = 0, $2714 = 0, $2715 = 0, $2716 = 0, $2717 = 0, $2718 = 0, $2719 = 0, $272 = 0, $2720 = 0, $2721 = 0, $2722 = 0, $2723 = 0, $2724 = 0, $2725 = 0;
 var $2726 = 0, $2727 = 0, $2728 = 0, $2729 = 0, $273 = 0, $2730 = 0, $2731 = 0, $2732 = 0, $2733 = 0, $2734 = 0, $2735 = 0, $2736 = 0, $2737 = 0, $2738 = 0, $2739 = 0, $274 = 0, $2740 = 0, $2741 = 0, $2742 = 0, $2743 = 0;
 var $2744 = 0, $2745 = 0, $2746 = 0, $2747 = 0, $2748 = 0, $2749 = 0, $275 = 0, $2750 = 0, $2751 = 0, $2752 = 0, $2753 = 0, $2754 = 0, $2755 = 0, $2756 = 0, $2757 = 0, $2758 = 0, $2759 = 0, $276 = 0, $2760 = 0, $2761 = 0;
 var $2762 = 0, $2763 = 0, $2764 = 0, $2765 = 0, $2766 = 0, $2767 = 0, $2768 = 0, $2769 = 0, $277 = 0, $2770 = 0, $2771 = 0, $2772 = 0, $2773 = 0, $2774 = 0, $2775 = 0, $2776 = 0, $2777 = 0, $2778 = 0, $2779 = 0, $278 = 0;
 var $2780 = 0, $2781 = 0, $2782 = 0, $2783 = 0, $2784 = 0, $2785 = 0, $2786 = 0, $2787 = 0, $2788 = 0, $2789 = 0, $279 = 0, $2790 = 0, $2791 = 0, $2792 = 0, $2793 = 0, $2794 = 0, $2795 = 0, $2796 = 0, $2797 = 0, $2798 = 0;
 var $2799 = 0, $28 = 0, $280 = 0, $2800 = 0, $2801 = 0, $2802 = 0, $2803 = 0, $2804 = 0, $2805 = 0, $2806 = 0, $2807 = 0, $2808 = 0, $2809 = 0, $281 = 0, $2810 = 0, $2811 = 0, $2812 = 0, $2813 = 0, $2814 = 0, $2815 = 0;
 var $2816 = 0, $2817 = 0, $2818 = 0, $2819 = 0, $282 = 0, $2820 = 0, $2821 = 0, $2822 = 0, $2823 = 0, $2824 = 0, $2825 = 0, $2826 = 0, $2827 = 0, $2828 = 0, $2829 = 0, $283 = 0, $2830 = 0, $2831 = 0, $2832 = 0, $2833 = 0;
 var $2834 = 0, $2835 = 0, $2836 = 0, $2837 = 0, $2838 = 0, $2839 = 0, $284 = 0, $2840 = 0, $2841 = 0, $2842 = 0, $2843 = 0, $2844 = 0, $2845 = 0, $2846 = 0, $2847 = 0, $2848 = 0, $2849 = 0, $285 = 0, $2850 = 0, $2851 = 0;
 var $2852 = 0, $2853 = 0, $2854 = 0, $2855 = 0, $2856 = 0, $2857 = 0, $2858 = 0, $2859 = 0, $286 = 0, $2860 = 0, $2861 = 0, $2862 = 0, $2863 = 0, $2864 = 0, $2865 = 0, $2866 = 0, $2867 = 0, $2868 = 0, $2869 = 0, $287 = 0;
 var $2870 = 0, $2871 = 0, $2872 = 0, $2873 = 0, $2874 = 0, $2875 = 0, $2876 = 0, $2877 = 0, $2878 = 0, $2879 = 0, $288 = 0, $2880 = 0, $2881 = 0, $2882 = 0, $2883 = 0, $2884 = 0, $2885 = 0, $2886 = 0, $2887 = 0, $2888 = 0;
 var $2889 = 0, $289 = 0, $2890 = 0, $2891 = 0, $2892 = 0, $2893 = 0, $2894 = 0, $2895 = 0, $2896 = 0, $2897 = 0, $2898 = 0, $2899 = 0, $29 = 0, $290 = 0, $2900 = 0, $2901 = 0, $2902 = 0, $2903 = 0, $2904 = 0, $2905 = 0;
 var $2906 = 0, $2907 = 0, $2908 = 0, $2909 = 0, $291 = 0, $2910 = 0, $2911 = 0, $2912 = 0, $2913 = 0, $2914 = 0, $2915 = 0, $2916 = 0, $2917 = 0, $2918 = 0, $2919 = 0, $292 = 0, $2920 = 0, $2921 = 0, $2922 = 0, $2923 = 0;
 var $2924 = 0, $2925 = 0, $2926 = 0, $2927 = 0, $2928 = 0, $2929 = 0, $293 = 0, $2930 = 0, $2931 = 0, $2932 = 0, $2933 = 0, $2934 = 0, $2935 = 0, $2936 = 0, $2937 = 0, $2938 = 0, $2939 = 0, $294 = 0, $2940 = 0, $2941 = 0;
 var $2942 = 0, $2943 = 0, $2944 = 0, $2945 = 0, $2946 = 0, $2947 = 0, $2948 = 0, $2949 = 0, $295 = 0, $2950 = 0, $2951 = 0, $2952 = 0, $2953 = 0, $2954 = 0, $2955 = 0, $2956 = 0, $2957 = 0, $2958 = 0, $2959 = 0, $296 = 0;
 var $2960 = 0, $2961 = 0, $2962 = 0, $2963 = 0, $2964 = 0, $2965 = 0, $2966 = 0, $2967 = 0, $2968 = 0, $2969 = 0, $297 = 0, $2970 = 0, $2971 = 0, $2972 = 0, $2973 = 0, $2974 = 0, $2975 = 0, $2976 = 0, $2977 = 0, $2978 = 0;
 var $2979 = 0, $298 = 0, $2980 = 0, $2981 = 0, $2982 = 0, $2983 = 0, $2984 = 0, $2985 = 0, $2986 = 0, $2987 = 0, $2988 = 0, $2989 = 0, $299 = 0, $2990 = 0, $2991 = 0, $2992 = 0, $2993 = 0, $2994 = 0, $2995 = 0, $2996 = 0;
 var $2997 = 0, $2998 = 0, $2999 = 0, $3 = 0, $30 = 0, $300 = 0, $3000 = 0, $3001 = 0, $3002 = 0, $3003 = 0, $3004 = 0, $3005 = 0, $3006 = 0, $3007 = 0, $3008 = 0, $3009 = 0, $301 = 0, $3010 = 0, $3011 = 0, $3012 = 0;
 var $3013 = 0, $3014 = 0, $3015 = 0, $3016 = 0, $3017 = 0, $3018 = 0, $3019 = 0, $302 = 0, $3020 = 0, $3021 = 0, $3022 = 0, $3023 = 0, $3024 = 0, $3025 = 0, $3026 = 0, $3027 = 0, $3028 = 0, $3029 = 0, $303 = 0, $3030 = 0;
 var $3031 = 0, $3032 = 0, $3033 = 0, $3034 = 0, $3035 = 0, $3036 = 0, $3037 = 0, $3038 = 0, $3039 = 0, $304 = 0, $3040 = 0, $3041 = 0, $3042 = 0, $3043 = 0, $3044 = 0, $3045 = 0, $3046 = 0, $3047 = 0, $3048 = 0, $3049 = 0;
 var $305 = 0, $3050 = 0, $3051 = 0, $3052 = 0, $3053 = 0, $3054 = 0, $3055 = 0, $3056 = 0, $3057 = 0, $3058 = 0, $3059 = 0, $306 = 0, $3060 = 0, $3061 = 0, $3062 = 0, $3063 = 0, $3064 = 0, $3065 = 0, $3066 = 0, $3067 = 0;
 var $3068 = 0, $3069 = 0, $307 = 0, $3070 = 0, $3071 = 0, $3072 = 0, $3073 = 0, $3074 = 0, $3075 = 0, $3076 = 0, $3077 = 0, $3078 = 0, $3079 = 0, $308 = 0, $3080 = 0, $3081 = 0, $3082 = 0, $3083 = 0, $3084 = 0, $3085 = 0;
 var $3086 = 0, $3087 = 0, $3088 = 0, $3089 = 0, $309 = 0, $3090 = 0, $3091 = 0, $3092 = 0, $3093 = 0, $3094 = 0, $3095 = 0, $3096 = 0, $3097 = 0, $3098 = 0, $3099 = 0, $31 = 0, $310 = 0, $3100 = 0, $3101 = 0, $3102 = 0;
 var $3103 = 0, $3104 = 0, $3105 = 0, $3106 = 0, $3107 = 0, $3108 = 0, $3109 = 0, $311 = 0, $3110 = 0, $3111 = 0, $3112 = 0, $3113 = 0, $3114 = 0, $3115 = 0, $3116 = 0, $3117 = 0, $3118 = 0, $3119 = 0, $312 = 0, $3120 = 0;
 var $3121 = 0, $3122 = 0, $3123 = 0, $3124 = 0, $3125 = 0, $3126 = 0, $3127 = 0, $3128 = 0, $3129 = 0, $313 = 0, $3130 = 0, $3131 = 0, $3132 = 0, $3133 = 0, $3134 = 0, $3135 = 0, $3136 = 0, $3137 = 0, $3138 = 0, $3139 = 0;
 var $314 = 0, $3140 = 0, $3141 = 0, $3142 = 0, $3143 = 0, $3144 = 0, $3145 = 0, $3146 = 0, $3147 = 0, $3148 = 0, $3149 = 0, $315 = 0, $3150 = 0, $3151 = 0, $3152 = 0, $3153 = 0, $3154 = 0, $3155 = 0, $3156 = 0, $3157 = 0;
 var $3158 = 0, $3159 = 0, $316 = 0, $3160 = 0, $3161 = 0, $3162 = 0, $3163 = 0, $3164 = 0, $3165 = 0, $3166 = 0, $3167 = 0, $3168 = 0, $3169 = 0, $317 = 0, $3170 = 0, $3171 = 0, $3172 = 0, $3173 = 0, $3174 = 0, $3175 = 0;
 var $3176 = 0, $3177 = 0, $3178 = 0, $3179 = 0, $318 = 0, $3180 = 0, $3181 = 0, $3182 = 0, $3183 = 0, $3184 = 0, $3185 = 0, $3186 = 0, $3187 = 0, $3188 = 0, $3189 = 0, $319 = 0, $3190 = 0, $3191 = 0, $3192 = 0, $3193 = 0;
 var $3194 = 0, $3195 = 0, $3196 = 0, $3197 = 0, $3198 = 0, $3199 = 0, $32 = 0, $320 = 0, $3200 = 0, $3201 = 0, $3202 = 0, $3203 = 0, $3204 = 0, $3205 = 0, $3206 = 0, $3207 = 0, $3208 = 0, $3209 = 0, $321 = 0, $3210 = 0;
 var $3211 = 0, $3212 = 0, $3213 = 0, $3214 = 0, $3215 = 0, $3216 = 0, $3217 = 0, $3218 = 0, $3219 = 0, $322 = 0, $3220 = 0, $3221 = 0, $3222 = 0, $3223 = 0, $3224 = 0, $3225 = 0, $3226 = 0, $3227 = 0, $3228 = 0, $3229 = 0;
 var $323 = 0, $3230 = 0, $3231 = 0, $3232 = 0, $3233 = 0, $3234 = 0, $3235 = 0, $3236 = 0, $3237 = 0, $3238 = 0, $3239 = 0, $324 = 0, $3240 = 0, $3241 = 0, $3242 = 0, $3243 = 0, $3244 = 0, $3245 = 0, $3246 = 0, $3247 = 0;
 var $3248 = 0, $3249 = 0, $325 = 0, $3250 = 0, $3251 = 0, $3252 = 0, $3253 = 0, $3254 = 0, $3255 = 0, $3256 = 0, $3257 = 0, $3258 = 0, $3259 = 0, $326 = 0, $3260 = 0, $3261 = 0, $3262 = 0, $3263 = 0, $3264 = 0, $3265 = 0;
 var $3266 = 0, $3267 = 0, $3268 = 0, $3269 = 0, $327 = 0, $3270 = 0, $3271 = 0, $3272 = 0, $3273 = 0, $3274 = 0, $3275 = 0, $3276 = 0, $3277 = 0, $3278 = 0, $3279 = 0, $328 = 0, $3280 = 0, $3281 = 0, $3282 = 0, $3283 = 0;
 var $3284 = 0, $3285 = 0, $3286 = 0, $3287 = 0, $3288 = 0, $3289 = 0, $329 = 0, $3290 = 0, $3291 = 0, $3292 = 0, $3293 = 0, $3294 = 0, $3295 = 0, $3296 = 0, $3297 = 0, $3298 = 0, $3299 = 0, $33 = 0, $330 = 0, $3300 = 0;
 var $3301 = 0, $3302 = 0, $3303 = 0, $3304 = 0, $3305 = 0, $3306 = 0, $3307 = 0, $3308 = 0, $3309 = 0, $331 = 0, $3310 = 0, $3311 = 0, $3312 = 0, $3313 = 0, $3314 = 0, $3315 = 0, $3316 = 0, $3317 = 0, $3318 = 0, $3319 = 0;
 var $332 = 0, $3320 = 0, $3321 = 0, $3322 = 0, $3323 = 0, $3324 = 0, $3325 = 0, $3326 = 0, $3327 = 0, $3328 = 0, $3329 = 0, $333 = 0, $3330 = 0, $3331 = 0, $3332 = 0, $3333 = 0, $3334 = 0, $3335 = 0, $3336 = 0, $3337 = 0;
 var $3338 = 0, $3339 = 0, $334 = 0, $3340 = 0, $3341 = 0, $3342 = 0, $3343 = 0, $3344 = 0, $3345 = 0, $3346 = 0, $3347 = 0, $3348 = 0, $3349 = 0, $335 = 0, $3350 = 0, $3351 = 0, $3352 = 0, $3353 = 0, $3354 = 0, $3355 = 0;
 var $3356 = 0, $3357 = 0, $3358 = 0, $3359 = 0, $336 = 0, $3360 = 0, $3361 = 0, $3362 = 0, $3363 = 0, $3364 = 0, $3365 = 0, $3366 = 0, $3367 = 0, $3368 = 0, $3369 = 0, $337 = 0, $3370 = 0, $3371 = 0, $3372 = 0, $3373 = 0;
 var $3374 = 0, $3375 = 0, $3376 = 0, $3377 = 0, $3378 = 0, $3379 = 0, $338 = 0, $3380 = 0, $3381 = 0, $3382 = 0, $3383 = 0, $3384 = 0, $3385 = 0, $3386 = 0, $3387 = 0, $3388 = 0, $3389 = 0, $339 = 0, $3390 = 0, $3391 = 0;
 var $3392 = 0, $3393 = 0, $3394 = 0, $3395 = 0, $3396 = 0, $3397 = 0, $3398 = 0, $3399 = 0, $34 = 0, $340 = 0, $3400 = 0, $3401 = 0, $3402 = 0, $3403 = 0, $3404 = 0, $3405 = 0, $3406 = 0, $3407 = 0, $3408 = 0, $3409 = 0;
 var $341 = 0, $3410 = 0, $3411 = 0, $3412 = 0, $3413 = 0, $3414 = 0, $3415 = 0, $3416 = 0, $3417 = 0, $3418 = 0, $3419 = 0, $342 = 0, $3420 = 0, $3421 = 0, $3422 = 0, $3423 = 0, $3424 = 0, $3425 = 0, $3426 = 0, $3427 = 0;
 var $3428 = 0, $3429 = 0, $343 = 0, $3430 = 0, $3431 = 0, $3432 = 0, $3433 = 0, $3434 = 0, $3435 = 0, $3436 = 0, $3437 = 0, $3438 = 0, $3439 = 0, $344 = 0, $3440 = 0, $3441 = 0, $3442 = 0, $3443 = 0, $3444 = 0, $3445 = 0;
 var $3446 = 0, $3447 = 0, $3448 = 0, $3449 = 0, $345 = 0, $3450 = 0, $3451 = 0, $3452 = 0, $3453 = 0, $3454 = 0, $3455 = 0, $3456 = 0, $3457 = 0, $3458 = 0, $3459 = 0, $346 = 0, $3460 = 0, $3461 = 0, $3462 = 0, $3463 = 0;
 var $3464 = 0, $3465 = 0, $3466 = 0, $3467 = 0, $3468 = 0, $3469 = 0, $347 = 0, $3470 = 0, $3471 = 0, $3472 = 0, $3473 = 0, $3474 = 0, $3475 = 0, $3476 = 0, $3477 = 0, $3478 = 0, $3479 = 0, $348 = 0, $3480 = 0, $3481 = 0;
 var $3482 = 0, $3483 = 0, $3484 = 0, $3485 = 0, $3486 = 0, $3487 = 0, $3488 = 0, $3489 = 0, $349 = 0, $3490 = 0, $3491 = 0, $3492 = 0, $3493 = 0, $3494 = 0, $3495 = 0, $3496 = 0, $3497 = 0, $3498 = 0, $3499 = 0, $35 = 0;
 var $350 = 0, $3500 = 0, $3501 = 0, $3502 = 0, $3503 = 0, $3504 = 0, $3505 = 0, $3506 = 0, $3507 = 0, $3508 = 0, $3509 = 0, $351 = 0, $3510 = 0, $3511 = 0, $3512 = 0, $3513 = 0, $3514 = 0, $3515 = 0, $3516 = 0, $3517 = 0;
 var $3518 = 0, $3519 = 0, $352 = 0, $3520 = 0, $3521 = 0, $3522 = 0, $3523 = 0, $3524 = 0, $3525 = 0, $3526 = 0, $3527 = 0, $3528 = 0, $3529 = 0, $353 = 0, $3530 = 0, $3531 = 0, $3532 = 0, $3533 = 0, $3534 = 0, $3535 = 0;
 var $3536 = 0, $3537 = 0, $3538 = 0, $3539 = 0, $354 = 0, $3540 = 0, $3541 = 0, $3542 = 0, $3543 = 0, $3544 = 0, $3545 = 0, $3546 = 0, $3547 = 0, $3548 = 0, $3549 = 0, $355 = 0, $3550 = 0, $3551 = 0, $3552 = 0, $3553 = 0;
 var $3554 = 0, $3555 = 0, $3556 = 0, $3557 = 0, $3558 = 0, $3559 = 0, $356 = 0, $3560 = 0, $3561 = 0, $3562 = 0, $3563 = 0, $3564 = 0, $3565 = 0, $3566 = 0, $3567 = 0, $3568 = 0, $3569 = 0, $357 = 0, $3570 = 0, $3571 = 0;
 var $3572 = 0, $3573 = 0, $3574 = 0, $3575 = 0, $3576 = 0, $3577 = 0, $3578 = 0, $3579 = 0, $358 = 0, $3580 = 0, $3581 = 0, $3582 = 0, $3583 = 0, $3584 = 0, $3585 = 0, $3586 = 0, $3587 = 0, $3588 = 0, $3589 = 0, $359 = 0;
 var $3590 = 0, $3591 = 0, $3592 = 0, $3593 = 0, $3594 = 0, $3595 = 0, $3596 = 0, $3597 = 0, $3598 = 0, $3599 = 0, $36 = 0, $360 = 0, $3600 = 0, $3601 = 0, $3602 = 0, $3603 = 0, $3604 = 0, $3605 = 0, $3606 = 0, $3607 = 0;
 var $3608 = 0, $3609 = 0, $361 = 0, $3610 = 0, $3611 = 0, $3612 = 0, $3613 = 0, $3614 = 0, $3615 = 0, $3616 = 0, $3617 = 0, $3618 = 0, $3619 = 0, $362 = 0, $3620 = 0, $3621 = 0, $3622 = 0, $3623 = 0, $3624 = 0, $3625 = 0;
 var $3626 = 0, $3627 = 0, $3628 = 0, $3629 = 0, $363 = 0, $3630 = 0, $3631 = 0, $3632 = 0, $3633 = 0, $3634 = 0, $3635 = 0, $3636 = 0, $3637 = 0, $3638 = 0, $3639 = 0, $364 = 0, $3640 = 0, $3641 = 0, $3642 = 0, $3643 = 0;
 var $3644 = 0, $3645 = 0, $3646 = 0, $3647 = 0, $3648 = 0, $3649 = 0, $365 = 0, $3650 = 0, $3651 = 0, $3652 = 0, $3653 = 0, $3654 = 0, $3655 = 0, $3656 = 0, $3657 = 0, $3658 = 0, $3659 = 0, $366 = 0, $3660 = 0, $3661 = 0;
 var $3662 = 0, $3663 = 0, $3664 = 0, $3665 = 0, $3666 = 0, $3667 = 0, $3668 = 0, $3669 = 0, $367 = 0, $3670 = 0, $3671 = 0, $3672 = 0, $3673 = 0, $3674 = 0, $3675 = 0, $3676 = 0, $3677 = 0, $3678 = 0, $3679 = 0, $368 = 0;
 var $3680 = 0, $3681 = 0, $3682 = 0, $3683 = 0, $3684 = 0, $3685 = 0, $3686 = 0, $3687 = 0, $3688 = 0, $3689 = 0, $369 = 0, $3690 = 0, $3691 = 0, $3692 = 0, $3693 = 0, $3694 = 0, $3695 = 0, $3696 = 0, $3697 = 0, $3698 = 0;
 var $3699 = 0, $37 = 0, $370 = 0, $3700 = 0, $3701 = 0, $3702 = 0, $3703 = 0, $3704 = 0, $3705 = 0, $3706 = 0, $3707 = 0, $3708 = 0, $3709 = 0, $371 = 0, $3710 = 0, $3711 = 0, $3712 = 0, $3713 = 0, $3714 = 0, $3715 = 0;
 var $3716 = 0, $3717 = 0, $3718 = 0, $3719 = 0, $372 = 0, $3720 = 0, $3721 = 0, $3722 = 0, $3723 = 0, $3724 = 0, $3725 = 0, $3726 = 0, $3727 = 0, $3728 = 0, $3729 = 0, $373 = 0, $3730 = 0, $3731 = 0, $3732 = 0, $3733 = 0;
 var $3734 = 0, $3735 = 0, $3736 = 0, $3737 = 0, $3738 = 0, $3739 = 0, $374 = 0, $3740 = 0, $3741 = 0, $3742 = 0, $3743 = 0, $3744 = 0, $3745 = 0, $3746 = 0, $3747 = 0, $3748 = 0, $3749 = 0, $375 = 0, $3750 = 0, $3751 = 0;
 var $3752 = 0, $3753 = 0, $3754 = 0, $3755 = 0, $3756 = 0, $3757 = 0, $3758 = 0, $3759 = 0, $376 = 0, $3760 = 0, $3761 = 0, $3762 = 0, $3763 = 0, $3764 = 0, $3765 = 0, $3766 = 0, $3767 = 0, $3768 = 0, $3769 = 0, $377 = 0;
 var $3770 = 0, $3771 = 0, $3772 = 0, $3773 = 0, $3774 = 0, $3775 = 0, $3776 = 0, $3777 = 0, $3778 = 0, $3779 = 0, $378 = 0, $3780 = 0, $3781 = 0, $3782 = 0, $3783 = 0, $3784 = 0, $3785 = 0, $3786 = 0, $3787 = 0, $3788 = 0;
 var $3789 = 0, $379 = 0, $3790 = 0, $3791 = 0, $3792 = 0, $3793 = 0, $3794 = 0, $3795 = 0, $3796 = 0, $3797 = 0, $3798 = 0, $3799 = 0, $38 = 0, $380 = 0, $3800 = 0, $3801 = 0, $3802 = 0, $3803 = 0, $3804 = 0, $3805 = 0;
 var $3806 = 0, $3807 = 0, $3808 = 0, $3809 = 0, $381 = 0, $3810 = 0, $3811 = 0, $3812 = 0, $3813 = 0, $3814 = 0, $3815 = 0, $3816 = 0, $3817 = 0, $3818 = 0, $3819 = 0, $382 = 0, $3820 = 0, $3821 = 0, $3822 = 0, $3823 = 0;
 var $3824 = 0, $3825 = 0, $3826 = 0, $3827 = 0, $3828 = 0, $3829 = 0, $383 = 0, $3830 = 0, $3831 = 0, $3832 = 0, $3833 = 0, $3834 = 0, $3835 = 0, $3836 = 0, $3837 = 0, $3838 = 0, $3839 = 0, $384 = 0, $3840 = 0, $3841 = 0;
 var $3842 = 0, $3843 = 0, $3844 = 0, $3845 = 0, $3846 = 0, $3847 = 0, $3848 = 0, $3849 = 0, $385 = 0, $3850 = 0, $3851 = 0, $3852 = 0, $3853 = 0, $3854 = 0, $3855 = 0, $3856 = 0, $3857 = 0, $3858 = 0, $3859 = 0, $386 = 0;
 var $3860 = 0, $3861 = 0, $3862 = 0, $3863 = 0, $3864 = 0, $3865 = 0, $3866 = 0, $3867 = 0, $3868 = 0, $3869 = 0, $387 = 0, $3870 = 0, $3871 = 0, $3872 = 0, $3873 = 0, $3874 = 0, $3875 = 0, $3876 = 0, $3877 = 0, $3878 = 0;
 var $3879 = 0, $388 = 0, $3880 = 0, $3881 = 0, $3882 = 0, $3883 = 0, $3884 = 0, $3885 = 0, $3886 = 0, $3887 = 0, $3888 = 0, $3889 = 0, $389 = 0, $3890 = 0, $3891 = 0, $3892 = 0, $3893 = 0, $3894 = 0, $3895 = 0, $3896 = 0;
 var $3897 = 0, $3898 = 0, $3899 = 0, $39 = 0, $390 = 0, $3900 = 0, $3901 = 0, $3902 = 0, $3903 = 0, $3904 = 0, $3905 = 0, $3906 = 0, $3907 = 0, $3908 = 0, $3909 = 0, $391 = 0, $3910 = 0, $3911 = 0, $3912 = 0, $3913 = 0;
 var $3914 = 0, $3915 = 0, $3916 = 0, $3917 = 0, $3918 = 0, $3919 = 0, $392 = 0, $3920 = 0, $3921 = 0, $3922 = 0, $3923 = 0, $3924 = 0, $3925 = 0, $3926 = 0, $3927 = 0, $3928 = 0, $3929 = 0, $393 = 0, $3930 = 0, $3931 = 0;
 var $3932 = 0, $3933 = 0, $3934 = 0, $3935 = 0, $3936 = 0, $3937 = 0, $3938 = 0, $3939 = 0, $394 = 0, $3940 = 0, $3941 = 0, $3942 = 0, $3943 = 0, $3944 = 0, $3945 = 0, $3946 = 0, $3947 = 0, $3948 = 0, $3949 = 0, $395 = 0;
 var $3950 = 0, $3951 = 0, $3952 = 0, $3953 = 0, $3954 = 0, $3955 = 0, $3956 = 0, $3957 = 0, $3958 = 0, $3959 = 0, $396 = 0, $3960 = 0, $3961 = 0, $3962 = 0, $3963 = 0, $3964 = 0, $3965 = 0, $3966 = 0, $3967 = 0, $3968 = 0;
 var $3969 = 0, $397 = 0, $3970 = 0, $3971 = 0, $3972 = 0, $3973 = 0, $3974 = 0, $3975 = 0, $3976 = 0, $3977 = 0, $3978 = 0, $3979 = 0, $398 = 0, $3980 = 0, $3981 = 0, $3982 = 0, $3983 = 0, $3984 = 0, $3985 = 0, $3986 = 0;
 var $3987 = 0, $3988 = 0, $3989 = 0, $399 = 0, $3990 = 0, $3991 = 0, $3992 = 0, $3993 = 0, $3994 = 0, $3995 = 0, $3996 = 0, $3997 = 0, $3998 = 0, $3999 = 0, $4 = 0, $40 = 0, $400 = 0, $4000 = 0, $4001 = 0, $4002 = 0;
 var $4003 = 0, $4004 = 0, $4005 = 0, $4006 = 0, $4007 = 0, $4008 = 0, $4009 = 0, $401 = 0, $4010 = 0, $4011 = 0, $4012 = 0, $4013 = 0, $4014 = 0, $4015 = 0, $4016 = 0, $4017 = 0, $4018 = 0, $4019 = 0, $402 = 0, $4020 = 0;
 var $4021 = 0, $4022 = 0, $4023 = 0, $4024 = 0, $4025 = 0, $4026 = 0, $4027 = 0, $4028 = 0, $4029 = 0, $403 = 0, $4030 = 0, $4031 = 0, $4032 = 0, $4033 = 0, $4034 = 0, $4035 = 0, $4036 = 0, $4037 = 0, $4038 = 0, $4039 = 0;
 var $404 = 0, $4040 = 0, $4041 = 0, $4042 = 0, $4043 = 0, $4044 = 0, $4045 = 0, $4046 = 0, $4047 = 0, $4048 = 0, $4049 = 0, $405 = 0, $4050 = 0, $4051 = 0, $4052 = 0, $4053 = 0, $4054 = 0, $4055 = 0, $4056 = 0, $4057 = 0;
 var $4058 = 0, $4059 = 0, $406 = 0, $4060 = 0, $4061 = 0, $4062 = 0, $4063 = 0, $4064 = 0, $4065 = 0, $4066 = 0, $4067 = 0, $4068 = 0, $4069 = 0, $407 = 0, $4070 = 0, $4071 = 0, $4072 = 0, $4073 = 0, $4074 = 0, $4075 = 0;
 var $4076 = 0, $4077 = 0, $4078 = 0, $4079 = 0, $408 = 0, $4080 = 0, $4081 = 0, $4082 = 0, $4083 = 0, $4084 = 0, $4085 = 0, $4086 = 0, $4087 = 0, $4088 = 0, $4089 = 0, $409 = 0, $4090 = 0, $4091 = 0, $4092 = 0, $4093 = 0;
 var $4094 = 0, $4095 = 0, $4096 = 0, $4097 = 0, $4098 = 0, $4099 = 0, $41 = 0, $410 = 0, $4100 = 0, $4101 = 0, $4102 = 0, $4103 = 0, $4104 = 0, $4105 = 0, $4106 = 0, $4107 = 0, $4108 = 0, $4109 = 0, $411 = 0, $4110 = 0;
 var $4111 = 0, $4112 = 0, $4113 = 0, $4114 = 0, $4115 = 0, $4116 = 0, $4117 = 0, $4118 = 0, $4119 = 0, $412 = 0, $4120 = 0, $4121 = 0, $4122 = 0, $4123 = 0, $4124 = 0, $4125 = 0, $4126 = 0, $4127 = 0, $4128 = 0, $4129 = 0;
 var $413 = 0, $4130 = 0, $4131 = 0, $4132 = 0, $4133 = 0, $4134 = 0, $4135 = 0, $4136 = 0, $4137 = 0, $4138 = 0, $4139 = 0, $414 = 0, $4140 = 0, $4141 = 0, $4142 = 0, $4143 = 0, $4144 = 0, $4145 = 0, $4146 = 0, $4147 = 0;
 var $4148 = 0, $4149 = 0, $415 = 0, $4150 = 0, $4151 = 0, $4152 = 0, $4153 = 0, $4154 = 0, $4155 = 0, $4156 = 0, $4157 = 0, $4158 = 0, $4159 = 0, $416 = 0, $4160 = 0, $4161 = 0, $4162 = 0, $4163 = 0, $4164 = 0, $4165 = 0;
 var $4166 = 0, $4167 = 0, $4168 = 0, $4169 = 0, $417 = 0, $4170 = 0, $4171 = 0, $4172 = 0, $4173 = 0, $4174 = 0, $4175 = 0, $4176 = 0, $4177 = 0, $4178 = 0, $4179 = 0, $418 = 0, $4180 = 0, $4181 = 0, $4182 = 0, $4183 = 0;
 var $4184 = 0, $4185 = 0, $4186 = 0, $4187 = 0, $4188 = 0, $4189 = 0, $419 = 0, $4190 = 0, $4191 = 0, $4192 = 0, $4193 = 0, $4194 = 0, $4195 = 0, $4196 = 0, $4197 = 0, $4198 = 0, $4199 = 0, $42 = 0, $420 = 0, $4200 = 0;
 var $4201 = 0, $4202 = 0, $4203 = 0, $4204 = 0, $4205 = 0, $4206 = 0, $4207 = 0, $4208 = 0, $4209 = 0, $421 = 0, $4210 = 0, $4211 = 0, $4212 = 0, $4213 = 0, $4214 = 0, $4215 = 0, $4216 = 0, $4217 = 0, $4218 = 0, $4219 = 0;
 var $422 = 0, $4220 = 0, $4221 = 0, $4222 = 0, $4223 = 0, $4224 = 0, $4225 = 0, $4226 = 0, $4227 = 0, $4228 = 0, $4229 = 0, $423 = 0, $4230 = 0, $4231 = 0, $4232 = 0, $4233 = 0, $4234 = 0, $4235 = 0, $4236 = 0, $4237 = 0;
 var $4238 = 0, $4239 = 0, $424 = 0, $4240 = 0, $4241 = 0, $4242 = 0, $4243 = 0, $4244 = 0, $4245 = 0, $4246 = 0, $4247 = 0, $4248 = 0, $4249 = 0, $425 = 0, $4250 = 0, $4251 = 0, $4252 = 0, $4253 = 0, $4254 = 0, $4255 = 0;
 var $4256 = 0, $4257 = 0, $4258 = 0, $4259 = 0, $426 = 0, $4260 = 0, $4261 = 0, $4262 = 0, $4263 = 0, $4264 = 0, $4265 = 0, $4266 = 0, $4267 = 0, $4268 = 0, $4269 = 0, $427 = 0, $4270 = 0, $4271 = 0, $4272 = 0, $4273 = 0;
 var $4274 = 0, $4275 = 0, $4276 = 0, $4277 = 0, $4278 = 0, $4279 = 0, $428 = 0, $4280 = 0, $4281 = 0, $4282 = 0, $4283 = 0, $4284 = 0, $4285 = 0, $4286 = 0, $4287 = 0, $4288 = 0, $4289 = 0, $429 = 0, $4290 = 0, $4291 = 0;
 var $4292 = 0, $4293 = 0, $4294 = 0, $4295 = 0, $4296 = 0, $4297 = 0, $4298 = 0, $4299 = 0, $43 = 0, $430 = 0, $4300 = 0, $4301 = 0, $4302 = 0, $4303 = 0, $4304 = 0, $4305 = 0, $4306 = 0, $4307 = 0, $4308 = 0, $4309 = 0;
 var $431 = 0, $4310 = 0, $4311 = 0, $4312 = 0, $4313 = 0, $4314 = 0, $4315 = 0, $4316 = 0, $4317 = 0, $4318 = 0, $4319 = 0, $432 = 0, $4320 = 0, $4321 = 0, $4322 = 0, $4323 = 0, $4324 = 0, $4325 = 0, $4326 = 0, $4327 = 0;
 var $4328 = 0, $4329 = 0, $433 = 0, $4330 = 0, $4331 = 0, $4332 = 0, $4333 = 0, $4334 = 0, $4335 = 0, $4336 = 0, $4337 = 0, $4338 = 0, $4339 = 0, $434 = 0, $4340 = 0, $4341 = 0, $4342 = 0, $4343 = 0, $4344 = 0, $4345 = 0;
 var $4346 = 0, $4347 = 0, $4348 = 0, $4349 = 0, $435 = 0, $4350 = 0, $4351 = 0, $4352 = 0, $4353 = 0, $4354 = 0, $4355 = 0, $4356 = 0, $4357 = 0, $4358 = 0, $4359 = 0, $436 = 0, $4360 = 0, $4361 = 0, $4362 = 0, $4363 = 0;
 var $4364 = 0, $4365 = 0, $4366 = 0, $4367 = 0, $4368 = 0, $4369 = 0, $437 = 0, $4370 = 0, $4371 = 0, $4372 = 0, $4373 = 0, $4374 = 0, $4375 = 0, $4376 = 0, $4377 = 0, $4378 = 0, $4379 = 0, $438 = 0, $4380 = 0, $4381 = 0;
 var $4382 = 0, $4383 = 0, $4384 = 0, $4385 = 0, $4386 = 0, $4387 = 0, $4388 = 0, $4389 = 0, $439 = 0, $4390 = 0, $4391 = 0, $4392 = 0, $4393 = 0, $4394 = 0, $4395 = 0, $4396 = 0, $4397 = 0, $4398 = 0, $4399 = 0, $44 = 0;
 var $440 = 0, $4400 = 0, $4401 = 0, $4402 = 0, $4403 = 0, $4404 = 0, $4405 = 0, $4406 = 0, $4407 = 0, $4408 = 0, $4409 = 0, $441 = 0, $4410 = 0, $4411 = 0, $4412 = 0, $4413 = 0, $4414 = 0, $4415 = 0, $4416 = 0, $4417 = 0;
 var $4418 = 0, $4419 = 0, $442 = 0, $4420 = 0, $4421 = 0, $4422 = 0, $4423 = 0, $4424 = 0, $4425 = 0, $4426 = 0, $4427 = 0, $4428 = 0, $4429 = 0, $443 = 0, $4430 = 0, $4431 = 0, $4432 = 0, $4433 = 0, $4434 = 0, $4435 = 0;
 var $4436 = 0, $4437 = 0, $4438 = 0, $4439 = 0, $444 = 0, $4440 = 0, $4441 = 0, $4442 = 0, $4443 = 0, $4444 = 0, $4445 = 0, $4446 = 0, $4447 = 0, $4448 = 0, $4449 = 0, $445 = 0, $4450 = 0, $4451 = 0, $4452 = 0, $4453 = 0;
 var $4454 = 0, $4455 = 0, $4456 = 0, $4457 = 0, $4458 = 0, $4459 = 0, $446 = 0, $4460 = 0, $4461 = 0, $4462 = 0, $4463 = 0, $4464 = 0, $4465 = 0, $4466 = 0, $4467 = 0, $4468 = 0, $4469 = 0, $447 = 0, $4470 = 0, $4471 = 0;
 var $4472 = 0, $4473 = 0, $4474 = 0, $4475 = 0, $4476 = 0, $4477 = 0, $4478 = 0, $4479 = 0, $448 = 0, $4480 = 0, $4481 = 0, $4482 = 0, $4483 = 0, $4484 = 0, $4485 = 0, $4486 = 0, $4487 = 0, $4488 = 0, $4489 = 0, $449 = 0;
 var $4490 = 0, $4491 = 0, $4492 = 0, $4493 = 0, $4494 = 0, $4495 = 0, $4496 = 0, $4497 = 0, $4498 = 0, $4499 = 0, $45 = 0, $450 = 0, $4500 = 0, $4501 = 0, $4502 = 0, $4503 = 0, $4504 = 0, $4505 = 0, $4506 = 0, $4507 = 0;
 var $4508 = 0, $4509 = 0, $451 = 0, $4510 = 0, $4511 = 0, $4512 = 0, $4513 = 0, $4514 = 0, $4515 = 0, $4516 = 0, $4517 = 0, $4518 = 0, $4519 = 0, $452 = 0, $4520 = 0, $4521 = 0, $4522 = 0, $4523 = 0, $4524 = 0, $4525 = 0;
 var $4526 = 0, $4527 = 0, $4528 = 0, $4529 = 0, $453 = 0, $4530 = 0, $4531 = 0, $4532 = 0, $4533 = 0, $4534 = 0, $4535 = 0, $4536 = 0, $4537 = 0, $4538 = 0, $4539 = 0, $454 = 0, $4540 = 0, $4541 = 0, $4542 = 0, $4543 = 0;
 var $4544 = 0, $4545 = 0, $4546 = 0, $4547 = 0, $4548 = 0, $4549 = 0, $455 = 0, $4550 = 0, $4551 = 0, $4552 = 0, $4553 = 0, $4554 = 0, $4555 = 0, $4556 = 0, $4557 = 0, $4558 = 0, $4559 = 0, $456 = 0, $4560 = 0, $4561 = 0;
 var $4562 = 0, $4563 = 0, $4564 = 0, $4565 = 0, $4566 = 0, $4567 = 0, $4568 = 0, $4569 = 0, $457 = 0, $4570 = 0, $4571 = 0, $4572 = 0, $4573 = 0, $4574 = 0, $4575 = 0, $4576 = 0, $4577 = 0, $4578 = 0, $4579 = 0, $458 = 0;
 var $4580 = 0, $4581 = 0, $4582 = 0, $4583 = 0, $4584 = 0, $4585 = 0, $4586 = 0, $4587 = 0, $4588 = 0, $4589 = 0, $459 = 0, $4590 = 0, $4591 = 0, $4592 = 0, $4593 = 0, $4594 = 0, $4595 = 0, $4596 = 0, $4597 = 0, $4598 = 0;
 var $4599 = 0, $46 = 0, $460 = 0, $4600 = 0, $4601 = 0, $4602 = 0, $4603 = 0, $4604 = 0, $4605 = 0, $4606 = 0, $4607 = 0, $4608 = 0, $4609 = 0, $461 = 0, $4610 = 0, $4611 = 0, $4612 = 0, $4613 = 0, $4614 = 0, $4615 = 0;
 var $4616 = 0, $4617 = 0, $4618 = 0, $4619 = 0, $462 = 0, $4620 = 0, $4621 = 0, $4622 = 0, $4623 = 0, $4624 = 0, $4625 = 0, $4626 = 0, $4627 = 0, $4628 = 0, $4629 = 0, $463 = 0, $4630 = 0, $4631 = 0, $4632 = 0, $4633 = 0;
 var $4634 = 0, $4635 = 0, $4636 = 0, $4637 = 0, $4638 = 0, $4639 = 0, $464 = 0, $4640 = 0, $4641 = 0, $4642 = 0, $4643 = 0, $4644 = 0, $4645 = 0, $4646 = 0, $4647 = 0, $4648 = 0, $4649 = 0, $465 = 0, $4650 = 0, $4651 = 0;
 var $4652 = 0, $4653 = 0, $4654 = 0, $4655 = 0, $4656 = 0, $4657 = 0, $4658 = 0, $4659 = 0, $466 = 0, $4660 = 0, $4661 = 0, $4662 = 0, $4663 = 0, $4664 = 0, $4665 = 0, $4666 = 0, $4667 = 0, $4668 = 0, $4669 = 0, $467 = 0;
 var $4670 = 0, $4671 = 0, $4672 = 0, $4673 = 0, $4674 = 0, $4675 = 0, $4676 = 0, $4677 = 0, $4678 = 0, $4679 = 0, $468 = 0, $4680 = 0, $4681 = 0, $4682 = 0, $4683 = 0, $4684 = 0, $4685 = 0, $4686 = 0, $4687 = 0, $4688 = 0;
 var $4689 = 0, $469 = 0, $4690 = 0, $4691 = 0, $4692 = 0, $4693 = 0, $4694 = 0, $4695 = 0, $4696 = 0, $4697 = 0, $4698 = 0, $4699 = 0, $47 = 0, $470 = 0, $4700 = 0, $4701 = 0, $4702 = 0, $4703 = 0, $4704 = 0, $4705 = 0;
 var $4706 = 0, $4707 = 0, $4708 = 0, $4709 = 0, $471 = 0, $4710 = 0, $4711 = 0, $4712 = 0, $4713 = 0, $4714 = 0, $4715 = 0, $4716 = 0, $4717 = 0, $4718 = 0, $4719 = 0, $472 = 0, $4720 = 0, $4721 = 0, $4722 = 0, $4723 = 0;
 var $4724 = 0, $4725 = 0, $4726 = 0, $4727 = 0, $4728 = 0, $4729 = 0, $473 = 0, $4730 = 0, $4731 = 0, $4732 = 0, $4733 = 0, $4734 = 0, $4735 = 0, $4736 = 0, $4737 = 0, $4738 = 0, $4739 = 0, $474 = 0, $4740 = 0, $4741 = 0;
 var $4742 = 0, $4743 = 0, $4744 = 0, $4745 = 0, $4746 = 0, $4747 = 0, $4748 = 0, $4749 = 0, $475 = 0, $4750 = 0, $4751 = 0, $4752 = 0, $4753 = 0, $4754 = 0, $4755 = 0, $4756 = 0, $4757 = 0, $4758 = 0, $4759 = 0, $476 = 0;
 var $4760 = 0, $4761 = 0, $4762 = 0, $4763 = 0, $4764 = 0, $4765 = 0, $4766 = 0, $4767 = 0, $4768 = 0, $4769 = 0, $477 = 0, $4770 = 0, $4771 = 0, $4772 = 0, $4773 = 0, $4774 = 0, $4775 = 0, $4776 = 0, $4777 = 0, $4778 = 0;
 var $4779 = 0, $478 = 0, $4780 = 0, $4781 = 0, $4782 = 0, $4783 = 0, $4784 = 0, $4785 = 0, $4786 = 0, $4787 = 0, $4788 = 0, $4789 = 0, $479 = 0, $4790 = 0, $4791 = 0, $4792 = 0, $4793 = 0, $4794 = 0, $4795 = 0, $4796 = 0;
 var $4797 = 0, $4798 = 0, $4799 = 0, $48 = 0, $480 = 0, $4800 = 0, $4801 = 0, $4802 = 0, $4803 = 0, $4804 = 0, $4805 = 0, $4806 = 0, $4807 = 0, $4808 = 0, $4809 = 0, $481 = 0, $4810 = 0, $4811 = 0, $4812 = 0, $4813 = 0;
 var $4814 = 0, $4815 = 0, $4816 = 0, $4817 = 0, $4818 = 0, $4819 = 0, $482 = 0, $4820 = 0, $4821 = 0, $4822 = 0, $4823 = 0, $4824 = 0, $4825 = 0, $4826 = 0, $4827 = 0, $4828 = 0, $4829 = 0, $483 = 0, $4830 = 0, $4831 = 0;
 var $4832 = 0, $4833 = 0, $4834 = 0, $4835 = 0, $4836 = 0, $4837 = 0, $4838 = 0, $4839 = 0, $484 = 0, $4840 = 0, $4841 = 0, $4842 = 0, $4843 = 0, $4844 = 0, $4845 = 0, $4846 = 0, $4847 = 0, $4848 = 0, $4849 = 0, $485 = 0;
 var $4850 = 0, $4851 = 0, $4852 = 0, $4853 = 0, $4854 = 0, $4855 = 0, $4856 = 0, $4857 = 0, $4858 = 0, $4859 = 0, $486 = 0, $4860 = 0, $4861 = 0, $4862 = 0, $4863 = 0, $4864 = 0, $4865 = 0, $4866 = 0, $4867 = 0, $4868 = 0;
 var $4869 = 0, $487 = 0, $4870 = 0, $4871 = 0, $4872 = 0, $4873 = 0, $4874 = 0, $4875 = 0, $4876 = 0, $4877 = 0, $4878 = 0, $4879 = 0, $488 = 0, $4880 = 0, $4881 = 0, $4882 = 0, $4883 = 0, $4884 = 0, $4885 = 0, $4886 = 0;
 var $4887 = 0, $4888 = 0, $4889 = 0, $489 = 0, $4890 = 0, $4891 = 0, $4892 = 0, $4893 = 0, $4894 = 0, $4895 = 0, $4896 = 0, $4897 = 0, $4898 = 0, $4899 = 0, $49 = 0, $490 = 0, $4900 = 0, $4901 = 0, $4902 = 0, $4903 = 0;
 var $4904 = 0, $4905 = 0, $4906 = 0, $4907 = 0, $4908 = 0, $4909 = 0, $491 = 0, $4910 = 0, $4911 = 0, $4912 = 0, $4913 = 0, $4914 = 0, $4915 = 0, $4916 = 0, $4917 = 0, $4918 = 0, $4919 = 0, $492 = 0, $4920 = 0, $4921 = 0;
 var $4922 = 0, $4923 = 0, $4924 = 0, $4925 = 0, $4926 = 0, $4927 = 0, $4928 = 0, $4929 = 0, $493 = 0, $4930 = 0, $4931 = 0, $4932 = 0, $4933 = 0, $4934 = 0, $4935 = 0, $4936 = 0, $4937 = 0, $4938 = 0, $4939 = 0, $494 = 0;
 var $4940 = 0, $4941 = 0, $4942 = 0, $4943 = 0, $4944 = 0, $4945 = 0, $4946 = 0, $4947 = 0, $4948 = 0, $4949 = 0, $495 = 0, $4950 = 0, $4951 = 0, $4952 = 0, $4953 = 0, $4954 = 0, $4955 = 0, $4956 = 0, $4957 = 0, $4958 = 0;
 var $4959 = 0, $496 = 0, $4960 = 0, $4961 = 0, $4962 = 0, $4963 = 0, $4964 = 0, $4965 = 0, $4966 = 0, $4967 = 0, $4968 = 0, $4969 = 0, $497 = 0, $4970 = 0, $4971 = 0, $4972 = 0, $4973 = 0, $4974 = 0, $4975 = 0, $4976 = 0;
 var $4977 = 0, $4978 = 0, $4979 = 0, $498 = 0, $4980 = 0, $4981 = 0, $4982 = 0, $4983 = 0, $4984 = 0, $4985 = 0, $4986 = 0, $4987 = 0, $4988 = 0, $4989 = 0, $499 = 0, $4990 = 0, $4991 = 0, $4992 = 0, $4993 = 0, $4994 = 0;
 var $4995 = 0, $4996 = 0, $4997 = 0, $4998 = 0, $4999 = 0, $5 = 0, $50 = 0, $500 = 0, $5000 = 0, $5001 = 0, $5002 = 0, $5003 = 0, $5004 = 0, $5005 = 0, $5006 = 0, $5007 = 0, $5008 = 0, $5009 = 0, $501 = 0, $5010 = 0;
 var $5011 = 0, $5012 = 0, $5013 = 0, $5014 = 0, $5015 = 0, $5016 = 0, $5017 = 0, $5018 = 0, $5019 = 0, $502 = 0, $5020 = 0, $5021 = 0, $5022 = 0, $5023 = 0, $5024 = 0, $5025 = 0, $5026 = 0, $5027 = 0, $5028 = 0, $5029 = 0;
 var $503 = 0, $5030 = 0, $5031 = 0, $5032 = 0, $5033 = 0, $5034 = 0, $5035 = 0, $5036 = 0, $5037 = 0, $5038 = 0, $5039 = 0, $504 = 0, $5040 = 0, $5041 = 0, $5042 = 0, $5043 = 0, $5044 = 0, $5045 = 0, $5046 = 0, $5047 = 0;
 var $5048 = 0, $5049 = 0, $505 = 0, $5050 = 0, $5051 = 0, $5052 = 0, $5053 = 0, $5054 = 0, $5055 = 0, $5056 = 0, $5057 = 0, $5058 = 0, $5059 = 0, $506 = 0, $5060 = 0, $5061 = 0, $5062 = 0, $5063 = 0, $5064 = 0, $5065 = 0;
 var $5066 = 0, $5067 = 0, $5068 = 0, $5069 = 0, $507 = 0, $5070 = 0, $5071 = 0, $5072 = 0, $5073 = 0, $5074 = 0, $5075 = 0, $5076 = 0, $5077 = 0, $5078 = 0, $5079 = 0, $508 = 0, $5080 = 0, $5081 = 0, $5082 = 0, $5083 = 0;
 var $5084 = 0, $5085 = 0, $5086 = 0, $5087 = 0, $5088 = 0, $5089 = 0, $509 = 0, $5090 = 0, $5091 = 0, $5092 = 0, $5093 = 0, $5094 = 0, $5095 = 0, $5096 = 0, $5097 = 0, $5098 = 0, $5099 = 0, $51 = 0, $510 = 0, $5100 = 0;
 var $5101 = 0, $5102 = 0, $5103 = 0, $5104 = 0, $5105 = 0, $5106 = 0, $5107 = 0, $5108 = 0, $5109 = 0, $511 = 0, $5110 = 0, $5111 = 0, $5112 = 0, $5113 = 0, $5114 = 0, $5115 = 0, $5116 = 0, $5117 = 0, $5118 = 0, $5119 = 0;
 var $512 = 0, $5120 = 0, $5121 = 0, $5122 = 0, $5123 = 0, $5124 = 0, $5125 = 0, $5126 = 0, $5127 = 0, $5128 = 0, $5129 = 0, $513 = 0, $5130 = 0, $5131 = 0, $5132 = 0, $5133 = 0, $5134 = 0, $5135 = 0, $5136 = 0, $5137 = 0;
 var $5138 = 0, $5139 = 0, $514 = 0, $5140 = 0, $5141 = 0, $5142 = 0, $5143 = 0, $5144 = 0, $5145 = 0, $5146 = 0, $5147 = 0, $5148 = 0, $5149 = 0, $515 = 0, $5150 = 0, $5151 = 0, $5152 = 0, $5153 = 0, $5154 = 0, $5155 = 0;
 var $5156 = 0, $5157 = 0, $5158 = 0, $5159 = 0, $516 = 0, $5160 = 0, $5161 = 0, $5162 = 0, $5163 = 0, $5164 = 0, $5165 = 0, $5166 = 0, $5167 = 0, $5168 = 0, $5169 = 0, $517 = 0, $5170 = 0, $5171 = 0, $5172 = 0, $5173 = 0;
 var $5174 = 0, $5175 = 0, $5176 = 0, $5177 = 0, $5178 = 0, $5179 = 0, $518 = 0, $5180 = 0, $5181 = 0, $5182 = 0, $5183 = 0, $5184 = 0, $5185 = 0, $5186 = 0, $5187 = 0, $5188 = 0, $5189 = 0, $519 = 0, $5190 = 0, $5191 = 0;
 var $5192 = 0, $5193 = 0, $5194 = 0, $5195 = 0, $5196 = 0, $5197 = 0, $5198 = 0, $5199 = 0, $52 = 0, $520 = 0, $5200 = 0, $5201 = 0, $5202 = 0, $5203 = 0, $5204 = 0, $5205 = 0, $5206 = 0, $5207 = 0, $5208 = 0, $5209 = 0;
 var $521 = 0, $5210 = 0, $5211 = 0, $5212 = 0, $5213 = 0, $5214 = 0, $5215 = 0, $5216 = 0, $5217 = 0, $5218 = 0, $5219 = 0, $522 = 0, $5220 = 0, $5221 = 0, $5222 = 0, $5223 = 0, $5224 = 0, $5225 = 0, $5226 = 0, $5227 = 0;
 var $5228 = 0, $5229 = 0, $523 = 0, $5230 = 0, $5231 = 0, $5232 = 0, $5233 = 0, $5234 = 0, $5235 = 0, $5236 = 0, $5237 = 0, $5238 = 0, $5239 = 0, $524 = 0, $5240 = 0, $5241 = 0, $5242 = 0, $5243 = 0, $5244 = 0, $5245 = 0;
 var $5246 = 0, $5247 = 0, $5248 = 0, $5249 = 0, $525 = 0, $5250 = 0, $5251 = 0, $5252 = 0, $5253 = 0, $5254 = 0, $5255 = 0, $5256 = 0, $5257 = 0, $5258 = 0, $5259 = 0, $526 = 0, $5260 = 0, $5261 = 0, $5262 = 0, $5263 = 0;
 var $5264 = 0, $5265 = 0, $5266 = 0, $5267 = 0, $5268 = 0, $5269 = 0, $527 = 0, $5270 = 0, $5271 = 0, $5272 = 0, $5273 = 0, $5274 = 0, $5275 = 0, $5276 = 0, $5277 = 0, $5278 = 0, $5279 = 0, $528 = 0, $5280 = 0, $5281 = 0;
 var $5282 = 0, $5283 = 0, $5284 = 0, $5285 = 0, $5286 = 0, $5287 = 0, $5288 = 0, $5289 = 0, $529 = 0, $5290 = 0, $5291 = 0, $5292 = 0, $5293 = 0, $5294 = 0, $5295 = 0, $5296 = 0, $5297 = 0, $5298 = 0, $5299 = 0, $53 = 0;
 var $530 = 0, $5300 = 0, $5301 = 0, $5302 = 0, $5303 = 0, $5304 = 0, $5305 = 0, $5306 = 0, $5307 = 0, $5308 = 0, $5309 = 0, $531 = 0, $5310 = 0, $5311 = 0, $5312 = 0, $5313 = 0, $5314 = 0, $5315 = 0, $5316 = 0, $5317 = 0;
 var $5318 = 0, $5319 = 0, $532 = 0, $5320 = 0, $5321 = 0, $5322 = 0, $5323 = 0, $5324 = 0, $5325 = 0, $5326 = 0, $5327 = 0, $5328 = 0, $5329 = 0, $533 = 0, $5330 = 0, $5331 = 0, $5332 = 0, $5333 = 0, $5334 = 0, $5335 = 0;
 var $5336 = 0, $5337 = 0, $5338 = 0, $5339 = 0, $534 = 0, $5340 = 0, $5341 = 0, $5342 = 0, $5343 = 0, $5344 = 0, $5345 = 0, $5346 = 0, $5347 = 0, $5348 = 0, $5349 = 0, $535 = 0, $5350 = 0, $5351 = 0, $5352 = 0, $5353 = 0;
 var $5354 = 0, $5355 = 0, $5356 = 0, $5357 = 0, $5358 = 0, $5359 = 0, $536 = 0, $5360 = 0, $5361 = 0, $5362 = 0, $5363 = 0, $5364 = 0, $5365 = 0, $5366 = 0, $5367 = 0, $5368 = 0, $5369 = 0, $537 = 0, $5370 = 0, $5371 = 0;
 var $5372 = 0, $5373 = 0, $5374 = 0, $5375 = 0, $5376 = 0, $5377 = 0, $5378 = 0, $5379 = 0, $538 = 0, $5380 = 0, $5381 = 0, $5382 = 0, $5383 = 0, $5384 = 0, $5385 = 0, $5386 = 0, $5387 = 0, $5388 = 0, $5389 = 0, $539 = 0;
 var $5390 = 0, $5391 = 0, $5392 = 0, $5393 = 0, $5394 = 0, $5395 = 0, $5396 = 0, $5397 = 0, $5398 = 0, $5399 = 0, $54 = 0, $540 = 0, $5400 = 0, $5401 = 0, $5402 = 0, $5403 = 0, $5404 = 0, $5405 = 0, $5406 = 0, $5407 = 0;
 var $5408 = 0, $5409 = 0, $541 = 0, $5410 = 0, $5411 = 0, $5412 = 0, $5413 = 0, $5414 = 0, $5415 = 0, $5416 = 0, $5417 = 0, $5418 = 0, $5419 = 0, $542 = 0, $5420 = 0, $5421 = 0, $5422 = 0, $5423 = 0, $5424 = 0, $5425 = 0;
 var $5426 = 0, $5427 = 0, $5428 = 0, $5429 = 0, $543 = 0, $5430 = 0, $5431 = 0, $5432 = 0, $5433 = 0, $5434 = 0, $5435 = 0, $5436 = 0, $5437 = 0, $5438 = 0, $5439 = 0, $544 = 0, $5440 = 0, $5441 = 0, $5442 = 0, $5443 = 0;
 var $5444 = 0, $5445 = 0, $5446 = 0, $5447 = 0, $5448 = 0, $5449 = 0, $545 = 0, $5450 = 0, $5451 = 0, $5452 = 0, $5453 = 0, $5454 = 0, $5455 = 0, $5456 = 0, $5457 = 0, $5458 = 0, $5459 = 0, $546 = 0, $5460 = 0, $5461 = 0;
 var $5462 = 0, $5463 = 0, $5464 = 0, $5465 = 0, $5466 = 0, $5467 = 0, $5468 = 0, $5469 = 0, $547 = 0, $5470 = 0, $5471 = 0, $5472 = 0, $5473 = 0, $5474 = 0, $5475 = 0, $5476 = 0, $5477 = 0, $5478 = 0, $5479 = 0, $548 = 0;
 var $5480 = 0, $5481 = 0, $5482 = 0, $5483 = 0, $5484 = 0, $5485 = 0, $5486 = 0, $5487 = 0, $5488 = 0, $5489 = 0, $549 = 0, $5490 = 0, $5491 = 0, $5492 = 0, $5493 = 0, $5494 = 0, $5495 = 0, $5496 = 0, $5497 = 0, $5498 = 0;
 var $5499 = 0, $55 = 0, $550 = 0, $5500 = 0, $5501 = 0, $5502 = 0, $5503 = 0, $5504 = 0, $5505 = 0, $5506 = 0, $5507 = 0, $5508 = 0, $5509 = 0, $551 = 0, $5510 = 0, $5511 = 0, $5512 = 0, $5513 = 0, $5514 = 0, $5515 = 0;
 var $5516 = 0, $5517 = 0, $5518 = 0, $5519 = 0, $552 = 0, $5520 = 0, $5521 = 0, $5522 = 0, $5523 = 0, $5524 = 0, $5525 = 0, $5526 = 0, $5527 = 0, $5528 = 0, $5529 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0;
 var $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0;
 var $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0;
 var $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0;
 var $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0;
 var $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0;
 var $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0;
 var $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0;
 var $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0;
 var $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0;
 var $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0;
 var $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0;
 var $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0;
 var $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0;
 var $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0;
 var $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0;
 var $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0;
 var $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0;
 var $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0;
 var $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0;
 var $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0;
 var $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0;
 var $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0;
 var $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0;
 var $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0, $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0;
 var $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $S = 0, $W = 0, $i = 0, $t0 = 0, $t1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 320|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $W = sp + 8|0;
 $S = sp + 264|0;
 $0 = $state;
 $1 = $block;
 $2 = $1;
 _be32dec_vect($W,$2,64);
 $i = 16;
 while(1) {
  $3 = $i;
  $4 = ($3|0)<(64);
  if (!($4)) {
   break;
  }
  $5 = $i;
  $6 = (($5) - 2)|0;
  $7 = (($W) + ($6<<2)|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = $8 >>> 17;
  $10 = $i;
  $11 = (($10) - 2)|0;
  $12 = (($W) + ($11<<2)|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = $13 << 15;
  $15 = $9 | $14;
  $16 = $i;
  $17 = (($16) - 2)|0;
  $18 = (($W) + ($17<<2)|0);
  $19 = HEAP32[$18>>2]|0;
  $20 = $19 >>> 19;
  $21 = $i;
  $22 = (($21) - 2)|0;
  $23 = (($W) + ($22<<2)|0);
  $24 = HEAP32[$23>>2]|0;
  $25 = $24 << 13;
  $26 = $20 | $25;
  $27 = $15 ^ $26;
  $28 = $i;
  $29 = (($28) - 2)|0;
  $30 = (($W) + ($29<<2)|0);
  $31 = HEAP32[$30>>2]|0;
  $32 = $31 >>> 10;
  $33 = $27 ^ $32;
  $34 = $i;
  $35 = (($34) - 7)|0;
  $36 = (($W) + ($35<<2)|0);
  $37 = HEAP32[$36>>2]|0;
  $38 = (($33) + ($37))|0;
  $39 = $i;
  $40 = (($39) - 15)|0;
  $41 = (($W) + ($40<<2)|0);
  $42 = HEAP32[$41>>2]|0;
  $43 = $42 >>> 7;
  $44 = $i;
  $45 = (($44) - 15)|0;
  $46 = (($W) + ($45<<2)|0);
  $47 = HEAP32[$46>>2]|0;
  $48 = $47 << 25;
  $49 = $43 | $48;
  $50 = $i;
  $51 = (($50) - 15)|0;
  $52 = (($W) + ($51<<2)|0);
  $53 = HEAP32[$52>>2]|0;
  $54 = $53 >>> 18;
  $55 = $i;
  $56 = (($55) - 15)|0;
  $57 = (($W) + ($56<<2)|0);
  $58 = HEAP32[$57>>2]|0;
  $59 = $58 << 14;
  $60 = $54 | $59;
  $61 = $49 ^ $60;
  $62 = $i;
  $63 = (($62) - 15)|0;
  $64 = (($W) + ($63<<2)|0);
  $65 = HEAP32[$64>>2]|0;
  $66 = $65 >>> 3;
  $67 = $61 ^ $66;
  $68 = (($38) + ($67))|0;
  $69 = $i;
  $70 = (($69) - 16)|0;
  $71 = (($W) + ($70<<2)|0);
  $72 = HEAP32[$71>>2]|0;
  $73 = (($68) + ($72))|0;
  $74 = $i;
  $75 = (($W) + ($74<<2)|0);
  HEAP32[$75>>2] = $73;
  $76 = $i;
  $77 = (($76) + 1)|0;
  $i = $77;
 }
 $78 = $0;
 ;HEAP32[$S+0>>2]=HEAP32[$78+0>>2]|0;HEAP32[$S+4>>2]=HEAP32[$78+4>>2]|0;HEAP32[$S+8>>2]=HEAP32[$78+8>>2]|0;HEAP32[$S+12>>2]=HEAP32[$78+12>>2]|0;HEAP32[$S+16>>2]=HEAP32[$78+16>>2]|0;HEAP32[$S+20>>2]=HEAP32[$78+20>>2]|0;HEAP32[$S+24>>2]=HEAP32[$78+24>>2]|0;HEAP32[$S+28>>2]=HEAP32[$78+28>>2]|0;
 $79 = (($S) + 28|0);
 $80 = HEAP32[$79>>2]|0;
 $81 = (($S) + 16|0);
 $82 = HEAP32[$81>>2]|0;
 $83 = $82 >>> 6;
 $84 = (($S) + 16|0);
 $85 = HEAP32[$84>>2]|0;
 $86 = $85 << 26;
 $87 = $83 | $86;
 $88 = (($S) + 16|0);
 $89 = HEAP32[$88>>2]|0;
 $90 = $89 >>> 11;
 $91 = (($S) + 16|0);
 $92 = HEAP32[$91>>2]|0;
 $93 = $92 << 21;
 $94 = $90 | $93;
 $95 = $87 ^ $94;
 $96 = (($S) + 16|0);
 $97 = HEAP32[$96>>2]|0;
 $98 = $97 >>> 25;
 $99 = (($S) + 16|0);
 $100 = HEAP32[$99>>2]|0;
 $101 = $100 << 7;
 $102 = $98 | $101;
 $103 = $95 ^ $102;
 $104 = (($80) + ($103))|0;
 $105 = (($S) + 16|0);
 $106 = HEAP32[$105>>2]|0;
 $107 = (($S) + 20|0);
 $108 = HEAP32[$107>>2]|0;
 $109 = (($S) + 24|0);
 $110 = HEAP32[$109>>2]|0;
 $111 = $108 ^ $110;
 $112 = $106 & $111;
 $113 = (($S) + 24|0);
 $114 = HEAP32[$113>>2]|0;
 $115 = $112 ^ $114;
 $116 = (($104) + ($115))|0;
 $117 = HEAP32[$W>>2]|0;
 $118 = (($116) + ($117))|0;
 $119 = (($118) + 1116352408)|0;
 $t0 = $119;
 $120 = HEAP32[$S>>2]|0;
 $121 = $120 >>> 2;
 $122 = HEAP32[$S>>2]|0;
 $123 = $122 << 30;
 $124 = $121 | $123;
 $125 = HEAP32[$S>>2]|0;
 $126 = $125 >>> 13;
 $127 = HEAP32[$S>>2]|0;
 $128 = $127 << 19;
 $129 = $126 | $128;
 $130 = $124 ^ $129;
 $131 = HEAP32[$S>>2]|0;
 $132 = $131 >>> 22;
 $133 = HEAP32[$S>>2]|0;
 $134 = $133 << 10;
 $135 = $132 | $134;
 $136 = $130 ^ $135;
 $137 = HEAP32[$S>>2]|0;
 $138 = (($S) + 4|0);
 $139 = HEAP32[$138>>2]|0;
 $140 = (($S) + 8|0);
 $141 = HEAP32[$140>>2]|0;
 $142 = $139 | $141;
 $143 = $137 & $142;
 $144 = (($S) + 4|0);
 $145 = HEAP32[$144>>2]|0;
 $146 = (($S) + 8|0);
 $147 = HEAP32[$146>>2]|0;
 $148 = $145 & $147;
 $149 = $143 | $148;
 $150 = (($136) + ($149))|0;
 $t1 = $150;
 $151 = $t0;
 $152 = (($S) + 12|0);
 $153 = HEAP32[$152>>2]|0;
 $154 = (($153) + ($151))|0;
 HEAP32[$152>>2] = $154;
 $155 = $t0;
 $156 = $t1;
 $157 = (($155) + ($156))|0;
 $158 = (($S) + 28|0);
 HEAP32[$158>>2] = $157;
 $159 = (($S) + 24|0);
 $160 = HEAP32[$159>>2]|0;
 $161 = (($S) + 12|0);
 $162 = HEAP32[$161>>2]|0;
 $163 = $162 >>> 6;
 $164 = (($S) + 12|0);
 $165 = HEAP32[$164>>2]|0;
 $166 = $165 << 26;
 $167 = $163 | $166;
 $168 = (($S) + 12|0);
 $169 = HEAP32[$168>>2]|0;
 $170 = $169 >>> 11;
 $171 = (($S) + 12|0);
 $172 = HEAP32[$171>>2]|0;
 $173 = $172 << 21;
 $174 = $170 | $173;
 $175 = $167 ^ $174;
 $176 = (($S) + 12|0);
 $177 = HEAP32[$176>>2]|0;
 $178 = $177 >>> 25;
 $179 = (($S) + 12|0);
 $180 = HEAP32[$179>>2]|0;
 $181 = $180 << 7;
 $182 = $178 | $181;
 $183 = $175 ^ $182;
 $184 = (($160) + ($183))|0;
 $185 = (($S) + 12|0);
 $186 = HEAP32[$185>>2]|0;
 $187 = (($S) + 16|0);
 $188 = HEAP32[$187>>2]|0;
 $189 = (($S) + 20|0);
 $190 = HEAP32[$189>>2]|0;
 $191 = $188 ^ $190;
 $192 = $186 & $191;
 $193 = (($S) + 20|0);
 $194 = HEAP32[$193>>2]|0;
 $195 = $192 ^ $194;
 $196 = (($184) + ($195))|0;
 $197 = (($W) + 4|0);
 $198 = HEAP32[$197>>2]|0;
 $199 = (($196) + ($198))|0;
 $200 = (($199) + 1899447441)|0;
 $t0 = $200;
 $201 = (($S) + 28|0);
 $202 = HEAP32[$201>>2]|0;
 $203 = $202 >>> 2;
 $204 = (($S) + 28|0);
 $205 = HEAP32[$204>>2]|0;
 $206 = $205 << 30;
 $207 = $203 | $206;
 $208 = (($S) + 28|0);
 $209 = HEAP32[$208>>2]|0;
 $210 = $209 >>> 13;
 $211 = (($S) + 28|0);
 $212 = HEAP32[$211>>2]|0;
 $213 = $212 << 19;
 $214 = $210 | $213;
 $215 = $207 ^ $214;
 $216 = (($S) + 28|0);
 $217 = HEAP32[$216>>2]|0;
 $218 = $217 >>> 22;
 $219 = (($S) + 28|0);
 $220 = HEAP32[$219>>2]|0;
 $221 = $220 << 10;
 $222 = $218 | $221;
 $223 = $215 ^ $222;
 $224 = (($S) + 28|0);
 $225 = HEAP32[$224>>2]|0;
 $226 = HEAP32[$S>>2]|0;
 $227 = (($S) + 4|0);
 $228 = HEAP32[$227>>2]|0;
 $229 = $226 | $228;
 $230 = $225 & $229;
 $231 = HEAP32[$S>>2]|0;
 $232 = (($S) + 4|0);
 $233 = HEAP32[$232>>2]|0;
 $234 = $231 & $233;
 $235 = $230 | $234;
 $236 = (($223) + ($235))|0;
 $t1 = $236;
 $237 = $t0;
 $238 = (($S) + 8|0);
 $239 = HEAP32[$238>>2]|0;
 $240 = (($239) + ($237))|0;
 HEAP32[$238>>2] = $240;
 $241 = $t0;
 $242 = $t1;
 $243 = (($241) + ($242))|0;
 $244 = (($S) + 24|0);
 HEAP32[$244>>2] = $243;
 $245 = (($S) + 20|0);
 $246 = HEAP32[$245>>2]|0;
 $247 = (($S) + 8|0);
 $248 = HEAP32[$247>>2]|0;
 $249 = $248 >>> 6;
 $250 = (($S) + 8|0);
 $251 = HEAP32[$250>>2]|0;
 $252 = $251 << 26;
 $253 = $249 | $252;
 $254 = (($S) + 8|0);
 $255 = HEAP32[$254>>2]|0;
 $256 = $255 >>> 11;
 $257 = (($S) + 8|0);
 $258 = HEAP32[$257>>2]|0;
 $259 = $258 << 21;
 $260 = $256 | $259;
 $261 = $253 ^ $260;
 $262 = (($S) + 8|0);
 $263 = HEAP32[$262>>2]|0;
 $264 = $263 >>> 25;
 $265 = (($S) + 8|0);
 $266 = HEAP32[$265>>2]|0;
 $267 = $266 << 7;
 $268 = $264 | $267;
 $269 = $261 ^ $268;
 $270 = (($246) + ($269))|0;
 $271 = (($S) + 8|0);
 $272 = HEAP32[$271>>2]|0;
 $273 = (($S) + 12|0);
 $274 = HEAP32[$273>>2]|0;
 $275 = (($S) + 16|0);
 $276 = HEAP32[$275>>2]|0;
 $277 = $274 ^ $276;
 $278 = $272 & $277;
 $279 = (($S) + 16|0);
 $280 = HEAP32[$279>>2]|0;
 $281 = $278 ^ $280;
 $282 = (($270) + ($281))|0;
 $283 = (($W) + 8|0);
 $284 = HEAP32[$283>>2]|0;
 $285 = (($282) + ($284))|0;
 $286 = (($285) + -1245643825)|0;
 $t0 = $286;
 $287 = (($S) + 24|0);
 $288 = HEAP32[$287>>2]|0;
 $289 = $288 >>> 2;
 $290 = (($S) + 24|0);
 $291 = HEAP32[$290>>2]|0;
 $292 = $291 << 30;
 $293 = $289 | $292;
 $294 = (($S) + 24|0);
 $295 = HEAP32[$294>>2]|0;
 $296 = $295 >>> 13;
 $297 = (($S) + 24|0);
 $298 = HEAP32[$297>>2]|0;
 $299 = $298 << 19;
 $300 = $296 | $299;
 $301 = $293 ^ $300;
 $302 = (($S) + 24|0);
 $303 = HEAP32[$302>>2]|0;
 $304 = $303 >>> 22;
 $305 = (($S) + 24|0);
 $306 = HEAP32[$305>>2]|0;
 $307 = $306 << 10;
 $308 = $304 | $307;
 $309 = $301 ^ $308;
 $310 = (($S) + 24|0);
 $311 = HEAP32[$310>>2]|0;
 $312 = (($S) + 28|0);
 $313 = HEAP32[$312>>2]|0;
 $314 = HEAP32[$S>>2]|0;
 $315 = $313 | $314;
 $316 = $311 & $315;
 $317 = (($S) + 28|0);
 $318 = HEAP32[$317>>2]|0;
 $319 = HEAP32[$S>>2]|0;
 $320 = $318 & $319;
 $321 = $316 | $320;
 $322 = (($309) + ($321))|0;
 $t1 = $322;
 $323 = $t0;
 $324 = (($S) + 4|0);
 $325 = HEAP32[$324>>2]|0;
 $326 = (($325) + ($323))|0;
 HEAP32[$324>>2] = $326;
 $327 = $t0;
 $328 = $t1;
 $329 = (($327) + ($328))|0;
 $330 = (($S) + 20|0);
 HEAP32[$330>>2] = $329;
 $331 = (($S) + 16|0);
 $332 = HEAP32[$331>>2]|0;
 $333 = (($S) + 4|0);
 $334 = HEAP32[$333>>2]|0;
 $335 = $334 >>> 6;
 $336 = (($S) + 4|0);
 $337 = HEAP32[$336>>2]|0;
 $338 = $337 << 26;
 $339 = $335 | $338;
 $340 = (($S) + 4|0);
 $341 = HEAP32[$340>>2]|0;
 $342 = $341 >>> 11;
 $343 = (($S) + 4|0);
 $344 = HEAP32[$343>>2]|0;
 $345 = $344 << 21;
 $346 = $342 | $345;
 $347 = $339 ^ $346;
 $348 = (($S) + 4|0);
 $349 = HEAP32[$348>>2]|0;
 $350 = $349 >>> 25;
 $351 = (($S) + 4|0);
 $352 = HEAP32[$351>>2]|0;
 $353 = $352 << 7;
 $354 = $350 | $353;
 $355 = $347 ^ $354;
 $356 = (($332) + ($355))|0;
 $357 = (($S) + 4|0);
 $358 = HEAP32[$357>>2]|0;
 $359 = (($S) + 8|0);
 $360 = HEAP32[$359>>2]|0;
 $361 = (($S) + 12|0);
 $362 = HEAP32[$361>>2]|0;
 $363 = $360 ^ $362;
 $364 = $358 & $363;
 $365 = (($S) + 12|0);
 $366 = HEAP32[$365>>2]|0;
 $367 = $364 ^ $366;
 $368 = (($356) + ($367))|0;
 $369 = (($W) + 12|0);
 $370 = HEAP32[$369>>2]|0;
 $371 = (($368) + ($370))|0;
 $372 = (($371) + -373957723)|0;
 $t0 = $372;
 $373 = (($S) + 20|0);
 $374 = HEAP32[$373>>2]|0;
 $375 = $374 >>> 2;
 $376 = (($S) + 20|0);
 $377 = HEAP32[$376>>2]|0;
 $378 = $377 << 30;
 $379 = $375 | $378;
 $380 = (($S) + 20|0);
 $381 = HEAP32[$380>>2]|0;
 $382 = $381 >>> 13;
 $383 = (($S) + 20|0);
 $384 = HEAP32[$383>>2]|0;
 $385 = $384 << 19;
 $386 = $382 | $385;
 $387 = $379 ^ $386;
 $388 = (($S) + 20|0);
 $389 = HEAP32[$388>>2]|0;
 $390 = $389 >>> 22;
 $391 = (($S) + 20|0);
 $392 = HEAP32[$391>>2]|0;
 $393 = $392 << 10;
 $394 = $390 | $393;
 $395 = $387 ^ $394;
 $396 = (($S) + 20|0);
 $397 = HEAP32[$396>>2]|0;
 $398 = (($S) + 24|0);
 $399 = HEAP32[$398>>2]|0;
 $400 = (($S) + 28|0);
 $401 = HEAP32[$400>>2]|0;
 $402 = $399 | $401;
 $403 = $397 & $402;
 $404 = (($S) + 24|0);
 $405 = HEAP32[$404>>2]|0;
 $406 = (($S) + 28|0);
 $407 = HEAP32[$406>>2]|0;
 $408 = $405 & $407;
 $409 = $403 | $408;
 $410 = (($395) + ($409))|0;
 $t1 = $410;
 $411 = $t0;
 $412 = HEAP32[$S>>2]|0;
 $413 = (($412) + ($411))|0;
 HEAP32[$S>>2] = $413;
 $414 = $t0;
 $415 = $t1;
 $416 = (($414) + ($415))|0;
 $417 = (($S) + 16|0);
 HEAP32[$417>>2] = $416;
 $418 = (($S) + 12|0);
 $419 = HEAP32[$418>>2]|0;
 $420 = HEAP32[$S>>2]|0;
 $421 = $420 >>> 6;
 $422 = HEAP32[$S>>2]|0;
 $423 = $422 << 26;
 $424 = $421 | $423;
 $425 = HEAP32[$S>>2]|0;
 $426 = $425 >>> 11;
 $427 = HEAP32[$S>>2]|0;
 $428 = $427 << 21;
 $429 = $426 | $428;
 $430 = $424 ^ $429;
 $431 = HEAP32[$S>>2]|0;
 $432 = $431 >>> 25;
 $433 = HEAP32[$S>>2]|0;
 $434 = $433 << 7;
 $435 = $432 | $434;
 $436 = $430 ^ $435;
 $437 = (($419) + ($436))|0;
 $438 = HEAP32[$S>>2]|0;
 $439 = (($S) + 4|0);
 $440 = HEAP32[$439>>2]|0;
 $441 = (($S) + 8|0);
 $442 = HEAP32[$441>>2]|0;
 $443 = $440 ^ $442;
 $444 = $438 & $443;
 $445 = (($S) + 8|0);
 $446 = HEAP32[$445>>2]|0;
 $447 = $444 ^ $446;
 $448 = (($437) + ($447))|0;
 $449 = (($W) + 16|0);
 $450 = HEAP32[$449>>2]|0;
 $451 = (($448) + ($450))|0;
 $452 = (($451) + 961987163)|0;
 $t0 = $452;
 $453 = (($S) + 16|0);
 $454 = HEAP32[$453>>2]|0;
 $455 = $454 >>> 2;
 $456 = (($S) + 16|0);
 $457 = HEAP32[$456>>2]|0;
 $458 = $457 << 30;
 $459 = $455 | $458;
 $460 = (($S) + 16|0);
 $461 = HEAP32[$460>>2]|0;
 $462 = $461 >>> 13;
 $463 = (($S) + 16|0);
 $464 = HEAP32[$463>>2]|0;
 $465 = $464 << 19;
 $466 = $462 | $465;
 $467 = $459 ^ $466;
 $468 = (($S) + 16|0);
 $469 = HEAP32[$468>>2]|0;
 $470 = $469 >>> 22;
 $471 = (($S) + 16|0);
 $472 = HEAP32[$471>>2]|0;
 $473 = $472 << 10;
 $474 = $470 | $473;
 $475 = $467 ^ $474;
 $476 = (($S) + 16|0);
 $477 = HEAP32[$476>>2]|0;
 $478 = (($S) + 20|0);
 $479 = HEAP32[$478>>2]|0;
 $480 = (($S) + 24|0);
 $481 = HEAP32[$480>>2]|0;
 $482 = $479 | $481;
 $483 = $477 & $482;
 $484 = (($S) + 20|0);
 $485 = HEAP32[$484>>2]|0;
 $486 = (($S) + 24|0);
 $487 = HEAP32[$486>>2]|0;
 $488 = $485 & $487;
 $489 = $483 | $488;
 $490 = (($475) + ($489))|0;
 $t1 = $490;
 $491 = $t0;
 $492 = (($S) + 28|0);
 $493 = HEAP32[$492>>2]|0;
 $494 = (($493) + ($491))|0;
 HEAP32[$492>>2] = $494;
 $495 = $t0;
 $496 = $t1;
 $497 = (($495) + ($496))|0;
 $498 = (($S) + 12|0);
 HEAP32[$498>>2] = $497;
 $499 = (($S) + 8|0);
 $500 = HEAP32[$499>>2]|0;
 $501 = (($S) + 28|0);
 $502 = HEAP32[$501>>2]|0;
 $503 = $502 >>> 6;
 $504 = (($S) + 28|0);
 $505 = HEAP32[$504>>2]|0;
 $506 = $505 << 26;
 $507 = $503 | $506;
 $508 = (($S) + 28|0);
 $509 = HEAP32[$508>>2]|0;
 $510 = $509 >>> 11;
 $511 = (($S) + 28|0);
 $512 = HEAP32[$511>>2]|0;
 $513 = $512 << 21;
 $514 = $510 | $513;
 $515 = $507 ^ $514;
 $516 = (($S) + 28|0);
 $517 = HEAP32[$516>>2]|0;
 $518 = $517 >>> 25;
 $519 = (($S) + 28|0);
 $520 = HEAP32[$519>>2]|0;
 $521 = $520 << 7;
 $522 = $518 | $521;
 $523 = $515 ^ $522;
 $524 = (($500) + ($523))|0;
 $525 = (($S) + 28|0);
 $526 = HEAP32[$525>>2]|0;
 $527 = HEAP32[$S>>2]|0;
 $528 = (($S) + 4|0);
 $529 = HEAP32[$528>>2]|0;
 $530 = $527 ^ $529;
 $531 = $526 & $530;
 $532 = (($S) + 4|0);
 $533 = HEAP32[$532>>2]|0;
 $534 = $531 ^ $533;
 $535 = (($524) + ($534))|0;
 $536 = (($W) + 20|0);
 $537 = HEAP32[$536>>2]|0;
 $538 = (($535) + ($537))|0;
 $539 = (($538) + 1508970993)|0;
 $t0 = $539;
 $540 = (($S) + 12|0);
 $541 = HEAP32[$540>>2]|0;
 $542 = $541 >>> 2;
 $543 = (($S) + 12|0);
 $544 = HEAP32[$543>>2]|0;
 $545 = $544 << 30;
 $546 = $542 | $545;
 $547 = (($S) + 12|0);
 $548 = HEAP32[$547>>2]|0;
 $549 = $548 >>> 13;
 $550 = (($S) + 12|0);
 $551 = HEAP32[$550>>2]|0;
 $552 = $551 << 19;
 $553 = $549 | $552;
 $554 = $546 ^ $553;
 $555 = (($S) + 12|0);
 $556 = HEAP32[$555>>2]|0;
 $557 = $556 >>> 22;
 $558 = (($S) + 12|0);
 $559 = HEAP32[$558>>2]|0;
 $560 = $559 << 10;
 $561 = $557 | $560;
 $562 = $554 ^ $561;
 $563 = (($S) + 12|0);
 $564 = HEAP32[$563>>2]|0;
 $565 = (($S) + 16|0);
 $566 = HEAP32[$565>>2]|0;
 $567 = (($S) + 20|0);
 $568 = HEAP32[$567>>2]|0;
 $569 = $566 | $568;
 $570 = $564 & $569;
 $571 = (($S) + 16|0);
 $572 = HEAP32[$571>>2]|0;
 $573 = (($S) + 20|0);
 $574 = HEAP32[$573>>2]|0;
 $575 = $572 & $574;
 $576 = $570 | $575;
 $577 = (($562) + ($576))|0;
 $t1 = $577;
 $578 = $t0;
 $579 = (($S) + 24|0);
 $580 = HEAP32[$579>>2]|0;
 $581 = (($580) + ($578))|0;
 HEAP32[$579>>2] = $581;
 $582 = $t0;
 $583 = $t1;
 $584 = (($582) + ($583))|0;
 $585 = (($S) + 8|0);
 HEAP32[$585>>2] = $584;
 $586 = (($S) + 4|0);
 $587 = HEAP32[$586>>2]|0;
 $588 = (($S) + 24|0);
 $589 = HEAP32[$588>>2]|0;
 $590 = $589 >>> 6;
 $591 = (($S) + 24|0);
 $592 = HEAP32[$591>>2]|0;
 $593 = $592 << 26;
 $594 = $590 | $593;
 $595 = (($S) + 24|0);
 $596 = HEAP32[$595>>2]|0;
 $597 = $596 >>> 11;
 $598 = (($S) + 24|0);
 $599 = HEAP32[$598>>2]|0;
 $600 = $599 << 21;
 $601 = $597 | $600;
 $602 = $594 ^ $601;
 $603 = (($S) + 24|0);
 $604 = HEAP32[$603>>2]|0;
 $605 = $604 >>> 25;
 $606 = (($S) + 24|0);
 $607 = HEAP32[$606>>2]|0;
 $608 = $607 << 7;
 $609 = $605 | $608;
 $610 = $602 ^ $609;
 $611 = (($587) + ($610))|0;
 $612 = (($S) + 24|0);
 $613 = HEAP32[$612>>2]|0;
 $614 = (($S) + 28|0);
 $615 = HEAP32[$614>>2]|0;
 $616 = HEAP32[$S>>2]|0;
 $617 = $615 ^ $616;
 $618 = $613 & $617;
 $619 = HEAP32[$S>>2]|0;
 $620 = $618 ^ $619;
 $621 = (($611) + ($620))|0;
 $622 = (($W) + 24|0);
 $623 = HEAP32[$622>>2]|0;
 $624 = (($621) + ($623))|0;
 $625 = (($624) + -1841331548)|0;
 $t0 = $625;
 $626 = (($S) + 8|0);
 $627 = HEAP32[$626>>2]|0;
 $628 = $627 >>> 2;
 $629 = (($S) + 8|0);
 $630 = HEAP32[$629>>2]|0;
 $631 = $630 << 30;
 $632 = $628 | $631;
 $633 = (($S) + 8|0);
 $634 = HEAP32[$633>>2]|0;
 $635 = $634 >>> 13;
 $636 = (($S) + 8|0);
 $637 = HEAP32[$636>>2]|0;
 $638 = $637 << 19;
 $639 = $635 | $638;
 $640 = $632 ^ $639;
 $641 = (($S) + 8|0);
 $642 = HEAP32[$641>>2]|0;
 $643 = $642 >>> 22;
 $644 = (($S) + 8|0);
 $645 = HEAP32[$644>>2]|0;
 $646 = $645 << 10;
 $647 = $643 | $646;
 $648 = $640 ^ $647;
 $649 = (($S) + 8|0);
 $650 = HEAP32[$649>>2]|0;
 $651 = (($S) + 12|0);
 $652 = HEAP32[$651>>2]|0;
 $653 = (($S) + 16|0);
 $654 = HEAP32[$653>>2]|0;
 $655 = $652 | $654;
 $656 = $650 & $655;
 $657 = (($S) + 12|0);
 $658 = HEAP32[$657>>2]|0;
 $659 = (($S) + 16|0);
 $660 = HEAP32[$659>>2]|0;
 $661 = $658 & $660;
 $662 = $656 | $661;
 $663 = (($648) + ($662))|0;
 $t1 = $663;
 $664 = $t0;
 $665 = (($S) + 20|0);
 $666 = HEAP32[$665>>2]|0;
 $667 = (($666) + ($664))|0;
 HEAP32[$665>>2] = $667;
 $668 = $t0;
 $669 = $t1;
 $670 = (($668) + ($669))|0;
 $671 = (($S) + 4|0);
 HEAP32[$671>>2] = $670;
 $672 = HEAP32[$S>>2]|0;
 $673 = (($S) + 20|0);
 $674 = HEAP32[$673>>2]|0;
 $675 = $674 >>> 6;
 $676 = (($S) + 20|0);
 $677 = HEAP32[$676>>2]|0;
 $678 = $677 << 26;
 $679 = $675 | $678;
 $680 = (($S) + 20|0);
 $681 = HEAP32[$680>>2]|0;
 $682 = $681 >>> 11;
 $683 = (($S) + 20|0);
 $684 = HEAP32[$683>>2]|0;
 $685 = $684 << 21;
 $686 = $682 | $685;
 $687 = $679 ^ $686;
 $688 = (($S) + 20|0);
 $689 = HEAP32[$688>>2]|0;
 $690 = $689 >>> 25;
 $691 = (($S) + 20|0);
 $692 = HEAP32[$691>>2]|0;
 $693 = $692 << 7;
 $694 = $690 | $693;
 $695 = $687 ^ $694;
 $696 = (($672) + ($695))|0;
 $697 = (($S) + 20|0);
 $698 = HEAP32[$697>>2]|0;
 $699 = (($S) + 24|0);
 $700 = HEAP32[$699>>2]|0;
 $701 = (($S) + 28|0);
 $702 = HEAP32[$701>>2]|0;
 $703 = $700 ^ $702;
 $704 = $698 & $703;
 $705 = (($S) + 28|0);
 $706 = HEAP32[$705>>2]|0;
 $707 = $704 ^ $706;
 $708 = (($696) + ($707))|0;
 $709 = (($W) + 28|0);
 $710 = HEAP32[$709>>2]|0;
 $711 = (($708) + ($710))|0;
 $712 = (($711) + -1424204075)|0;
 $t0 = $712;
 $713 = (($S) + 4|0);
 $714 = HEAP32[$713>>2]|0;
 $715 = $714 >>> 2;
 $716 = (($S) + 4|0);
 $717 = HEAP32[$716>>2]|0;
 $718 = $717 << 30;
 $719 = $715 | $718;
 $720 = (($S) + 4|0);
 $721 = HEAP32[$720>>2]|0;
 $722 = $721 >>> 13;
 $723 = (($S) + 4|0);
 $724 = HEAP32[$723>>2]|0;
 $725 = $724 << 19;
 $726 = $722 | $725;
 $727 = $719 ^ $726;
 $728 = (($S) + 4|0);
 $729 = HEAP32[$728>>2]|0;
 $730 = $729 >>> 22;
 $731 = (($S) + 4|0);
 $732 = HEAP32[$731>>2]|0;
 $733 = $732 << 10;
 $734 = $730 | $733;
 $735 = $727 ^ $734;
 $736 = (($S) + 4|0);
 $737 = HEAP32[$736>>2]|0;
 $738 = (($S) + 8|0);
 $739 = HEAP32[$738>>2]|0;
 $740 = (($S) + 12|0);
 $741 = HEAP32[$740>>2]|0;
 $742 = $739 | $741;
 $743 = $737 & $742;
 $744 = (($S) + 8|0);
 $745 = HEAP32[$744>>2]|0;
 $746 = (($S) + 12|0);
 $747 = HEAP32[$746>>2]|0;
 $748 = $745 & $747;
 $749 = $743 | $748;
 $750 = (($735) + ($749))|0;
 $t1 = $750;
 $751 = $t0;
 $752 = (($S) + 16|0);
 $753 = HEAP32[$752>>2]|0;
 $754 = (($753) + ($751))|0;
 HEAP32[$752>>2] = $754;
 $755 = $t0;
 $756 = $t1;
 $757 = (($755) + ($756))|0;
 HEAP32[$S>>2] = $757;
 $758 = (($S) + 28|0);
 $759 = HEAP32[$758>>2]|0;
 $760 = (($S) + 16|0);
 $761 = HEAP32[$760>>2]|0;
 $762 = $761 >>> 6;
 $763 = (($S) + 16|0);
 $764 = HEAP32[$763>>2]|0;
 $765 = $764 << 26;
 $766 = $762 | $765;
 $767 = (($S) + 16|0);
 $768 = HEAP32[$767>>2]|0;
 $769 = $768 >>> 11;
 $770 = (($S) + 16|0);
 $771 = HEAP32[$770>>2]|0;
 $772 = $771 << 21;
 $773 = $769 | $772;
 $774 = $766 ^ $773;
 $775 = (($S) + 16|0);
 $776 = HEAP32[$775>>2]|0;
 $777 = $776 >>> 25;
 $778 = (($S) + 16|0);
 $779 = HEAP32[$778>>2]|0;
 $780 = $779 << 7;
 $781 = $777 | $780;
 $782 = $774 ^ $781;
 $783 = (($759) + ($782))|0;
 $784 = (($S) + 16|0);
 $785 = HEAP32[$784>>2]|0;
 $786 = (($S) + 20|0);
 $787 = HEAP32[$786>>2]|0;
 $788 = (($S) + 24|0);
 $789 = HEAP32[$788>>2]|0;
 $790 = $787 ^ $789;
 $791 = $785 & $790;
 $792 = (($S) + 24|0);
 $793 = HEAP32[$792>>2]|0;
 $794 = $791 ^ $793;
 $795 = (($783) + ($794))|0;
 $796 = (($W) + 32|0);
 $797 = HEAP32[$796>>2]|0;
 $798 = (($795) + ($797))|0;
 $799 = (($798) + -670586216)|0;
 $t0 = $799;
 $800 = HEAP32[$S>>2]|0;
 $801 = $800 >>> 2;
 $802 = HEAP32[$S>>2]|0;
 $803 = $802 << 30;
 $804 = $801 | $803;
 $805 = HEAP32[$S>>2]|0;
 $806 = $805 >>> 13;
 $807 = HEAP32[$S>>2]|0;
 $808 = $807 << 19;
 $809 = $806 | $808;
 $810 = $804 ^ $809;
 $811 = HEAP32[$S>>2]|0;
 $812 = $811 >>> 22;
 $813 = HEAP32[$S>>2]|0;
 $814 = $813 << 10;
 $815 = $812 | $814;
 $816 = $810 ^ $815;
 $817 = HEAP32[$S>>2]|0;
 $818 = (($S) + 4|0);
 $819 = HEAP32[$818>>2]|0;
 $820 = (($S) + 8|0);
 $821 = HEAP32[$820>>2]|0;
 $822 = $819 | $821;
 $823 = $817 & $822;
 $824 = (($S) + 4|0);
 $825 = HEAP32[$824>>2]|0;
 $826 = (($S) + 8|0);
 $827 = HEAP32[$826>>2]|0;
 $828 = $825 & $827;
 $829 = $823 | $828;
 $830 = (($816) + ($829))|0;
 $t1 = $830;
 $831 = $t0;
 $832 = (($S) + 12|0);
 $833 = HEAP32[$832>>2]|0;
 $834 = (($833) + ($831))|0;
 HEAP32[$832>>2] = $834;
 $835 = $t0;
 $836 = $t1;
 $837 = (($835) + ($836))|0;
 $838 = (($S) + 28|0);
 HEAP32[$838>>2] = $837;
 $839 = (($S) + 24|0);
 $840 = HEAP32[$839>>2]|0;
 $841 = (($S) + 12|0);
 $842 = HEAP32[$841>>2]|0;
 $843 = $842 >>> 6;
 $844 = (($S) + 12|0);
 $845 = HEAP32[$844>>2]|0;
 $846 = $845 << 26;
 $847 = $843 | $846;
 $848 = (($S) + 12|0);
 $849 = HEAP32[$848>>2]|0;
 $850 = $849 >>> 11;
 $851 = (($S) + 12|0);
 $852 = HEAP32[$851>>2]|0;
 $853 = $852 << 21;
 $854 = $850 | $853;
 $855 = $847 ^ $854;
 $856 = (($S) + 12|0);
 $857 = HEAP32[$856>>2]|0;
 $858 = $857 >>> 25;
 $859 = (($S) + 12|0);
 $860 = HEAP32[$859>>2]|0;
 $861 = $860 << 7;
 $862 = $858 | $861;
 $863 = $855 ^ $862;
 $864 = (($840) + ($863))|0;
 $865 = (($S) + 12|0);
 $866 = HEAP32[$865>>2]|0;
 $867 = (($S) + 16|0);
 $868 = HEAP32[$867>>2]|0;
 $869 = (($S) + 20|0);
 $870 = HEAP32[$869>>2]|0;
 $871 = $868 ^ $870;
 $872 = $866 & $871;
 $873 = (($S) + 20|0);
 $874 = HEAP32[$873>>2]|0;
 $875 = $872 ^ $874;
 $876 = (($864) + ($875))|0;
 $877 = (($W) + 36|0);
 $878 = HEAP32[$877>>2]|0;
 $879 = (($876) + ($878))|0;
 $880 = (($879) + 310598401)|0;
 $t0 = $880;
 $881 = (($S) + 28|0);
 $882 = HEAP32[$881>>2]|0;
 $883 = $882 >>> 2;
 $884 = (($S) + 28|0);
 $885 = HEAP32[$884>>2]|0;
 $886 = $885 << 30;
 $887 = $883 | $886;
 $888 = (($S) + 28|0);
 $889 = HEAP32[$888>>2]|0;
 $890 = $889 >>> 13;
 $891 = (($S) + 28|0);
 $892 = HEAP32[$891>>2]|0;
 $893 = $892 << 19;
 $894 = $890 | $893;
 $895 = $887 ^ $894;
 $896 = (($S) + 28|0);
 $897 = HEAP32[$896>>2]|0;
 $898 = $897 >>> 22;
 $899 = (($S) + 28|0);
 $900 = HEAP32[$899>>2]|0;
 $901 = $900 << 10;
 $902 = $898 | $901;
 $903 = $895 ^ $902;
 $904 = (($S) + 28|0);
 $905 = HEAP32[$904>>2]|0;
 $906 = HEAP32[$S>>2]|0;
 $907 = (($S) + 4|0);
 $908 = HEAP32[$907>>2]|0;
 $909 = $906 | $908;
 $910 = $905 & $909;
 $911 = HEAP32[$S>>2]|0;
 $912 = (($S) + 4|0);
 $913 = HEAP32[$912>>2]|0;
 $914 = $911 & $913;
 $915 = $910 | $914;
 $916 = (($903) + ($915))|0;
 $t1 = $916;
 $917 = $t0;
 $918 = (($S) + 8|0);
 $919 = HEAP32[$918>>2]|0;
 $920 = (($919) + ($917))|0;
 HEAP32[$918>>2] = $920;
 $921 = $t0;
 $922 = $t1;
 $923 = (($921) + ($922))|0;
 $924 = (($S) + 24|0);
 HEAP32[$924>>2] = $923;
 $925 = (($S) + 20|0);
 $926 = HEAP32[$925>>2]|0;
 $927 = (($S) + 8|0);
 $928 = HEAP32[$927>>2]|0;
 $929 = $928 >>> 6;
 $930 = (($S) + 8|0);
 $931 = HEAP32[$930>>2]|0;
 $932 = $931 << 26;
 $933 = $929 | $932;
 $934 = (($S) + 8|0);
 $935 = HEAP32[$934>>2]|0;
 $936 = $935 >>> 11;
 $937 = (($S) + 8|0);
 $938 = HEAP32[$937>>2]|0;
 $939 = $938 << 21;
 $940 = $936 | $939;
 $941 = $933 ^ $940;
 $942 = (($S) + 8|0);
 $943 = HEAP32[$942>>2]|0;
 $944 = $943 >>> 25;
 $945 = (($S) + 8|0);
 $946 = HEAP32[$945>>2]|0;
 $947 = $946 << 7;
 $948 = $944 | $947;
 $949 = $941 ^ $948;
 $950 = (($926) + ($949))|0;
 $951 = (($S) + 8|0);
 $952 = HEAP32[$951>>2]|0;
 $953 = (($S) + 12|0);
 $954 = HEAP32[$953>>2]|0;
 $955 = (($S) + 16|0);
 $956 = HEAP32[$955>>2]|0;
 $957 = $954 ^ $956;
 $958 = $952 & $957;
 $959 = (($S) + 16|0);
 $960 = HEAP32[$959>>2]|0;
 $961 = $958 ^ $960;
 $962 = (($950) + ($961))|0;
 $963 = (($W) + 40|0);
 $964 = HEAP32[$963>>2]|0;
 $965 = (($962) + ($964))|0;
 $966 = (($965) + 607225278)|0;
 $t0 = $966;
 $967 = (($S) + 24|0);
 $968 = HEAP32[$967>>2]|0;
 $969 = $968 >>> 2;
 $970 = (($S) + 24|0);
 $971 = HEAP32[$970>>2]|0;
 $972 = $971 << 30;
 $973 = $969 | $972;
 $974 = (($S) + 24|0);
 $975 = HEAP32[$974>>2]|0;
 $976 = $975 >>> 13;
 $977 = (($S) + 24|0);
 $978 = HEAP32[$977>>2]|0;
 $979 = $978 << 19;
 $980 = $976 | $979;
 $981 = $973 ^ $980;
 $982 = (($S) + 24|0);
 $983 = HEAP32[$982>>2]|0;
 $984 = $983 >>> 22;
 $985 = (($S) + 24|0);
 $986 = HEAP32[$985>>2]|0;
 $987 = $986 << 10;
 $988 = $984 | $987;
 $989 = $981 ^ $988;
 $990 = (($S) + 24|0);
 $991 = HEAP32[$990>>2]|0;
 $992 = (($S) + 28|0);
 $993 = HEAP32[$992>>2]|0;
 $994 = HEAP32[$S>>2]|0;
 $995 = $993 | $994;
 $996 = $991 & $995;
 $997 = (($S) + 28|0);
 $998 = HEAP32[$997>>2]|0;
 $999 = HEAP32[$S>>2]|0;
 $1000 = $998 & $999;
 $1001 = $996 | $1000;
 $1002 = (($989) + ($1001))|0;
 $t1 = $1002;
 $1003 = $t0;
 $1004 = (($S) + 4|0);
 $1005 = HEAP32[$1004>>2]|0;
 $1006 = (($1005) + ($1003))|0;
 HEAP32[$1004>>2] = $1006;
 $1007 = $t0;
 $1008 = $t1;
 $1009 = (($1007) + ($1008))|0;
 $1010 = (($S) + 20|0);
 HEAP32[$1010>>2] = $1009;
 $1011 = (($S) + 16|0);
 $1012 = HEAP32[$1011>>2]|0;
 $1013 = (($S) + 4|0);
 $1014 = HEAP32[$1013>>2]|0;
 $1015 = $1014 >>> 6;
 $1016 = (($S) + 4|0);
 $1017 = HEAP32[$1016>>2]|0;
 $1018 = $1017 << 26;
 $1019 = $1015 | $1018;
 $1020 = (($S) + 4|0);
 $1021 = HEAP32[$1020>>2]|0;
 $1022 = $1021 >>> 11;
 $1023 = (($S) + 4|0);
 $1024 = HEAP32[$1023>>2]|0;
 $1025 = $1024 << 21;
 $1026 = $1022 | $1025;
 $1027 = $1019 ^ $1026;
 $1028 = (($S) + 4|0);
 $1029 = HEAP32[$1028>>2]|0;
 $1030 = $1029 >>> 25;
 $1031 = (($S) + 4|0);
 $1032 = HEAP32[$1031>>2]|0;
 $1033 = $1032 << 7;
 $1034 = $1030 | $1033;
 $1035 = $1027 ^ $1034;
 $1036 = (($1012) + ($1035))|0;
 $1037 = (($S) + 4|0);
 $1038 = HEAP32[$1037>>2]|0;
 $1039 = (($S) + 8|0);
 $1040 = HEAP32[$1039>>2]|0;
 $1041 = (($S) + 12|0);
 $1042 = HEAP32[$1041>>2]|0;
 $1043 = $1040 ^ $1042;
 $1044 = $1038 & $1043;
 $1045 = (($S) + 12|0);
 $1046 = HEAP32[$1045>>2]|0;
 $1047 = $1044 ^ $1046;
 $1048 = (($1036) + ($1047))|0;
 $1049 = (($W) + 44|0);
 $1050 = HEAP32[$1049>>2]|0;
 $1051 = (($1048) + ($1050))|0;
 $1052 = (($1051) + 1426881987)|0;
 $t0 = $1052;
 $1053 = (($S) + 20|0);
 $1054 = HEAP32[$1053>>2]|0;
 $1055 = $1054 >>> 2;
 $1056 = (($S) + 20|0);
 $1057 = HEAP32[$1056>>2]|0;
 $1058 = $1057 << 30;
 $1059 = $1055 | $1058;
 $1060 = (($S) + 20|0);
 $1061 = HEAP32[$1060>>2]|0;
 $1062 = $1061 >>> 13;
 $1063 = (($S) + 20|0);
 $1064 = HEAP32[$1063>>2]|0;
 $1065 = $1064 << 19;
 $1066 = $1062 | $1065;
 $1067 = $1059 ^ $1066;
 $1068 = (($S) + 20|0);
 $1069 = HEAP32[$1068>>2]|0;
 $1070 = $1069 >>> 22;
 $1071 = (($S) + 20|0);
 $1072 = HEAP32[$1071>>2]|0;
 $1073 = $1072 << 10;
 $1074 = $1070 | $1073;
 $1075 = $1067 ^ $1074;
 $1076 = (($S) + 20|0);
 $1077 = HEAP32[$1076>>2]|0;
 $1078 = (($S) + 24|0);
 $1079 = HEAP32[$1078>>2]|0;
 $1080 = (($S) + 28|0);
 $1081 = HEAP32[$1080>>2]|0;
 $1082 = $1079 | $1081;
 $1083 = $1077 & $1082;
 $1084 = (($S) + 24|0);
 $1085 = HEAP32[$1084>>2]|0;
 $1086 = (($S) + 28|0);
 $1087 = HEAP32[$1086>>2]|0;
 $1088 = $1085 & $1087;
 $1089 = $1083 | $1088;
 $1090 = (($1075) + ($1089))|0;
 $t1 = $1090;
 $1091 = $t0;
 $1092 = HEAP32[$S>>2]|0;
 $1093 = (($1092) + ($1091))|0;
 HEAP32[$S>>2] = $1093;
 $1094 = $t0;
 $1095 = $t1;
 $1096 = (($1094) + ($1095))|0;
 $1097 = (($S) + 16|0);
 HEAP32[$1097>>2] = $1096;
 $1098 = (($S) + 12|0);
 $1099 = HEAP32[$1098>>2]|0;
 $1100 = HEAP32[$S>>2]|0;
 $1101 = $1100 >>> 6;
 $1102 = HEAP32[$S>>2]|0;
 $1103 = $1102 << 26;
 $1104 = $1101 | $1103;
 $1105 = HEAP32[$S>>2]|0;
 $1106 = $1105 >>> 11;
 $1107 = HEAP32[$S>>2]|0;
 $1108 = $1107 << 21;
 $1109 = $1106 | $1108;
 $1110 = $1104 ^ $1109;
 $1111 = HEAP32[$S>>2]|0;
 $1112 = $1111 >>> 25;
 $1113 = HEAP32[$S>>2]|0;
 $1114 = $1113 << 7;
 $1115 = $1112 | $1114;
 $1116 = $1110 ^ $1115;
 $1117 = (($1099) + ($1116))|0;
 $1118 = HEAP32[$S>>2]|0;
 $1119 = (($S) + 4|0);
 $1120 = HEAP32[$1119>>2]|0;
 $1121 = (($S) + 8|0);
 $1122 = HEAP32[$1121>>2]|0;
 $1123 = $1120 ^ $1122;
 $1124 = $1118 & $1123;
 $1125 = (($S) + 8|0);
 $1126 = HEAP32[$1125>>2]|0;
 $1127 = $1124 ^ $1126;
 $1128 = (($1117) + ($1127))|0;
 $1129 = (($W) + 48|0);
 $1130 = HEAP32[$1129>>2]|0;
 $1131 = (($1128) + ($1130))|0;
 $1132 = (($1131) + 1925078388)|0;
 $t0 = $1132;
 $1133 = (($S) + 16|0);
 $1134 = HEAP32[$1133>>2]|0;
 $1135 = $1134 >>> 2;
 $1136 = (($S) + 16|0);
 $1137 = HEAP32[$1136>>2]|0;
 $1138 = $1137 << 30;
 $1139 = $1135 | $1138;
 $1140 = (($S) + 16|0);
 $1141 = HEAP32[$1140>>2]|0;
 $1142 = $1141 >>> 13;
 $1143 = (($S) + 16|0);
 $1144 = HEAP32[$1143>>2]|0;
 $1145 = $1144 << 19;
 $1146 = $1142 | $1145;
 $1147 = $1139 ^ $1146;
 $1148 = (($S) + 16|0);
 $1149 = HEAP32[$1148>>2]|0;
 $1150 = $1149 >>> 22;
 $1151 = (($S) + 16|0);
 $1152 = HEAP32[$1151>>2]|0;
 $1153 = $1152 << 10;
 $1154 = $1150 | $1153;
 $1155 = $1147 ^ $1154;
 $1156 = (($S) + 16|0);
 $1157 = HEAP32[$1156>>2]|0;
 $1158 = (($S) + 20|0);
 $1159 = HEAP32[$1158>>2]|0;
 $1160 = (($S) + 24|0);
 $1161 = HEAP32[$1160>>2]|0;
 $1162 = $1159 | $1161;
 $1163 = $1157 & $1162;
 $1164 = (($S) + 20|0);
 $1165 = HEAP32[$1164>>2]|0;
 $1166 = (($S) + 24|0);
 $1167 = HEAP32[$1166>>2]|0;
 $1168 = $1165 & $1167;
 $1169 = $1163 | $1168;
 $1170 = (($1155) + ($1169))|0;
 $t1 = $1170;
 $1171 = $t0;
 $1172 = (($S) + 28|0);
 $1173 = HEAP32[$1172>>2]|0;
 $1174 = (($1173) + ($1171))|0;
 HEAP32[$1172>>2] = $1174;
 $1175 = $t0;
 $1176 = $t1;
 $1177 = (($1175) + ($1176))|0;
 $1178 = (($S) + 12|0);
 HEAP32[$1178>>2] = $1177;
 $1179 = (($S) + 8|0);
 $1180 = HEAP32[$1179>>2]|0;
 $1181 = (($S) + 28|0);
 $1182 = HEAP32[$1181>>2]|0;
 $1183 = $1182 >>> 6;
 $1184 = (($S) + 28|0);
 $1185 = HEAP32[$1184>>2]|0;
 $1186 = $1185 << 26;
 $1187 = $1183 | $1186;
 $1188 = (($S) + 28|0);
 $1189 = HEAP32[$1188>>2]|0;
 $1190 = $1189 >>> 11;
 $1191 = (($S) + 28|0);
 $1192 = HEAP32[$1191>>2]|0;
 $1193 = $1192 << 21;
 $1194 = $1190 | $1193;
 $1195 = $1187 ^ $1194;
 $1196 = (($S) + 28|0);
 $1197 = HEAP32[$1196>>2]|0;
 $1198 = $1197 >>> 25;
 $1199 = (($S) + 28|0);
 $1200 = HEAP32[$1199>>2]|0;
 $1201 = $1200 << 7;
 $1202 = $1198 | $1201;
 $1203 = $1195 ^ $1202;
 $1204 = (($1180) + ($1203))|0;
 $1205 = (($S) + 28|0);
 $1206 = HEAP32[$1205>>2]|0;
 $1207 = HEAP32[$S>>2]|0;
 $1208 = (($S) + 4|0);
 $1209 = HEAP32[$1208>>2]|0;
 $1210 = $1207 ^ $1209;
 $1211 = $1206 & $1210;
 $1212 = (($S) + 4|0);
 $1213 = HEAP32[$1212>>2]|0;
 $1214 = $1211 ^ $1213;
 $1215 = (($1204) + ($1214))|0;
 $1216 = (($W) + 52|0);
 $1217 = HEAP32[$1216>>2]|0;
 $1218 = (($1215) + ($1217))|0;
 $1219 = (($1218) + -2132889090)|0;
 $t0 = $1219;
 $1220 = (($S) + 12|0);
 $1221 = HEAP32[$1220>>2]|0;
 $1222 = $1221 >>> 2;
 $1223 = (($S) + 12|0);
 $1224 = HEAP32[$1223>>2]|0;
 $1225 = $1224 << 30;
 $1226 = $1222 | $1225;
 $1227 = (($S) + 12|0);
 $1228 = HEAP32[$1227>>2]|0;
 $1229 = $1228 >>> 13;
 $1230 = (($S) + 12|0);
 $1231 = HEAP32[$1230>>2]|0;
 $1232 = $1231 << 19;
 $1233 = $1229 | $1232;
 $1234 = $1226 ^ $1233;
 $1235 = (($S) + 12|0);
 $1236 = HEAP32[$1235>>2]|0;
 $1237 = $1236 >>> 22;
 $1238 = (($S) + 12|0);
 $1239 = HEAP32[$1238>>2]|0;
 $1240 = $1239 << 10;
 $1241 = $1237 | $1240;
 $1242 = $1234 ^ $1241;
 $1243 = (($S) + 12|0);
 $1244 = HEAP32[$1243>>2]|0;
 $1245 = (($S) + 16|0);
 $1246 = HEAP32[$1245>>2]|0;
 $1247 = (($S) + 20|0);
 $1248 = HEAP32[$1247>>2]|0;
 $1249 = $1246 | $1248;
 $1250 = $1244 & $1249;
 $1251 = (($S) + 16|0);
 $1252 = HEAP32[$1251>>2]|0;
 $1253 = (($S) + 20|0);
 $1254 = HEAP32[$1253>>2]|0;
 $1255 = $1252 & $1254;
 $1256 = $1250 | $1255;
 $1257 = (($1242) + ($1256))|0;
 $t1 = $1257;
 $1258 = $t0;
 $1259 = (($S) + 24|0);
 $1260 = HEAP32[$1259>>2]|0;
 $1261 = (($1260) + ($1258))|0;
 HEAP32[$1259>>2] = $1261;
 $1262 = $t0;
 $1263 = $t1;
 $1264 = (($1262) + ($1263))|0;
 $1265 = (($S) + 8|0);
 HEAP32[$1265>>2] = $1264;
 $1266 = (($S) + 4|0);
 $1267 = HEAP32[$1266>>2]|0;
 $1268 = (($S) + 24|0);
 $1269 = HEAP32[$1268>>2]|0;
 $1270 = $1269 >>> 6;
 $1271 = (($S) + 24|0);
 $1272 = HEAP32[$1271>>2]|0;
 $1273 = $1272 << 26;
 $1274 = $1270 | $1273;
 $1275 = (($S) + 24|0);
 $1276 = HEAP32[$1275>>2]|0;
 $1277 = $1276 >>> 11;
 $1278 = (($S) + 24|0);
 $1279 = HEAP32[$1278>>2]|0;
 $1280 = $1279 << 21;
 $1281 = $1277 | $1280;
 $1282 = $1274 ^ $1281;
 $1283 = (($S) + 24|0);
 $1284 = HEAP32[$1283>>2]|0;
 $1285 = $1284 >>> 25;
 $1286 = (($S) + 24|0);
 $1287 = HEAP32[$1286>>2]|0;
 $1288 = $1287 << 7;
 $1289 = $1285 | $1288;
 $1290 = $1282 ^ $1289;
 $1291 = (($1267) + ($1290))|0;
 $1292 = (($S) + 24|0);
 $1293 = HEAP32[$1292>>2]|0;
 $1294 = (($S) + 28|0);
 $1295 = HEAP32[$1294>>2]|0;
 $1296 = HEAP32[$S>>2]|0;
 $1297 = $1295 ^ $1296;
 $1298 = $1293 & $1297;
 $1299 = HEAP32[$S>>2]|0;
 $1300 = $1298 ^ $1299;
 $1301 = (($1291) + ($1300))|0;
 $1302 = (($W) + 56|0);
 $1303 = HEAP32[$1302>>2]|0;
 $1304 = (($1301) + ($1303))|0;
 $1305 = (($1304) + -1680079193)|0;
 $t0 = $1305;
 $1306 = (($S) + 8|0);
 $1307 = HEAP32[$1306>>2]|0;
 $1308 = $1307 >>> 2;
 $1309 = (($S) + 8|0);
 $1310 = HEAP32[$1309>>2]|0;
 $1311 = $1310 << 30;
 $1312 = $1308 | $1311;
 $1313 = (($S) + 8|0);
 $1314 = HEAP32[$1313>>2]|0;
 $1315 = $1314 >>> 13;
 $1316 = (($S) + 8|0);
 $1317 = HEAP32[$1316>>2]|0;
 $1318 = $1317 << 19;
 $1319 = $1315 | $1318;
 $1320 = $1312 ^ $1319;
 $1321 = (($S) + 8|0);
 $1322 = HEAP32[$1321>>2]|0;
 $1323 = $1322 >>> 22;
 $1324 = (($S) + 8|0);
 $1325 = HEAP32[$1324>>2]|0;
 $1326 = $1325 << 10;
 $1327 = $1323 | $1326;
 $1328 = $1320 ^ $1327;
 $1329 = (($S) + 8|0);
 $1330 = HEAP32[$1329>>2]|0;
 $1331 = (($S) + 12|0);
 $1332 = HEAP32[$1331>>2]|0;
 $1333 = (($S) + 16|0);
 $1334 = HEAP32[$1333>>2]|0;
 $1335 = $1332 | $1334;
 $1336 = $1330 & $1335;
 $1337 = (($S) + 12|0);
 $1338 = HEAP32[$1337>>2]|0;
 $1339 = (($S) + 16|0);
 $1340 = HEAP32[$1339>>2]|0;
 $1341 = $1338 & $1340;
 $1342 = $1336 | $1341;
 $1343 = (($1328) + ($1342))|0;
 $t1 = $1343;
 $1344 = $t0;
 $1345 = (($S) + 20|0);
 $1346 = HEAP32[$1345>>2]|0;
 $1347 = (($1346) + ($1344))|0;
 HEAP32[$1345>>2] = $1347;
 $1348 = $t0;
 $1349 = $t1;
 $1350 = (($1348) + ($1349))|0;
 $1351 = (($S) + 4|0);
 HEAP32[$1351>>2] = $1350;
 $1352 = HEAP32[$S>>2]|0;
 $1353 = (($S) + 20|0);
 $1354 = HEAP32[$1353>>2]|0;
 $1355 = $1354 >>> 6;
 $1356 = (($S) + 20|0);
 $1357 = HEAP32[$1356>>2]|0;
 $1358 = $1357 << 26;
 $1359 = $1355 | $1358;
 $1360 = (($S) + 20|0);
 $1361 = HEAP32[$1360>>2]|0;
 $1362 = $1361 >>> 11;
 $1363 = (($S) + 20|0);
 $1364 = HEAP32[$1363>>2]|0;
 $1365 = $1364 << 21;
 $1366 = $1362 | $1365;
 $1367 = $1359 ^ $1366;
 $1368 = (($S) + 20|0);
 $1369 = HEAP32[$1368>>2]|0;
 $1370 = $1369 >>> 25;
 $1371 = (($S) + 20|0);
 $1372 = HEAP32[$1371>>2]|0;
 $1373 = $1372 << 7;
 $1374 = $1370 | $1373;
 $1375 = $1367 ^ $1374;
 $1376 = (($1352) + ($1375))|0;
 $1377 = (($S) + 20|0);
 $1378 = HEAP32[$1377>>2]|0;
 $1379 = (($S) + 24|0);
 $1380 = HEAP32[$1379>>2]|0;
 $1381 = (($S) + 28|0);
 $1382 = HEAP32[$1381>>2]|0;
 $1383 = $1380 ^ $1382;
 $1384 = $1378 & $1383;
 $1385 = (($S) + 28|0);
 $1386 = HEAP32[$1385>>2]|0;
 $1387 = $1384 ^ $1386;
 $1388 = (($1376) + ($1387))|0;
 $1389 = (($W) + 60|0);
 $1390 = HEAP32[$1389>>2]|0;
 $1391 = (($1388) + ($1390))|0;
 $1392 = (($1391) + -1046744716)|0;
 $t0 = $1392;
 $1393 = (($S) + 4|0);
 $1394 = HEAP32[$1393>>2]|0;
 $1395 = $1394 >>> 2;
 $1396 = (($S) + 4|0);
 $1397 = HEAP32[$1396>>2]|0;
 $1398 = $1397 << 30;
 $1399 = $1395 | $1398;
 $1400 = (($S) + 4|0);
 $1401 = HEAP32[$1400>>2]|0;
 $1402 = $1401 >>> 13;
 $1403 = (($S) + 4|0);
 $1404 = HEAP32[$1403>>2]|0;
 $1405 = $1404 << 19;
 $1406 = $1402 | $1405;
 $1407 = $1399 ^ $1406;
 $1408 = (($S) + 4|0);
 $1409 = HEAP32[$1408>>2]|0;
 $1410 = $1409 >>> 22;
 $1411 = (($S) + 4|0);
 $1412 = HEAP32[$1411>>2]|0;
 $1413 = $1412 << 10;
 $1414 = $1410 | $1413;
 $1415 = $1407 ^ $1414;
 $1416 = (($S) + 4|0);
 $1417 = HEAP32[$1416>>2]|0;
 $1418 = (($S) + 8|0);
 $1419 = HEAP32[$1418>>2]|0;
 $1420 = (($S) + 12|0);
 $1421 = HEAP32[$1420>>2]|0;
 $1422 = $1419 | $1421;
 $1423 = $1417 & $1422;
 $1424 = (($S) + 8|0);
 $1425 = HEAP32[$1424>>2]|0;
 $1426 = (($S) + 12|0);
 $1427 = HEAP32[$1426>>2]|0;
 $1428 = $1425 & $1427;
 $1429 = $1423 | $1428;
 $1430 = (($1415) + ($1429))|0;
 $t1 = $1430;
 $1431 = $t0;
 $1432 = (($S) + 16|0);
 $1433 = HEAP32[$1432>>2]|0;
 $1434 = (($1433) + ($1431))|0;
 HEAP32[$1432>>2] = $1434;
 $1435 = $t0;
 $1436 = $t1;
 $1437 = (($1435) + ($1436))|0;
 HEAP32[$S>>2] = $1437;
 $1438 = (($S) + 28|0);
 $1439 = HEAP32[$1438>>2]|0;
 $1440 = (($S) + 16|0);
 $1441 = HEAP32[$1440>>2]|0;
 $1442 = $1441 >>> 6;
 $1443 = (($S) + 16|0);
 $1444 = HEAP32[$1443>>2]|0;
 $1445 = $1444 << 26;
 $1446 = $1442 | $1445;
 $1447 = (($S) + 16|0);
 $1448 = HEAP32[$1447>>2]|0;
 $1449 = $1448 >>> 11;
 $1450 = (($S) + 16|0);
 $1451 = HEAP32[$1450>>2]|0;
 $1452 = $1451 << 21;
 $1453 = $1449 | $1452;
 $1454 = $1446 ^ $1453;
 $1455 = (($S) + 16|0);
 $1456 = HEAP32[$1455>>2]|0;
 $1457 = $1456 >>> 25;
 $1458 = (($S) + 16|0);
 $1459 = HEAP32[$1458>>2]|0;
 $1460 = $1459 << 7;
 $1461 = $1457 | $1460;
 $1462 = $1454 ^ $1461;
 $1463 = (($1439) + ($1462))|0;
 $1464 = (($S) + 16|0);
 $1465 = HEAP32[$1464>>2]|0;
 $1466 = (($S) + 20|0);
 $1467 = HEAP32[$1466>>2]|0;
 $1468 = (($S) + 24|0);
 $1469 = HEAP32[$1468>>2]|0;
 $1470 = $1467 ^ $1469;
 $1471 = $1465 & $1470;
 $1472 = (($S) + 24|0);
 $1473 = HEAP32[$1472>>2]|0;
 $1474 = $1471 ^ $1473;
 $1475 = (($1463) + ($1474))|0;
 $1476 = (($W) + 64|0);
 $1477 = HEAP32[$1476>>2]|0;
 $1478 = (($1475) + ($1477))|0;
 $1479 = (($1478) + -459576895)|0;
 $t0 = $1479;
 $1480 = HEAP32[$S>>2]|0;
 $1481 = $1480 >>> 2;
 $1482 = HEAP32[$S>>2]|0;
 $1483 = $1482 << 30;
 $1484 = $1481 | $1483;
 $1485 = HEAP32[$S>>2]|0;
 $1486 = $1485 >>> 13;
 $1487 = HEAP32[$S>>2]|0;
 $1488 = $1487 << 19;
 $1489 = $1486 | $1488;
 $1490 = $1484 ^ $1489;
 $1491 = HEAP32[$S>>2]|0;
 $1492 = $1491 >>> 22;
 $1493 = HEAP32[$S>>2]|0;
 $1494 = $1493 << 10;
 $1495 = $1492 | $1494;
 $1496 = $1490 ^ $1495;
 $1497 = HEAP32[$S>>2]|0;
 $1498 = (($S) + 4|0);
 $1499 = HEAP32[$1498>>2]|0;
 $1500 = (($S) + 8|0);
 $1501 = HEAP32[$1500>>2]|0;
 $1502 = $1499 | $1501;
 $1503 = $1497 & $1502;
 $1504 = (($S) + 4|0);
 $1505 = HEAP32[$1504>>2]|0;
 $1506 = (($S) + 8|0);
 $1507 = HEAP32[$1506>>2]|0;
 $1508 = $1505 & $1507;
 $1509 = $1503 | $1508;
 $1510 = (($1496) + ($1509))|0;
 $t1 = $1510;
 $1511 = $t0;
 $1512 = (($S) + 12|0);
 $1513 = HEAP32[$1512>>2]|0;
 $1514 = (($1513) + ($1511))|0;
 HEAP32[$1512>>2] = $1514;
 $1515 = $t0;
 $1516 = $t1;
 $1517 = (($1515) + ($1516))|0;
 $1518 = (($S) + 28|0);
 HEAP32[$1518>>2] = $1517;
 $1519 = (($S) + 24|0);
 $1520 = HEAP32[$1519>>2]|0;
 $1521 = (($S) + 12|0);
 $1522 = HEAP32[$1521>>2]|0;
 $1523 = $1522 >>> 6;
 $1524 = (($S) + 12|0);
 $1525 = HEAP32[$1524>>2]|0;
 $1526 = $1525 << 26;
 $1527 = $1523 | $1526;
 $1528 = (($S) + 12|0);
 $1529 = HEAP32[$1528>>2]|0;
 $1530 = $1529 >>> 11;
 $1531 = (($S) + 12|0);
 $1532 = HEAP32[$1531>>2]|0;
 $1533 = $1532 << 21;
 $1534 = $1530 | $1533;
 $1535 = $1527 ^ $1534;
 $1536 = (($S) + 12|0);
 $1537 = HEAP32[$1536>>2]|0;
 $1538 = $1537 >>> 25;
 $1539 = (($S) + 12|0);
 $1540 = HEAP32[$1539>>2]|0;
 $1541 = $1540 << 7;
 $1542 = $1538 | $1541;
 $1543 = $1535 ^ $1542;
 $1544 = (($1520) + ($1543))|0;
 $1545 = (($S) + 12|0);
 $1546 = HEAP32[$1545>>2]|0;
 $1547 = (($S) + 16|0);
 $1548 = HEAP32[$1547>>2]|0;
 $1549 = (($S) + 20|0);
 $1550 = HEAP32[$1549>>2]|0;
 $1551 = $1548 ^ $1550;
 $1552 = $1546 & $1551;
 $1553 = (($S) + 20|0);
 $1554 = HEAP32[$1553>>2]|0;
 $1555 = $1552 ^ $1554;
 $1556 = (($1544) + ($1555))|0;
 $1557 = (($W) + 68|0);
 $1558 = HEAP32[$1557>>2]|0;
 $1559 = (($1556) + ($1558))|0;
 $1560 = (($1559) + -272742522)|0;
 $t0 = $1560;
 $1561 = (($S) + 28|0);
 $1562 = HEAP32[$1561>>2]|0;
 $1563 = $1562 >>> 2;
 $1564 = (($S) + 28|0);
 $1565 = HEAP32[$1564>>2]|0;
 $1566 = $1565 << 30;
 $1567 = $1563 | $1566;
 $1568 = (($S) + 28|0);
 $1569 = HEAP32[$1568>>2]|0;
 $1570 = $1569 >>> 13;
 $1571 = (($S) + 28|0);
 $1572 = HEAP32[$1571>>2]|0;
 $1573 = $1572 << 19;
 $1574 = $1570 | $1573;
 $1575 = $1567 ^ $1574;
 $1576 = (($S) + 28|0);
 $1577 = HEAP32[$1576>>2]|0;
 $1578 = $1577 >>> 22;
 $1579 = (($S) + 28|0);
 $1580 = HEAP32[$1579>>2]|0;
 $1581 = $1580 << 10;
 $1582 = $1578 | $1581;
 $1583 = $1575 ^ $1582;
 $1584 = (($S) + 28|0);
 $1585 = HEAP32[$1584>>2]|0;
 $1586 = HEAP32[$S>>2]|0;
 $1587 = (($S) + 4|0);
 $1588 = HEAP32[$1587>>2]|0;
 $1589 = $1586 | $1588;
 $1590 = $1585 & $1589;
 $1591 = HEAP32[$S>>2]|0;
 $1592 = (($S) + 4|0);
 $1593 = HEAP32[$1592>>2]|0;
 $1594 = $1591 & $1593;
 $1595 = $1590 | $1594;
 $1596 = (($1583) + ($1595))|0;
 $t1 = $1596;
 $1597 = $t0;
 $1598 = (($S) + 8|0);
 $1599 = HEAP32[$1598>>2]|0;
 $1600 = (($1599) + ($1597))|0;
 HEAP32[$1598>>2] = $1600;
 $1601 = $t0;
 $1602 = $t1;
 $1603 = (($1601) + ($1602))|0;
 $1604 = (($S) + 24|0);
 HEAP32[$1604>>2] = $1603;
 $1605 = (($S) + 20|0);
 $1606 = HEAP32[$1605>>2]|0;
 $1607 = (($S) + 8|0);
 $1608 = HEAP32[$1607>>2]|0;
 $1609 = $1608 >>> 6;
 $1610 = (($S) + 8|0);
 $1611 = HEAP32[$1610>>2]|0;
 $1612 = $1611 << 26;
 $1613 = $1609 | $1612;
 $1614 = (($S) + 8|0);
 $1615 = HEAP32[$1614>>2]|0;
 $1616 = $1615 >>> 11;
 $1617 = (($S) + 8|0);
 $1618 = HEAP32[$1617>>2]|0;
 $1619 = $1618 << 21;
 $1620 = $1616 | $1619;
 $1621 = $1613 ^ $1620;
 $1622 = (($S) + 8|0);
 $1623 = HEAP32[$1622>>2]|0;
 $1624 = $1623 >>> 25;
 $1625 = (($S) + 8|0);
 $1626 = HEAP32[$1625>>2]|0;
 $1627 = $1626 << 7;
 $1628 = $1624 | $1627;
 $1629 = $1621 ^ $1628;
 $1630 = (($1606) + ($1629))|0;
 $1631 = (($S) + 8|0);
 $1632 = HEAP32[$1631>>2]|0;
 $1633 = (($S) + 12|0);
 $1634 = HEAP32[$1633>>2]|0;
 $1635 = (($S) + 16|0);
 $1636 = HEAP32[$1635>>2]|0;
 $1637 = $1634 ^ $1636;
 $1638 = $1632 & $1637;
 $1639 = (($S) + 16|0);
 $1640 = HEAP32[$1639>>2]|0;
 $1641 = $1638 ^ $1640;
 $1642 = (($1630) + ($1641))|0;
 $1643 = (($W) + 72|0);
 $1644 = HEAP32[$1643>>2]|0;
 $1645 = (($1642) + ($1644))|0;
 $1646 = (($1645) + 264347078)|0;
 $t0 = $1646;
 $1647 = (($S) + 24|0);
 $1648 = HEAP32[$1647>>2]|0;
 $1649 = $1648 >>> 2;
 $1650 = (($S) + 24|0);
 $1651 = HEAP32[$1650>>2]|0;
 $1652 = $1651 << 30;
 $1653 = $1649 | $1652;
 $1654 = (($S) + 24|0);
 $1655 = HEAP32[$1654>>2]|0;
 $1656 = $1655 >>> 13;
 $1657 = (($S) + 24|0);
 $1658 = HEAP32[$1657>>2]|0;
 $1659 = $1658 << 19;
 $1660 = $1656 | $1659;
 $1661 = $1653 ^ $1660;
 $1662 = (($S) + 24|0);
 $1663 = HEAP32[$1662>>2]|0;
 $1664 = $1663 >>> 22;
 $1665 = (($S) + 24|0);
 $1666 = HEAP32[$1665>>2]|0;
 $1667 = $1666 << 10;
 $1668 = $1664 | $1667;
 $1669 = $1661 ^ $1668;
 $1670 = (($S) + 24|0);
 $1671 = HEAP32[$1670>>2]|0;
 $1672 = (($S) + 28|0);
 $1673 = HEAP32[$1672>>2]|0;
 $1674 = HEAP32[$S>>2]|0;
 $1675 = $1673 | $1674;
 $1676 = $1671 & $1675;
 $1677 = (($S) + 28|0);
 $1678 = HEAP32[$1677>>2]|0;
 $1679 = HEAP32[$S>>2]|0;
 $1680 = $1678 & $1679;
 $1681 = $1676 | $1680;
 $1682 = (($1669) + ($1681))|0;
 $t1 = $1682;
 $1683 = $t0;
 $1684 = (($S) + 4|0);
 $1685 = HEAP32[$1684>>2]|0;
 $1686 = (($1685) + ($1683))|0;
 HEAP32[$1684>>2] = $1686;
 $1687 = $t0;
 $1688 = $t1;
 $1689 = (($1687) + ($1688))|0;
 $1690 = (($S) + 20|0);
 HEAP32[$1690>>2] = $1689;
 $1691 = (($S) + 16|0);
 $1692 = HEAP32[$1691>>2]|0;
 $1693 = (($S) + 4|0);
 $1694 = HEAP32[$1693>>2]|0;
 $1695 = $1694 >>> 6;
 $1696 = (($S) + 4|0);
 $1697 = HEAP32[$1696>>2]|0;
 $1698 = $1697 << 26;
 $1699 = $1695 | $1698;
 $1700 = (($S) + 4|0);
 $1701 = HEAP32[$1700>>2]|0;
 $1702 = $1701 >>> 11;
 $1703 = (($S) + 4|0);
 $1704 = HEAP32[$1703>>2]|0;
 $1705 = $1704 << 21;
 $1706 = $1702 | $1705;
 $1707 = $1699 ^ $1706;
 $1708 = (($S) + 4|0);
 $1709 = HEAP32[$1708>>2]|0;
 $1710 = $1709 >>> 25;
 $1711 = (($S) + 4|0);
 $1712 = HEAP32[$1711>>2]|0;
 $1713 = $1712 << 7;
 $1714 = $1710 | $1713;
 $1715 = $1707 ^ $1714;
 $1716 = (($1692) + ($1715))|0;
 $1717 = (($S) + 4|0);
 $1718 = HEAP32[$1717>>2]|0;
 $1719 = (($S) + 8|0);
 $1720 = HEAP32[$1719>>2]|0;
 $1721 = (($S) + 12|0);
 $1722 = HEAP32[$1721>>2]|0;
 $1723 = $1720 ^ $1722;
 $1724 = $1718 & $1723;
 $1725 = (($S) + 12|0);
 $1726 = HEAP32[$1725>>2]|0;
 $1727 = $1724 ^ $1726;
 $1728 = (($1716) + ($1727))|0;
 $1729 = (($W) + 76|0);
 $1730 = HEAP32[$1729>>2]|0;
 $1731 = (($1728) + ($1730))|0;
 $1732 = (($1731) + 604807628)|0;
 $t0 = $1732;
 $1733 = (($S) + 20|0);
 $1734 = HEAP32[$1733>>2]|0;
 $1735 = $1734 >>> 2;
 $1736 = (($S) + 20|0);
 $1737 = HEAP32[$1736>>2]|0;
 $1738 = $1737 << 30;
 $1739 = $1735 | $1738;
 $1740 = (($S) + 20|0);
 $1741 = HEAP32[$1740>>2]|0;
 $1742 = $1741 >>> 13;
 $1743 = (($S) + 20|0);
 $1744 = HEAP32[$1743>>2]|0;
 $1745 = $1744 << 19;
 $1746 = $1742 | $1745;
 $1747 = $1739 ^ $1746;
 $1748 = (($S) + 20|0);
 $1749 = HEAP32[$1748>>2]|0;
 $1750 = $1749 >>> 22;
 $1751 = (($S) + 20|0);
 $1752 = HEAP32[$1751>>2]|0;
 $1753 = $1752 << 10;
 $1754 = $1750 | $1753;
 $1755 = $1747 ^ $1754;
 $1756 = (($S) + 20|0);
 $1757 = HEAP32[$1756>>2]|0;
 $1758 = (($S) + 24|0);
 $1759 = HEAP32[$1758>>2]|0;
 $1760 = (($S) + 28|0);
 $1761 = HEAP32[$1760>>2]|0;
 $1762 = $1759 | $1761;
 $1763 = $1757 & $1762;
 $1764 = (($S) + 24|0);
 $1765 = HEAP32[$1764>>2]|0;
 $1766 = (($S) + 28|0);
 $1767 = HEAP32[$1766>>2]|0;
 $1768 = $1765 & $1767;
 $1769 = $1763 | $1768;
 $1770 = (($1755) + ($1769))|0;
 $t1 = $1770;
 $1771 = $t0;
 $1772 = HEAP32[$S>>2]|0;
 $1773 = (($1772) + ($1771))|0;
 HEAP32[$S>>2] = $1773;
 $1774 = $t0;
 $1775 = $t1;
 $1776 = (($1774) + ($1775))|0;
 $1777 = (($S) + 16|0);
 HEAP32[$1777>>2] = $1776;
 $1778 = (($S) + 12|0);
 $1779 = HEAP32[$1778>>2]|0;
 $1780 = HEAP32[$S>>2]|0;
 $1781 = $1780 >>> 6;
 $1782 = HEAP32[$S>>2]|0;
 $1783 = $1782 << 26;
 $1784 = $1781 | $1783;
 $1785 = HEAP32[$S>>2]|0;
 $1786 = $1785 >>> 11;
 $1787 = HEAP32[$S>>2]|0;
 $1788 = $1787 << 21;
 $1789 = $1786 | $1788;
 $1790 = $1784 ^ $1789;
 $1791 = HEAP32[$S>>2]|0;
 $1792 = $1791 >>> 25;
 $1793 = HEAP32[$S>>2]|0;
 $1794 = $1793 << 7;
 $1795 = $1792 | $1794;
 $1796 = $1790 ^ $1795;
 $1797 = (($1779) + ($1796))|0;
 $1798 = HEAP32[$S>>2]|0;
 $1799 = (($S) + 4|0);
 $1800 = HEAP32[$1799>>2]|0;
 $1801 = (($S) + 8|0);
 $1802 = HEAP32[$1801>>2]|0;
 $1803 = $1800 ^ $1802;
 $1804 = $1798 & $1803;
 $1805 = (($S) + 8|0);
 $1806 = HEAP32[$1805>>2]|0;
 $1807 = $1804 ^ $1806;
 $1808 = (($1797) + ($1807))|0;
 $1809 = (($W) + 80|0);
 $1810 = HEAP32[$1809>>2]|0;
 $1811 = (($1808) + ($1810))|0;
 $1812 = (($1811) + 770255983)|0;
 $t0 = $1812;
 $1813 = (($S) + 16|0);
 $1814 = HEAP32[$1813>>2]|0;
 $1815 = $1814 >>> 2;
 $1816 = (($S) + 16|0);
 $1817 = HEAP32[$1816>>2]|0;
 $1818 = $1817 << 30;
 $1819 = $1815 | $1818;
 $1820 = (($S) + 16|0);
 $1821 = HEAP32[$1820>>2]|0;
 $1822 = $1821 >>> 13;
 $1823 = (($S) + 16|0);
 $1824 = HEAP32[$1823>>2]|0;
 $1825 = $1824 << 19;
 $1826 = $1822 | $1825;
 $1827 = $1819 ^ $1826;
 $1828 = (($S) + 16|0);
 $1829 = HEAP32[$1828>>2]|0;
 $1830 = $1829 >>> 22;
 $1831 = (($S) + 16|0);
 $1832 = HEAP32[$1831>>2]|0;
 $1833 = $1832 << 10;
 $1834 = $1830 | $1833;
 $1835 = $1827 ^ $1834;
 $1836 = (($S) + 16|0);
 $1837 = HEAP32[$1836>>2]|0;
 $1838 = (($S) + 20|0);
 $1839 = HEAP32[$1838>>2]|0;
 $1840 = (($S) + 24|0);
 $1841 = HEAP32[$1840>>2]|0;
 $1842 = $1839 | $1841;
 $1843 = $1837 & $1842;
 $1844 = (($S) + 20|0);
 $1845 = HEAP32[$1844>>2]|0;
 $1846 = (($S) + 24|0);
 $1847 = HEAP32[$1846>>2]|0;
 $1848 = $1845 & $1847;
 $1849 = $1843 | $1848;
 $1850 = (($1835) + ($1849))|0;
 $t1 = $1850;
 $1851 = $t0;
 $1852 = (($S) + 28|0);
 $1853 = HEAP32[$1852>>2]|0;
 $1854 = (($1853) + ($1851))|0;
 HEAP32[$1852>>2] = $1854;
 $1855 = $t0;
 $1856 = $t1;
 $1857 = (($1855) + ($1856))|0;
 $1858 = (($S) + 12|0);
 HEAP32[$1858>>2] = $1857;
 $1859 = (($S) + 8|0);
 $1860 = HEAP32[$1859>>2]|0;
 $1861 = (($S) + 28|0);
 $1862 = HEAP32[$1861>>2]|0;
 $1863 = $1862 >>> 6;
 $1864 = (($S) + 28|0);
 $1865 = HEAP32[$1864>>2]|0;
 $1866 = $1865 << 26;
 $1867 = $1863 | $1866;
 $1868 = (($S) + 28|0);
 $1869 = HEAP32[$1868>>2]|0;
 $1870 = $1869 >>> 11;
 $1871 = (($S) + 28|0);
 $1872 = HEAP32[$1871>>2]|0;
 $1873 = $1872 << 21;
 $1874 = $1870 | $1873;
 $1875 = $1867 ^ $1874;
 $1876 = (($S) + 28|0);
 $1877 = HEAP32[$1876>>2]|0;
 $1878 = $1877 >>> 25;
 $1879 = (($S) + 28|0);
 $1880 = HEAP32[$1879>>2]|0;
 $1881 = $1880 << 7;
 $1882 = $1878 | $1881;
 $1883 = $1875 ^ $1882;
 $1884 = (($1860) + ($1883))|0;
 $1885 = (($S) + 28|0);
 $1886 = HEAP32[$1885>>2]|0;
 $1887 = HEAP32[$S>>2]|0;
 $1888 = (($S) + 4|0);
 $1889 = HEAP32[$1888>>2]|0;
 $1890 = $1887 ^ $1889;
 $1891 = $1886 & $1890;
 $1892 = (($S) + 4|0);
 $1893 = HEAP32[$1892>>2]|0;
 $1894 = $1891 ^ $1893;
 $1895 = (($1884) + ($1894))|0;
 $1896 = (($W) + 84|0);
 $1897 = HEAP32[$1896>>2]|0;
 $1898 = (($1895) + ($1897))|0;
 $1899 = (($1898) + 1249150122)|0;
 $t0 = $1899;
 $1900 = (($S) + 12|0);
 $1901 = HEAP32[$1900>>2]|0;
 $1902 = $1901 >>> 2;
 $1903 = (($S) + 12|0);
 $1904 = HEAP32[$1903>>2]|0;
 $1905 = $1904 << 30;
 $1906 = $1902 | $1905;
 $1907 = (($S) + 12|0);
 $1908 = HEAP32[$1907>>2]|0;
 $1909 = $1908 >>> 13;
 $1910 = (($S) + 12|0);
 $1911 = HEAP32[$1910>>2]|0;
 $1912 = $1911 << 19;
 $1913 = $1909 | $1912;
 $1914 = $1906 ^ $1913;
 $1915 = (($S) + 12|0);
 $1916 = HEAP32[$1915>>2]|0;
 $1917 = $1916 >>> 22;
 $1918 = (($S) + 12|0);
 $1919 = HEAP32[$1918>>2]|0;
 $1920 = $1919 << 10;
 $1921 = $1917 | $1920;
 $1922 = $1914 ^ $1921;
 $1923 = (($S) + 12|0);
 $1924 = HEAP32[$1923>>2]|0;
 $1925 = (($S) + 16|0);
 $1926 = HEAP32[$1925>>2]|0;
 $1927 = (($S) + 20|0);
 $1928 = HEAP32[$1927>>2]|0;
 $1929 = $1926 | $1928;
 $1930 = $1924 & $1929;
 $1931 = (($S) + 16|0);
 $1932 = HEAP32[$1931>>2]|0;
 $1933 = (($S) + 20|0);
 $1934 = HEAP32[$1933>>2]|0;
 $1935 = $1932 & $1934;
 $1936 = $1930 | $1935;
 $1937 = (($1922) + ($1936))|0;
 $t1 = $1937;
 $1938 = $t0;
 $1939 = (($S) + 24|0);
 $1940 = HEAP32[$1939>>2]|0;
 $1941 = (($1940) + ($1938))|0;
 HEAP32[$1939>>2] = $1941;
 $1942 = $t0;
 $1943 = $t1;
 $1944 = (($1942) + ($1943))|0;
 $1945 = (($S) + 8|0);
 HEAP32[$1945>>2] = $1944;
 $1946 = (($S) + 4|0);
 $1947 = HEAP32[$1946>>2]|0;
 $1948 = (($S) + 24|0);
 $1949 = HEAP32[$1948>>2]|0;
 $1950 = $1949 >>> 6;
 $1951 = (($S) + 24|0);
 $1952 = HEAP32[$1951>>2]|0;
 $1953 = $1952 << 26;
 $1954 = $1950 | $1953;
 $1955 = (($S) + 24|0);
 $1956 = HEAP32[$1955>>2]|0;
 $1957 = $1956 >>> 11;
 $1958 = (($S) + 24|0);
 $1959 = HEAP32[$1958>>2]|0;
 $1960 = $1959 << 21;
 $1961 = $1957 | $1960;
 $1962 = $1954 ^ $1961;
 $1963 = (($S) + 24|0);
 $1964 = HEAP32[$1963>>2]|0;
 $1965 = $1964 >>> 25;
 $1966 = (($S) + 24|0);
 $1967 = HEAP32[$1966>>2]|0;
 $1968 = $1967 << 7;
 $1969 = $1965 | $1968;
 $1970 = $1962 ^ $1969;
 $1971 = (($1947) + ($1970))|0;
 $1972 = (($S) + 24|0);
 $1973 = HEAP32[$1972>>2]|0;
 $1974 = (($S) + 28|0);
 $1975 = HEAP32[$1974>>2]|0;
 $1976 = HEAP32[$S>>2]|0;
 $1977 = $1975 ^ $1976;
 $1978 = $1973 & $1977;
 $1979 = HEAP32[$S>>2]|0;
 $1980 = $1978 ^ $1979;
 $1981 = (($1971) + ($1980))|0;
 $1982 = (($W) + 88|0);
 $1983 = HEAP32[$1982>>2]|0;
 $1984 = (($1981) + ($1983))|0;
 $1985 = (($1984) + 1555081692)|0;
 $t0 = $1985;
 $1986 = (($S) + 8|0);
 $1987 = HEAP32[$1986>>2]|0;
 $1988 = $1987 >>> 2;
 $1989 = (($S) + 8|0);
 $1990 = HEAP32[$1989>>2]|0;
 $1991 = $1990 << 30;
 $1992 = $1988 | $1991;
 $1993 = (($S) + 8|0);
 $1994 = HEAP32[$1993>>2]|0;
 $1995 = $1994 >>> 13;
 $1996 = (($S) + 8|0);
 $1997 = HEAP32[$1996>>2]|0;
 $1998 = $1997 << 19;
 $1999 = $1995 | $1998;
 $2000 = $1992 ^ $1999;
 $2001 = (($S) + 8|0);
 $2002 = HEAP32[$2001>>2]|0;
 $2003 = $2002 >>> 22;
 $2004 = (($S) + 8|0);
 $2005 = HEAP32[$2004>>2]|0;
 $2006 = $2005 << 10;
 $2007 = $2003 | $2006;
 $2008 = $2000 ^ $2007;
 $2009 = (($S) + 8|0);
 $2010 = HEAP32[$2009>>2]|0;
 $2011 = (($S) + 12|0);
 $2012 = HEAP32[$2011>>2]|0;
 $2013 = (($S) + 16|0);
 $2014 = HEAP32[$2013>>2]|0;
 $2015 = $2012 | $2014;
 $2016 = $2010 & $2015;
 $2017 = (($S) + 12|0);
 $2018 = HEAP32[$2017>>2]|0;
 $2019 = (($S) + 16|0);
 $2020 = HEAP32[$2019>>2]|0;
 $2021 = $2018 & $2020;
 $2022 = $2016 | $2021;
 $2023 = (($2008) + ($2022))|0;
 $t1 = $2023;
 $2024 = $t0;
 $2025 = (($S) + 20|0);
 $2026 = HEAP32[$2025>>2]|0;
 $2027 = (($2026) + ($2024))|0;
 HEAP32[$2025>>2] = $2027;
 $2028 = $t0;
 $2029 = $t1;
 $2030 = (($2028) + ($2029))|0;
 $2031 = (($S) + 4|0);
 HEAP32[$2031>>2] = $2030;
 $2032 = HEAP32[$S>>2]|0;
 $2033 = (($S) + 20|0);
 $2034 = HEAP32[$2033>>2]|0;
 $2035 = $2034 >>> 6;
 $2036 = (($S) + 20|0);
 $2037 = HEAP32[$2036>>2]|0;
 $2038 = $2037 << 26;
 $2039 = $2035 | $2038;
 $2040 = (($S) + 20|0);
 $2041 = HEAP32[$2040>>2]|0;
 $2042 = $2041 >>> 11;
 $2043 = (($S) + 20|0);
 $2044 = HEAP32[$2043>>2]|0;
 $2045 = $2044 << 21;
 $2046 = $2042 | $2045;
 $2047 = $2039 ^ $2046;
 $2048 = (($S) + 20|0);
 $2049 = HEAP32[$2048>>2]|0;
 $2050 = $2049 >>> 25;
 $2051 = (($S) + 20|0);
 $2052 = HEAP32[$2051>>2]|0;
 $2053 = $2052 << 7;
 $2054 = $2050 | $2053;
 $2055 = $2047 ^ $2054;
 $2056 = (($2032) + ($2055))|0;
 $2057 = (($S) + 20|0);
 $2058 = HEAP32[$2057>>2]|0;
 $2059 = (($S) + 24|0);
 $2060 = HEAP32[$2059>>2]|0;
 $2061 = (($S) + 28|0);
 $2062 = HEAP32[$2061>>2]|0;
 $2063 = $2060 ^ $2062;
 $2064 = $2058 & $2063;
 $2065 = (($S) + 28|0);
 $2066 = HEAP32[$2065>>2]|0;
 $2067 = $2064 ^ $2066;
 $2068 = (($2056) + ($2067))|0;
 $2069 = (($W) + 92|0);
 $2070 = HEAP32[$2069>>2]|0;
 $2071 = (($2068) + ($2070))|0;
 $2072 = (($2071) + 1996064986)|0;
 $t0 = $2072;
 $2073 = (($S) + 4|0);
 $2074 = HEAP32[$2073>>2]|0;
 $2075 = $2074 >>> 2;
 $2076 = (($S) + 4|0);
 $2077 = HEAP32[$2076>>2]|0;
 $2078 = $2077 << 30;
 $2079 = $2075 | $2078;
 $2080 = (($S) + 4|0);
 $2081 = HEAP32[$2080>>2]|0;
 $2082 = $2081 >>> 13;
 $2083 = (($S) + 4|0);
 $2084 = HEAP32[$2083>>2]|0;
 $2085 = $2084 << 19;
 $2086 = $2082 | $2085;
 $2087 = $2079 ^ $2086;
 $2088 = (($S) + 4|0);
 $2089 = HEAP32[$2088>>2]|0;
 $2090 = $2089 >>> 22;
 $2091 = (($S) + 4|0);
 $2092 = HEAP32[$2091>>2]|0;
 $2093 = $2092 << 10;
 $2094 = $2090 | $2093;
 $2095 = $2087 ^ $2094;
 $2096 = (($S) + 4|0);
 $2097 = HEAP32[$2096>>2]|0;
 $2098 = (($S) + 8|0);
 $2099 = HEAP32[$2098>>2]|0;
 $2100 = (($S) + 12|0);
 $2101 = HEAP32[$2100>>2]|0;
 $2102 = $2099 | $2101;
 $2103 = $2097 & $2102;
 $2104 = (($S) + 8|0);
 $2105 = HEAP32[$2104>>2]|0;
 $2106 = (($S) + 12|0);
 $2107 = HEAP32[$2106>>2]|0;
 $2108 = $2105 & $2107;
 $2109 = $2103 | $2108;
 $2110 = (($2095) + ($2109))|0;
 $t1 = $2110;
 $2111 = $t0;
 $2112 = (($S) + 16|0);
 $2113 = HEAP32[$2112>>2]|0;
 $2114 = (($2113) + ($2111))|0;
 HEAP32[$2112>>2] = $2114;
 $2115 = $t0;
 $2116 = $t1;
 $2117 = (($2115) + ($2116))|0;
 HEAP32[$S>>2] = $2117;
 $2118 = (($S) + 28|0);
 $2119 = HEAP32[$2118>>2]|0;
 $2120 = (($S) + 16|0);
 $2121 = HEAP32[$2120>>2]|0;
 $2122 = $2121 >>> 6;
 $2123 = (($S) + 16|0);
 $2124 = HEAP32[$2123>>2]|0;
 $2125 = $2124 << 26;
 $2126 = $2122 | $2125;
 $2127 = (($S) + 16|0);
 $2128 = HEAP32[$2127>>2]|0;
 $2129 = $2128 >>> 11;
 $2130 = (($S) + 16|0);
 $2131 = HEAP32[$2130>>2]|0;
 $2132 = $2131 << 21;
 $2133 = $2129 | $2132;
 $2134 = $2126 ^ $2133;
 $2135 = (($S) + 16|0);
 $2136 = HEAP32[$2135>>2]|0;
 $2137 = $2136 >>> 25;
 $2138 = (($S) + 16|0);
 $2139 = HEAP32[$2138>>2]|0;
 $2140 = $2139 << 7;
 $2141 = $2137 | $2140;
 $2142 = $2134 ^ $2141;
 $2143 = (($2119) + ($2142))|0;
 $2144 = (($S) + 16|0);
 $2145 = HEAP32[$2144>>2]|0;
 $2146 = (($S) + 20|0);
 $2147 = HEAP32[$2146>>2]|0;
 $2148 = (($S) + 24|0);
 $2149 = HEAP32[$2148>>2]|0;
 $2150 = $2147 ^ $2149;
 $2151 = $2145 & $2150;
 $2152 = (($S) + 24|0);
 $2153 = HEAP32[$2152>>2]|0;
 $2154 = $2151 ^ $2153;
 $2155 = (($2143) + ($2154))|0;
 $2156 = (($W) + 96|0);
 $2157 = HEAP32[$2156>>2]|0;
 $2158 = (($2155) + ($2157))|0;
 $2159 = (($2158) + -1740746414)|0;
 $t0 = $2159;
 $2160 = HEAP32[$S>>2]|0;
 $2161 = $2160 >>> 2;
 $2162 = HEAP32[$S>>2]|0;
 $2163 = $2162 << 30;
 $2164 = $2161 | $2163;
 $2165 = HEAP32[$S>>2]|0;
 $2166 = $2165 >>> 13;
 $2167 = HEAP32[$S>>2]|0;
 $2168 = $2167 << 19;
 $2169 = $2166 | $2168;
 $2170 = $2164 ^ $2169;
 $2171 = HEAP32[$S>>2]|0;
 $2172 = $2171 >>> 22;
 $2173 = HEAP32[$S>>2]|0;
 $2174 = $2173 << 10;
 $2175 = $2172 | $2174;
 $2176 = $2170 ^ $2175;
 $2177 = HEAP32[$S>>2]|0;
 $2178 = (($S) + 4|0);
 $2179 = HEAP32[$2178>>2]|0;
 $2180 = (($S) + 8|0);
 $2181 = HEAP32[$2180>>2]|0;
 $2182 = $2179 | $2181;
 $2183 = $2177 & $2182;
 $2184 = (($S) + 4|0);
 $2185 = HEAP32[$2184>>2]|0;
 $2186 = (($S) + 8|0);
 $2187 = HEAP32[$2186>>2]|0;
 $2188 = $2185 & $2187;
 $2189 = $2183 | $2188;
 $2190 = (($2176) + ($2189))|0;
 $t1 = $2190;
 $2191 = $t0;
 $2192 = (($S) + 12|0);
 $2193 = HEAP32[$2192>>2]|0;
 $2194 = (($2193) + ($2191))|0;
 HEAP32[$2192>>2] = $2194;
 $2195 = $t0;
 $2196 = $t1;
 $2197 = (($2195) + ($2196))|0;
 $2198 = (($S) + 28|0);
 HEAP32[$2198>>2] = $2197;
 $2199 = (($S) + 24|0);
 $2200 = HEAP32[$2199>>2]|0;
 $2201 = (($S) + 12|0);
 $2202 = HEAP32[$2201>>2]|0;
 $2203 = $2202 >>> 6;
 $2204 = (($S) + 12|0);
 $2205 = HEAP32[$2204>>2]|0;
 $2206 = $2205 << 26;
 $2207 = $2203 | $2206;
 $2208 = (($S) + 12|0);
 $2209 = HEAP32[$2208>>2]|0;
 $2210 = $2209 >>> 11;
 $2211 = (($S) + 12|0);
 $2212 = HEAP32[$2211>>2]|0;
 $2213 = $2212 << 21;
 $2214 = $2210 | $2213;
 $2215 = $2207 ^ $2214;
 $2216 = (($S) + 12|0);
 $2217 = HEAP32[$2216>>2]|0;
 $2218 = $2217 >>> 25;
 $2219 = (($S) + 12|0);
 $2220 = HEAP32[$2219>>2]|0;
 $2221 = $2220 << 7;
 $2222 = $2218 | $2221;
 $2223 = $2215 ^ $2222;
 $2224 = (($2200) + ($2223))|0;
 $2225 = (($S) + 12|0);
 $2226 = HEAP32[$2225>>2]|0;
 $2227 = (($S) + 16|0);
 $2228 = HEAP32[$2227>>2]|0;
 $2229 = (($S) + 20|0);
 $2230 = HEAP32[$2229>>2]|0;
 $2231 = $2228 ^ $2230;
 $2232 = $2226 & $2231;
 $2233 = (($S) + 20|0);
 $2234 = HEAP32[$2233>>2]|0;
 $2235 = $2232 ^ $2234;
 $2236 = (($2224) + ($2235))|0;
 $2237 = (($W) + 100|0);
 $2238 = HEAP32[$2237>>2]|0;
 $2239 = (($2236) + ($2238))|0;
 $2240 = (($2239) + -1473132947)|0;
 $t0 = $2240;
 $2241 = (($S) + 28|0);
 $2242 = HEAP32[$2241>>2]|0;
 $2243 = $2242 >>> 2;
 $2244 = (($S) + 28|0);
 $2245 = HEAP32[$2244>>2]|0;
 $2246 = $2245 << 30;
 $2247 = $2243 | $2246;
 $2248 = (($S) + 28|0);
 $2249 = HEAP32[$2248>>2]|0;
 $2250 = $2249 >>> 13;
 $2251 = (($S) + 28|0);
 $2252 = HEAP32[$2251>>2]|0;
 $2253 = $2252 << 19;
 $2254 = $2250 | $2253;
 $2255 = $2247 ^ $2254;
 $2256 = (($S) + 28|0);
 $2257 = HEAP32[$2256>>2]|0;
 $2258 = $2257 >>> 22;
 $2259 = (($S) + 28|0);
 $2260 = HEAP32[$2259>>2]|0;
 $2261 = $2260 << 10;
 $2262 = $2258 | $2261;
 $2263 = $2255 ^ $2262;
 $2264 = (($S) + 28|0);
 $2265 = HEAP32[$2264>>2]|0;
 $2266 = HEAP32[$S>>2]|0;
 $2267 = (($S) + 4|0);
 $2268 = HEAP32[$2267>>2]|0;
 $2269 = $2266 | $2268;
 $2270 = $2265 & $2269;
 $2271 = HEAP32[$S>>2]|0;
 $2272 = (($S) + 4|0);
 $2273 = HEAP32[$2272>>2]|0;
 $2274 = $2271 & $2273;
 $2275 = $2270 | $2274;
 $2276 = (($2263) + ($2275))|0;
 $t1 = $2276;
 $2277 = $t0;
 $2278 = (($S) + 8|0);
 $2279 = HEAP32[$2278>>2]|0;
 $2280 = (($2279) + ($2277))|0;
 HEAP32[$2278>>2] = $2280;
 $2281 = $t0;
 $2282 = $t1;
 $2283 = (($2281) + ($2282))|0;
 $2284 = (($S) + 24|0);
 HEAP32[$2284>>2] = $2283;
 $2285 = (($S) + 20|0);
 $2286 = HEAP32[$2285>>2]|0;
 $2287 = (($S) + 8|0);
 $2288 = HEAP32[$2287>>2]|0;
 $2289 = $2288 >>> 6;
 $2290 = (($S) + 8|0);
 $2291 = HEAP32[$2290>>2]|0;
 $2292 = $2291 << 26;
 $2293 = $2289 | $2292;
 $2294 = (($S) + 8|0);
 $2295 = HEAP32[$2294>>2]|0;
 $2296 = $2295 >>> 11;
 $2297 = (($S) + 8|0);
 $2298 = HEAP32[$2297>>2]|0;
 $2299 = $2298 << 21;
 $2300 = $2296 | $2299;
 $2301 = $2293 ^ $2300;
 $2302 = (($S) + 8|0);
 $2303 = HEAP32[$2302>>2]|0;
 $2304 = $2303 >>> 25;
 $2305 = (($S) + 8|0);
 $2306 = HEAP32[$2305>>2]|0;
 $2307 = $2306 << 7;
 $2308 = $2304 | $2307;
 $2309 = $2301 ^ $2308;
 $2310 = (($2286) + ($2309))|0;
 $2311 = (($S) + 8|0);
 $2312 = HEAP32[$2311>>2]|0;
 $2313 = (($S) + 12|0);
 $2314 = HEAP32[$2313>>2]|0;
 $2315 = (($S) + 16|0);
 $2316 = HEAP32[$2315>>2]|0;
 $2317 = $2314 ^ $2316;
 $2318 = $2312 & $2317;
 $2319 = (($S) + 16|0);
 $2320 = HEAP32[$2319>>2]|0;
 $2321 = $2318 ^ $2320;
 $2322 = (($2310) + ($2321))|0;
 $2323 = (($W) + 104|0);
 $2324 = HEAP32[$2323>>2]|0;
 $2325 = (($2322) + ($2324))|0;
 $2326 = (($2325) + -1341970488)|0;
 $t0 = $2326;
 $2327 = (($S) + 24|0);
 $2328 = HEAP32[$2327>>2]|0;
 $2329 = $2328 >>> 2;
 $2330 = (($S) + 24|0);
 $2331 = HEAP32[$2330>>2]|0;
 $2332 = $2331 << 30;
 $2333 = $2329 | $2332;
 $2334 = (($S) + 24|0);
 $2335 = HEAP32[$2334>>2]|0;
 $2336 = $2335 >>> 13;
 $2337 = (($S) + 24|0);
 $2338 = HEAP32[$2337>>2]|0;
 $2339 = $2338 << 19;
 $2340 = $2336 | $2339;
 $2341 = $2333 ^ $2340;
 $2342 = (($S) + 24|0);
 $2343 = HEAP32[$2342>>2]|0;
 $2344 = $2343 >>> 22;
 $2345 = (($S) + 24|0);
 $2346 = HEAP32[$2345>>2]|0;
 $2347 = $2346 << 10;
 $2348 = $2344 | $2347;
 $2349 = $2341 ^ $2348;
 $2350 = (($S) + 24|0);
 $2351 = HEAP32[$2350>>2]|0;
 $2352 = (($S) + 28|0);
 $2353 = HEAP32[$2352>>2]|0;
 $2354 = HEAP32[$S>>2]|0;
 $2355 = $2353 | $2354;
 $2356 = $2351 & $2355;
 $2357 = (($S) + 28|0);
 $2358 = HEAP32[$2357>>2]|0;
 $2359 = HEAP32[$S>>2]|0;
 $2360 = $2358 & $2359;
 $2361 = $2356 | $2360;
 $2362 = (($2349) + ($2361))|0;
 $t1 = $2362;
 $2363 = $t0;
 $2364 = (($S) + 4|0);
 $2365 = HEAP32[$2364>>2]|0;
 $2366 = (($2365) + ($2363))|0;
 HEAP32[$2364>>2] = $2366;
 $2367 = $t0;
 $2368 = $t1;
 $2369 = (($2367) + ($2368))|0;
 $2370 = (($S) + 20|0);
 HEAP32[$2370>>2] = $2369;
 $2371 = (($S) + 16|0);
 $2372 = HEAP32[$2371>>2]|0;
 $2373 = (($S) + 4|0);
 $2374 = HEAP32[$2373>>2]|0;
 $2375 = $2374 >>> 6;
 $2376 = (($S) + 4|0);
 $2377 = HEAP32[$2376>>2]|0;
 $2378 = $2377 << 26;
 $2379 = $2375 | $2378;
 $2380 = (($S) + 4|0);
 $2381 = HEAP32[$2380>>2]|0;
 $2382 = $2381 >>> 11;
 $2383 = (($S) + 4|0);
 $2384 = HEAP32[$2383>>2]|0;
 $2385 = $2384 << 21;
 $2386 = $2382 | $2385;
 $2387 = $2379 ^ $2386;
 $2388 = (($S) + 4|0);
 $2389 = HEAP32[$2388>>2]|0;
 $2390 = $2389 >>> 25;
 $2391 = (($S) + 4|0);
 $2392 = HEAP32[$2391>>2]|0;
 $2393 = $2392 << 7;
 $2394 = $2390 | $2393;
 $2395 = $2387 ^ $2394;
 $2396 = (($2372) + ($2395))|0;
 $2397 = (($S) + 4|0);
 $2398 = HEAP32[$2397>>2]|0;
 $2399 = (($S) + 8|0);
 $2400 = HEAP32[$2399>>2]|0;
 $2401 = (($S) + 12|0);
 $2402 = HEAP32[$2401>>2]|0;
 $2403 = $2400 ^ $2402;
 $2404 = $2398 & $2403;
 $2405 = (($S) + 12|0);
 $2406 = HEAP32[$2405>>2]|0;
 $2407 = $2404 ^ $2406;
 $2408 = (($2396) + ($2407))|0;
 $2409 = (($W) + 108|0);
 $2410 = HEAP32[$2409>>2]|0;
 $2411 = (($2408) + ($2410))|0;
 $2412 = (($2411) + -1084653625)|0;
 $t0 = $2412;
 $2413 = (($S) + 20|0);
 $2414 = HEAP32[$2413>>2]|0;
 $2415 = $2414 >>> 2;
 $2416 = (($S) + 20|0);
 $2417 = HEAP32[$2416>>2]|0;
 $2418 = $2417 << 30;
 $2419 = $2415 | $2418;
 $2420 = (($S) + 20|0);
 $2421 = HEAP32[$2420>>2]|0;
 $2422 = $2421 >>> 13;
 $2423 = (($S) + 20|0);
 $2424 = HEAP32[$2423>>2]|0;
 $2425 = $2424 << 19;
 $2426 = $2422 | $2425;
 $2427 = $2419 ^ $2426;
 $2428 = (($S) + 20|0);
 $2429 = HEAP32[$2428>>2]|0;
 $2430 = $2429 >>> 22;
 $2431 = (($S) + 20|0);
 $2432 = HEAP32[$2431>>2]|0;
 $2433 = $2432 << 10;
 $2434 = $2430 | $2433;
 $2435 = $2427 ^ $2434;
 $2436 = (($S) + 20|0);
 $2437 = HEAP32[$2436>>2]|0;
 $2438 = (($S) + 24|0);
 $2439 = HEAP32[$2438>>2]|0;
 $2440 = (($S) + 28|0);
 $2441 = HEAP32[$2440>>2]|0;
 $2442 = $2439 | $2441;
 $2443 = $2437 & $2442;
 $2444 = (($S) + 24|0);
 $2445 = HEAP32[$2444>>2]|0;
 $2446 = (($S) + 28|0);
 $2447 = HEAP32[$2446>>2]|0;
 $2448 = $2445 & $2447;
 $2449 = $2443 | $2448;
 $2450 = (($2435) + ($2449))|0;
 $t1 = $2450;
 $2451 = $t0;
 $2452 = HEAP32[$S>>2]|0;
 $2453 = (($2452) + ($2451))|0;
 HEAP32[$S>>2] = $2453;
 $2454 = $t0;
 $2455 = $t1;
 $2456 = (($2454) + ($2455))|0;
 $2457 = (($S) + 16|0);
 HEAP32[$2457>>2] = $2456;
 $2458 = (($S) + 12|0);
 $2459 = HEAP32[$2458>>2]|0;
 $2460 = HEAP32[$S>>2]|0;
 $2461 = $2460 >>> 6;
 $2462 = HEAP32[$S>>2]|0;
 $2463 = $2462 << 26;
 $2464 = $2461 | $2463;
 $2465 = HEAP32[$S>>2]|0;
 $2466 = $2465 >>> 11;
 $2467 = HEAP32[$S>>2]|0;
 $2468 = $2467 << 21;
 $2469 = $2466 | $2468;
 $2470 = $2464 ^ $2469;
 $2471 = HEAP32[$S>>2]|0;
 $2472 = $2471 >>> 25;
 $2473 = HEAP32[$S>>2]|0;
 $2474 = $2473 << 7;
 $2475 = $2472 | $2474;
 $2476 = $2470 ^ $2475;
 $2477 = (($2459) + ($2476))|0;
 $2478 = HEAP32[$S>>2]|0;
 $2479 = (($S) + 4|0);
 $2480 = HEAP32[$2479>>2]|0;
 $2481 = (($S) + 8|0);
 $2482 = HEAP32[$2481>>2]|0;
 $2483 = $2480 ^ $2482;
 $2484 = $2478 & $2483;
 $2485 = (($S) + 8|0);
 $2486 = HEAP32[$2485>>2]|0;
 $2487 = $2484 ^ $2486;
 $2488 = (($2477) + ($2487))|0;
 $2489 = (($W) + 112|0);
 $2490 = HEAP32[$2489>>2]|0;
 $2491 = (($2488) + ($2490))|0;
 $2492 = (($2491) + -958395405)|0;
 $t0 = $2492;
 $2493 = (($S) + 16|0);
 $2494 = HEAP32[$2493>>2]|0;
 $2495 = $2494 >>> 2;
 $2496 = (($S) + 16|0);
 $2497 = HEAP32[$2496>>2]|0;
 $2498 = $2497 << 30;
 $2499 = $2495 | $2498;
 $2500 = (($S) + 16|0);
 $2501 = HEAP32[$2500>>2]|0;
 $2502 = $2501 >>> 13;
 $2503 = (($S) + 16|0);
 $2504 = HEAP32[$2503>>2]|0;
 $2505 = $2504 << 19;
 $2506 = $2502 | $2505;
 $2507 = $2499 ^ $2506;
 $2508 = (($S) + 16|0);
 $2509 = HEAP32[$2508>>2]|0;
 $2510 = $2509 >>> 22;
 $2511 = (($S) + 16|0);
 $2512 = HEAP32[$2511>>2]|0;
 $2513 = $2512 << 10;
 $2514 = $2510 | $2513;
 $2515 = $2507 ^ $2514;
 $2516 = (($S) + 16|0);
 $2517 = HEAP32[$2516>>2]|0;
 $2518 = (($S) + 20|0);
 $2519 = HEAP32[$2518>>2]|0;
 $2520 = (($S) + 24|0);
 $2521 = HEAP32[$2520>>2]|0;
 $2522 = $2519 | $2521;
 $2523 = $2517 & $2522;
 $2524 = (($S) + 20|0);
 $2525 = HEAP32[$2524>>2]|0;
 $2526 = (($S) + 24|0);
 $2527 = HEAP32[$2526>>2]|0;
 $2528 = $2525 & $2527;
 $2529 = $2523 | $2528;
 $2530 = (($2515) + ($2529))|0;
 $t1 = $2530;
 $2531 = $t0;
 $2532 = (($S) + 28|0);
 $2533 = HEAP32[$2532>>2]|0;
 $2534 = (($2533) + ($2531))|0;
 HEAP32[$2532>>2] = $2534;
 $2535 = $t0;
 $2536 = $t1;
 $2537 = (($2535) + ($2536))|0;
 $2538 = (($S) + 12|0);
 HEAP32[$2538>>2] = $2537;
 $2539 = (($S) + 8|0);
 $2540 = HEAP32[$2539>>2]|0;
 $2541 = (($S) + 28|0);
 $2542 = HEAP32[$2541>>2]|0;
 $2543 = $2542 >>> 6;
 $2544 = (($S) + 28|0);
 $2545 = HEAP32[$2544>>2]|0;
 $2546 = $2545 << 26;
 $2547 = $2543 | $2546;
 $2548 = (($S) + 28|0);
 $2549 = HEAP32[$2548>>2]|0;
 $2550 = $2549 >>> 11;
 $2551 = (($S) + 28|0);
 $2552 = HEAP32[$2551>>2]|0;
 $2553 = $2552 << 21;
 $2554 = $2550 | $2553;
 $2555 = $2547 ^ $2554;
 $2556 = (($S) + 28|0);
 $2557 = HEAP32[$2556>>2]|0;
 $2558 = $2557 >>> 25;
 $2559 = (($S) + 28|0);
 $2560 = HEAP32[$2559>>2]|0;
 $2561 = $2560 << 7;
 $2562 = $2558 | $2561;
 $2563 = $2555 ^ $2562;
 $2564 = (($2540) + ($2563))|0;
 $2565 = (($S) + 28|0);
 $2566 = HEAP32[$2565>>2]|0;
 $2567 = HEAP32[$S>>2]|0;
 $2568 = (($S) + 4|0);
 $2569 = HEAP32[$2568>>2]|0;
 $2570 = $2567 ^ $2569;
 $2571 = $2566 & $2570;
 $2572 = (($S) + 4|0);
 $2573 = HEAP32[$2572>>2]|0;
 $2574 = $2571 ^ $2573;
 $2575 = (($2564) + ($2574))|0;
 $2576 = (($W) + 116|0);
 $2577 = HEAP32[$2576>>2]|0;
 $2578 = (($2575) + ($2577))|0;
 $2579 = (($2578) + -710438585)|0;
 $t0 = $2579;
 $2580 = (($S) + 12|0);
 $2581 = HEAP32[$2580>>2]|0;
 $2582 = $2581 >>> 2;
 $2583 = (($S) + 12|0);
 $2584 = HEAP32[$2583>>2]|0;
 $2585 = $2584 << 30;
 $2586 = $2582 | $2585;
 $2587 = (($S) + 12|0);
 $2588 = HEAP32[$2587>>2]|0;
 $2589 = $2588 >>> 13;
 $2590 = (($S) + 12|0);
 $2591 = HEAP32[$2590>>2]|0;
 $2592 = $2591 << 19;
 $2593 = $2589 | $2592;
 $2594 = $2586 ^ $2593;
 $2595 = (($S) + 12|0);
 $2596 = HEAP32[$2595>>2]|0;
 $2597 = $2596 >>> 22;
 $2598 = (($S) + 12|0);
 $2599 = HEAP32[$2598>>2]|0;
 $2600 = $2599 << 10;
 $2601 = $2597 | $2600;
 $2602 = $2594 ^ $2601;
 $2603 = (($S) + 12|0);
 $2604 = HEAP32[$2603>>2]|0;
 $2605 = (($S) + 16|0);
 $2606 = HEAP32[$2605>>2]|0;
 $2607 = (($S) + 20|0);
 $2608 = HEAP32[$2607>>2]|0;
 $2609 = $2606 | $2608;
 $2610 = $2604 & $2609;
 $2611 = (($S) + 16|0);
 $2612 = HEAP32[$2611>>2]|0;
 $2613 = (($S) + 20|0);
 $2614 = HEAP32[$2613>>2]|0;
 $2615 = $2612 & $2614;
 $2616 = $2610 | $2615;
 $2617 = (($2602) + ($2616))|0;
 $t1 = $2617;
 $2618 = $t0;
 $2619 = (($S) + 24|0);
 $2620 = HEAP32[$2619>>2]|0;
 $2621 = (($2620) + ($2618))|0;
 HEAP32[$2619>>2] = $2621;
 $2622 = $t0;
 $2623 = $t1;
 $2624 = (($2622) + ($2623))|0;
 $2625 = (($S) + 8|0);
 HEAP32[$2625>>2] = $2624;
 $2626 = (($S) + 4|0);
 $2627 = HEAP32[$2626>>2]|0;
 $2628 = (($S) + 24|0);
 $2629 = HEAP32[$2628>>2]|0;
 $2630 = $2629 >>> 6;
 $2631 = (($S) + 24|0);
 $2632 = HEAP32[$2631>>2]|0;
 $2633 = $2632 << 26;
 $2634 = $2630 | $2633;
 $2635 = (($S) + 24|0);
 $2636 = HEAP32[$2635>>2]|0;
 $2637 = $2636 >>> 11;
 $2638 = (($S) + 24|0);
 $2639 = HEAP32[$2638>>2]|0;
 $2640 = $2639 << 21;
 $2641 = $2637 | $2640;
 $2642 = $2634 ^ $2641;
 $2643 = (($S) + 24|0);
 $2644 = HEAP32[$2643>>2]|0;
 $2645 = $2644 >>> 25;
 $2646 = (($S) + 24|0);
 $2647 = HEAP32[$2646>>2]|0;
 $2648 = $2647 << 7;
 $2649 = $2645 | $2648;
 $2650 = $2642 ^ $2649;
 $2651 = (($2627) + ($2650))|0;
 $2652 = (($S) + 24|0);
 $2653 = HEAP32[$2652>>2]|0;
 $2654 = (($S) + 28|0);
 $2655 = HEAP32[$2654>>2]|0;
 $2656 = HEAP32[$S>>2]|0;
 $2657 = $2655 ^ $2656;
 $2658 = $2653 & $2657;
 $2659 = HEAP32[$S>>2]|0;
 $2660 = $2658 ^ $2659;
 $2661 = (($2651) + ($2660))|0;
 $2662 = (($W) + 120|0);
 $2663 = HEAP32[$2662>>2]|0;
 $2664 = (($2661) + ($2663))|0;
 $2665 = (($2664) + 113926993)|0;
 $t0 = $2665;
 $2666 = (($S) + 8|0);
 $2667 = HEAP32[$2666>>2]|0;
 $2668 = $2667 >>> 2;
 $2669 = (($S) + 8|0);
 $2670 = HEAP32[$2669>>2]|0;
 $2671 = $2670 << 30;
 $2672 = $2668 | $2671;
 $2673 = (($S) + 8|0);
 $2674 = HEAP32[$2673>>2]|0;
 $2675 = $2674 >>> 13;
 $2676 = (($S) + 8|0);
 $2677 = HEAP32[$2676>>2]|0;
 $2678 = $2677 << 19;
 $2679 = $2675 | $2678;
 $2680 = $2672 ^ $2679;
 $2681 = (($S) + 8|0);
 $2682 = HEAP32[$2681>>2]|0;
 $2683 = $2682 >>> 22;
 $2684 = (($S) + 8|0);
 $2685 = HEAP32[$2684>>2]|0;
 $2686 = $2685 << 10;
 $2687 = $2683 | $2686;
 $2688 = $2680 ^ $2687;
 $2689 = (($S) + 8|0);
 $2690 = HEAP32[$2689>>2]|0;
 $2691 = (($S) + 12|0);
 $2692 = HEAP32[$2691>>2]|0;
 $2693 = (($S) + 16|0);
 $2694 = HEAP32[$2693>>2]|0;
 $2695 = $2692 | $2694;
 $2696 = $2690 & $2695;
 $2697 = (($S) + 12|0);
 $2698 = HEAP32[$2697>>2]|0;
 $2699 = (($S) + 16|0);
 $2700 = HEAP32[$2699>>2]|0;
 $2701 = $2698 & $2700;
 $2702 = $2696 | $2701;
 $2703 = (($2688) + ($2702))|0;
 $t1 = $2703;
 $2704 = $t0;
 $2705 = (($S) + 20|0);
 $2706 = HEAP32[$2705>>2]|0;
 $2707 = (($2706) + ($2704))|0;
 HEAP32[$2705>>2] = $2707;
 $2708 = $t0;
 $2709 = $t1;
 $2710 = (($2708) + ($2709))|0;
 $2711 = (($S) + 4|0);
 HEAP32[$2711>>2] = $2710;
 $2712 = HEAP32[$S>>2]|0;
 $2713 = (($S) + 20|0);
 $2714 = HEAP32[$2713>>2]|0;
 $2715 = $2714 >>> 6;
 $2716 = (($S) + 20|0);
 $2717 = HEAP32[$2716>>2]|0;
 $2718 = $2717 << 26;
 $2719 = $2715 | $2718;
 $2720 = (($S) + 20|0);
 $2721 = HEAP32[$2720>>2]|0;
 $2722 = $2721 >>> 11;
 $2723 = (($S) + 20|0);
 $2724 = HEAP32[$2723>>2]|0;
 $2725 = $2724 << 21;
 $2726 = $2722 | $2725;
 $2727 = $2719 ^ $2726;
 $2728 = (($S) + 20|0);
 $2729 = HEAP32[$2728>>2]|0;
 $2730 = $2729 >>> 25;
 $2731 = (($S) + 20|0);
 $2732 = HEAP32[$2731>>2]|0;
 $2733 = $2732 << 7;
 $2734 = $2730 | $2733;
 $2735 = $2727 ^ $2734;
 $2736 = (($2712) + ($2735))|0;
 $2737 = (($S) + 20|0);
 $2738 = HEAP32[$2737>>2]|0;
 $2739 = (($S) + 24|0);
 $2740 = HEAP32[$2739>>2]|0;
 $2741 = (($S) + 28|0);
 $2742 = HEAP32[$2741>>2]|0;
 $2743 = $2740 ^ $2742;
 $2744 = $2738 & $2743;
 $2745 = (($S) + 28|0);
 $2746 = HEAP32[$2745>>2]|0;
 $2747 = $2744 ^ $2746;
 $2748 = (($2736) + ($2747))|0;
 $2749 = (($W) + 124|0);
 $2750 = HEAP32[$2749>>2]|0;
 $2751 = (($2748) + ($2750))|0;
 $2752 = (($2751) + 338241895)|0;
 $t0 = $2752;
 $2753 = (($S) + 4|0);
 $2754 = HEAP32[$2753>>2]|0;
 $2755 = $2754 >>> 2;
 $2756 = (($S) + 4|0);
 $2757 = HEAP32[$2756>>2]|0;
 $2758 = $2757 << 30;
 $2759 = $2755 | $2758;
 $2760 = (($S) + 4|0);
 $2761 = HEAP32[$2760>>2]|0;
 $2762 = $2761 >>> 13;
 $2763 = (($S) + 4|0);
 $2764 = HEAP32[$2763>>2]|0;
 $2765 = $2764 << 19;
 $2766 = $2762 | $2765;
 $2767 = $2759 ^ $2766;
 $2768 = (($S) + 4|0);
 $2769 = HEAP32[$2768>>2]|0;
 $2770 = $2769 >>> 22;
 $2771 = (($S) + 4|0);
 $2772 = HEAP32[$2771>>2]|0;
 $2773 = $2772 << 10;
 $2774 = $2770 | $2773;
 $2775 = $2767 ^ $2774;
 $2776 = (($S) + 4|0);
 $2777 = HEAP32[$2776>>2]|0;
 $2778 = (($S) + 8|0);
 $2779 = HEAP32[$2778>>2]|0;
 $2780 = (($S) + 12|0);
 $2781 = HEAP32[$2780>>2]|0;
 $2782 = $2779 | $2781;
 $2783 = $2777 & $2782;
 $2784 = (($S) + 8|0);
 $2785 = HEAP32[$2784>>2]|0;
 $2786 = (($S) + 12|0);
 $2787 = HEAP32[$2786>>2]|0;
 $2788 = $2785 & $2787;
 $2789 = $2783 | $2788;
 $2790 = (($2775) + ($2789))|0;
 $t1 = $2790;
 $2791 = $t0;
 $2792 = (($S) + 16|0);
 $2793 = HEAP32[$2792>>2]|0;
 $2794 = (($2793) + ($2791))|0;
 HEAP32[$2792>>2] = $2794;
 $2795 = $t0;
 $2796 = $t1;
 $2797 = (($2795) + ($2796))|0;
 HEAP32[$S>>2] = $2797;
 $2798 = (($S) + 28|0);
 $2799 = HEAP32[$2798>>2]|0;
 $2800 = (($S) + 16|0);
 $2801 = HEAP32[$2800>>2]|0;
 $2802 = $2801 >>> 6;
 $2803 = (($S) + 16|0);
 $2804 = HEAP32[$2803>>2]|0;
 $2805 = $2804 << 26;
 $2806 = $2802 | $2805;
 $2807 = (($S) + 16|0);
 $2808 = HEAP32[$2807>>2]|0;
 $2809 = $2808 >>> 11;
 $2810 = (($S) + 16|0);
 $2811 = HEAP32[$2810>>2]|0;
 $2812 = $2811 << 21;
 $2813 = $2809 | $2812;
 $2814 = $2806 ^ $2813;
 $2815 = (($S) + 16|0);
 $2816 = HEAP32[$2815>>2]|0;
 $2817 = $2816 >>> 25;
 $2818 = (($S) + 16|0);
 $2819 = HEAP32[$2818>>2]|0;
 $2820 = $2819 << 7;
 $2821 = $2817 | $2820;
 $2822 = $2814 ^ $2821;
 $2823 = (($2799) + ($2822))|0;
 $2824 = (($S) + 16|0);
 $2825 = HEAP32[$2824>>2]|0;
 $2826 = (($S) + 20|0);
 $2827 = HEAP32[$2826>>2]|0;
 $2828 = (($S) + 24|0);
 $2829 = HEAP32[$2828>>2]|0;
 $2830 = $2827 ^ $2829;
 $2831 = $2825 & $2830;
 $2832 = (($S) + 24|0);
 $2833 = HEAP32[$2832>>2]|0;
 $2834 = $2831 ^ $2833;
 $2835 = (($2823) + ($2834))|0;
 $2836 = (($W) + 128|0);
 $2837 = HEAP32[$2836>>2]|0;
 $2838 = (($2835) + ($2837))|0;
 $2839 = (($2838) + 666307205)|0;
 $t0 = $2839;
 $2840 = HEAP32[$S>>2]|0;
 $2841 = $2840 >>> 2;
 $2842 = HEAP32[$S>>2]|0;
 $2843 = $2842 << 30;
 $2844 = $2841 | $2843;
 $2845 = HEAP32[$S>>2]|0;
 $2846 = $2845 >>> 13;
 $2847 = HEAP32[$S>>2]|0;
 $2848 = $2847 << 19;
 $2849 = $2846 | $2848;
 $2850 = $2844 ^ $2849;
 $2851 = HEAP32[$S>>2]|0;
 $2852 = $2851 >>> 22;
 $2853 = HEAP32[$S>>2]|0;
 $2854 = $2853 << 10;
 $2855 = $2852 | $2854;
 $2856 = $2850 ^ $2855;
 $2857 = HEAP32[$S>>2]|0;
 $2858 = (($S) + 4|0);
 $2859 = HEAP32[$2858>>2]|0;
 $2860 = (($S) + 8|0);
 $2861 = HEAP32[$2860>>2]|0;
 $2862 = $2859 | $2861;
 $2863 = $2857 & $2862;
 $2864 = (($S) + 4|0);
 $2865 = HEAP32[$2864>>2]|0;
 $2866 = (($S) + 8|0);
 $2867 = HEAP32[$2866>>2]|0;
 $2868 = $2865 & $2867;
 $2869 = $2863 | $2868;
 $2870 = (($2856) + ($2869))|0;
 $t1 = $2870;
 $2871 = $t0;
 $2872 = (($S) + 12|0);
 $2873 = HEAP32[$2872>>2]|0;
 $2874 = (($2873) + ($2871))|0;
 HEAP32[$2872>>2] = $2874;
 $2875 = $t0;
 $2876 = $t1;
 $2877 = (($2875) + ($2876))|0;
 $2878 = (($S) + 28|0);
 HEAP32[$2878>>2] = $2877;
 $2879 = (($S) + 24|0);
 $2880 = HEAP32[$2879>>2]|0;
 $2881 = (($S) + 12|0);
 $2882 = HEAP32[$2881>>2]|0;
 $2883 = $2882 >>> 6;
 $2884 = (($S) + 12|0);
 $2885 = HEAP32[$2884>>2]|0;
 $2886 = $2885 << 26;
 $2887 = $2883 | $2886;
 $2888 = (($S) + 12|0);
 $2889 = HEAP32[$2888>>2]|0;
 $2890 = $2889 >>> 11;
 $2891 = (($S) + 12|0);
 $2892 = HEAP32[$2891>>2]|0;
 $2893 = $2892 << 21;
 $2894 = $2890 | $2893;
 $2895 = $2887 ^ $2894;
 $2896 = (($S) + 12|0);
 $2897 = HEAP32[$2896>>2]|0;
 $2898 = $2897 >>> 25;
 $2899 = (($S) + 12|0);
 $2900 = HEAP32[$2899>>2]|0;
 $2901 = $2900 << 7;
 $2902 = $2898 | $2901;
 $2903 = $2895 ^ $2902;
 $2904 = (($2880) + ($2903))|0;
 $2905 = (($S) + 12|0);
 $2906 = HEAP32[$2905>>2]|0;
 $2907 = (($S) + 16|0);
 $2908 = HEAP32[$2907>>2]|0;
 $2909 = (($S) + 20|0);
 $2910 = HEAP32[$2909>>2]|0;
 $2911 = $2908 ^ $2910;
 $2912 = $2906 & $2911;
 $2913 = (($S) + 20|0);
 $2914 = HEAP32[$2913>>2]|0;
 $2915 = $2912 ^ $2914;
 $2916 = (($2904) + ($2915))|0;
 $2917 = (($W) + 132|0);
 $2918 = HEAP32[$2917>>2]|0;
 $2919 = (($2916) + ($2918))|0;
 $2920 = (($2919) + 773529912)|0;
 $t0 = $2920;
 $2921 = (($S) + 28|0);
 $2922 = HEAP32[$2921>>2]|0;
 $2923 = $2922 >>> 2;
 $2924 = (($S) + 28|0);
 $2925 = HEAP32[$2924>>2]|0;
 $2926 = $2925 << 30;
 $2927 = $2923 | $2926;
 $2928 = (($S) + 28|0);
 $2929 = HEAP32[$2928>>2]|0;
 $2930 = $2929 >>> 13;
 $2931 = (($S) + 28|0);
 $2932 = HEAP32[$2931>>2]|0;
 $2933 = $2932 << 19;
 $2934 = $2930 | $2933;
 $2935 = $2927 ^ $2934;
 $2936 = (($S) + 28|0);
 $2937 = HEAP32[$2936>>2]|0;
 $2938 = $2937 >>> 22;
 $2939 = (($S) + 28|0);
 $2940 = HEAP32[$2939>>2]|0;
 $2941 = $2940 << 10;
 $2942 = $2938 | $2941;
 $2943 = $2935 ^ $2942;
 $2944 = (($S) + 28|0);
 $2945 = HEAP32[$2944>>2]|0;
 $2946 = HEAP32[$S>>2]|0;
 $2947 = (($S) + 4|0);
 $2948 = HEAP32[$2947>>2]|0;
 $2949 = $2946 | $2948;
 $2950 = $2945 & $2949;
 $2951 = HEAP32[$S>>2]|0;
 $2952 = (($S) + 4|0);
 $2953 = HEAP32[$2952>>2]|0;
 $2954 = $2951 & $2953;
 $2955 = $2950 | $2954;
 $2956 = (($2943) + ($2955))|0;
 $t1 = $2956;
 $2957 = $t0;
 $2958 = (($S) + 8|0);
 $2959 = HEAP32[$2958>>2]|0;
 $2960 = (($2959) + ($2957))|0;
 HEAP32[$2958>>2] = $2960;
 $2961 = $t0;
 $2962 = $t1;
 $2963 = (($2961) + ($2962))|0;
 $2964 = (($S) + 24|0);
 HEAP32[$2964>>2] = $2963;
 $2965 = (($S) + 20|0);
 $2966 = HEAP32[$2965>>2]|0;
 $2967 = (($S) + 8|0);
 $2968 = HEAP32[$2967>>2]|0;
 $2969 = $2968 >>> 6;
 $2970 = (($S) + 8|0);
 $2971 = HEAP32[$2970>>2]|0;
 $2972 = $2971 << 26;
 $2973 = $2969 | $2972;
 $2974 = (($S) + 8|0);
 $2975 = HEAP32[$2974>>2]|0;
 $2976 = $2975 >>> 11;
 $2977 = (($S) + 8|0);
 $2978 = HEAP32[$2977>>2]|0;
 $2979 = $2978 << 21;
 $2980 = $2976 | $2979;
 $2981 = $2973 ^ $2980;
 $2982 = (($S) + 8|0);
 $2983 = HEAP32[$2982>>2]|0;
 $2984 = $2983 >>> 25;
 $2985 = (($S) + 8|0);
 $2986 = HEAP32[$2985>>2]|0;
 $2987 = $2986 << 7;
 $2988 = $2984 | $2987;
 $2989 = $2981 ^ $2988;
 $2990 = (($2966) + ($2989))|0;
 $2991 = (($S) + 8|0);
 $2992 = HEAP32[$2991>>2]|0;
 $2993 = (($S) + 12|0);
 $2994 = HEAP32[$2993>>2]|0;
 $2995 = (($S) + 16|0);
 $2996 = HEAP32[$2995>>2]|0;
 $2997 = $2994 ^ $2996;
 $2998 = $2992 & $2997;
 $2999 = (($S) + 16|0);
 $3000 = HEAP32[$2999>>2]|0;
 $3001 = $2998 ^ $3000;
 $3002 = (($2990) + ($3001))|0;
 $3003 = (($W) + 136|0);
 $3004 = HEAP32[$3003>>2]|0;
 $3005 = (($3002) + ($3004))|0;
 $3006 = (($3005) + 1294757372)|0;
 $t0 = $3006;
 $3007 = (($S) + 24|0);
 $3008 = HEAP32[$3007>>2]|0;
 $3009 = $3008 >>> 2;
 $3010 = (($S) + 24|0);
 $3011 = HEAP32[$3010>>2]|0;
 $3012 = $3011 << 30;
 $3013 = $3009 | $3012;
 $3014 = (($S) + 24|0);
 $3015 = HEAP32[$3014>>2]|0;
 $3016 = $3015 >>> 13;
 $3017 = (($S) + 24|0);
 $3018 = HEAP32[$3017>>2]|0;
 $3019 = $3018 << 19;
 $3020 = $3016 | $3019;
 $3021 = $3013 ^ $3020;
 $3022 = (($S) + 24|0);
 $3023 = HEAP32[$3022>>2]|0;
 $3024 = $3023 >>> 22;
 $3025 = (($S) + 24|0);
 $3026 = HEAP32[$3025>>2]|0;
 $3027 = $3026 << 10;
 $3028 = $3024 | $3027;
 $3029 = $3021 ^ $3028;
 $3030 = (($S) + 24|0);
 $3031 = HEAP32[$3030>>2]|0;
 $3032 = (($S) + 28|0);
 $3033 = HEAP32[$3032>>2]|0;
 $3034 = HEAP32[$S>>2]|0;
 $3035 = $3033 | $3034;
 $3036 = $3031 & $3035;
 $3037 = (($S) + 28|0);
 $3038 = HEAP32[$3037>>2]|0;
 $3039 = HEAP32[$S>>2]|0;
 $3040 = $3038 & $3039;
 $3041 = $3036 | $3040;
 $3042 = (($3029) + ($3041))|0;
 $t1 = $3042;
 $3043 = $t0;
 $3044 = (($S) + 4|0);
 $3045 = HEAP32[$3044>>2]|0;
 $3046 = (($3045) + ($3043))|0;
 HEAP32[$3044>>2] = $3046;
 $3047 = $t0;
 $3048 = $t1;
 $3049 = (($3047) + ($3048))|0;
 $3050 = (($S) + 20|0);
 HEAP32[$3050>>2] = $3049;
 $3051 = (($S) + 16|0);
 $3052 = HEAP32[$3051>>2]|0;
 $3053 = (($S) + 4|0);
 $3054 = HEAP32[$3053>>2]|0;
 $3055 = $3054 >>> 6;
 $3056 = (($S) + 4|0);
 $3057 = HEAP32[$3056>>2]|0;
 $3058 = $3057 << 26;
 $3059 = $3055 | $3058;
 $3060 = (($S) + 4|0);
 $3061 = HEAP32[$3060>>2]|0;
 $3062 = $3061 >>> 11;
 $3063 = (($S) + 4|0);
 $3064 = HEAP32[$3063>>2]|0;
 $3065 = $3064 << 21;
 $3066 = $3062 | $3065;
 $3067 = $3059 ^ $3066;
 $3068 = (($S) + 4|0);
 $3069 = HEAP32[$3068>>2]|0;
 $3070 = $3069 >>> 25;
 $3071 = (($S) + 4|0);
 $3072 = HEAP32[$3071>>2]|0;
 $3073 = $3072 << 7;
 $3074 = $3070 | $3073;
 $3075 = $3067 ^ $3074;
 $3076 = (($3052) + ($3075))|0;
 $3077 = (($S) + 4|0);
 $3078 = HEAP32[$3077>>2]|0;
 $3079 = (($S) + 8|0);
 $3080 = HEAP32[$3079>>2]|0;
 $3081 = (($S) + 12|0);
 $3082 = HEAP32[$3081>>2]|0;
 $3083 = $3080 ^ $3082;
 $3084 = $3078 & $3083;
 $3085 = (($S) + 12|0);
 $3086 = HEAP32[$3085>>2]|0;
 $3087 = $3084 ^ $3086;
 $3088 = (($3076) + ($3087))|0;
 $3089 = (($W) + 140|0);
 $3090 = HEAP32[$3089>>2]|0;
 $3091 = (($3088) + ($3090))|0;
 $3092 = (($3091) + 1396182291)|0;
 $t0 = $3092;
 $3093 = (($S) + 20|0);
 $3094 = HEAP32[$3093>>2]|0;
 $3095 = $3094 >>> 2;
 $3096 = (($S) + 20|0);
 $3097 = HEAP32[$3096>>2]|0;
 $3098 = $3097 << 30;
 $3099 = $3095 | $3098;
 $3100 = (($S) + 20|0);
 $3101 = HEAP32[$3100>>2]|0;
 $3102 = $3101 >>> 13;
 $3103 = (($S) + 20|0);
 $3104 = HEAP32[$3103>>2]|0;
 $3105 = $3104 << 19;
 $3106 = $3102 | $3105;
 $3107 = $3099 ^ $3106;
 $3108 = (($S) + 20|0);
 $3109 = HEAP32[$3108>>2]|0;
 $3110 = $3109 >>> 22;
 $3111 = (($S) + 20|0);
 $3112 = HEAP32[$3111>>2]|0;
 $3113 = $3112 << 10;
 $3114 = $3110 | $3113;
 $3115 = $3107 ^ $3114;
 $3116 = (($S) + 20|0);
 $3117 = HEAP32[$3116>>2]|0;
 $3118 = (($S) + 24|0);
 $3119 = HEAP32[$3118>>2]|0;
 $3120 = (($S) + 28|0);
 $3121 = HEAP32[$3120>>2]|0;
 $3122 = $3119 | $3121;
 $3123 = $3117 & $3122;
 $3124 = (($S) + 24|0);
 $3125 = HEAP32[$3124>>2]|0;
 $3126 = (($S) + 28|0);
 $3127 = HEAP32[$3126>>2]|0;
 $3128 = $3125 & $3127;
 $3129 = $3123 | $3128;
 $3130 = (($3115) + ($3129))|0;
 $t1 = $3130;
 $3131 = $t0;
 $3132 = HEAP32[$S>>2]|0;
 $3133 = (($3132) + ($3131))|0;
 HEAP32[$S>>2] = $3133;
 $3134 = $t0;
 $3135 = $t1;
 $3136 = (($3134) + ($3135))|0;
 $3137 = (($S) + 16|0);
 HEAP32[$3137>>2] = $3136;
 $3138 = (($S) + 12|0);
 $3139 = HEAP32[$3138>>2]|0;
 $3140 = HEAP32[$S>>2]|0;
 $3141 = $3140 >>> 6;
 $3142 = HEAP32[$S>>2]|0;
 $3143 = $3142 << 26;
 $3144 = $3141 | $3143;
 $3145 = HEAP32[$S>>2]|0;
 $3146 = $3145 >>> 11;
 $3147 = HEAP32[$S>>2]|0;
 $3148 = $3147 << 21;
 $3149 = $3146 | $3148;
 $3150 = $3144 ^ $3149;
 $3151 = HEAP32[$S>>2]|0;
 $3152 = $3151 >>> 25;
 $3153 = HEAP32[$S>>2]|0;
 $3154 = $3153 << 7;
 $3155 = $3152 | $3154;
 $3156 = $3150 ^ $3155;
 $3157 = (($3139) + ($3156))|0;
 $3158 = HEAP32[$S>>2]|0;
 $3159 = (($S) + 4|0);
 $3160 = HEAP32[$3159>>2]|0;
 $3161 = (($S) + 8|0);
 $3162 = HEAP32[$3161>>2]|0;
 $3163 = $3160 ^ $3162;
 $3164 = $3158 & $3163;
 $3165 = (($S) + 8|0);
 $3166 = HEAP32[$3165>>2]|0;
 $3167 = $3164 ^ $3166;
 $3168 = (($3157) + ($3167))|0;
 $3169 = (($W) + 144|0);
 $3170 = HEAP32[$3169>>2]|0;
 $3171 = (($3168) + ($3170))|0;
 $3172 = (($3171) + 1695183700)|0;
 $t0 = $3172;
 $3173 = (($S) + 16|0);
 $3174 = HEAP32[$3173>>2]|0;
 $3175 = $3174 >>> 2;
 $3176 = (($S) + 16|0);
 $3177 = HEAP32[$3176>>2]|0;
 $3178 = $3177 << 30;
 $3179 = $3175 | $3178;
 $3180 = (($S) + 16|0);
 $3181 = HEAP32[$3180>>2]|0;
 $3182 = $3181 >>> 13;
 $3183 = (($S) + 16|0);
 $3184 = HEAP32[$3183>>2]|0;
 $3185 = $3184 << 19;
 $3186 = $3182 | $3185;
 $3187 = $3179 ^ $3186;
 $3188 = (($S) + 16|0);
 $3189 = HEAP32[$3188>>2]|0;
 $3190 = $3189 >>> 22;
 $3191 = (($S) + 16|0);
 $3192 = HEAP32[$3191>>2]|0;
 $3193 = $3192 << 10;
 $3194 = $3190 | $3193;
 $3195 = $3187 ^ $3194;
 $3196 = (($S) + 16|0);
 $3197 = HEAP32[$3196>>2]|0;
 $3198 = (($S) + 20|0);
 $3199 = HEAP32[$3198>>2]|0;
 $3200 = (($S) + 24|0);
 $3201 = HEAP32[$3200>>2]|0;
 $3202 = $3199 | $3201;
 $3203 = $3197 & $3202;
 $3204 = (($S) + 20|0);
 $3205 = HEAP32[$3204>>2]|0;
 $3206 = (($S) + 24|0);
 $3207 = HEAP32[$3206>>2]|0;
 $3208 = $3205 & $3207;
 $3209 = $3203 | $3208;
 $3210 = (($3195) + ($3209))|0;
 $t1 = $3210;
 $3211 = $t0;
 $3212 = (($S) + 28|0);
 $3213 = HEAP32[$3212>>2]|0;
 $3214 = (($3213) + ($3211))|0;
 HEAP32[$3212>>2] = $3214;
 $3215 = $t0;
 $3216 = $t1;
 $3217 = (($3215) + ($3216))|0;
 $3218 = (($S) + 12|0);
 HEAP32[$3218>>2] = $3217;
 $3219 = (($S) + 8|0);
 $3220 = HEAP32[$3219>>2]|0;
 $3221 = (($S) + 28|0);
 $3222 = HEAP32[$3221>>2]|0;
 $3223 = $3222 >>> 6;
 $3224 = (($S) + 28|0);
 $3225 = HEAP32[$3224>>2]|0;
 $3226 = $3225 << 26;
 $3227 = $3223 | $3226;
 $3228 = (($S) + 28|0);
 $3229 = HEAP32[$3228>>2]|0;
 $3230 = $3229 >>> 11;
 $3231 = (($S) + 28|0);
 $3232 = HEAP32[$3231>>2]|0;
 $3233 = $3232 << 21;
 $3234 = $3230 | $3233;
 $3235 = $3227 ^ $3234;
 $3236 = (($S) + 28|0);
 $3237 = HEAP32[$3236>>2]|0;
 $3238 = $3237 >>> 25;
 $3239 = (($S) + 28|0);
 $3240 = HEAP32[$3239>>2]|0;
 $3241 = $3240 << 7;
 $3242 = $3238 | $3241;
 $3243 = $3235 ^ $3242;
 $3244 = (($3220) + ($3243))|0;
 $3245 = (($S) + 28|0);
 $3246 = HEAP32[$3245>>2]|0;
 $3247 = HEAP32[$S>>2]|0;
 $3248 = (($S) + 4|0);
 $3249 = HEAP32[$3248>>2]|0;
 $3250 = $3247 ^ $3249;
 $3251 = $3246 & $3250;
 $3252 = (($S) + 4|0);
 $3253 = HEAP32[$3252>>2]|0;
 $3254 = $3251 ^ $3253;
 $3255 = (($3244) + ($3254))|0;
 $3256 = (($W) + 148|0);
 $3257 = HEAP32[$3256>>2]|0;
 $3258 = (($3255) + ($3257))|0;
 $3259 = (($3258) + 1986661051)|0;
 $t0 = $3259;
 $3260 = (($S) + 12|0);
 $3261 = HEAP32[$3260>>2]|0;
 $3262 = $3261 >>> 2;
 $3263 = (($S) + 12|0);
 $3264 = HEAP32[$3263>>2]|0;
 $3265 = $3264 << 30;
 $3266 = $3262 | $3265;
 $3267 = (($S) + 12|0);
 $3268 = HEAP32[$3267>>2]|0;
 $3269 = $3268 >>> 13;
 $3270 = (($S) + 12|0);
 $3271 = HEAP32[$3270>>2]|0;
 $3272 = $3271 << 19;
 $3273 = $3269 | $3272;
 $3274 = $3266 ^ $3273;
 $3275 = (($S) + 12|0);
 $3276 = HEAP32[$3275>>2]|0;
 $3277 = $3276 >>> 22;
 $3278 = (($S) + 12|0);
 $3279 = HEAP32[$3278>>2]|0;
 $3280 = $3279 << 10;
 $3281 = $3277 | $3280;
 $3282 = $3274 ^ $3281;
 $3283 = (($S) + 12|0);
 $3284 = HEAP32[$3283>>2]|0;
 $3285 = (($S) + 16|0);
 $3286 = HEAP32[$3285>>2]|0;
 $3287 = (($S) + 20|0);
 $3288 = HEAP32[$3287>>2]|0;
 $3289 = $3286 | $3288;
 $3290 = $3284 & $3289;
 $3291 = (($S) + 16|0);
 $3292 = HEAP32[$3291>>2]|0;
 $3293 = (($S) + 20|0);
 $3294 = HEAP32[$3293>>2]|0;
 $3295 = $3292 & $3294;
 $3296 = $3290 | $3295;
 $3297 = (($3282) + ($3296))|0;
 $t1 = $3297;
 $3298 = $t0;
 $3299 = (($S) + 24|0);
 $3300 = HEAP32[$3299>>2]|0;
 $3301 = (($3300) + ($3298))|0;
 HEAP32[$3299>>2] = $3301;
 $3302 = $t0;
 $3303 = $t1;
 $3304 = (($3302) + ($3303))|0;
 $3305 = (($S) + 8|0);
 HEAP32[$3305>>2] = $3304;
 $3306 = (($S) + 4|0);
 $3307 = HEAP32[$3306>>2]|0;
 $3308 = (($S) + 24|0);
 $3309 = HEAP32[$3308>>2]|0;
 $3310 = $3309 >>> 6;
 $3311 = (($S) + 24|0);
 $3312 = HEAP32[$3311>>2]|0;
 $3313 = $3312 << 26;
 $3314 = $3310 | $3313;
 $3315 = (($S) + 24|0);
 $3316 = HEAP32[$3315>>2]|0;
 $3317 = $3316 >>> 11;
 $3318 = (($S) + 24|0);
 $3319 = HEAP32[$3318>>2]|0;
 $3320 = $3319 << 21;
 $3321 = $3317 | $3320;
 $3322 = $3314 ^ $3321;
 $3323 = (($S) + 24|0);
 $3324 = HEAP32[$3323>>2]|0;
 $3325 = $3324 >>> 25;
 $3326 = (($S) + 24|0);
 $3327 = HEAP32[$3326>>2]|0;
 $3328 = $3327 << 7;
 $3329 = $3325 | $3328;
 $3330 = $3322 ^ $3329;
 $3331 = (($3307) + ($3330))|0;
 $3332 = (($S) + 24|0);
 $3333 = HEAP32[$3332>>2]|0;
 $3334 = (($S) + 28|0);
 $3335 = HEAP32[$3334>>2]|0;
 $3336 = HEAP32[$S>>2]|0;
 $3337 = $3335 ^ $3336;
 $3338 = $3333 & $3337;
 $3339 = HEAP32[$S>>2]|0;
 $3340 = $3338 ^ $3339;
 $3341 = (($3331) + ($3340))|0;
 $3342 = (($W) + 152|0);
 $3343 = HEAP32[$3342>>2]|0;
 $3344 = (($3341) + ($3343))|0;
 $3345 = (($3344) + -2117940946)|0;
 $t0 = $3345;
 $3346 = (($S) + 8|0);
 $3347 = HEAP32[$3346>>2]|0;
 $3348 = $3347 >>> 2;
 $3349 = (($S) + 8|0);
 $3350 = HEAP32[$3349>>2]|0;
 $3351 = $3350 << 30;
 $3352 = $3348 | $3351;
 $3353 = (($S) + 8|0);
 $3354 = HEAP32[$3353>>2]|0;
 $3355 = $3354 >>> 13;
 $3356 = (($S) + 8|0);
 $3357 = HEAP32[$3356>>2]|0;
 $3358 = $3357 << 19;
 $3359 = $3355 | $3358;
 $3360 = $3352 ^ $3359;
 $3361 = (($S) + 8|0);
 $3362 = HEAP32[$3361>>2]|0;
 $3363 = $3362 >>> 22;
 $3364 = (($S) + 8|0);
 $3365 = HEAP32[$3364>>2]|0;
 $3366 = $3365 << 10;
 $3367 = $3363 | $3366;
 $3368 = $3360 ^ $3367;
 $3369 = (($S) + 8|0);
 $3370 = HEAP32[$3369>>2]|0;
 $3371 = (($S) + 12|0);
 $3372 = HEAP32[$3371>>2]|0;
 $3373 = (($S) + 16|0);
 $3374 = HEAP32[$3373>>2]|0;
 $3375 = $3372 | $3374;
 $3376 = $3370 & $3375;
 $3377 = (($S) + 12|0);
 $3378 = HEAP32[$3377>>2]|0;
 $3379 = (($S) + 16|0);
 $3380 = HEAP32[$3379>>2]|0;
 $3381 = $3378 & $3380;
 $3382 = $3376 | $3381;
 $3383 = (($3368) + ($3382))|0;
 $t1 = $3383;
 $3384 = $t0;
 $3385 = (($S) + 20|0);
 $3386 = HEAP32[$3385>>2]|0;
 $3387 = (($3386) + ($3384))|0;
 HEAP32[$3385>>2] = $3387;
 $3388 = $t0;
 $3389 = $t1;
 $3390 = (($3388) + ($3389))|0;
 $3391 = (($S) + 4|0);
 HEAP32[$3391>>2] = $3390;
 $3392 = HEAP32[$S>>2]|0;
 $3393 = (($S) + 20|0);
 $3394 = HEAP32[$3393>>2]|0;
 $3395 = $3394 >>> 6;
 $3396 = (($S) + 20|0);
 $3397 = HEAP32[$3396>>2]|0;
 $3398 = $3397 << 26;
 $3399 = $3395 | $3398;
 $3400 = (($S) + 20|0);
 $3401 = HEAP32[$3400>>2]|0;
 $3402 = $3401 >>> 11;
 $3403 = (($S) + 20|0);
 $3404 = HEAP32[$3403>>2]|0;
 $3405 = $3404 << 21;
 $3406 = $3402 | $3405;
 $3407 = $3399 ^ $3406;
 $3408 = (($S) + 20|0);
 $3409 = HEAP32[$3408>>2]|0;
 $3410 = $3409 >>> 25;
 $3411 = (($S) + 20|0);
 $3412 = HEAP32[$3411>>2]|0;
 $3413 = $3412 << 7;
 $3414 = $3410 | $3413;
 $3415 = $3407 ^ $3414;
 $3416 = (($3392) + ($3415))|0;
 $3417 = (($S) + 20|0);
 $3418 = HEAP32[$3417>>2]|0;
 $3419 = (($S) + 24|0);
 $3420 = HEAP32[$3419>>2]|0;
 $3421 = (($S) + 28|0);
 $3422 = HEAP32[$3421>>2]|0;
 $3423 = $3420 ^ $3422;
 $3424 = $3418 & $3423;
 $3425 = (($S) + 28|0);
 $3426 = HEAP32[$3425>>2]|0;
 $3427 = $3424 ^ $3426;
 $3428 = (($3416) + ($3427))|0;
 $3429 = (($W) + 156|0);
 $3430 = HEAP32[$3429>>2]|0;
 $3431 = (($3428) + ($3430))|0;
 $3432 = (($3431) + -1838011259)|0;
 $t0 = $3432;
 $3433 = (($S) + 4|0);
 $3434 = HEAP32[$3433>>2]|0;
 $3435 = $3434 >>> 2;
 $3436 = (($S) + 4|0);
 $3437 = HEAP32[$3436>>2]|0;
 $3438 = $3437 << 30;
 $3439 = $3435 | $3438;
 $3440 = (($S) + 4|0);
 $3441 = HEAP32[$3440>>2]|0;
 $3442 = $3441 >>> 13;
 $3443 = (($S) + 4|0);
 $3444 = HEAP32[$3443>>2]|0;
 $3445 = $3444 << 19;
 $3446 = $3442 | $3445;
 $3447 = $3439 ^ $3446;
 $3448 = (($S) + 4|0);
 $3449 = HEAP32[$3448>>2]|0;
 $3450 = $3449 >>> 22;
 $3451 = (($S) + 4|0);
 $3452 = HEAP32[$3451>>2]|0;
 $3453 = $3452 << 10;
 $3454 = $3450 | $3453;
 $3455 = $3447 ^ $3454;
 $3456 = (($S) + 4|0);
 $3457 = HEAP32[$3456>>2]|0;
 $3458 = (($S) + 8|0);
 $3459 = HEAP32[$3458>>2]|0;
 $3460 = (($S) + 12|0);
 $3461 = HEAP32[$3460>>2]|0;
 $3462 = $3459 | $3461;
 $3463 = $3457 & $3462;
 $3464 = (($S) + 8|0);
 $3465 = HEAP32[$3464>>2]|0;
 $3466 = (($S) + 12|0);
 $3467 = HEAP32[$3466>>2]|0;
 $3468 = $3465 & $3467;
 $3469 = $3463 | $3468;
 $3470 = (($3455) + ($3469))|0;
 $t1 = $3470;
 $3471 = $t0;
 $3472 = (($S) + 16|0);
 $3473 = HEAP32[$3472>>2]|0;
 $3474 = (($3473) + ($3471))|0;
 HEAP32[$3472>>2] = $3474;
 $3475 = $t0;
 $3476 = $t1;
 $3477 = (($3475) + ($3476))|0;
 HEAP32[$S>>2] = $3477;
 $3478 = (($S) + 28|0);
 $3479 = HEAP32[$3478>>2]|0;
 $3480 = (($S) + 16|0);
 $3481 = HEAP32[$3480>>2]|0;
 $3482 = $3481 >>> 6;
 $3483 = (($S) + 16|0);
 $3484 = HEAP32[$3483>>2]|0;
 $3485 = $3484 << 26;
 $3486 = $3482 | $3485;
 $3487 = (($S) + 16|0);
 $3488 = HEAP32[$3487>>2]|0;
 $3489 = $3488 >>> 11;
 $3490 = (($S) + 16|0);
 $3491 = HEAP32[$3490>>2]|0;
 $3492 = $3491 << 21;
 $3493 = $3489 | $3492;
 $3494 = $3486 ^ $3493;
 $3495 = (($S) + 16|0);
 $3496 = HEAP32[$3495>>2]|0;
 $3497 = $3496 >>> 25;
 $3498 = (($S) + 16|0);
 $3499 = HEAP32[$3498>>2]|0;
 $3500 = $3499 << 7;
 $3501 = $3497 | $3500;
 $3502 = $3494 ^ $3501;
 $3503 = (($3479) + ($3502))|0;
 $3504 = (($S) + 16|0);
 $3505 = HEAP32[$3504>>2]|0;
 $3506 = (($S) + 20|0);
 $3507 = HEAP32[$3506>>2]|0;
 $3508 = (($S) + 24|0);
 $3509 = HEAP32[$3508>>2]|0;
 $3510 = $3507 ^ $3509;
 $3511 = $3505 & $3510;
 $3512 = (($S) + 24|0);
 $3513 = HEAP32[$3512>>2]|0;
 $3514 = $3511 ^ $3513;
 $3515 = (($3503) + ($3514))|0;
 $3516 = (($W) + 160|0);
 $3517 = HEAP32[$3516>>2]|0;
 $3518 = (($3515) + ($3517))|0;
 $3519 = (($3518) + -1564481375)|0;
 $t0 = $3519;
 $3520 = HEAP32[$S>>2]|0;
 $3521 = $3520 >>> 2;
 $3522 = HEAP32[$S>>2]|0;
 $3523 = $3522 << 30;
 $3524 = $3521 | $3523;
 $3525 = HEAP32[$S>>2]|0;
 $3526 = $3525 >>> 13;
 $3527 = HEAP32[$S>>2]|0;
 $3528 = $3527 << 19;
 $3529 = $3526 | $3528;
 $3530 = $3524 ^ $3529;
 $3531 = HEAP32[$S>>2]|0;
 $3532 = $3531 >>> 22;
 $3533 = HEAP32[$S>>2]|0;
 $3534 = $3533 << 10;
 $3535 = $3532 | $3534;
 $3536 = $3530 ^ $3535;
 $3537 = HEAP32[$S>>2]|0;
 $3538 = (($S) + 4|0);
 $3539 = HEAP32[$3538>>2]|0;
 $3540 = (($S) + 8|0);
 $3541 = HEAP32[$3540>>2]|0;
 $3542 = $3539 | $3541;
 $3543 = $3537 & $3542;
 $3544 = (($S) + 4|0);
 $3545 = HEAP32[$3544>>2]|0;
 $3546 = (($S) + 8|0);
 $3547 = HEAP32[$3546>>2]|0;
 $3548 = $3545 & $3547;
 $3549 = $3543 | $3548;
 $3550 = (($3536) + ($3549))|0;
 $t1 = $3550;
 $3551 = $t0;
 $3552 = (($S) + 12|0);
 $3553 = HEAP32[$3552>>2]|0;
 $3554 = (($3553) + ($3551))|0;
 HEAP32[$3552>>2] = $3554;
 $3555 = $t0;
 $3556 = $t1;
 $3557 = (($3555) + ($3556))|0;
 $3558 = (($S) + 28|0);
 HEAP32[$3558>>2] = $3557;
 $3559 = (($S) + 24|0);
 $3560 = HEAP32[$3559>>2]|0;
 $3561 = (($S) + 12|0);
 $3562 = HEAP32[$3561>>2]|0;
 $3563 = $3562 >>> 6;
 $3564 = (($S) + 12|0);
 $3565 = HEAP32[$3564>>2]|0;
 $3566 = $3565 << 26;
 $3567 = $3563 | $3566;
 $3568 = (($S) + 12|0);
 $3569 = HEAP32[$3568>>2]|0;
 $3570 = $3569 >>> 11;
 $3571 = (($S) + 12|0);
 $3572 = HEAP32[$3571>>2]|0;
 $3573 = $3572 << 21;
 $3574 = $3570 | $3573;
 $3575 = $3567 ^ $3574;
 $3576 = (($S) + 12|0);
 $3577 = HEAP32[$3576>>2]|0;
 $3578 = $3577 >>> 25;
 $3579 = (($S) + 12|0);
 $3580 = HEAP32[$3579>>2]|0;
 $3581 = $3580 << 7;
 $3582 = $3578 | $3581;
 $3583 = $3575 ^ $3582;
 $3584 = (($3560) + ($3583))|0;
 $3585 = (($S) + 12|0);
 $3586 = HEAP32[$3585>>2]|0;
 $3587 = (($S) + 16|0);
 $3588 = HEAP32[$3587>>2]|0;
 $3589 = (($S) + 20|0);
 $3590 = HEAP32[$3589>>2]|0;
 $3591 = $3588 ^ $3590;
 $3592 = $3586 & $3591;
 $3593 = (($S) + 20|0);
 $3594 = HEAP32[$3593>>2]|0;
 $3595 = $3592 ^ $3594;
 $3596 = (($3584) + ($3595))|0;
 $3597 = (($W) + 164|0);
 $3598 = HEAP32[$3597>>2]|0;
 $3599 = (($3596) + ($3598))|0;
 $3600 = (($3599) + -1474664885)|0;
 $t0 = $3600;
 $3601 = (($S) + 28|0);
 $3602 = HEAP32[$3601>>2]|0;
 $3603 = $3602 >>> 2;
 $3604 = (($S) + 28|0);
 $3605 = HEAP32[$3604>>2]|0;
 $3606 = $3605 << 30;
 $3607 = $3603 | $3606;
 $3608 = (($S) + 28|0);
 $3609 = HEAP32[$3608>>2]|0;
 $3610 = $3609 >>> 13;
 $3611 = (($S) + 28|0);
 $3612 = HEAP32[$3611>>2]|0;
 $3613 = $3612 << 19;
 $3614 = $3610 | $3613;
 $3615 = $3607 ^ $3614;
 $3616 = (($S) + 28|0);
 $3617 = HEAP32[$3616>>2]|0;
 $3618 = $3617 >>> 22;
 $3619 = (($S) + 28|0);
 $3620 = HEAP32[$3619>>2]|0;
 $3621 = $3620 << 10;
 $3622 = $3618 | $3621;
 $3623 = $3615 ^ $3622;
 $3624 = (($S) + 28|0);
 $3625 = HEAP32[$3624>>2]|0;
 $3626 = HEAP32[$S>>2]|0;
 $3627 = (($S) + 4|0);
 $3628 = HEAP32[$3627>>2]|0;
 $3629 = $3626 | $3628;
 $3630 = $3625 & $3629;
 $3631 = HEAP32[$S>>2]|0;
 $3632 = (($S) + 4|0);
 $3633 = HEAP32[$3632>>2]|0;
 $3634 = $3631 & $3633;
 $3635 = $3630 | $3634;
 $3636 = (($3623) + ($3635))|0;
 $t1 = $3636;
 $3637 = $t0;
 $3638 = (($S) + 8|0);
 $3639 = HEAP32[$3638>>2]|0;
 $3640 = (($3639) + ($3637))|0;
 HEAP32[$3638>>2] = $3640;
 $3641 = $t0;
 $3642 = $t1;
 $3643 = (($3641) + ($3642))|0;
 $3644 = (($S) + 24|0);
 HEAP32[$3644>>2] = $3643;
 $3645 = (($S) + 20|0);
 $3646 = HEAP32[$3645>>2]|0;
 $3647 = (($S) + 8|0);
 $3648 = HEAP32[$3647>>2]|0;
 $3649 = $3648 >>> 6;
 $3650 = (($S) + 8|0);
 $3651 = HEAP32[$3650>>2]|0;
 $3652 = $3651 << 26;
 $3653 = $3649 | $3652;
 $3654 = (($S) + 8|0);
 $3655 = HEAP32[$3654>>2]|0;
 $3656 = $3655 >>> 11;
 $3657 = (($S) + 8|0);
 $3658 = HEAP32[$3657>>2]|0;
 $3659 = $3658 << 21;
 $3660 = $3656 | $3659;
 $3661 = $3653 ^ $3660;
 $3662 = (($S) + 8|0);
 $3663 = HEAP32[$3662>>2]|0;
 $3664 = $3663 >>> 25;
 $3665 = (($S) + 8|0);
 $3666 = HEAP32[$3665>>2]|0;
 $3667 = $3666 << 7;
 $3668 = $3664 | $3667;
 $3669 = $3661 ^ $3668;
 $3670 = (($3646) + ($3669))|0;
 $3671 = (($S) + 8|0);
 $3672 = HEAP32[$3671>>2]|0;
 $3673 = (($S) + 12|0);
 $3674 = HEAP32[$3673>>2]|0;
 $3675 = (($S) + 16|0);
 $3676 = HEAP32[$3675>>2]|0;
 $3677 = $3674 ^ $3676;
 $3678 = $3672 & $3677;
 $3679 = (($S) + 16|0);
 $3680 = HEAP32[$3679>>2]|0;
 $3681 = $3678 ^ $3680;
 $3682 = (($3670) + ($3681))|0;
 $3683 = (($W) + 168|0);
 $3684 = HEAP32[$3683>>2]|0;
 $3685 = (($3682) + ($3684))|0;
 $3686 = (($3685) + -1035236496)|0;
 $t0 = $3686;
 $3687 = (($S) + 24|0);
 $3688 = HEAP32[$3687>>2]|0;
 $3689 = $3688 >>> 2;
 $3690 = (($S) + 24|0);
 $3691 = HEAP32[$3690>>2]|0;
 $3692 = $3691 << 30;
 $3693 = $3689 | $3692;
 $3694 = (($S) + 24|0);
 $3695 = HEAP32[$3694>>2]|0;
 $3696 = $3695 >>> 13;
 $3697 = (($S) + 24|0);
 $3698 = HEAP32[$3697>>2]|0;
 $3699 = $3698 << 19;
 $3700 = $3696 | $3699;
 $3701 = $3693 ^ $3700;
 $3702 = (($S) + 24|0);
 $3703 = HEAP32[$3702>>2]|0;
 $3704 = $3703 >>> 22;
 $3705 = (($S) + 24|0);
 $3706 = HEAP32[$3705>>2]|0;
 $3707 = $3706 << 10;
 $3708 = $3704 | $3707;
 $3709 = $3701 ^ $3708;
 $3710 = (($S) + 24|0);
 $3711 = HEAP32[$3710>>2]|0;
 $3712 = (($S) + 28|0);
 $3713 = HEAP32[$3712>>2]|0;
 $3714 = HEAP32[$S>>2]|0;
 $3715 = $3713 | $3714;
 $3716 = $3711 & $3715;
 $3717 = (($S) + 28|0);
 $3718 = HEAP32[$3717>>2]|0;
 $3719 = HEAP32[$S>>2]|0;
 $3720 = $3718 & $3719;
 $3721 = $3716 | $3720;
 $3722 = (($3709) + ($3721))|0;
 $t1 = $3722;
 $3723 = $t0;
 $3724 = (($S) + 4|0);
 $3725 = HEAP32[$3724>>2]|0;
 $3726 = (($3725) + ($3723))|0;
 HEAP32[$3724>>2] = $3726;
 $3727 = $t0;
 $3728 = $t1;
 $3729 = (($3727) + ($3728))|0;
 $3730 = (($S) + 20|0);
 HEAP32[$3730>>2] = $3729;
 $3731 = (($S) + 16|0);
 $3732 = HEAP32[$3731>>2]|0;
 $3733 = (($S) + 4|0);
 $3734 = HEAP32[$3733>>2]|0;
 $3735 = $3734 >>> 6;
 $3736 = (($S) + 4|0);
 $3737 = HEAP32[$3736>>2]|0;
 $3738 = $3737 << 26;
 $3739 = $3735 | $3738;
 $3740 = (($S) + 4|0);
 $3741 = HEAP32[$3740>>2]|0;
 $3742 = $3741 >>> 11;
 $3743 = (($S) + 4|0);
 $3744 = HEAP32[$3743>>2]|0;
 $3745 = $3744 << 21;
 $3746 = $3742 | $3745;
 $3747 = $3739 ^ $3746;
 $3748 = (($S) + 4|0);
 $3749 = HEAP32[$3748>>2]|0;
 $3750 = $3749 >>> 25;
 $3751 = (($S) + 4|0);
 $3752 = HEAP32[$3751>>2]|0;
 $3753 = $3752 << 7;
 $3754 = $3750 | $3753;
 $3755 = $3747 ^ $3754;
 $3756 = (($3732) + ($3755))|0;
 $3757 = (($S) + 4|0);
 $3758 = HEAP32[$3757>>2]|0;
 $3759 = (($S) + 8|0);
 $3760 = HEAP32[$3759>>2]|0;
 $3761 = (($S) + 12|0);
 $3762 = HEAP32[$3761>>2]|0;
 $3763 = $3760 ^ $3762;
 $3764 = $3758 & $3763;
 $3765 = (($S) + 12|0);
 $3766 = HEAP32[$3765>>2]|0;
 $3767 = $3764 ^ $3766;
 $3768 = (($3756) + ($3767))|0;
 $3769 = (($W) + 172|0);
 $3770 = HEAP32[$3769>>2]|0;
 $3771 = (($3768) + ($3770))|0;
 $3772 = (($3771) + -949202525)|0;
 $t0 = $3772;
 $3773 = (($S) + 20|0);
 $3774 = HEAP32[$3773>>2]|0;
 $3775 = $3774 >>> 2;
 $3776 = (($S) + 20|0);
 $3777 = HEAP32[$3776>>2]|0;
 $3778 = $3777 << 30;
 $3779 = $3775 | $3778;
 $3780 = (($S) + 20|0);
 $3781 = HEAP32[$3780>>2]|0;
 $3782 = $3781 >>> 13;
 $3783 = (($S) + 20|0);
 $3784 = HEAP32[$3783>>2]|0;
 $3785 = $3784 << 19;
 $3786 = $3782 | $3785;
 $3787 = $3779 ^ $3786;
 $3788 = (($S) + 20|0);
 $3789 = HEAP32[$3788>>2]|0;
 $3790 = $3789 >>> 22;
 $3791 = (($S) + 20|0);
 $3792 = HEAP32[$3791>>2]|0;
 $3793 = $3792 << 10;
 $3794 = $3790 | $3793;
 $3795 = $3787 ^ $3794;
 $3796 = (($S) + 20|0);
 $3797 = HEAP32[$3796>>2]|0;
 $3798 = (($S) + 24|0);
 $3799 = HEAP32[$3798>>2]|0;
 $3800 = (($S) + 28|0);
 $3801 = HEAP32[$3800>>2]|0;
 $3802 = $3799 | $3801;
 $3803 = $3797 & $3802;
 $3804 = (($S) + 24|0);
 $3805 = HEAP32[$3804>>2]|0;
 $3806 = (($S) + 28|0);
 $3807 = HEAP32[$3806>>2]|0;
 $3808 = $3805 & $3807;
 $3809 = $3803 | $3808;
 $3810 = (($3795) + ($3809))|0;
 $t1 = $3810;
 $3811 = $t0;
 $3812 = HEAP32[$S>>2]|0;
 $3813 = (($3812) + ($3811))|0;
 HEAP32[$S>>2] = $3813;
 $3814 = $t0;
 $3815 = $t1;
 $3816 = (($3814) + ($3815))|0;
 $3817 = (($S) + 16|0);
 HEAP32[$3817>>2] = $3816;
 $3818 = (($S) + 12|0);
 $3819 = HEAP32[$3818>>2]|0;
 $3820 = HEAP32[$S>>2]|0;
 $3821 = $3820 >>> 6;
 $3822 = HEAP32[$S>>2]|0;
 $3823 = $3822 << 26;
 $3824 = $3821 | $3823;
 $3825 = HEAP32[$S>>2]|0;
 $3826 = $3825 >>> 11;
 $3827 = HEAP32[$S>>2]|0;
 $3828 = $3827 << 21;
 $3829 = $3826 | $3828;
 $3830 = $3824 ^ $3829;
 $3831 = HEAP32[$S>>2]|0;
 $3832 = $3831 >>> 25;
 $3833 = HEAP32[$S>>2]|0;
 $3834 = $3833 << 7;
 $3835 = $3832 | $3834;
 $3836 = $3830 ^ $3835;
 $3837 = (($3819) + ($3836))|0;
 $3838 = HEAP32[$S>>2]|0;
 $3839 = (($S) + 4|0);
 $3840 = HEAP32[$3839>>2]|0;
 $3841 = (($S) + 8|0);
 $3842 = HEAP32[$3841>>2]|0;
 $3843 = $3840 ^ $3842;
 $3844 = $3838 & $3843;
 $3845 = (($S) + 8|0);
 $3846 = HEAP32[$3845>>2]|0;
 $3847 = $3844 ^ $3846;
 $3848 = (($3837) + ($3847))|0;
 $3849 = (($W) + 176|0);
 $3850 = HEAP32[$3849>>2]|0;
 $3851 = (($3848) + ($3850))|0;
 $3852 = (($3851) + -778901479)|0;
 $t0 = $3852;
 $3853 = (($S) + 16|0);
 $3854 = HEAP32[$3853>>2]|0;
 $3855 = $3854 >>> 2;
 $3856 = (($S) + 16|0);
 $3857 = HEAP32[$3856>>2]|0;
 $3858 = $3857 << 30;
 $3859 = $3855 | $3858;
 $3860 = (($S) + 16|0);
 $3861 = HEAP32[$3860>>2]|0;
 $3862 = $3861 >>> 13;
 $3863 = (($S) + 16|0);
 $3864 = HEAP32[$3863>>2]|0;
 $3865 = $3864 << 19;
 $3866 = $3862 | $3865;
 $3867 = $3859 ^ $3866;
 $3868 = (($S) + 16|0);
 $3869 = HEAP32[$3868>>2]|0;
 $3870 = $3869 >>> 22;
 $3871 = (($S) + 16|0);
 $3872 = HEAP32[$3871>>2]|0;
 $3873 = $3872 << 10;
 $3874 = $3870 | $3873;
 $3875 = $3867 ^ $3874;
 $3876 = (($S) + 16|0);
 $3877 = HEAP32[$3876>>2]|0;
 $3878 = (($S) + 20|0);
 $3879 = HEAP32[$3878>>2]|0;
 $3880 = (($S) + 24|0);
 $3881 = HEAP32[$3880>>2]|0;
 $3882 = $3879 | $3881;
 $3883 = $3877 & $3882;
 $3884 = (($S) + 20|0);
 $3885 = HEAP32[$3884>>2]|0;
 $3886 = (($S) + 24|0);
 $3887 = HEAP32[$3886>>2]|0;
 $3888 = $3885 & $3887;
 $3889 = $3883 | $3888;
 $3890 = (($3875) + ($3889))|0;
 $t1 = $3890;
 $3891 = $t0;
 $3892 = (($S) + 28|0);
 $3893 = HEAP32[$3892>>2]|0;
 $3894 = (($3893) + ($3891))|0;
 HEAP32[$3892>>2] = $3894;
 $3895 = $t0;
 $3896 = $t1;
 $3897 = (($3895) + ($3896))|0;
 $3898 = (($S) + 12|0);
 HEAP32[$3898>>2] = $3897;
 $3899 = (($S) + 8|0);
 $3900 = HEAP32[$3899>>2]|0;
 $3901 = (($S) + 28|0);
 $3902 = HEAP32[$3901>>2]|0;
 $3903 = $3902 >>> 6;
 $3904 = (($S) + 28|0);
 $3905 = HEAP32[$3904>>2]|0;
 $3906 = $3905 << 26;
 $3907 = $3903 | $3906;
 $3908 = (($S) + 28|0);
 $3909 = HEAP32[$3908>>2]|0;
 $3910 = $3909 >>> 11;
 $3911 = (($S) + 28|0);
 $3912 = HEAP32[$3911>>2]|0;
 $3913 = $3912 << 21;
 $3914 = $3910 | $3913;
 $3915 = $3907 ^ $3914;
 $3916 = (($S) + 28|0);
 $3917 = HEAP32[$3916>>2]|0;
 $3918 = $3917 >>> 25;
 $3919 = (($S) + 28|0);
 $3920 = HEAP32[$3919>>2]|0;
 $3921 = $3920 << 7;
 $3922 = $3918 | $3921;
 $3923 = $3915 ^ $3922;
 $3924 = (($3900) + ($3923))|0;
 $3925 = (($S) + 28|0);
 $3926 = HEAP32[$3925>>2]|0;
 $3927 = HEAP32[$S>>2]|0;
 $3928 = (($S) + 4|0);
 $3929 = HEAP32[$3928>>2]|0;
 $3930 = $3927 ^ $3929;
 $3931 = $3926 & $3930;
 $3932 = (($S) + 4|0);
 $3933 = HEAP32[$3932>>2]|0;
 $3934 = $3931 ^ $3933;
 $3935 = (($3924) + ($3934))|0;
 $3936 = (($W) + 180|0);
 $3937 = HEAP32[$3936>>2]|0;
 $3938 = (($3935) + ($3937))|0;
 $3939 = (($3938) + -694614492)|0;
 $t0 = $3939;
 $3940 = (($S) + 12|0);
 $3941 = HEAP32[$3940>>2]|0;
 $3942 = $3941 >>> 2;
 $3943 = (($S) + 12|0);
 $3944 = HEAP32[$3943>>2]|0;
 $3945 = $3944 << 30;
 $3946 = $3942 | $3945;
 $3947 = (($S) + 12|0);
 $3948 = HEAP32[$3947>>2]|0;
 $3949 = $3948 >>> 13;
 $3950 = (($S) + 12|0);
 $3951 = HEAP32[$3950>>2]|0;
 $3952 = $3951 << 19;
 $3953 = $3949 | $3952;
 $3954 = $3946 ^ $3953;
 $3955 = (($S) + 12|0);
 $3956 = HEAP32[$3955>>2]|0;
 $3957 = $3956 >>> 22;
 $3958 = (($S) + 12|0);
 $3959 = HEAP32[$3958>>2]|0;
 $3960 = $3959 << 10;
 $3961 = $3957 | $3960;
 $3962 = $3954 ^ $3961;
 $3963 = (($S) + 12|0);
 $3964 = HEAP32[$3963>>2]|0;
 $3965 = (($S) + 16|0);
 $3966 = HEAP32[$3965>>2]|0;
 $3967 = (($S) + 20|0);
 $3968 = HEAP32[$3967>>2]|0;
 $3969 = $3966 | $3968;
 $3970 = $3964 & $3969;
 $3971 = (($S) + 16|0);
 $3972 = HEAP32[$3971>>2]|0;
 $3973 = (($S) + 20|0);
 $3974 = HEAP32[$3973>>2]|0;
 $3975 = $3972 & $3974;
 $3976 = $3970 | $3975;
 $3977 = (($3962) + ($3976))|0;
 $t1 = $3977;
 $3978 = $t0;
 $3979 = (($S) + 24|0);
 $3980 = HEAP32[$3979>>2]|0;
 $3981 = (($3980) + ($3978))|0;
 HEAP32[$3979>>2] = $3981;
 $3982 = $t0;
 $3983 = $t1;
 $3984 = (($3982) + ($3983))|0;
 $3985 = (($S) + 8|0);
 HEAP32[$3985>>2] = $3984;
 $3986 = (($S) + 4|0);
 $3987 = HEAP32[$3986>>2]|0;
 $3988 = (($S) + 24|0);
 $3989 = HEAP32[$3988>>2]|0;
 $3990 = $3989 >>> 6;
 $3991 = (($S) + 24|0);
 $3992 = HEAP32[$3991>>2]|0;
 $3993 = $3992 << 26;
 $3994 = $3990 | $3993;
 $3995 = (($S) + 24|0);
 $3996 = HEAP32[$3995>>2]|0;
 $3997 = $3996 >>> 11;
 $3998 = (($S) + 24|0);
 $3999 = HEAP32[$3998>>2]|0;
 $4000 = $3999 << 21;
 $4001 = $3997 | $4000;
 $4002 = $3994 ^ $4001;
 $4003 = (($S) + 24|0);
 $4004 = HEAP32[$4003>>2]|0;
 $4005 = $4004 >>> 25;
 $4006 = (($S) + 24|0);
 $4007 = HEAP32[$4006>>2]|0;
 $4008 = $4007 << 7;
 $4009 = $4005 | $4008;
 $4010 = $4002 ^ $4009;
 $4011 = (($3987) + ($4010))|0;
 $4012 = (($S) + 24|0);
 $4013 = HEAP32[$4012>>2]|0;
 $4014 = (($S) + 28|0);
 $4015 = HEAP32[$4014>>2]|0;
 $4016 = HEAP32[$S>>2]|0;
 $4017 = $4015 ^ $4016;
 $4018 = $4013 & $4017;
 $4019 = HEAP32[$S>>2]|0;
 $4020 = $4018 ^ $4019;
 $4021 = (($4011) + ($4020))|0;
 $4022 = (($W) + 184|0);
 $4023 = HEAP32[$4022>>2]|0;
 $4024 = (($4021) + ($4023))|0;
 $4025 = (($4024) + -200395387)|0;
 $t0 = $4025;
 $4026 = (($S) + 8|0);
 $4027 = HEAP32[$4026>>2]|0;
 $4028 = $4027 >>> 2;
 $4029 = (($S) + 8|0);
 $4030 = HEAP32[$4029>>2]|0;
 $4031 = $4030 << 30;
 $4032 = $4028 | $4031;
 $4033 = (($S) + 8|0);
 $4034 = HEAP32[$4033>>2]|0;
 $4035 = $4034 >>> 13;
 $4036 = (($S) + 8|0);
 $4037 = HEAP32[$4036>>2]|0;
 $4038 = $4037 << 19;
 $4039 = $4035 | $4038;
 $4040 = $4032 ^ $4039;
 $4041 = (($S) + 8|0);
 $4042 = HEAP32[$4041>>2]|0;
 $4043 = $4042 >>> 22;
 $4044 = (($S) + 8|0);
 $4045 = HEAP32[$4044>>2]|0;
 $4046 = $4045 << 10;
 $4047 = $4043 | $4046;
 $4048 = $4040 ^ $4047;
 $4049 = (($S) + 8|0);
 $4050 = HEAP32[$4049>>2]|0;
 $4051 = (($S) + 12|0);
 $4052 = HEAP32[$4051>>2]|0;
 $4053 = (($S) + 16|0);
 $4054 = HEAP32[$4053>>2]|0;
 $4055 = $4052 | $4054;
 $4056 = $4050 & $4055;
 $4057 = (($S) + 12|0);
 $4058 = HEAP32[$4057>>2]|0;
 $4059 = (($S) + 16|0);
 $4060 = HEAP32[$4059>>2]|0;
 $4061 = $4058 & $4060;
 $4062 = $4056 | $4061;
 $4063 = (($4048) + ($4062))|0;
 $t1 = $4063;
 $4064 = $t0;
 $4065 = (($S) + 20|0);
 $4066 = HEAP32[$4065>>2]|0;
 $4067 = (($4066) + ($4064))|0;
 HEAP32[$4065>>2] = $4067;
 $4068 = $t0;
 $4069 = $t1;
 $4070 = (($4068) + ($4069))|0;
 $4071 = (($S) + 4|0);
 HEAP32[$4071>>2] = $4070;
 $4072 = HEAP32[$S>>2]|0;
 $4073 = (($S) + 20|0);
 $4074 = HEAP32[$4073>>2]|0;
 $4075 = $4074 >>> 6;
 $4076 = (($S) + 20|0);
 $4077 = HEAP32[$4076>>2]|0;
 $4078 = $4077 << 26;
 $4079 = $4075 | $4078;
 $4080 = (($S) + 20|0);
 $4081 = HEAP32[$4080>>2]|0;
 $4082 = $4081 >>> 11;
 $4083 = (($S) + 20|0);
 $4084 = HEAP32[$4083>>2]|0;
 $4085 = $4084 << 21;
 $4086 = $4082 | $4085;
 $4087 = $4079 ^ $4086;
 $4088 = (($S) + 20|0);
 $4089 = HEAP32[$4088>>2]|0;
 $4090 = $4089 >>> 25;
 $4091 = (($S) + 20|0);
 $4092 = HEAP32[$4091>>2]|0;
 $4093 = $4092 << 7;
 $4094 = $4090 | $4093;
 $4095 = $4087 ^ $4094;
 $4096 = (($4072) + ($4095))|0;
 $4097 = (($S) + 20|0);
 $4098 = HEAP32[$4097>>2]|0;
 $4099 = (($S) + 24|0);
 $4100 = HEAP32[$4099>>2]|0;
 $4101 = (($S) + 28|0);
 $4102 = HEAP32[$4101>>2]|0;
 $4103 = $4100 ^ $4102;
 $4104 = $4098 & $4103;
 $4105 = (($S) + 28|0);
 $4106 = HEAP32[$4105>>2]|0;
 $4107 = $4104 ^ $4106;
 $4108 = (($4096) + ($4107))|0;
 $4109 = (($W) + 188|0);
 $4110 = HEAP32[$4109>>2]|0;
 $4111 = (($4108) + ($4110))|0;
 $4112 = (($4111) + 275423344)|0;
 $t0 = $4112;
 $4113 = (($S) + 4|0);
 $4114 = HEAP32[$4113>>2]|0;
 $4115 = $4114 >>> 2;
 $4116 = (($S) + 4|0);
 $4117 = HEAP32[$4116>>2]|0;
 $4118 = $4117 << 30;
 $4119 = $4115 | $4118;
 $4120 = (($S) + 4|0);
 $4121 = HEAP32[$4120>>2]|0;
 $4122 = $4121 >>> 13;
 $4123 = (($S) + 4|0);
 $4124 = HEAP32[$4123>>2]|0;
 $4125 = $4124 << 19;
 $4126 = $4122 | $4125;
 $4127 = $4119 ^ $4126;
 $4128 = (($S) + 4|0);
 $4129 = HEAP32[$4128>>2]|0;
 $4130 = $4129 >>> 22;
 $4131 = (($S) + 4|0);
 $4132 = HEAP32[$4131>>2]|0;
 $4133 = $4132 << 10;
 $4134 = $4130 | $4133;
 $4135 = $4127 ^ $4134;
 $4136 = (($S) + 4|0);
 $4137 = HEAP32[$4136>>2]|0;
 $4138 = (($S) + 8|0);
 $4139 = HEAP32[$4138>>2]|0;
 $4140 = (($S) + 12|0);
 $4141 = HEAP32[$4140>>2]|0;
 $4142 = $4139 | $4141;
 $4143 = $4137 & $4142;
 $4144 = (($S) + 8|0);
 $4145 = HEAP32[$4144>>2]|0;
 $4146 = (($S) + 12|0);
 $4147 = HEAP32[$4146>>2]|0;
 $4148 = $4145 & $4147;
 $4149 = $4143 | $4148;
 $4150 = (($4135) + ($4149))|0;
 $t1 = $4150;
 $4151 = $t0;
 $4152 = (($S) + 16|0);
 $4153 = HEAP32[$4152>>2]|0;
 $4154 = (($4153) + ($4151))|0;
 HEAP32[$4152>>2] = $4154;
 $4155 = $t0;
 $4156 = $t1;
 $4157 = (($4155) + ($4156))|0;
 HEAP32[$S>>2] = $4157;
 $4158 = (($S) + 28|0);
 $4159 = HEAP32[$4158>>2]|0;
 $4160 = (($S) + 16|0);
 $4161 = HEAP32[$4160>>2]|0;
 $4162 = $4161 >>> 6;
 $4163 = (($S) + 16|0);
 $4164 = HEAP32[$4163>>2]|0;
 $4165 = $4164 << 26;
 $4166 = $4162 | $4165;
 $4167 = (($S) + 16|0);
 $4168 = HEAP32[$4167>>2]|0;
 $4169 = $4168 >>> 11;
 $4170 = (($S) + 16|0);
 $4171 = HEAP32[$4170>>2]|0;
 $4172 = $4171 << 21;
 $4173 = $4169 | $4172;
 $4174 = $4166 ^ $4173;
 $4175 = (($S) + 16|0);
 $4176 = HEAP32[$4175>>2]|0;
 $4177 = $4176 >>> 25;
 $4178 = (($S) + 16|0);
 $4179 = HEAP32[$4178>>2]|0;
 $4180 = $4179 << 7;
 $4181 = $4177 | $4180;
 $4182 = $4174 ^ $4181;
 $4183 = (($4159) + ($4182))|0;
 $4184 = (($S) + 16|0);
 $4185 = HEAP32[$4184>>2]|0;
 $4186 = (($S) + 20|0);
 $4187 = HEAP32[$4186>>2]|0;
 $4188 = (($S) + 24|0);
 $4189 = HEAP32[$4188>>2]|0;
 $4190 = $4187 ^ $4189;
 $4191 = $4185 & $4190;
 $4192 = (($S) + 24|0);
 $4193 = HEAP32[$4192>>2]|0;
 $4194 = $4191 ^ $4193;
 $4195 = (($4183) + ($4194))|0;
 $4196 = (($W) + 192|0);
 $4197 = HEAP32[$4196>>2]|0;
 $4198 = (($4195) + ($4197))|0;
 $4199 = (($4198) + 430227734)|0;
 $t0 = $4199;
 $4200 = HEAP32[$S>>2]|0;
 $4201 = $4200 >>> 2;
 $4202 = HEAP32[$S>>2]|0;
 $4203 = $4202 << 30;
 $4204 = $4201 | $4203;
 $4205 = HEAP32[$S>>2]|0;
 $4206 = $4205 >>> 13;
 $4207 = HEAP32[$S>>2]|0;
 $4208 = $4207 << 19;
 $4209 = $4206 | $4208;
 $4210 = $4204 ^ $4209;
 $4211 = HEAP32[$S>>2]|0;
 $4212 = $4211 >>> 22;
 $4213 = HEAP32[$S>>2]|0;
 $4214 = $4213 << 10;
 $4215 = $4212 | $4214;
 $4216 = $4210 ^ $4215;
 $4217 = HEAP32[$S>>2]|0;
 $4218 = (($S) + 4|0);
 $4219 = HEAP32[$4218>>2]|0;
 $4220 = (($S) + 8|0);
 $4221 = HEAP32[$4220>>2]|0;
 $4222 = $4219 | $4221;
 $4223 = $4217 & $4222;
 $4224 = (($S) + 4|0);
 $4225 = HEAP32[$4224>>2]|0;
 $4226 = (($S) + 8|0);
 $4227 = HEAP32[$4226>>2]|0;
 $4228 = $4225 & $4227;
 $4229 = $4223 | $4228;
 $4230 = (($4216) + ($4229))|0;
 $t1 = $4230;
 $4231 = $t0;
 $4232 = (($S) + 12|0);
 $4233 = HEAP32[$4232>>2]|0;
 $4234 = (($4233) + ($4231))|0;
 HEAP32[$4232>>2] = $4234;
 $4235 = $t0;
 $4236 = $t1;
 $4237 = (($4235) + ($4236))|0;
 $4238 = (($S) + 28|0);
 HEAP32[$4238>>2] = $4237;
 $4239 = (($S) + 24|0);
 $4240 = HEAP32[$4239>>2]|0;
 $4241 = (($S) + 12|0);
 $4242 = HEAP32[$4241>>2]|0;
 $4243 = $4242 >>> 6;
 $4244 = (($S) + 12|0);
 $4245 = HEAP32[$4244>>2]|0;
 $4246 = $4245 << 26;
 $4247 = $4243 | $4246;
 $4248 = (($S) + 12|0);
 $4249 = HEAP32[$4248>>2]|0;
 $4250 = $4249 >>> 11;
 $4251 = (($S) + 12|0);
 $4252 = HEAP32[$4251>>2]|0;
 $4253 = $4252 << 21;
 $4254 = $4250 | $4253;
 $4255 = $4247 ^ $4254;
 $4256 = (($S) + 12|0);
 $4257 = HEAP32[$4256>>2]|0;
 $4258 = $4257 >>> 25;
 $4259 = (($S) + 12|0);
 $4260 = HEAP32[$4259>>2]|0;
 $4261 = $4260 << 7;
 $4262 = $4258 | $4261;
 $4263 = $4255 ^ $4262;
 $4264 = (($4240) + ($4263))|0;
 $4265 = (($S) + 12|0);
 $4266 = HEAP32[$4265>>2]|0;
 $4267 = (($S) + 16|0);
 $4268 = HEAP32[$4267>>2]|0;
 $4269 = (($S) + 20|0);
 $4270 = HEAP32[$4269>>2]|0;
 $4271 = $4268 ^ $4270;
 $4272 = $4266 & $4271;
 $4273 = (($S) + 20|0);
 $4274 = HEAP32[$4273>>2]|0;
 $4275 = $4272 ^ $4274;
 $4276 = (($4264) + ($4275))|0;
 $4277 = (($W) + 196|0);
 $4278 = HEAP32[$4277>>2]|0;
 $4279 = (($4276) + ($4278))|0;
 $4280 = (($4279) + 506948616)|0;
 $t0 = $4280;
 $4281 = (($S) + 28|0);
 $4282 = HEAP32[$4281>>2]|0;
 $4283 = $4282 >>> 2;
 $4284 = (($S) + 28|0);
 $4285 = HEAP32[$4284>>2]|0;
 $4286 = $4285 << 30;
 $4287 = $4283 | $4286;
 $4288 = (($S) + 28|0);
 $4289 = HEAP32[$4288>>2]|0;
 $4290 = $4289 >>> 13;
 $4291 = (($S) + 28|0);
 $4292 = HEAP32[$4291>>2]|0;
 $4293 = $4292 << 19;
 $4294 = $4290 | $4293;
 $4295 = $4287 ^ $4294;
 $4296 = (($S) + 28|0);
 $4297 = HEAP32[$4296>>2]|0;
 $4298 = $4297 >>> 22;
 $4299 = (($S) + 28|0);
 $4300 = HEAP32[$4299>>2]|0;
 $4301 = $4300 << 10;
 $4302 = $4298 | $4301;
 $4303 = $4295 ^ $4302;
 $4304 = (($S) + 28|0);
 $4305 = HEAP32[$4304>>2]|0;
 $4306 = HEAP32[$S>>2]|0;
 $4307 = (($S) + 4|0);
 $4308 = HEAP32[$4307>>2]|0;
 $4309 = $4306 | $4308;
 $4310 = $4305 & $4309;
 $4311 = HEAP32[$S>>2]|0;
 $4312 = (($S) + 4|0);
 $4313 = HEAP32[$4312>>2]|0;
 $4314 = $4311 & $4313;
 $4315 = $4310 | $4314;
 $4316 = (($4303) + ($4315))|0;
 $t1 = $4316;
 $4317 = $t0;
 $4318 = (($S) + 8|0);
 $4319 = HEAP32[$4318>>2]|0;
 $4320 = (($4319) + ($4317))|0;
 HEAP32[$4318>>2] = $4320;
 $4321 = $t0;
 $4322 = $t1;
 $4323 = (($4321) + ($4322))|0;
 $4324 = (($S) + 24|0);
 HEAP32[$4324>>2] = $4323;
 $4325 = (($S) + 20|0);
 $4326 = HEAP32[$4325>>2]|0;
 $4327 = (($S) + 8|0);
 $4328 = HEAP32[$4327>>2]|0;
 $4329 = $4328 >>> 6;
 $4330 = (($S) + 8|0);
 $4331 = HEAP32[$4330>>2]|0;
 $4332 = $4331 << 26;
 $4333 = $4329 | $4332;
 $4334 = (($S) + 8|0);
 $4335 = HEAP32[$4334>>2]|0;
 $4336 = $4335 >>> 11;
 $4337 = (($S) + 8|0);
 $4338 = HEAP32[$4337>>2]|0;
 $4339 = $4338 << 21;
 $4340 = $4336 | $4339;
 $4341 = $4333 ^ $4340;
 $4342 = (($S) + 8|0);
 $4343 = HEAP32[$4342>>2]|0;
 $4344 = $4343 >>> 25;
 $4345 = (($S) + 8|0);
 $4346 = HEAP32[$4345>>2]|0;
 $4347 = $4346 << 7;
 $4348 = $4344 | $4347;
 $4349 = $4341 ^ $4348;
 $4350 = (($4326) + ($4349))|0;
 $4351 = (($S) + 8|0);
 $4352 = HEAP32[$4351>>2]|0;
 $4353 = (($S) + 12|0);
 $4354 = HEAP32[$4353>>2]|0;
 $4355 = (($S) + 16|0);
 $4356 = HEAP32[$4355>>2]|0;
 $4357 = $4354 ^ $4356;
 $4358 = $4352 & $4357;
 $4359 = (($S) + 16|0);
 $4360 = HEAP32[$4359>>2]|0;
 $4361 = $4358 ^ $4360;
 $4362 = (($4350) + ($4361))|0;
 $4363 = (($W) + 200|0);
 $4364 = HEAP32[$4363>>2]|0;
 $4365 = (($4362) + ($4364))|0;
 $4366 = (($4365) + 659060556)|0;
 $t0 = $4366;
 $4367 = (($S) + 24|0);
 $4368 = HEAP32[$4367>>2]|0;
 $4369 = $4368 >>> 2;
 $4370 = (($S) + 24|0);
 $4371 = HEAP32[$4370>>2]|0;
 $4372 = $4371 << 30;
 $4373 = $4369 | $4372;
 $4374 = (($S) + 24|0);
 $4375 = HEAP32[$4374>>2]|0;
 $4376 = $4375 >>> 13;
 $4377 = (($S) + 24|0);
 $4378 = HEAP32[$4377>>2]|0;
 $4379 = $4378 << 19;
 $4380 = $4376 | $4379;
 $4381 = $4373 ^ $4380;
 $4382 = (($S) + 24|0);
 $4383 = HEAP32[$4382>>2]|0;
 $4384 = $4383 >>> 22;
 $4385 = (($S) + 24|0);
 $4386 = HEAP32[$4385>>2]|0;
 $4387 = $4386 << 10;
 $4388 = $4384 | $4387;
 $4389 = $4381 ^ $4388;
 $4390 = (($S) + 24|0);
 $4391 = HEAP32[$4390>>2]|0;
 $4392 = (($S) + 28|0);
 $4393 = HEAP32[$4392>>2]|0;
 $4394 = HEAP32[$S>>2]|0;
 $4395 = $4393 | $4394;
 $4396 = $4391 & $4395;
 $4397 = (($S) + 28|0);
 $4398 = HEAP32[$4397>>2]|0;
 $4399 = HEAP32[$S>>2]|0;
 $4400 = $4398 & $4399;
 $4401 = $4396 | $4400;
 $4402 = (($4389) + ($4401))|0;
 $t1 = $4402;
 $4403 = $t0;
 $4404 = (($S) + 4|0);
 $4405 = HEAP32[$4404>>2]|0;
 $4406 = (($4405) + ($4403))|0;
 HEAP32[$4404>>2] = $4406;
 $4407 = $t0;
 $4408 = $t1;
 $4409 = (($4407) + ($4408))|0;
 $4410 = (($S) + 20|0);
 HEAP32[$4410>>2] = $4409;
 $4411 = (($S) + 16|0);
 $4412 = HEAP32[$4411>>2]|0;
 $4413 = (($S) + 4|0);
 $4414 = HEAP32[$4413>>2]|0;
 $4415 = $4414 >>> 6;
 $4416 = (($S) + 4|0);
 $4417 = HEAP32[$4416>>2]|0;
 $4418 = $4417 << 26;
 $4419 = $4415 | $4418;
 $4420 = (($S) + 4|0);
 $4421 = HEAP32[$4420>>2]|0;
 $4422 = $4421 >>> 11;
 $4423 = (($S) + 4|0);
 $4424 = HEAP32[$4423>>2]|0;
 $4425 = $4424 << 21;
 $4426 = $4422 | $4425;
 $4427 = $4419 ^ $4426;
 $4428 = (($S) + 4|0);
 $4429 = HEAP32[$4428>>2]|0;
 $4430 = $4429 >>> 25;
 $4431 = (($S) + 4|0);
 $4432 = HEAP32[$4431>>2]|0;
 $4433 = $4432 << 7;
 $4434 = $4430 | $4433;
 $4435 = $4427 ^ $4434;
 $4436 = (($4412) + ($4435))|0;
 $4437 = (($S) + 4|0);
 $4438 = HEAP32[$4437>>2]|0;
 $4439 = (($S) + 8|0);
 $4440 = HEAP32[$4439>>2]|0;
 $4441 = (($S) + 12|0);
 $4442 = HEAP32[$4441>>2]|0;
 $4443 = $4440 ^ $4442;
 $4444 = $4438 & $4443;
 $4445 = (($S) + 12|0);
 $4446 = HEAP32[$4445>>2]|0;
 $4447 = $4444 ^ $4446;
 $4448 = (($4436) + ($4447))|0;
 $4449 = (($W) + 204|0);
 $4450 = HEAP32[$4449>>2]|0;
 $4451 = (($4448) + ($4450))|0;
 $4452 = (($4451) + 883997877)|0;
 $t0 = $4452;
 $4453 = (($S) + 20|0);
 $4454 = HEAP32[$4453>>2]|0;
 $4455 = $4454 >>> 2;
 $4456 = (($S) + 20|0);
 $4457 = HEAP32[$4456>>2]|0;
 $4458 = $4457 << 30;
 $4459 = $4455 | $4458;
 $4460 = (($S) + 20|0);
 $4461 = HEAP32[$4460>>2]|0;
 $4462 = $4461 >>> 13;
 $4463 = (($S) + 20|0);
 $4464 = HEAP32[$4463>>2]|0;
 $4465 = $4464 << 19;
 $4466 = $4462 | $4465;
 $4467 = $4459 ^ $4466;
 $4468 = (($S) + 20|0);
 $4469 = HEAP32[$4468>>2]|0;
 $4470 = $4469 >>> 22;
 $4471 = (($S) + 20|0);
 $4472 = HEAP32[$4471>>2]|0;
 $4473 = $4472 << 10;
 $4474 = $4470 | $4473;
 $4475 = $4467 ^ $4474;
 $4476 = (($S) + 20|0);
 $4477 = HEAP32[$4476>>2]|0;
 $4478 = (($S) + 24|0);
 $4479 = HEAP32[$4478>>2]|0;
 $4480 = (($S) + 28|0);
 $4481 = HEAP32[$4480>>2]|0;
 $4482 = $4479 | $4481;
 $4483 = $4477 & $4482;
 $4484 = (($S) + 24|0);
 $4485 = HEAP32[$4484>>2]|0;
 $4486 = (($S) + 28|0);
 $4487 = HEAP32[$4486>>2]|0;
 $4488 = $4485 & $4487;
 $4489 = $4483 | $4488;
 $4490 = (($4475) + ($4489))|0;
 $t1 = $4490;
 $4491 = $t0;
 $4492 = HEAP32[$S>>2]|0;
 $4493 = (($4492) + ($4491))|0;
 HEAP32[$S>>2] = $4493;
 $4494 = $t0;
 $4495 = $t1;
 $4496 = (($4494) + ($4495))|0;
 $4497 = (($S) + 16|0);
 HEAP32[$4497>>2] = $4496;
 $4498 = (($S) + 12|0);
 $4499 = HEAP32[$4498>>2]|0;
 $4500 = HEAP32[$S>>2]|0;
 $4501 = $4500 >>> 6;
 $4502 = HEAP32[$S>>2]|0;
 $4503 = $4502 << 26;
 $4504 = $4501 | $4503;
 $4505 = HEAP32[$S>>2]|0;
 $4506 = $4505 >>> 11;
 $4507 = HEAP32[$S>>2]|0;
 $4508 = $4507 << 21;
 $4509 = $4506 | $4508;
 $4510 = $4504 ^ $4509;
 $4511 = HEAP32[$S>>2]|0;
 $4512 = $4511 >>> 25;
 $4513 = HEAP32[$S>>2]|0;
 $4514 = $4513 << 7;
 $4515 = $4512 | $4514;
 $4516 = $4510 ^ $4515;
 $4517 = (($4499) + ($4516))|0;
 $4518 = HEAP32[$S>>2]|0;
 $4519 = (($S) + 4|0);
 $4520 = HEAP32[$4519>>2]|0;
 $4521 = (($S) + 8|0);
 $4522 = HEAP32[$4521>>2]|0;
 $4523 = $4520 ^ $4522;
 $4524 = $4518 & $4523;
 $4525 = (($S) + 8|0);
 $4526 = HEAP32[$4525>>2]|0;
 $4527 = $4524 ^ $4526;
 $4528 = (($4517) + ($4527))|0;
 $4529 = (($W) + 208|0);
 $4530 = HEAP32[$4529>>2]|0;
 $4531 = (($4528) + ($4530))|0;
 $4532 = (($4531) + 958139571)|0;
 $t0 = $4532;
 $4533 = (($S) + 16|0);
 $4534 = HEAP32[$4533>>2]|0;
 $4535 = $4534 >>> 2;
 $4536 = (($S) + 16|0);
 $4537 = HEAP32[$4536>>2]|0;
 $4538 = $4537 << 30;
 $4539 = $4535 | $4538;
 $4540 = (($S) + 16|0);
 $4541 = HEAP32[$4540>>2]|0;
 $4542 = $4541 >>> 13;
 $4543 = (($S) + 16|0);
 $4544 = HEAP32[$4543>>2]|0;
 $4545 = $4544 << 19;
 $4546 = $4542 | $4545;
 $4547 = $4539 ^ $4546;
 $4548 = (($S) + 16|0);
 $4549 = HEAP32[$4548>>2]|0;
 $4550 = $4549 >>> 22;
 $4551 = (($S) + 16|0);
 $4552 = HEAP32[$4551>>2]|0;
 $4553 = $4552 << 10;
 $4554 = $4550 | $4553;
 $4555 = $4547 ^ $4554;
 $4556 = (($S) + 16|0);
 $4557 = HEAP32[$4556>>2]|0;
 $4558 = (($S) + 20|0);
 $4559 = HEAP32[$4558>>2]|0;
 $4560 = (($S) + 24|0);
 $4561 = HEAP32[$4560>>2]|0;
 $4562 = $4559 | $4561;
 $4563 = $4557 & $4562;
 $4564 = (($S) + 20|0);
 $4565 = HEAP32[$4564>>2]|0;
 $4566 = (($S) + 24|0);
 $4567 = HEAP32[$4566>>2]|0;
 $4568 = $4565 & $4567;
 $4569 = $4563 | $4568;
 $4570 = (($4555) + ($4569))|0;
 $t1 = $4570;
 $4571 = $t0;
 $4572 = (($S) + 28|0);
 $4573 = HEAP32[$4572>>2]|0;
 $4574 = (($4573) + ($4571))|0;
 HEAP32[$4572>>2] = $4574;
 $4575 = $t0;
 $4576 = $t1;
 $4577 = (($4575) + ($4576))|0;
 $4578 = (($S) + 12|0);
 HEAP32[$4578>>2] = $4577;
 $4579 = (($S) + 8|0);
 $4580 = HEAP32[$4579>>2]|0;
 $4581 = (($S) + 28|0);
 $4582 = HEAP32[$4581>>2]|0;
 $4583 = $4582 >>> 6;
 $4584 = (($S) + 28|0);
 $4585 = HEAP32[$4584>>2]|0;
 $4586 = $4585 << 26;
 $4587 = $4583 | $4586;
 $4588 = (($S) + 28|0);
 $4589 = HEAP32[$4588>>2]|0;
 $4590 = $4589 >>> 11;
 $4591 = (($S) + 28|0);
 $4592 = HEAP32[$4591>>2]|0;
 $4593 = $4592 << 21;
 $4594 = $4590 | $4593;
 $4595 = $4587 ^ $4594;
 $4596 = (($S) + 28|0);
 $4597 = HEAP32[$4596>>2]|0;
 $4598 = $4597 >>> 25;
 $4599 = (($S) + 28|0);
 $4600 = HEAP32[$4599>>2]|0;
 $4601 = $4600 << 7;
 $4602 = $4598 | $4601;
 $4603 = $4595 ^ $4602;
 $4604 = (($4580) + ($4603))|0;
 $4605 = (($S) + 28|0);
 $4606 = HEAP32[$4605>>2]|0;
 $4607 = HEAP32[$S>>2]|0;
 $4608 = (($S) + 4|0);
 $4609 = HEAP32[$4608>>2]|0;
 $4610 = $4607 ^ $4609;
 $4611 = $4606 & $4610;
 $4612 = (($S) + 4|0);
 $4613 = HEAP32[$4612>>2]|0;
 $4614 = $4611 ^ $4613;
 $4615 = (($4604) + ($4614))|0;
 $4616 = (($W) + 212|0);
 $4617 = HEAP32[$4616>>2]|0;
 $4618 = (($4615) + ($4617))|0;
 $4619 = (($4618) + 1322822218)|0;
 $t0 = $4619;
 $4620 = (($S) + 12|0);
 $4621 = HEAP32[$4620>>2]|0;
 $4622 = $4621 >>> 2;
 $4623 = (($S) + 12|0);
 $4624 = HEAP32[$4623>>2]|0;
 $4625 = $4624 << 30;
 $4626 = $4622 | $4625;
 $4627 = (($S) + 12|0);
 $4628 = HEAP32[$4627>>2]|0;
 $4629 = $4628 >>> 13;
 $4630 = (($S) + 12|0);
 $4631 = HEAP32[$4630>>2]|0;
 $4632 = $4631 << 19;
 $4633 = $4629 | $4632;
 $4634 = $4626 ^ $4633;
 $4635 = (($S) + 12|0);
 $4636 = HEAP32[$4635>>2]|0;
 $4637 = $4636 >>> 22;
 $4638 = (($S) + 12|0);
 $4639 = HEAP32[$4638>>2]|0;
 $4640 = $4639 << 10;
 $4641 = $4637 | $4640;
 $4642 = $4634 ^ $4641;
 $4643 = (($S) + 12|0);
 $4644 = HEAP32[$4643>>2]|0;
 $4645 = (($S) + 16|0);
 $4646 = HEAP32[$4645>>2]|0;
 $4647 = (($S) + 20|0);
 $4648 = HEAP32[$4647>>2]|0;
 $4649 = $4646 | $4648;
 $4650 = $4644 & $4649;
 $4651 = (($S) + 16|0);
 $4652 = HEAP32[$4651>>2]|0;
 $4653 = (($S) + 20|0);
 $4654 = HEAP32[$4653>>2]|0;
 $4655 = $4652 & $4654;
 $4656 = $4650 | $4655;
 $4657 = (($4642) + ($4656))|0;
 $t1 = $4657;
 $4658 = $t0;
 $4659 = (($S) + 24|0);
 $4660 = HEAP32[$4659>>2]|0;
 $4661 = (($4660) + ($4658))|0;
 HEAP32[$4659>>2] = $4661;
 $4662 = $t0;
 $4663 = $t1;
 $4664 = (($4662) + ($4663))|0;
 $4665 = (($S) + 8|0);
 HEAP32[$4665>>2] = $4664;
 $4666 = (($S) + 4|0);
 $4667 = HEAP32[$4666>>2]|0;
 $4668 = (($S) + 24|0);
 $4669 = HEAP32[$4668>>2]|0;
 $4670 = $4669 >>> 6;
 $4671 = (($S) + 24|0);
 $4672 = HEAP32[$4671>>2]|0;
 $4673 = $4672 << 26;
 $4674 = $4670 | $4673;
 $4675 = (($S) + 24|0);
 $4676 = HEAP32[$4675>>2]|0;
 $4677 = $4676 >>> 11;
 $4678 = (($S) + 24|0);
 $4679 = HEAP32[$4678>>2]|0;
 $4680 = $4679 << 21;
 $4681 = $4677 | $4680;
 $4682 = $4674 ^ $4681;
 $4683 = (($S) + 24|0);
 $4684 = HEAP32[$4683>>2]|0;
 $4685 = $4684 >>> 25;
 $4686 = (($S) + 24|0);
 $4687 = HEAP32[$4686>>2]|0;
 $4688 = $4687 << 7;
 $4689 = $4685 | $4688;
 $4690 = $4682 ^ $4689;
 $4691 = (($4667) + ($4690))|0;
 $4692 = (($S) + 24|0);
 $4693 = HEAP32[$4692>>2]|0;
 $4694 = (($S) + 28|0);
 $4695 = HEAP32[$4694>>2]|0;
 $4696 = HEAP32[$S>>2]|0;
 $4697 = $4695 ^ $4696;
 $4698 = $4693 & $4697;
 $4699 = HEAP32[$S>>2]|0;
 $4700 = $4698 ^ $4699;
 $4701 = (($4691) + ($4700))|0;
 $4702 = (($W) + 216|0);
 $4703 = HEAP32[$4702>>2]|0;
 $4704 = (($4701) + ($4703))|0;
 $4705 = (($4704) + 1537002063)|0;
 $t0 = $4705;
 $4706 = (($S) + 8|0);
 $4707 = HEAP32[$4706>>2]|0;
 $4708 = $4707 >>> 2;
 $4709 = (($S) + 8|0);
 $4710 = HEAP32[$4709>>2]|0;
 $4711 = $4710 << 30;
 $4712 = $4708 | $4711;
 $4713 = (($S) + 8|0);
 $4714 = HEAP32[$4713>>2]|0;
 $4715 = $4714 >>> 13;
 $4716 = (($S) + 8|0);
 $4717 = HEAP32[$4716>>2]|0;
 $4718 = $4717 << 19;
 $4719 = $4715 | $4718;
 $4720 = $4712 ^ $4719;
 $4721 = (($S) + 8|0);
 $4722 = HEAP32[$4721>>2]|0;
 $4723 = $4722 >>> 22;
 $4724 = (($S) + 8|0);
 $4725 = HEAP32[$4724>>2]|0;
 $4726 = $4725 << 10;
 $4727 = $4723 | $4726;
 $4728 = $4720 ^ $4727;
 $4729 = (($S) + 8|0);
 $4730 = HEAP32[$4729>>2]|0;
 $4731 = (($S) + 12|0);
 $4732 = HEAP32[$4731>>2]|0;
 $4733 = (($S) + 16|0);
 $4734 = HEAP32[$4733>>2]|0;
 $4735 = $4732 | $4734;
 $4736 = $4730 & $4735;
 $4737 = (($S) + 12|0);
 $4738 = HEAP32[$4737>>2]|0;
 $4739 = (($S) + 16|0);
 $4740 = HEAP32[$4739>>2]|0;
 $4741 = $4738 & $4740;
 $4742 = $4736 | $4741;
 $4743 = (($4728) + ($4742))|0;
 $t1 = $4743;
 $4744 = $t0;
 $4745 = (($S) + 20|0);
 $4746 = HEAP32[$4745>>2]|0;
 $4747 = (($4746) + ($4744))|0;
 HEAP32[$4745>>2] = $4747;
 $4748 = $t0;
 $4749 = $t1;
 $4750 = (($4748) + ($4749))|0;
 $4751 = (($S) + 4|0);
 HEAP32[$4751>>2] = $4750;
 $4752 = HEAP32[$S>>2]|0;
 $4753 = (($S) + 20|0);
 $4754 = HEAP32[$4753>>2]|0;
 $4755 = $4754 >>> 6;
 $4756 = (($S) + 20|0);
 $4757 = HEAP32[$4756>>2]|0;
 $4758 = $4757 << 26;
 $4759 = $4755 | $4758;
 $4760 = (($S) + 20|0);
 $4761 = HEAP32[$4760>>2]|0;
 $4762 = $4761 >>> 11;
 $4763 = (($S) + 20|0);
 $4764 = HEAP32[$4763>>2]|0;
 $4765 = $4764 << 21;
 $4766 = $4762 | $4765;
 $4767 = $4759 ^ $4766;
 $4768 = (($S) + 20|0);
 $4769 = HEAP32[$4768>>2]|0;
 $4770 = $4769 >>> 25;
 $4771 = (($S) + 20|0);
 $4772 = HEAP32[$4771>>2]|0;
 $4773 = $4772 << 7;
 $4774 = $4770 | $4773;
 $4775 = $4767 ^ $4774;
 $4776 = (($4752) + ($4775))|0;
 $4777 = (($S) + 20|0);
 $4778 = HEAP32[$4777>>2]|0;
 $4779 = (($S) + 24|0);
 $4780 = HEAP32[$4779>>2]|0;
 $4781 = (($S) + 28|0);
 $4782 = HEAP32[$4781>>2]|0;
 $4783 = $4780 ^ $4782;
 $4784 = $4778 & $4783;
 $4785 = (($S) + 28|0);
 $4786 = HEAP32[$4785>>2]|0;
 $4787 = $4784 ^ $4786;
 $4788 = (($4776) + ($4787))|0;
 $4789 = (($W) + 220|0);
 $4790 = HEAP32[$4789>>2]|0;
 $4791 = (($4788) + ($4790))|0;
 $4792 = (($4791) + 1747873779)|0;
 $t0 = $4792;
 $4793 = (($S) + 4|0);
 $4794 = HEAP32[$4793>>2]|0;
 $4795 = $4794 >>> 2;
 $4796 = (($S) + 4|0);
 $4797 = HEAP32[$4796>>2]|0;
 $4798 = $4797 << 30;
 $4799 = $4795 | $4798;
 $4800 = (($S) + 4|0);
 $4801 = HEAP32[$4800>>2]|0;
 $4802 = $4801 >>> 13;
 $4803 = (($S) + 4|0);
 $4804 = HEAP32[$4803>>2]|0;
 $4805 = $4804 << 19;
 $4806 = $4802 | $4805;
 $4807 = $4799 ^ $4806;
 $4808 = (($S) + 4|0);
 $4809 = HEAP32[$4808>>2]|0;
 $4810 = $4809 >>> 22;
 $4811 = (($S) + 4|0);
 $4812 = HEAP32[$4811>>2]|0;
 $4813 = $4812 << 10;
 $4814 = $4810 | $4813;
 $4815 = $4807 ^ $4814;
 $4816 = (($S) + 4|0);
 $4817 = HEAP32[$4816>>2]|0;
 $4818 = (($S) + 8|0);
 $4819 = HEAP32[$4818>>2]|0;
 $4820 = (($S) + 12|0);
 $4821 = HEAP32[$4820>>2]|0;
 $4822 = $4819 | $4821;
 $4823 = $4817 & $4822;
 $4824 = (($S) + 8|0);
 $4825 = HEAP32[$4824>>2]|0;
 $4826 = (($S) + 12|0);
 $4827 = HEAP32[$4826>>2]|0;
 $4828 = $4825 & $4827;
 $4829 = $4823 | $4828;
 $4830 = (($4815) + ($4829))|0;
 $t1 = $4830;
 $4831 = $t0;
 $4832 = (($S) + 16|0);
 $4833 = HEAP32[$4832>>2]|0;
 $4834 = (($4833) + ($4831))|0;
 HEAP32[$4832>>2] = $4834;
 $4835 = $t0;
 $4836 = $t1;
 $4837 = (($4835) + ($4836))|0;
 HEAP32[$S>>2] = $4837;
 $4838 = (($S) + 28|0);
 $4839 = HEAP32[$4838>>2]|0;
 $4840 = (($S) + 16|0);
 $4841 = HEAP32[$4840>>2]|0;
 $4842 = $4841 >>> 6;
 $4843 = (($S) + 16|0);
 $4844 = HEAP32[$4843>>2]|0;
 $4845 = $4844 << 26;
 $4846 = $4842 | $4845;
 $4847 = (($S) + 16|0);
 $4848 = HEAP32[$4847>>2]|0;
 $4849 = $4848 >>> 11;
 $4850 = (($S) + 16|0);
 $4851 = HEAP32[$4850>>2]|0;
 $4852 = $4851 << 21;
 $4853 = $4849 | $4852;
 $4854 = $4846 ^ $4853;
 $4855 = (($S) + 16|0);
 $4856 = HEAP32[$4855>>2]|0;
 $4857 = $4856 >>> 25;
 $4858 = (($S) + 16|0);
 $4859 = HEAP32[$4858>>2]|0;
 $4860 = $4859 << 7;
 $4861 = $4857 | $4860;
 $4862 = $4854 ^ $4861;
 $4863 = (($4839) + ($4862))|0;
 $4864 = (($S) + 16|0);
 $4865 = HEAP32[$4864>>2]|0;
 $4866 = (($S) + 20|0);
 $4867 = HEAP32[$4866>>2]|0;
 $4868 = (($S) + 24|0);
 $4869 = HEAP32[$4868>>2]|0;
 $4870 = $4867 ^ $4869;
 $4871 = $4865 & $4870;
 $4872 = (($S) + 24|0);
 $4873 = HEAP32[$4872>>2]|0;
 $4874 = $4871 ^ $4873;
 $4875 = (($4863) + ($4874))|0;
 $4876 = (($W) + 224|0);
 $4877 = HEAP32[$4876>>2]|0;
 $4878 = (($4875) + ($4877))|0;
 $4879 = (($4878) + 1955562222)|0;
 $t0 = $4879;
 $4880 = HEAP32[$S>>2]|0;
 $4881 = $4880 >>> 2;
 $4882 = HEAP32[$S>>2]|0;
 $4883 = $4882 << 30;
 $4884 = $4881 | $4883;
 $4885 = HEAP32[$S>>2]|0;
 $4886 = $4885 >>> 13;
 $4887 = HEAP32[$S>>2]|0;
 $4888 = $4887 << 19;
 $4889 = $4886 | $4888;
 $4890 = $4884 ^ $4889;
 $4891 = HEAP32[$S>>2]|0;
 $4892 = $4891 >>> 22;
 $4893 = HEAP32[$S>>2]|0;
 $4894 = $4893 << 10;
 $4895 = $4892 | $4894;
 $4896 = $4890 ^ $4895;
 $4897 = HEAP32[$S>>2]|0;
 $4898 = (($S) + 4|0);
 $4899 = HEAP32[$4898>>2]|0;
 $4900 = (($S) + 8|0);
 $4901 = HEAP32[$4900>>2]|0;
 $4902 = $4899 | $4901;
 $4903 = $4897 & $4902;
 $4904 = (($S) + 4|0);
 $4905 = HEAP32[$4904>>2]|0;
 $4906 = (($S) + 8|0);
 $4907 = HEAP32[$4906>>2]|0;
 $4908 = $4905 & $4907;
 $4909 = $4903 | $4908;
 $4910 = (($4896) + ($4909))|0;
 $t1 = $4910;
 $4911 = $t0;
 $4912 = (($S) + 12|0);
 $4913 = HEAP32[$4912>>2]|0;
 $4914 = (($4913) + ($4911))|0;
 HEAP32[$4912>>2] = $4914;
 $4915 = $t0;
 $4916 = $t1;
 $4917 = (($4915) + ($4916))|0;
 $4918 = (($S) + 28|0);
 HEAP32[$4918>>2] = $4917;
 $4919 = (($S) + 24|0);
 $4920 = HEAP32[$4919>>2]|0;
 $4921 = (($S) + 12|0);
 $4922 = HEAP32[$4921>>2]|0;
 $4923 = $4922 >>> 6;
 $4924 = (($S) + 12|0);
 $4925 = HEAP32[$4924>>2]|0;
 $4926 = $4925 << 26;
 $4927 = $4923 | $4926;
 $4928 = (($S) + 12|0);
 $4929 = HEAP32[$4928>>2]|0;
 $4930 = $4929 >>> 11;
 $4931 = (($S) + 12|0);
 $4932 = HEAP32[$4931>>2]|0;
 $4933 = $4932 << 21;
 $4934 = $4930 | $4933;
 $4935 = $4927 ^ $4934;
 $4936 = (($S) + 12|0);
 $4937 = HEAP32[$4936>>2]|0;
 $4938 = $4937 >>> 25;
 $4939 = (($S) + 12|0);
 $4940 = HEAP32[$4939>>2]|0;
 $4941 = $4940 << 7;
 $4942 = $4938 | $4941;
 $4943 = $4935 ^ $4942;
 $4944 = (($4920) + ($4943))|0;
 $4945 = (($S) + 12|0);
 $4946 = HEAP32[$4945>>2]|0;
 $4947 = (($S) + 16|0);
 $4948 = HEAP32[$4947>>2]|0;
 $4949 = (($S) + 20|0);
 $4950 = HEAP32[$4949>>2]|0;
 $4951 = $4948 ^ $4950;
 $4952 = $4946 & $4951;
 $4953 = (($S) + 20|0);
 $4954 = HEAP32[$4953>>2]|0;
 $4955 = $4952 ^ $4954;
 $4956 = (($4944) + ($4955))|0;
 $4957 = (($W) + 228|0);
 $4958 = HEAP32[$4957>>2]|0;
 $4959 = (($4956) + ($4958))|0;
 $4960 = (($4959) + 2024104815)|0;
 $t0 = $4960;
 $4961 = (($S) + 28|0);
 $4962 = HEAP32[$4961>>2]|0;
 $4963 = $4962 >>> 2;
 $4964 = (($S) + 28|0);
 $4965 = HEAP32[$4964>>2]|0;
 $4966 = $4965 << 30;
 $4967 = $4963 | $4966;
 $4968 = (($S) + 28|0);
 $4969 = HEAP32[$4968>>2]|0;
 $4970 = $4969 >>> 13;
 $4971 = (($S) + 28|0);
 $4972 = HEAP32[$4971>>2]|0;
 $4973 = $4972 << 19;
 $4974 = $4970 | $4973;
 $4975 = $4967 ^ $4974;
 $4976 = (($S) + 28|0);
 $4977 = HEAP32[$4976>>2]|0;
 $4978 = $4977 >>> 22;
 $4979 = (($S) + 28|0);
 $4980 = HEAP32[$4979>>2]|0;
 $4981 = $4980 << 10;
 $4982 = $4978 | $4981;
 $4983 = $4975 ^ $4982;
 $4984 = (($S) + 28|0);
 $4985 = HEAP32[$4984>>2]|0;
 $4986 = HEAP32[$S>>2]|0;
 $4987 = (($S) + 4|0);
 $4988 = HEAP32[$4987>>2]|0;
 $4989 = $4986 | $4988;
 $4990 = $4985 & $4989;
 $4991 = HEAP32[$S>>2]|0;
 $4992 = (($S) + 4|0);
 $4993 = HEAP32[$4992>>2]|0;
 $4994 = $4991 & $4993;
 $4995 = $4990 | $4994;
 $4996 = (($4983) + ($4995))|0;
 $t1 = $4996;
 $4997 = $t0;
 $4998 = (($S) + 8|0);
 $4999 = HEAP32[$4998>>2]|0;
 $5000 = (($4999) + ($4997))|0;
 HEAP32[$4998>>2] = $5000;
 $5001 = $t0;
 $5002 = $t1;
 $5003 = (($5001) + ($5002))|0;
 $5004 = (($S) + 24|0);
 HEAP32[$5004>>2] = $5003;
 $5005 = (($S) + 20|0);
 $5006 = HEAP32[$5005>>2]|0;
 $5007 = (($S) + 8|0);
 $5008 = HEAP32[$5007>>2]|0;
 $5009 = $5008 >>> 6;
 $5010 = (($S) + 8|0);
 $5011 = HEAP32[$5010>>2]|0;
 $5012 = $5011 << 26;
 $5013 = $5009 | $5012;
 $5014 = (($S) + 8|0);
 $5015 = HEAP32[$5014>>2]|0;
 $5016 = $5015 >>> 11;
 $5017 = (($S) + 8|0);
 $5018 = HEAP32[$5017>>2]|0;
 $5019 = $5018 << 21;
 $5020 = $5016 | $5019;
 $5021 = $5013 ^ $5020;
 $5022 = (($S) + 8|0);
 $5023 = HEAP32[$5022>>2]|0;
 $5024 = $5023 >>> 25;
 $5025 = (($S) + 8|0);
 $5026 = HEAP32[$5025>>2]|0;
 $5027 = $5026 << 7;
 $5028 = $5024 | $5027;
 $5029 = $5021 ^ $5028;
 $5030 = (($5006) + ($5029))|0;
 $5031 = (($S) + 8|0);
 $5032 = HEAP32[$5031>>2]|0;
 $5033 = (($S) + 12|0);
 $5034 = HEAP32[$5033>>2]|0;
 $5035 = (($S) + 16|0);
 $5036 = HEAP32[$5035>>2]|0;
 $5037 = $5034 ^ $5036;
 $5038 = $5032 & $5037;
 $5039 = (($S) + 16|0);
 $5040 = HEAP32[$5039>>2]|0;
 $5041 = $5038 ^ $5040;
 $5042 = (($5030) + ($5041))|0;
 $5043 = (($W) + 232|0);
 $5044 = HEAP32[$5043>>2]|0;
 $5045 = (($5042) + ($5044))|0;
 $5046 = (($5045) + -2067236844)|0;
 $t0 = $5046;
 $5047 = (($S) + 24|0);
 $5048 = HEAP32[$5047>>2]|0;
 $5049 = $5048 >>> 2;
 $5050 = (($S) + 24|0);
 $5051 = HEAP32[$5050>>2]|0;
 $5052 = $5051 << 30;
 $5053 = $5049 | $5052;
 $5054 = (($S) + 24|0);
 $5055 = HEAP32[$5054>>2]|0;
 $5056 = $5055 >>> 13;
 $5057 = (($S) + 24|0);
 $5058 = HEAP32[$5057>>2]|0;
 $5059 = $5058 << 19;
 $5060 = $5056 | $5059;
 $5061 = $5053 ^ $5060;
 $5062 = (($S) + 24|0);
 $5063 = HEAP32[$5062>>2]|0;
 $5064 = $5063 >>> 22;
 $5065 = (($S) + 24|0);
 $5066 = HEAP32[$5065>>2]|0;
 $5067 = $5066 << 10;
 $5068 = $5064 | $5067;
 $5069 = $5061 ^ $5068;
 $5070 = (($S) + 24|0);
 $5071 = HEAP32[$5070>>2]|0;
 $5072 = (($S) + 28|0);
 $5073 = HEAP32[$5072>>2]|0;
 $5074 = HEAP32[$S>>2]|0;
 $5075 = $5073 | $5074;
 $5076 = $5071 & $5075;
 $5077 = (($S) + 28|0);
 $5078 = HEAP32[$5077>>2]|0;
 $5079 = HEAP32[$S>>2]|0;
 $5080 = $5078 & $5079;
 $5081 = $5076 | $5080;
 $5082 = (($5069) + ($5081))|0;
 $t1 = $5082;
 $5083 = $t0;
 $5084 = (($S) + 4|0);
 $5085 = HEAP32[$5084>>2]|0;
 $5086 = (($5085) + ($5083))|0;
 HEAP32[$5084>>2] = $5086;
 $5087 = $t0;
 $5088 = $t1;
 $5089 = (($5087) + ($5088))|0;
 $5090 = (($S) + 20|0);
 HEAP32[$5090>>2] = $5089;
 $5091 = (($S) + 16|0);
 $5092 = HEAP32[$5091>>2]|0;
 $5093 = (($S) + 4|0);
 $5094 = HEAP32[$5093>>2]|0;
 $5095 = $5094 >>> 6;
 $5096 = (($S) + 4|0);
 $5097 = HEAP32[$5096>>2]|0;
 $5098 = $5097 << 26;
 $5099 = $5095 | $5098;
 $5100 = (($S) + 4|0);
 $5101 = HEAP32[$5100>>2]|0;
 $5102 = $5101 >>> 11;
 $5103 = (($S) + 4|0);
 $5104 = HEAP32[$5103>>2]|0;
 $5105 = $5104 << 21;
 $5106 = $5102 | $5105;
 $5107 = $5099 ^ $5106;
 $5108 = (($S) + 4|0);
 $5109 = HEAP32[$5108>>2]|0;
 $5110 = $5109 >>> 25;
 $5111 = (($S) + 4|0);
 $5112 = HEAP32[$5111>>2]|0;
 $5113 = $5112 << 7;
 $5114 = $5110 | $5113;
 $5115 = $5107 ^ $5114;
 $5116 = (($5092) + ($5115))|0;
 $5117 = (($S) + 4|0);
 $5118 = HEAP32[$5117>>2]|0;
 $5119 = (($S) + 8|0);
 $5120 = HEAP32[$5119>>2]|0;
 $5121 = (($S) + 12|0);
 $5122 = HEAP32[$5121>>2]|0;
 $5123 = $5120 ^ $5122;
 $5124 = $5118 & $5123;
 $5125 = (($S) + 12|0);
 $5126 = HEAP32[$5125>>2]|0;
 $5127 = $5124 ^ $5126;
 $5128 = (($5116) + ($5127))|0;
 $5129 = (($W) + 236|0);
 $5130 = HEAP32[$5129>>2]|0;
 $5131 = (($5128) + ($5130))|0;
 $5132 = (($5131) + -1933114872)|0;
 $t0 = $5132;
 $5133 = (($S) + 20|0);
 $5134 = HEAP32[$5133>>2]|0;
 $5135 = $5134 >>> 2;
 $5136 = (($S) + 20|0);
 $5137 = HEAP32[$5136>>2]|0;
 $5138 = $5137 << 30;
 $5139 = $5135 | $5138;
 $5140 = (($S) + 20|0);
 $5141 = HEAP32[$5140>>2]|0;
 $5142 = $5141 >>> 13;
 $5143 = (($S) + 20|0);
 $5144 = HEAP32[$5143>>2]|0;
 $5145 = $5144 << 19;
 $5146 = $5142 | $5145;
 $5147 = $5139 ^ $5146;
 $5148 = (($S) + 20|0);
 $5149 = HEAP32[$5148>>2]|0;
 $5150 = $5149 >>> 22;
 $5151 = (($S) + 20|0);
 $5152 = HEAP32[$5151>>2]|0;
 $5153 = $5152 << 10;
 $5154 = $5150 | $5153;
 $5155 = $5147 ^ $5154;
 $5156 = (($S) + 20|0);
 $5157 = HEAP32[$5156>>2]|0;
 $5158 = (($S) + 24|0);
 $5159 = HEAP32[$5158>>2]|0;
 $5160 = (($S) + 28|0);
 $5161 = HEAP32[$5160>>2]|0;
 $5162 = $5159 | $5161;
 $5163 = $5157 & $5162;
 $5164 = (($S) + 24|0);
 $5165 = HEAP32[$5164>>2]|0;
 $5166 = (($S) + 28|0);
 $5167 = HEAP32[$5166>>2]|0;
 $5168 = $5165 & $5167;
 $5169 = $5163 | $5168;
 $5170 = (($5155) + ($5169))|0;
 $t1 = $5170;
 $5171 = $t0;
 $5172 = HEAP32[$S>>2]|0;
 $5173 = (($5172) + ($5171))|0;
 HEAP32[$S>>2] = $5173;
 $5174 = $t0;
 $5175 = $t1;
 $5176 = (($5174) + ($5175))|0;
 $5177 = (($S) + 16|0);
 HEAP32[$5177>>2] = $5176;
 $5178 = (($S) + 12|0);
 $5179 = HEAP32[$5178>>2]|0;
 $5180 = HEAP32[$S>>2]|0;
 $5181 = $5180 >>> 6;
 $5182 = HEAP32[$S>>2]|0;
 $5183 = $5182 << 26;
 $5184 = $5181 | $5183;
 $5185 = HEAP32[$S>>2]|0;
 $5186 = $5185 >>> 11;
 $5187 = HEAP32[$S>>2]|0;
 $5188 = $5187 << 21;
 $5189 = $5186 | $5188;
 $5190 = $5184 ^ $5189;
 $5191 = HEAP32[$S>>2]|0;
 $5192 = $5191 >>> 25;
 $5193 = HEAP32[$S>>2]|0;
 $5194 = $5193 << 7;
 $5195 = $5192 | $5194;
 $5196 = $5190 ^ $5195;
 $5197 = (($5179) + ($5196))|0;
 $5198 = HEAP32[$S>>2]|0;
 $5199 = (($S) + 4|0);
 $5200 = HEAP32[$5199>>2]|0;
 $5201 = (($S) + 8|0);
 $5202 = HEAP32[$5201>>2]|0;
 $5203 = $5200 ^ $5202;
 $5204 = $5198 & $5203;
 $5205 = (($S) + 8|0);
 $5206 = HEAP32[$5205>>2]|0;
 $5207 = $5204 ^ $5206;
 $5208 = (($5197) + ($5207))|0;
 $5209 = (($W) + 240|0);
 $5210 = HEAP32[$5209>>2]|0;
 $5211 = (($5208) + ($5210))|0;
 $5212 = (($5211) + -1866530822)|0;
 $t0 = $5212;
 $5213 = (($S) + 16|0);
 $5214 = HEAP32[$5213>>2]|0;
 $5215 = $5214 >>> 2;
 $5216 = (($S) + 16|0);
 $5217 = HEAP32[$5216>>2]|0;
 $5218 = $5217 << 30;
 $5219 = $5215 | $5218;
 $5220 = (($S) + 16|0);
 $5221 = HEAP32[$5220>>2]|0;
 $5222 = $5221 >>> 13;
 $5223 = (($S) + 16|0);
 $5224 = HEAP32[$5223>>2]|0;
 $5225 = $5224 << 19;
 $5226 = $5222 | $5225;
 $5227 = $5219 ^ $5226;
 $5228 = (($S) + 16|0);
 $5229 = HEAP32[$5228>>2]|0;
 $5230 = $5229 >>> 22;
 $5231 = (($S) + 16|0);
 $5232 = HEAP32[$5231>>2]|0;
 $5233 = $5232 << 10;
 $5234 = $5230 | $5233;
 $5235 = $5227 ^ $5234;
 $5236 = (($S) + 16|0);
 $5237 = HEAP32[$5236>>2]|0;
 $5238 = (($S) + 20|0);
 $5239 = HEAP32[$5238>>2]|0;
 $5240 = (($S) + 24|0);
 $5241 = HEAP32[$5240>>2]|0;
 $5242 = $5239 | $5241;
 $5243 = $5237 & $5242;
 $5244 = (($S) + 20|0);
 $5245 = HEAP32[$5244>>2]|0;
 $5246 = (($S) + 24|0);
 $5247 = HEAP32[$5246>>2]|0;
 $5248 = $5245 & $5247;
 $5249 = $5243 | $5248;
 $5250 = (($5235) + ($5249))|0;
 $t1 = $5250;
 $5251 = $t0;
 $5252 = (($S) + 28|0);
 $5253 = HEAP32[$5252>>2]|0;
 $5254 = (($5253) + ($5251))|0;
 HEAP32[$5252>>2] = $5254;
 $5255 = $t0;
 $5256 = $t1;
 $5257 = (($5255) + ($5256))|0;
 $5258 = (($S) + 12|0);
 HEAP32[$5258>>2] = $5257;
 $5259 = (($S) + 8|0);
 $5260 = HEAP32[$5259>>2]|0;
 $5261 = (($S) + 28|0);
 $5262 = HEAP32[$5261>>2]|0;
 $5263 = $5262 >>> 6;
 $5264 = (($S) + 28|0);
 $5265 = HEAP32[$5264>>2]|0;
 $5266 = $5265 << 26;
 $5267 = $5263 | $5266;
 $5268 = (($S) + 28|0);
 $5269 = HEAP32[$5268>>2]|0;
 $5270 = $5269 >>> 11;
 $5271 = (($S) + 28|0);
 $5272 = HEAP32[$5271>>2]|0;
 $5273 = $5272 << 21;
 $5274 = $5270 | $5273;
 $5275 = $5267 ^ $5274;
 $5276 = (($S) + 28|0);
 $5277 = HEAP32[$5276>>2]|0;
 $5278 = $5277 >>> 25;
 $5279 = (($S) + 28|0);
 $5280 = HEAP32[$5279>>2]|0;
 $5281 = $5280 << 7;
 $5282 = $5278 | $5281;
 $5283 = $5275 ^ $5282;
 $5284 = (($5260) + ($5283))|0;
 $5285 = (($S) + 28|0);
 $5286 = HEAP32[$5285>>2]|0;
 $5287 = HEAP32[$S>>2]|0;
 $5288 = (($S) + 4|0);
 $5289 = HEAP32[$5288>>2]|0;
 $5290 = $5287 ^ $5289;
 $5291 = $5286 & $5290;
 $5292 = (($S) + 4|0);
 $5293 = HEAP32[$5292>>2]|0;
 $5294 = $5291 ^ $5293;
 $5295 = (($5284) + ($5294))|0;
 $5296 = (($W) + 244|0);
 $5297 = HEAP32[$5296>>2]|0;
 $5298 = (($5295) + ($5297))|0;
 $5299 = (($5298) + -1538233109)|0;
 $t0 = $5299;
 $5300 = (($S) + 12|0);
 $5301 = HEAP32[$5300>>2]|0;
 $5302 = $5301 >>> 2;
 $5303 = (($S) + 12|0);
 $5304 = HEAP32[$5303>>2]|0;
 $5305 = $5304 << 30;
 $5306 = $5302 | $5305;
 $5307 = (($S) + 12|0);
 $5308 = HEAP32[$5307>>2]|0;
 $5309 = $5308 >>> 13;
 $5310 = (($S) + 12|0);
 $5311 = HEAP32[$5310>>2]|0;
 $5312 = $5311 << 19;
 $5313 = $5309 | $5312;
 $5314 = $5306 ^ $5313;
 $5315 = (($S) + 12|0);
 $5316 = HEAP32[$5315>>2]|0;
 $5317 = $5316 >>> 22;
 $5318 = (($S) + 12|0);
 $5319 = HEAP32[$5318>>2]|0;
 $5320 = $5319 << 10;
 $5321 = $5317 | $5320;
 $5322 = $5314 ^ $5321;
 $5323 = (($S) + 12|0);
 $5324 = HEAP32[$5323>>2]|0;
 $5325 = (($S) + 16|0);
 $5326 = HEAP32[$5325>>2]|0;
 $5327 = (($S) + 20|0);
 $5328 = HEAP32[$5327>>2]|0;
 $5329 = $5326 | $5328;
 $5330 = $5324 & $5329;
 $5331 = (($S) + 16|0);
 $5332 = HEAP32[$5331>>2]|0;
 $5333 = (($S) + 20|0);
 $5334 = HEAP32[$5333>>2]|0;
 $5335 = $5332 & $5334;
 $5336 = $5330 | $5335;
 $5337 = (($5322) + ($5336))|0;
 $t1 = $5337;
 $5338 = $t0;
 $5339 = (($S) + 24|0);
 $5340 = HEAP32[$5339>>2]|0;
 $5341 = (($5340) + ($5338))|0;
 HEAP32[$5339>>2] = $5341;
 $5342 = $t0;
 $5343 = $t1;
 $5344 = (($5342) + ($5343))|0;
 $5345 = (($S) + 8|0);
 HEAP32[$5345>>2] = $5344;
 $5346 = (($S) + 4|0);
 $5347 = HEAP32[$5346>>2]|0;
 $5348 = (($S) + 24|0);
 $5349 = HEAP32[$5348>>2]|0;
 $5350 = $5349 >>> 6;
 $5351 = (($S) + 24|0);
 $5352 = HEAP32[$5351>>2]|0;
 $5353 = $5352 << 26;
 $5354 = $5350 | $5353;
 $5355 = (($S) + 24|0);
 $5356 = HEAP32[$5355>>2]|0;
 $5357 = $5356 >>> 11;
 $5358 = (($S) + 24|0);
 $5359 = HEAP32[$5358>>2]|0;
 $5360 = $5359 << 21;
 $5361 = $5357 | $5360;
 $5362 = $5354 ^ $5361;
 $5363 = (($S) + 24|0);
 $5364 = HEAP32[$5363>>2]|0;
 $5365 = $5364 >>> 25;
 $5366 = (($S) + 24|0);
 $5367 = HEAP32[$5366>>2]|0;
 $5368 = $5367 << 7;
 $5369 = $5365 | $5368;
 $5370 = $5362 ^ $5369;
 $5371 = (($5347) + ($5370))|0;
 $5372 = (($S) + 24|0);
 $5373 = HEAP32[$5372>>2]|0;
 $5374 = (($S) + 28|0);
 $5375 = HEAP32[$5374>>2]|0;
 $5376 = HEAP32[$S>>2]|0;
 $5377 = $5375 ^ $5376;
 $5378 = $5373 & $5377;
 $5379 = HEAP32[$S>>2]|0;
 $5380 = $5378 ^ $5379;
 $5381 = (($5371) + ($5380))|0;
 $5382 = (($W) + 248|0);
 $5383 = HEAP32[$5382>>2]|0;
 $5384 = (($5381) + ($5383))|0;
 $5385 = (($5384) + -1090935817)|0;
 $t0 = $5385;
 $5386 = (($S) + 8|0);
 $5387 = HEAP32[$5386>>2]|0;
 $5388 = $5387 >>> 2;
 $5389 = (($S) + 8|0);
 $5390 = HEAP32[$5389>>2]|0;
 $5391 = $5390 << 30;
 $5392 = $5388 | $5391;
 $5393 = (($S) + 8|0);
 $5394 = HEAP32[$5393>>2]|0;
 $5395 = $5394 >>> 13;
 $5396 = (($S) + 8|0);
 $5397 = HEAP32[$5396>>2]|0;
 $5398 = $5397 << 19;
 $5399 = $5395 | $5398;
 $5400 = $5392 ^ $5399;
 $5401 = (($S) + 8|0);
 $5402 = HEAP32[$5401>>2]|0;
 $5403 = $5402 >>> 22;
 $5404 = (($S) + 8|0);
 $5405 = HEAP32[$5404>>2]|0;
 $5406 = $5405 << 10;
 $5407 = $5403 | $5406;
 $5408 = $5400 ^ $5407;
 $5409 = (($S) + 8|0);
 $5410 = HEAP32[$5409>>2]|0;
 $5411 = (($S) + 12|0);
 $5412 = HEAP32[$5411>>2]|0;
 $5413 = (($S) + 16|0);
 $5414 = HEAP32[$5413>>2]|0;
 $5415 = $5412 | $5414;
 $5416 = $5410 & $5415;
 $5417 = (($S) + 12|0);
 $5418 = HEAP32[$5417>>2]|0;
 $5419 = (($S) + 16|0);
 $5420 = HEAP32[$5419>>2]|0;
 $5421 = $5418 & $5420;
 $5422 = $5416 | $5421;
 $5423 = (($5408) + ($5422))|0;
 $t1 = $5423;
 $5424 = $t0;
 $5425 = (($S) + 20|0);
 $5426 = HEAP32[$5425>>2]|0;
 $5427 = (($5426) + ($5424))|0;
 HEAP32[$5425>>2] = $5427;
 $5428 = $t0;
 $5429 = $t1;
 $5430 = (($5428) + ($5429))|0;
 $5431 = (($S) + 4|0);
 HEAP32[$5431>>2] = $5430;
 $5432 = HEAP32[$S>>2]|0;
 $5433 = (($S) + 20|0);
 $5434 = HEAP32[$5433>>2]|0;
 $5435 = $5434 >>> 6;
 $5436 = (($S) + 20|0);
 $5437 = HEAP32[$5436>>2]|0;
 $5438 = $5437 << 26;
 $5439 = $5435 | $5438;
 $5440 = (($S) + 20|0);
 $5441 = HEAP32[$5440>>2]|0;
 $5442 = $5441 >>> 11;
 $5443 = (($S) + 20|0);
 $5444 = HEAP32[$5443>>2]|0;
 $5445 = $5444 << 21;
 $5446 = $5442 | $5445;
 $5447 = $5439 ^ $5446;
 $5448 = (($S) + 20|0);
 $5449 = HEAP32[$5448>>2]|0;
 $5450 = $5449 >>> 25;
 $5451 = (($S) + 20|0);
 $5452 = HEAP32[$5451>>2]|0;
 $5453 = $5452 << 7;
 $5454 = $5450 | $5453;
 $5455 = $5447 ^ $5454;
 $5456 = (($5432) + ($5455))|0;
 $5457 = (($S) + 20|0);
 $5458 = HEAP32[$5457>>2]|0;
 $5459 = (($S) + 24|0);
 $5460 = HEAP32[$5459>>2]|0;
 $5461 = (($S) + 28|0);
 $5462 = HEAP32[$5461>>2]|0;
 $5463 = $5460 ^ $5462;
 $5464 = $5458 & $5463;
 $5465 = (($S) + 28|0);
 $5466 = HEAP32[$5465>>2]|0;
 $5467 = $5464 ^ $5466;
 $5468 = (($5456) + ($5467))|0;
 $5469 = (($W) + 252|0);
 $5470 = HEAP32[$5469>>2]|0;
 $5471 = (($5468) + ($5470))|0;
 $5472 = (($5471) + -965641998)|0;
 $t0 = $5472;
 $5473 = (($S) + 4|0);
 $5474 = HEAP32[$5473>>2]|0;
 $5475 = $5474 >>> 2;
 $5476 = (($S) + 4|0);
 $5477 = HEAP32[$5476>>2]|0;
 $5478 = $5477 << 30;
 $5479 = $5475 | $5478;
 $5480 = (($S) + 4|0);
 $5481 = HEAP32[$5480>>2]|0;
 $5482 = $5481 >>> 13;
 $5483 = (($S) + 4|0);
 $5484 = HEAP32[$5483>>2]|0;
 $5485 = $5484 << 19;
 $5486 = $5482 | $5485;
 $5487 = $5479 ^ $5486;
 $5488 = (($S) + 4|0);
 $5489 = HEAP32[$5488>>2]|0;
 $5490 = $5489 >>> 22;
 $5491 = (($S) + 4|0);
 $5492 = HEAP32[$5491>>2]|0;
 $5493 = $5492 << 10;
 $5494 = $5490 | $5493;
 $5495 = $5487 ^ $5494;
 $5496 = (($S) + 4|0);
 $5497 = HEAP32[$5496>>2]|0;
 $5498 = (($S) + 8|0);
 $5499 = HEAP32[$5498>>2]|0;
 $5500 = (($S) + 12|0);
 $5501 = HEAP32[$5500>>2]|0;
 $5502 = $5499 | $5501;
 $5503 = $5497 & $5502;
 $5504 = (($S) + 8|0);
 $5505 = HEAP32[$5504>>2]|0;
 $5506 = (($S) + 12|0);
 $5507 = HEAP32[$5506>>2]|0;
 $5508 = $5505 & $5507;
 $5509 = $5503 | $5508;
 $5510 = (($5495) + ($5509))|0;
 $t1 = $5510;
 $5511 = $t0;
 $5512 = (($S) + 16|0);
 $5513 = HEAP32[$5512>>2]|0;
 $5514 = (($5513) + ($5511))|0;
 HEAP32[$5512>>2] = $5514;
 $5515 = $t0;
 $5516 = $t1;
 $5517 = (($5515) + ($5516))|0;
 HEAP32[$S>>2] = $5517;
 $i = 0;
 while(1) {
  $5518 = $i;
  $5519 = ($5518|0)<(8);
  if (!($5519)) {
   break;
  }
  $5520 = $i;
  $5521 = (($S) + ($5520<<2)|0);
  $5522 = HEAP32[$5521>>2]|0;
  $5523 = $i;
  $5524 = $0;
  $5525 = (($5524) + ($5523<<2)|0);
  $5526 = HEAP32[$5525>>2]|0;
  $5527 = (($5526) + ($5522))|0;
  HEAP32[$5525>>2] = $5527;
  $5528 = $i;
  $5529 = (($5528) + 1)|0;
  $i = $5529;
 }
 _memset(($W|0),0,256)|0;
 ;HEAP32[$S+0>>2]=0|0;HEAP32[$S+4>>2]=0|0;HEAP32[$S+8>>2]=0|0;HEAP32[$S+12>>2]=0|0;HEAP32[$S+16>>2]=0|0;HEAP32[$S+20>>2]=0|0;HEAP32[$S+24>>2]=0|0;HEAP32[$S+28>>2]=0|0;
 $t1 = 0;
 $t0 = 0;
 STACKTOP = sp;return;
}
function _libcperciva_SHA256_Final($digest,$ctx) {
 $digest = $digest|0;
 $ctx = $ctx|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $digest;
 $1 = $ctx;
 $2 = $1;
 _SHA256_Pad($2);
 $3 = $0;
 $4 = $1;
 _be32enc_vect($3,$4,32);
 $5 = $1;
 dest=$5+0|0; stop=dest+104|0; do { HEAP8[dest>>0]=0|0; dest=dest+1|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _SHA256_Pad($ctx) {
 $ctx = $ctx|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $len = 0;
 var $plen = 0, $r = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $len = sp + 16|0;
 $0 = $ctx;
 $1 = $0;
 $2 = (($1) + 32|0);
 _be32enc_vect($len,$2,8);
 $3 = $0;
 $4 = (($3) + 32|0);
 $5 = (($4) + 4|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = $6 >>> 3;
 $8 = $7 & 63;
 $r = $8;
 $9 = $r;
 $10 = ($9>>>0)<(56);
 if ($10) {
  $11 = $r;
  $12 = (56 - ($11))|0;
  $15 = $12;
 } else {
  $13 = $r;
  $14 = (120 - ($13))|0;
  $15 = $14;
 }
 $plen = $15;
 $16 = $0;
 $17 = $plen;
 _libcperciva_SHA256_Update($16,8,$17);
 $18 = $0;
 _libcperciva_SHA256_Update($18,$len,8);
 STACKTOP = sp;return;
}
function _be32enc_vect($dst,$src,$len) {
 $dst = $dst|0;
 $src = $src|0;
 $len = $len|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $dst;
 $1 = $src;
 $2 = $len;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = $2;
  $5 = (($4>>>0) / 4)&-1;
  $6 = ($3>>>0)<($5>>>0);
  if (!($6)) {
   break;
  }
  $7 = $0;
  $8 = $i;
  $9 = $8<<2;
  $10 = (($7) + ($9)|0);
  $11 = $i;
  $12 = $1;
  $13 = (($12) + ($11<<2)|0);
  $14 = HEAP32[$13>>2]|0;
  _libcperciva_be32enc($10,$14);
  $15 = $i;
  $16 = (($15) + 1)|0;
  $i = $16;
 }
 STACKTOP = sp;return;
}
function _libcperciva_HMAC_SHA256_Init($ctx,$_K,$Klen) {
 $ctx = $ctx|0;
 $_K = $_K|0;
 $Klen = $Klen|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $K = 0, $i = 0, $khash = 0, $pad = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 128|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $pad = sp + 56|0;
 $khash = sp + 24|0;
 $0 = $ctx;
 $1 = $_K;
 $2 = $Klen;
 $3 = $1;
 $K = $3;
 $4 = $2;
 $5 = ($4>>>0)>(64);
 if ($5) {
  $6 = $0;
  _libcperciva_SHA256_Init($6);
  $7 = $0;
  $8 = $K;
  $9 = $2;
  _libcperciva_SHA256_Update($7,$8,$9);
  $10 = $0;
  _libcperciva_SHA256_Final($khash,$10);
  $K = $khash;
  $2 = 32;
 }
 $11 = $0;
 _libcperciva_SHA256_Init($11);
 dest=$pad+0|0; stop=dest+64|0; do { HEAP8[dest>>0]=54|0; dest=dest+1|0; } while ((dest|0) < (stop|0));
 $i = 0;
 while(1) {
  $12 = $i;
  $13 = $2;
  $14 = ($12>>>0)<($13>>>0);
  if (!($14)) {
   break;
  }
  $15 = $i;
  $16 = $K;
  $17 = (($16) + ($15)|0);
  $18 = HEAP8[$17>>0]|0;
  $19 = $18&255;
  $20 = $i;
  $21 = (($pad) + ($20)|0);
  $22 = HEAP8[$21>>0]|0;
  $23 = $22&255;
  $24 = $23 ^ $19;
  $25 = $24&255;
  HEAP8[$21>>0] = $25;
  $26 = $i;
  $27 = (($26) + 1)|0;
  $i = $27;
 }
 $28 = $0;
 _libcperciva_SHA256_Update($28,$pad,64);
 $29 = $0;
 $30 = (($29) + 104|0);
 _libcperciva_SHA256_Init($30);
 dest=$pad+0|0; stop=dest+64|0; do { HEAP8[dest>>0]=92|0; dest=dest+1|0; } while ((dest|0) < (stop|0));
 $i = 0;
 while(1) {
  $31 = $i;
  $32 = $2;
  $33 = ($31>>>0)<($32>>>0);
  if (!($33)) {
   break;
  }
  $34 = $i;
  $35 = $K;
  $36 = (($35) + ($34)|0);
  $37 = HEAP8[$36>>0]|0;
  $38 = $37&255;
  $39 = $i;
  $40 = (($pad) + ($39)|0);
  $41 = HEAP8[$40>>0]|0;
  $42 = $41&255;
  $43 = $42 ^ $38;
  $44 = $43&255;
  HEAP8[$40>>0] = $44;
  $45 = $i;
  $46 = (($45) + 1)|0;
  $i = $46;
 }
 $47 = $0;
 $48 = (($47) + 104|0);
 _libcperciva_SHA256_Update($48,$pad,64);
 dest=$khash+0|0; stop=dest+32|0; do { HEAP8[dest>>0]=0|0; dest=dest+1|0; } while ((dest|0) < (stop|0));
 dest=$pad+0|0; stop=dest+64|0; do { HEAP8[dest>>0]=0|0; dest=dest+1|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _libcperciva_HMAC_SHA256_Update($ctx,$in,$len) {
 $ctx = $ctx|0;
 $in = $in|0;
 $len = $len|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $ctx;
 $1 = $in;
 $2 = $len;
 $3 = $0;
 $4 = $1;
 $5 = $2;
 _libcperciva_SHA256_Update($3,$4,$5);
 STACKTOP = sp;return;
}
function _libcperciva_HMAC_SHA256_Final($digest,$ctx) {
 $digest = $digest|0;
 $ctx = $ctx|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $ihash = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $ihash = sp + 8|0;
 $0 = $digest;
 $1 = $ctx;
 $2 = $1;
 _libcperciva_SHA256_Final($ihash,$2);
 $3 = $1;
 $4 = (($3) + 104|0);
 _libcperciva_SHA256_Update($4,$ihash,32);
 $5 = $0;
 $6 = $1;
 $7 = (($6) + 104|0);
 _libcperciva_SHA256_Final($5,$7);
 dest=$ihash+0|0; stop=dest+32|0; do { HEAP8[dest>>0]=0|0; dest=dest+1|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _libcperciva_HMAC_SHA256_Buf($K,$Klen,$in,$len,$digest) {
 $K = $K|0;
 $Klen = $Klen|0;
 $in = $in|0;
 $len = $len|0;
 $digest = $digest|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $ctx = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 240|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $ctx = sp + 16|0;
 $0 = $K;
 $1 = $Klen;
 $2 = $in;
 $3 = $len;
 $4 = $digest;
 $5 = $0;
 $6 = $1;
 _libcperciva_HMAC_SHA256_Init($ctx,$5,$6);
 $7 = $2;
 $8 = $3;
 _libcperciva_HMAC_SHA256_Update($ctx,$7,$8);
 $9 = $4;
 _libcperciva_HMAC_SHA256_Final($9,$ctx);
 STACKTOP = sp;return;
}
function _PBKDF2_SHA256($passwd,$passwdlen,$salt,$saltlen,$0,$1,$buf,$dkLen) {
 $passwd = $passwd|0;
 $passwdlen = $passwdlen|0;
 $salt = $salt|0;
 $saltlen = $saltlen|0;
 $0 = $0|0;
 $1 = $1|0;
 $buf = $buf|0;
 $dkLen = $dkLen|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0;
 var $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0;
 var $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0;
 var $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0;
 var $83 = 0, $84 = 0, $9 = 0, $PShctx = 0, $T = 0, $U = 0, $clen = 0, $hctx = 0, $i = 0, $ivec = 0, $j = 0, $k = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 544|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $6 = sp + 8|0;
 $PShctx = sp + 240|0;
 $hctx = sp + 24|0;
 $ivec = sp + 536|0;
 $U = sp + 504|0;
 $T = sp + 472|0;
 $j = sp;
 $2 = $passwd;
 $3 = $passwdlen;
 $4 = $salt;
 $5 = $saltlen;
 $9 = $6;
 $10 = $9;
 HEAP32[$10>>2] = $0;
 $11 = (($9) + 4)|0;
 $12 = $11;
 HEAP32[$12>>2] = $1;
 $7 = $buf;
 $8 = $dkLen;
 $13 = $2;
 $14 = $3;
 _libcperciva_HMAC_SHA256_Init($PShctx,$13,$14);
 $15 = $4;
 $16 = $5;
 _libcperciva_HMAC_SHA256_Update($PShctx,$15,$16);
 $i = 0;
 while(1) {
  $17 = $i;
  $18 = $17<<5;
  $19 = $8;
  $20 = ($18>>>0)<($19>>>0);
  if (!($20)) {
   break;
  }
  $21 = $i;
  $22 = (($21) + 1)|0;
  _libcperciva_be32enc($ivec,$22);
  _memcpy(($hctx|0),($PShctx|0),208)|0;
  _libcperciva_HMAC_SHA256_Update($hctx,$ivec,4);
  _libcperciva_HMAC_SHA256_Final($U,$hctx);
  dest=$T+0|0; src=$U+0|0; stop=dest+32|0; do { HEAP8[dest>>0]=HEAP8[src>>0]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));
  $23 = $j;
  $24 = $23;
  HEAP32[$24>>2] = 2;
  $25 = (($23) + 4)|0;
  $26 = $25;
  HEAP32[$26>>2] = 0;
  while(1) {
   $27 = $j;
   $28 = $27;
   $29 = HEAP32[$28>>2]|0;
   $30 = (($27) + 4)|0;
   $31 = $30;
   $32 = HEAP32[$31>>2]|0;
   $33 = $6;
   $34 = $33;
   $35 = HEAP32[$34>>2]|0;
   $36 = (($33) + 4)|0;
   $37 = $36;
   $38 = HEAP32[$37>>2]|0;
   $39 = ($32>>>0)<($38>>>0);
   $40 = ($32|0)==($38|0);
   $41 = ($29>>>0)<=($35>>>0);
   $42 = $40 & $41;
   $43 = $39 | $42;
   if (!($43)) {
    break;
   }
   $44 = $2;
   $45 = $3;
   _libcperciva_HMAC_SHA256_Init($hctx,$44,$45);
   _libcperciva_HMAC_SHA256_Update($hctx,$U,32);
   _libcperciva_HMAC_SHA256_Final($U,$hctx);
   $k = 0;
   while(1) {
    $46 = $k;
    $47 = ($46|0)<(32);
    if (!($47)) {
     break;
    }
    $48 = $k;
    $49 = (($U) + ($48)|0);
    $50 = HEAP8[$49>>0]|0;
    $51 = $50&255;
    $52 = $k;
    $53 = (($T) + ($52)|0);
    $54 = HEAP8[$53>>0]|0;
    $55 = $54&255;
    $56 = $55 ^ $51;
    $57 = $56&255;
    HEAP8[$53>>0] = $57;
    $58 = $k;
    $59 = (($58) + 1)|0;
    $k = $59;
   }
   $60 = $j;
   $61 = $60;
   $62 = HEAP32[$61>>2]|0;
   $63 = (($60) + 4)|0;
   $64 = $63;
   $65 = HEAP32[$64>>2]|0;
   $66 = (_i64Add(($62|0),($65|0),1,0)|0);
   $67 = tempRet0;
   $68 = $j;
   $69 = $68;
   HEAP32[$69>>2] = $66;
   $70 = (($68) + 4)|0;
   $71 = $70;
   HEAP32[$71>>2] = $67;
  }
  $72 = $8;
  $73 = $i;
  $74 = $73<<5;
  $75 = (($72) - ($74))|0;
  $clen = $75;
  $76 = $clen;
  $77 = ($76>>>0)>(32);
  if ($77) {
   $clen = 32;
  }
  $78 = $i;
  $79 = $78<<5;
  $80 = $7;
  $81 = (($80) + ($79)|0);
  $82 = $clen;
  _memcpy(($81|0),($T|0),($82|0))|0;
  $83 = $i;
  $84 = (($83) + 1)|0;
  $i = $84;
 }
 _memset(($PShctx|0),0,208)|0;
 STACKTOP = sp;return;
}
function _libcperciva_be32enc($pp,$x) {
 $pp = $pp|0;
 $x = $x|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $pp;
 $1 = $x;
 $2 = $0;
 $p = $2;
 $3 = $1;
 $4 = $3 & 255;
 $5 = $4&255;
 $6 = $p;
 $7 = (($6) + 3|0);
 HEAP8[$7>>0] = $5;
 $8 = $1;
 $9 = $8 >>> 8;
 $10 = $9 & 255;
 $11 = $10&255;
 $12 = $p;
 $13 = (($12) + 2|0);
 HEAP8[$13>>0] = $11;
 $14 = $1;
 $15 = $14 >>> 16;
 $16 = $15 & 255;
 $17 = $16&255;
 $18 = $p;
 $19 = (($18) + 1|0);
 HEAP8[$19>>0] = $17;
 $20 = $1;
 $21 = $20 >>> 24;
 $22 = $21 & 255;
 $23 = $22&255;
 $24 = $p;
 HEAP8[$24>>0] = $23;
 STACKTOP = sp;return;
}
function _be32dec_vect($dst,$src,$len) {
 $dst = $dst|0;
 $src = $src|0;
 $len = $len|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $dst;
 $1 = $src;
 $2 = $len;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = $2;
  $5 = (($4>>>0) / 4)&-1;
  $6 = ($3>>>0)<($5>>>0);
  if (!($6)) {
   break;
  }
  $7 = $1;
  $8 = $i;
  $9 = $8<<2;
  $10 = (($7) + ($9)|0);
  $11 = (_libcperciva_be32dec($10)|0);
  $12 = $i;
  $13 = $0;
  $14 = (($13) + ($12<<2)|0);
  HEAP32[$14>>2] = $11;
  $15 = $i;
  $16 = (($15) + 1)|0;
  $i = $16;
 }
 STACKTOP = sp;return;
}
function _libcperciva_be32dec($pp) {
 $pp = $pp|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $pp;
 $1 = $0;
 $p = $1;
 $2 = $p;
 $3 = (($2) + 3|0);
 $4 = HEAP8[$3>>0]|0;
 $5 = $4&255;
 $6 = $p;
 $7 = (($6) + 2|0);
 $8 = HEAP8[$7>>0]|0;
 $9 = $8&255;
 $10 = $9 << 8;
 $11 = (($5) + ($10))|0;
 $12 = $p;
 $13 = (($12) + 1|0);
 $14 = HEAP8[$13>>0]|0;
 $15 = $14&255;
 $16 = $15 << 16;
 $17 = (($11) + ($16))|0;
 $18 = $p;
 $19 = HEAP8[$18>>0]|0;
 $20 = $19&255;
 $21 = $20 << 24;
 $22 = (($17) + ($21))|0;
 STACKTOP = sp;return ($22|0);
}
function _crypto_scrypt($passwd,$passwdlen,$salt,$saltlen,$0,$1,$_r,$_p,$buf,$buflen) {
 $passwd = $passwd|0;
 $passwdlen = $passwdlen|0;
 $salt = $salt|0;
 $saltlen = $saltlen|0;
 $0 = $0|0;
 $1 = $1|0;
 $_r = $_r|0;
 $_p = $_p|0;
 $buf = $buf|0;
 $buflen = $buflen|0;
 var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
 var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
 var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0;
 var $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0;
 var $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0;
 var $99 = 0, $B = 0, $V = 0, $XY = 0, $i = 0, $p = 0, $r = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $7 = sp;
 $3 = $passwd;
 $4 = $passwdlen;
 $5 = $salt;
 $6 = $saltlen;
 $12 = $7;
 $13 = $12;
 HEAP32[$13>>2] = $0;
 $14 = (($12) + 4)|0;
 $15 = $14;
 HEAP32[$15>>2] = $1;
 $8 = $_r;
 $9 = $_p;
 $10 = $buf;
 $11 = $buflen;
 $16 = $8;
 $r = $16;
 $17 = $9;
 $p = $17;
 $18 = $r;
 $19 = $p;
 $20 = (___muldi3(($18|0),0,($19|0),0)|0);
 $21 = tempRet0;
 $22 = ($21>>>0)>(0);
 $23 = ($21|0)==(0);
 $24 = ($20>>>0)>=(1073741824);
 $25 = $23 & $24;
 $26 = $22 | $25;
 do {
  if ($26) {
   $27 = (___errno_location()|0);
   HEAP32[$27>>2] = 27;
  } else {
   $28 = $7;
   $29 = $28;
   $30 = HEAP32[$29>>2]|0;
   $31 = (($28) + 4)|0;
   $32 = $31;
   $33 = HEAP32[$32>>2]|0;
   $34 = $7;
   $35 = $34;
   $36 = HEAP32[$35>>2]|0;
   $37 = (($34) + 4)|0;
   $38 = $37;
   $39 = HEAP32[$38>>2]|0;
   $40 = (_i64Subtract(($36|0),($39|0),1,0)|0);
   $41 = tempRet0;
   $42 = $30 & $40;
   $43 = $33 & $41;
   $44 = ($42|0)!=(0);
   $45 = ($43|0)!=(0);
   $46 = $44 | $45;
   if (!($46)) {
    $47 = $7;
    $48 = $47;
    $49 = HEAP32[$48>>2]|0;
    $50 = (($47) + 4)|0;
    $51 = $50;
    $52 = HEAP32[$51>>2]|0;
    $53 = ($49|0)==(0);
    $54 = ($52|0)==(0);
    $55 = $53 & $54;
    if (!($55)) {
     $57 = $r;
     $58 = $p;
     $59 = (33554431 / ($58>>>0))&-1;
     $60 = ($57>>>0)>($59>>>0);
     if (!($60)) {
      $61 = $r;
      $62 = ($61>>>0)>(16777215);
      if (!($62)) {
       $63 = $7;
       $64 = $63;
       $65 = HEAP32[$64>>2]|0;
       $66 = (($63) + 4)|0;
       $67 = $66;
       $68 = HEAP32[$67>>2]|0;
       $69 = $r;
       $70 = (33554431 / ($69>>>0))&-1;
       $71 = ($68>>>0)>(0);
       $72 = ($68|0)==(0);
       $73 = ($65>>>0)>($70>>>0);
       $74 = $72 & $73;
       $75 = $71 | $74;
       if (!($75)) {
        $77 = $r;
        $78 = $77<<7;
        $79 = $p;
        $80 = Math_imul($78, $79)|0;
        $81 = (_malloc($80)|0);
        $B = $81;
        $82 = ($81|0)==(0|0);
        if ($82) {
         break;
        }
        $83 = $r;
        $84 = $83<<8;
        $85 = (_malloc($84)|0);
        $XY = $85;
        $86 = ($85|0)==(0|0);
        do {
         if ($86) {
         } else {
          $87 = $r;
          $88 = $87<<7;
          $89 = $7;
          $90 = $89;
          $91 = HEAP32[$90>>2]|0;
          $92 = (($89) + 4)|0;
          $93 = $92;
          $94 = HEAP32[$93>>2]|0;
          $95 = (___muldi3(($88|0),0,($91|0),($94|0))|0);
          $96 = tempRet0;
          $97 = (_malloc($95)|0);
          $V = $97;
          $98 = ($97|0)==(0|0);
          if ($98) {
           $140 = $XY;
           _free($140);
           break;
          }
          $99 = $3;
          $100 = $4;
          $101 = $5;
          $102 = $6;
          $103 = $B;
          $104 = $p;
          $105 = $104<<7;
          $106 = $r;
          $107 = Math_imul($105, $106)|0;
          _PBKDF2_SHA256($99,$100,$101,$102,1,0,$103,$107);
          $i = 0;
          while(1) {
           $108 = $i;
           $109 = $p;
           $110 = ($108>>>0)<($109>>>0);
           if (!($110)) {
            break;
           }
           $111 = $i;
           $112 = $111<<7;
           $113 = $r;
           $114 = Math_imul($112, $113)|0;
           $115 = $B;
           $116 = (($115) + ($114)|0);
           $117 = $r;
           $118 = $7;
           $119 = $118;
           $120 = HEAP32[$119>>2]|0;
           $121 = (($118) + 4)|0;
           $122 = $121;
           $123 = HEAP32[$122>>2]|0;
           $124 = $V;
           $125 = $XY;
           _smix($116,$117,$120,$123,$124,$125);
           $126 = $i;
           $127 = (($126) + 1)|0;
           $i = $127;
          }
          $128 = $3;
          $129 = $4;
          $130 = $B;
          $131 = $p;
          $132 = $131<<7;
          $133 = $r;
          $134 = Math_imul($132, $133)|0;
          $135 = $10;
          $136 = $11;
          _PBKDF2_SHA256($128,$129,$130,$134,1,0,$135,$136);
          $137 = $V;
          _free($137);
          $138 = $XY;
          _free($138);
          $139 = $B;
          _free($139);
          $2 = 0;
          $142 = $2;
          STACKTOP = sp;return ($142|0);
         }
        } while(0);
        $141 = $B;
        _free($141);
        break;
       }
      }
     }
     $76 = (___errno_location()|0);
     HEAP32[$76>>2] = 12;
     break;
    }
   }
   $56 = (___errno_location()|0);
   HEAP32[$56>>2] = 22;
  }
 } while(0);
 $2 = -1;
 $142 = $2;
 STACKTOP = sp;return ($142|0);
}
function _smix($B,$r,$0,$1,$V,$XY) {
 $B = $B|0;
 $r = $r|0;
 $0 = $0|0;
 $1 = $1|0;
 $V = $V|0;
 $XY = $XY|0;
 var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
 var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
 var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0;
 var $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0;
 var $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0;
 var $98 = 0, $99 = 0, $X = 0, $Y = 0, $i = 0, $j = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $4 = sp + 8|0;
 $i = sp;
 $j = sp + 16|0;
 $2 = $B;
 $3 = $r;
 $7 = $4;
 $8 = $7;
 HEAP32[$8>>2] = $0;
 $9 = (($7) + 4)|0;
 $10 = $9;
 HEAP32[$10>>2] = $1;
 $5 = $V;
 $6 = $XY;
 $11 = $6;
 $X = $11;
 $12 = $3;
 $13 = $12<<7;
 $14 = $6;
 $15 = (($14) + ($13)|0);
 $Y = $15;
 $16 = $X;
 $17 = $2;
 $18 = $3;
 $19 = $18<<7;
 _blkcpy($16,$17,$19);
 $20 = $i;
 $21 = $20;
 HEAP32[$21>>2] = 0;
 $22 = (($20) + 4)|0;
 $23 = $22;
 HEAP32[$23>>2] = 0;
 while(1) {
  $24 = $i;
  $25 = $24;
  $26 = HEAP32[$25>>2]|0;
  $27 = (($24) + 4)|0;
  $28 = $27;
  $29 = HEAP32[$28>>2]|0;
  $30 = $4;
  $31 = $30;
  $32 = HEAP32[$31>>2]|0;
  $33 = (($30) + 4)|0;
  $34 = $33;
  $35 = HEAP32[$34>>2]|0;
  $36 = ($29>>>0)<($35>>>0);
  $37 = ($29|0)==($35|0);
  $38 = ($26>>>0)<($32>>>0);
  $39 = $37 & $38;
  $40 = $36 | $39;
  if (!($40)) {
   break;
  }
  $41 = $i;
  $42 = $41;
  $43 = HEAP32[$42>>2]|0;
  $44 = (($41) + 4)|0;
  $45 = $44;
  $46 = HEAP32[$45>>2]|0;
  $47 = $3;
  $48 = $47<<7;
  $49 = (___muldi3(($43|0),($46|0),($48|0),0)|0);
  $50 = tempRet0;
  $51 = $5;
  $52 = (($51) + ($49)|0);
  $53 = $X;
  $54 = $3;
  $55 = $54<<7;
  _blkcpy($52,$53,$55);
  $56 = $X;
  $57 = $Y;
  $58 = $3;
  _blockmix_salsa8($56,$57,$58);
  $59 = $i;
  $60 = $59;
  $61 = HEAP32[$60>>2]|0;
  $62 = (($59) + 4)|0;
  $63 = $62;
  $64 = HEAP32[$63>>2]|0;
  $65 = (_i64Add(($61|0),($64|0),1,0)|0);
  $66 = tempRet0;
  $67 = $i;
  $68 = $67;
  HEAP32[$68>>2] = $65;
  $69 = (($67) + 4)|0;
  $70 = $69;
  HEAP32[$70>>2] = $66;
 }
 $71 = $i;
 $72 = $71;
 HEAP32[$72>>2] = 0;
 $73 = (($71) + 4)|0;
 $74 = $73;
 HEAP32[$74>>2] = 0;
 while(1) {
  $75 = $i;
  $76 = $75;
  $77 = HEAP32[$76>>2]|0;
  $78 = (($75) + 4)|0;
  $79 = $78;
  $80 = HEAP32[$79>>2]|0;
  $81 = $4;
  $82 = $81;
  $83 = HEAP32[$82>>2]|0;
  $84 = (($81) + 4)|0;
  $85 = $84;
  $86 = HEAP32[$85>>2]|0;
  $87 = ($80>>>0)<($86>>>0);
  $88 = ($80|0)==($86|0);
  $89 = ($77>>>0)<($83>>>0);
  $90 = $88 & $89;
  $91 = $87 | $90;
  if (!($91)) {
   break;
  }
  $92 = $X;
  $93 = $3;
  $94 = (_integerify($92,$93)|0);
  $95 = tempRet0;
  $96 = $4;
  $97 = $96;
  $98 = HEAP32[$97>>2]|0;
  $99 = (($96) + 4)|0;
  $100 = $99;
  $101 = HEAP32[$100>>2]|0;
  $102 = (_i64Subtract(($98|0),($101|0),1,0)|0);
  $103 = tempRet0;
  $104 = $94 & $102;
  $105 = $95 & $103;
  $106 = $j;
  $107 = $106;
  HEAP32[$107>>2] = $104;
  $108 = (($106) + 4)|0;
  $109 = $108;
  HEAP32[$109>>2] = $105;
  $110 = $X;
  $111 = $j;
  $112 = $111;
  $113 = HEAP32[$112>>2]|0;
  $114 = (($111) + 4)|0;
  $115 = $114;
  $116 = HEAP32[$115>>2]|0;
  $117 = $3;
  $118 = $117<<7;
  $119 = (___muldi3(($113|0),($116|0),($118|0),0)|0);
  $120 = tempRet0;
  $121 = $5;
  $122 = (($121) + ($119)|0);
  $123 = $3;
  $124 = $123<<7;
  _blkxor($110,$122,$124);
  $125 = $X;
  $126 = $Y;
  $127 = $3;
  _blockmix_salsa8($125,$126,$127);
  $128 = $i;
  $129 = $128;
  $130 = HEAP32[$129>>2]|0;
  $131 = (($128) + 4)|0;
  $132 = $131;
  $133 = HEAP32[$132>>2]|0;
  $134 = (_i64Add(($130|0),($133|0),1,0)|0);
  $135 = tempRet0;
  $136 = $i;
  $137 = $136;
  HEAP32[$137>>2] = $134;
  $138 = (($136) + 4)|0;
  $139 = $138;
  HEAP32[$139>>2] = $135;
 }
 $140 = $2;
 $141 = $X;
 $142 = $3;
 $143 = $142<<7;
 _blkcpy($140,$141,$143);
 STACKTOP = sp;return;
}
function _blkcpy($dest,$src,$len) {
 $dest = $dest|0;
 $src = $src|0;
 $len = $len|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $dest;
 $1 = $src;
 $2 = $len;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = $2;
  $5 = ($3>>>0)<($4>>>0);
  if (!($5)) {
   break;
  }
  $6 = $i;
  $7 = $1;
  $8 = (($7) + ($6)|0);
  $9 = HEAP8[$8>>0]|0;
  $10 = $i;
  $11 = $0;
  $12 = (($11) + ($10)|0);
  HEAP8[$12>>0] = $9;
  $13 = $i;
  $14 = (($13) + 1)|0;
  $i = $14;
 }
 STACKTOP = sp;return;
}
function _blockmix_salsa8($B,$Y,$r) {
 $B = $B|0;
 $Y = $Y|0;
 $r = $r|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $X = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $X = sp + 16|0;
 $0 = $B;
 $1 = $Y;
 $2 = $r;
 $3 = $2;
 $4 = $3<<1;
 $5 = (($4) - 1)|0;
 $6 = $5<<6;
 $7 = $0;
 $8 = (($7) + ($6)|0);
 _blkcpy($X,$8,64);
 $i = 0;
 while(1) {
  $9 = $i;
  $10 = $2;
  $11 = $10<<1;
  $12 = ($9>>>0)<($11>>>0);
  if (!($12)) {
   break;
  }
  $13 = $i;
  $14 = $13<<6;
  $15 = $0;
  $16 = (($15) + ($14)|0);
  _blkxor($X,$16,64);
  _salsa20_8($X);
  $17 = $i;
  $18 = $17<<6;
  $19 = $1;
  $20 = (($19) + ($18)|0);
  _blkcpy($20,$X,64);
  $21 = $i;
  $22 = (($21) + 1)|0;
  $i = $22;
 }
 $i = 0;
 while(1) {
  $23 = $i;
  $24 = $2;
  $25 = ($23>>>0)<($24>>>0);
  if (!($25)) {
   break;
  }
  $26 = $i;
  $27 = $26<<6;
  $28 = $0;
  $29 = (($28) + ($27)|0);
  $30 = $i;
  $31 = $30<<1;
  $32 = $31<<6;
  $33 = $1;
  $34 = (($33) + ($32)|0);
  _blkcpy($29,$34,64);
  $35 = $i;
  $36 = (($35) + 1)|0;
  $i = $36;
 }
 $i = 0;
 while(1) {
  $37 = $i;
  $38 = $2;
  $39 = ($37>>>0)<($38>>>0);
  if (!($39)) {
   break;
  }
  $40 = $i;
  $41 = $2;
  $42 = (($40) + ($41))|0;
  $43 = $42<<6;
  $44 = $0;
  $45 = (($44) + ($43)|0);
  $46 = $i;
  $47 = $46<<1;
  $48 = (($47) + 1)|0;
  $49 = $48<<6;
  $50 = $1;
  $51 = (($50) + ($49)|0);
  _blkcpy($45,$51,64);
  $52 = $i;
  $53 = (($52) + 1)|0;
  $i = $53;
 }
 STACKTOP = sp;return;
}
function _integerify($B,$r) {
 $B = $B|0;
 $r = $r|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $X = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $B;
 $1 = $r;
 $2 = $1;
 $3 = $2<<1;
 $4 = (($3) - 1)|0;
 $5 = $4<<6;
 $6 = $0;
 $7 = (($6) + ($5)|0);
 $X = $7;
 $8 = $X;
 $9 = (_libcperciva_le64dec($8)|0);
 $10 = tempRet0;
 tempRet0 = $10;
 STACKTOP = sp;return ($9|0);
}
function _blkxor($dest,$src,$len) {
 $dest = $dest|0;
 $src = $src|0;
 $len = $len|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $dest;
 $1 = $src;
 $2 = $len;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = $2;
  $5 = ($3>>>0)<($4>>>0);
  if (!($5)) {
   break;
  }
  $6 = $i;
  $7 = $1;
  $8 = (($7) + ($6)|0);
  $9 = HEAP8[$8>>0]|0;
  $10 = $9&255;
  $11 = $i;
  $12 = $0;
  $13 = (($12) + ($11)|0);
  $14 = HEAP8[$13>>0]|0;
  $15 = $14&255;
  $16 = $15 ^ $10;
  $17 = $16&255;
  HEAP8[$13>>0] = $17;
  $18 = $i;
  $19 = (($18) + 1)|0;
  $i = $19;
 }
 STACKTOP = sp;return;
}
function _libcperciva_le64dec($pp) {
 $pp = $pp|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $p = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $pp;
 $1 = $0;
 $p = $1;
 $2 = $p;
 $3 = HEAP8[$2>>0]|0;
 $4 = $3&255;
 $5 = $p;
 $6 = (($5) + 1|0);
 $7 = HEAP8[$6>>0]|0;
 $8 = $7&255;
 $9 = (_bitshift64Shl(($8|0),0,8)|0);
 $10 = tempRet0;
 $11 = (_i64Add(($4|0),0,($9|0),($10|0))|0);
 $12 = tempRet0;
 $13 = $p;
 $14 = (($13) + 2|0);
 $15 = HEAP8[$14>>0]|0;
 $16 = $15&255;
 $17 = (_bitshift64Shl(($16|0),0,16)|0);
 $18 = tempRet0;
 $19 = (_i64Add(($11|0),($12|0),($17|0),($18|0))|0);
 $20 = tempRet0;
 $21 = $p;
 $22 = (($21) + 3|0);
 $23 = HEAP8[$22>>0]|0;
 $24 = $23&255;
 $25 = (_bitshift64Shl(($24|0),0,24)|0);
 $26 = tempRet0;
 $27 = (_i64Add(($19|0),($20|0),($25|0),($26|0))|0);
 $28 = tempRet0;
 $29 = $p;
 $30 = (($29) + 4|0);
 $31 = HEAP8[$30>>0]|0;
 $32 = $31&255;
 $33 = (_i64Add(($27|0),($28|0),0,($32|0))|0);
 $34 = tempRet0;
 $35 = $p;
 $36 = (($35) + 5|0);
 $37 = HEAP8[$36>>0]|0;
 $38 = $37&255;
 $39 = (_bitshift64Shl(($38|0),0,40)|0);
 $40 = tempRet0;
 $41 = (_i64Add(($33|0),($34|0),($39|0),($40|0))|0);
 $42 = tempRet0;
 $43 = $p;
 $44 = (($43) + 6|0);
 $45 = HEAP8[$44>>0]|0;
 $46 = $45&255;
 $47 = (_bitshift64Shl(($46|0),0,48)|0);
 $48 = tempRet0;
 $49 = (_i64Add(($41|0),($42|0),($47|0),($48|0))|0);
 $50 = tempRet0;
 $51 = $p;
 $52 = (($51) + 7|0);
 $53 = HEAP8[$52>>0]|0;
 $54 = $53&255;
 $55 = (_bitshift64Shl(($54|0),0,56)|0);
 $56 = tempRet0;
 $57 = (_i64Add(($49|0),($50|0),($55|0),($56|0))|0);
 $58 = tempRet0;
 tempRet0 = $58;
 STACKTOP = sp;return ($57|0);
}
function _salsa20_8($B) {
 $B = $B|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0;
 var $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0;
 var $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0;
 var $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0;
 var $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0;
 var $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0;
 var $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0;
 var $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0;
 var $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0;
 var $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0;
 var $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0;
 var $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0;
 var $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0;
 var $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0;
 var $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0;
 var $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0;
 var $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0;
 var $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0;
 var $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0;
 var $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0;
 var $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $B32 = 0, $i = 0, $x = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 144|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $B32 = sp;
 $x = sp + 64|0;
 $0 = $B;
 $i = 0;
 while(1) {
  $1 = $i;
  $2 = ($1>>>0)<(16);
  if (!($2)) {
   break;
  }
  $3 = $i;
  $4 = $3<<2;
  $5 = $0;
  $6 = (($5) + ($4)|0);
  $7 = (_libcperciva_le32dec($6)|0);
  $8 = $i;
  $9 = (($B32) + ($8<<2)|0);
  HEAP32[$9>>2] = $7;
  $10 = $i;
  $11 = (($10) + 1)|0;
  $i = $11;
 }
 $i = 0;
 while(1) {
  $12 = $i;
  $13 = ($12>>>0)<(16);
  if (!($13)) {
   break;
  }
  $14 = $i;
  $15 = (($B32) + ($14<<2)|0);
  $16 = HEAP32[$15>>2]|0;
  $17 = $i;
  $18 = (($x) + ($17<<2)|0);
  HEAP32[$18>>2] = $16;
  $19 = $i;
  $20 = (($19) + 1)|0;
  $i = $20;
 }
 $i = 0;
 while(1) {
  $21 = $i;
  $22 = ($21>>>0)<(8);
  if (!($22)) {
   break;
  }
  $23 = HEAP32[$x>>2]|0;
  $24 = (($x) + 48|0);
  $25 = HEAP32[$24>>2]|0;
  $26 = (($23) + ($25))|0;
  $27 = $26 << 7;
  $28 = HEAP32[$x>>2]|0;
  $29 = (($x) + 48|0);
  $30 = HEAP32[$29>>2]|0;
  $31 = (($28) + ($30))|0;
  $32 = $31 >>> 25;
  $33 = $27 | $32;
  $34 = (($x) + 16|0);
  $35 = HEAP32[$34>>2]|0;
  $36 = $35 ^ $33;
  HEAP32[$34>>2] = $36;
  $37 = (($x) + 16|0);
  $38 = HEAP32[$37>>2]|0;
  $39 = HEAP32[$x>>2]|0;
  $40 = (($38) + ($39))|0;
  $41 = $40 << 9;
  $42 = (($x) + 16|0);
  $43 = HEAP32[$42>>2]|0;
  $44 = HEAP32[$x>>2]|0;
  $45 = (($43) + ($44))|0;
  $46 = $45 >>> 23;
  $47 = $41 | $46;
  $48 = (($x) + 32|0);
  $49 = HEAP32[$48>>2]|0;
  $50 = $49 ^ $47;
  HEAP32[$48>>2] = $50;
  $51 = (($x) + 32|0);
  $52 = HEAP32[$51>>2]|0;
  $53 = (($x) + 16|0);
  $54 = HEAP32[$53>>2]|0;
  $55 = (($52) + ($54))|0;
  $56 = $55 << 13;
  $57 = (($x) + 32|0);
  $58 = HEAP32[$57>>2]|0;
  $59 = (($x) + 16|0);
  $60 = HEAP32[$59>>2]|0;
  $61 = (($58) + ($60))|0;
  $62 = $61 >>> 19;
  $63 = $56 | $62;
  $64 = (($x) + 48|0);
  $65 = HEAP32[$64>>2]|0;
  $66 = $65 ^ $63;
  HEAP32[$64>>2] = $66;
  $67 = (($x) + 48|0);
  $68 = HEAP32[$67>>2]|0;
  $69 = (($x) + 32|0);
  $70 = HEAP32[$69>>2]|0;
  $71 = (($68) + ($70))|0;
  $72 = $71 << 18;
  $73 = (($x) + 48|0);
  $74 = HEAP32[$73>>2]|0;
  $75 = (($x) + 32|0);
  $76 = HEAP32[$75>>2]|0;
  $77 = (($74) + ($76))|0;
  $78 = $77 >>> 14;
  $79 = $72 | $78;
  $80 = HEAP32[$x>>2]|0;
  $81 = $80 ^ $79;
  HEAP32[$x>>2] = $81;
  $82 = (($x) + 20|0);
  $83 = HEAP32[$82>>2]|0;
  $84 = (($x) + 4|0);
  $85 = HEAP32[$84>>2]|0;
  $86 = (($83) + ($85))|0;
  $87 = $86 << 7;
  $88 = (($x) + 20|0);
  $89 = HEAP32[$88>>2]|0;
  $90 = (($x) + 4|0);
  $91 = HEAP32[$90>>2]|0;
  $92 = (($89) + ($91))|0;
  $93 = $92 >>> 25;
  $94 = $87 | $93;
  $95 = (($x) + 36|0);
  $96 = HEAP32[$95>>2]|0;
  $97 = $96 ^ $94;
  HEAP32[$95>>2] = $97;
  $98 = (($x) + 36|0);
  $99 = HEAP32[$98>>2]|0;
  $100 = (($x) + 20|0);
  $101 = HEAP32[$100>>2]|0;
  $102 = (($99) + ($101))|0;
  $103 = $102 << 9;
  $104 = (($x) + 36|0);
  $105 = HEAP32[$104>>2]|0;
  $106 = (($x) + 20|0);
  $107 = HEAP32[$106>>2]|0;
  $108 = (($105) + ($107))|0;
  $109 = $108 >>> 23;
  $110 = $103 | $109;
  $111 = (($x) + 52|0);
  $112 = HEAP32[$111>>2]|0;
  $113 = $112 ^ $110;
  HEAP32[$111>>2] = $113;
  $114 = (($x) + 52|0);
  $115 = HEAP32[$114>>2]|0;
  $116 = (($x) + 36|0);
  $117 = HEAP32[$116>>2]|0;
  $118 = (($115) + ($117))|0;
  $119 = $118 << 13;
  $120 = (($x) + 52|0);
  $121 = HEAP32[$120>>2]|0;
  $122 = (($x) + 36|0);
  $123 = HEAP32[$122>>2]|0;
  $124 = (($121) + ($123))|0;
  $125 = $124 >>> 19;
  $126 = $119 | $125;
  $127 = (($x) + 4|0);
  $128 = HEAP32[$127>>2]|0;
  $129 = $128 ^ $126;
  HEAP32[$127>>2] = $129;
  $130 = (($x) + 4|0);
  $131 = HEAP32[$130>>2]|0;
  $132 = (($x) + 52|0);
  $133 = HEAP32[$132>>2]|0;
  $134 = (($131) + ($133))|0;
  $135 = $134 << 18;
  $136 = (($x) + 4|0);
  $137 = HEAP32[$136>>2]|0;
  $138 = (($x) + 52|0);
  $139 = HEAP32[$138>>2]|0;
  $140 = (($137) + ($139))|0;
  $141 = $140 >>> 14;
  $142 = $135 | $141;
  $143 = (($x) + 20|0);
  $144 = HEAP32[$143>>2]|0;
  $145 = $144 ^ $142;
  HEAP32[$143>>2] = $145;
  $146 = (($x) + 40|0);
  $147 = HEAP32[$146>>2]|0;
  $148 = (($x) + 24|0);
  $149 = HEAP32[$148>>2]|0;
  $150 = (($147) + ($149))|0;
  $151 = $150 << 7;
  $152 = (($x) + 40|0);
  $153 = HEAP32[$152>>2]|0;
  $154 = (($x) + 24|0);
  $155 = HEAP32[$154>>2]|0;
  $156 = (($153) + ($155))|0;
  $157 = $156 >>> 25;
  $158 = $151 | $157;
  $159 = (($x) + 56|0);
  $160 = HEAP32[$159>>2]|0;
  $161 = $160 ^ $158;
  HEAP32[$159>>2] = $161;
  $162 = (($x) + 56|0);
  $163 = HEAP32[$162>>2]|0;
  $164 = (($x) + 40|0);
  $165 = HEAP32[$164>>2]|0;
  $166 = (($163) + ($165))|0;
  $167 = $166 << 9;
  $168 = (($x) + 56|0);
  $169 = HEAP32[$168>>2]|0;
  $170 = (($x) + 40|0);
  $171 = HEAP32[$170>>2]|0;
  $172 = (($169) + ($171))|0;
  $173 = $172 >>> 23;
  $174 = $167 | $173;
  $175 = (($x) + 8|0);
  $176 = HEAP32[$175>>2]|0;
  $177 = $176 ^ $174;
  HEAP32[$175>>2] = $177;
  $178 = (($x) + 8|0);
  $179 = HEAP32[$178>>2]|0;
  $180 = (($x) + 56|0);
  $181 = HEAP32[$180>>2]|0;
  $182 = (($179) + ($181))|0;
  $183 = $182 << 13;
  $184 = (($x) + 8|0);
  $185 = HEAP32[$184>>2]|0;
  $186 = (($x) + 56|0);
  $187 = HEAP32[$186>>2]|0;
  $188 = (($185) + ($187))|0;
  $189 = $188 >>> 19;
  $190 = $183 | $189;
  $191 = (($x) + 24|0);
  $192 = HEAP32[$191>>2]|0;
  $193 = $192 ^ $190;
  HEAP32[$191>>2] = $193;
  $194 = (($x) + 24|0);
  $195 = HEAP32[$194>>2]|0;
  $196 = (($x) + 8|0);
  $197 = HEAP32[$196>>2]|0;
  $198 = (($195) + ($197))|0;
  $199 = $198 << 18;
  $200 = (($x) + 24|0);
  $201 = HEAP32[$200>>2]|0;
  $202 = (($x) + 8|0);
  $203 = HEAP32[$202>>2]|0;
  $204 = (($201) + ($203))|0;
  $205 = $204 >>> 14;
  $206 = $199 | $205;
  $207 = (($x) + 40|0);
  $208 = HEAP32[$207>>2]|0;
  $209 = $208 ^ $206;
  HEAP32[$207>>2] = $209;
  $210 = (($x) + 60|0);
  $211 = HEAP32[$210>>2]|0;
  $212 = (($x) + 44|0);
  $213 = HEAP32[$212>>2]|0;
  $214 = (($211) + ($213))|0;
  $215 = $214 << 7;
  $216 = (($x) + 60|0);
  $217 = HEAP32[$216>>2]|0;
  $218 = (($x) + 44|0);
  $219 = HEAP32[$218>>2]|0;
  $220 = (($217) + ($219))|0;
  $221 = $220 >>> 25;
  $222 = $215 | $221;
  $223 = (($x) + 12|0);
  $224 = HEAP32[$223>>2]|0;
  $225 = $224 ^ $222;
  HEAP32[$223>>2] = $225;
  $226 = (($x) + 12|0);
  $227 = HEAP32[$226>>2]|0;
  $228 = (($x) + 60|0);
  $229 = HEAP32[$228>>2]|0;
  $230 = (($227) + ($229))|0;
  $231 = $230 << 9;
  $232 = (($x) + 12|0);
  $233 = HEAP32[$232>>2]|0;
  $234 = (($x) + 60|0);
  $235 = HEAP32[$234>>2]|0;
  $236 = (($233) + ($235))|0;
  $237 = $236 >>> 23;
  $238 = $231 | $237;
  $239 = (($x) + 28|0);
  $240 = HEAP32[$239>>2]|0;
  $241 = $240 ^ $238;
  HEAP32[$239>>2] = $241;
  $242 = (($x) + 28|0);
  $243 = HEAP32[$242>>2]|0;
  $244 = (($x) + 12|0);
  $245 = HEAP32[$244>>2]|0;
  $246 = (($243) + ($245))|0;
  $247 = $246 << 13;
  $248 = (($x) + 28|0);
  $249 = HEAP32[$248>>2]|0;
  $250 = (($x) + 12|0);
  $251 = HEAP32[$250>>2]|0;
  $252 = (($249) + ($251))|0;
  $253 = $252 >>> 19;
  $254 = $247 | $253;
  $255 = (($x) + 44|0);
  $256 = HEAP32[$255>>2]|0;
  $257 = $256 ^ $254;
  HEAP32[$255>>2] = $257;
  $258 = (($x) + 44|0);
  $259 = HEAP32[$258>>2]|0;
  $260 = (($x) + 28|0);
  $261 = HEAP32[$260>>2]|0;
  $262 = (($259) + ($261))|0;
  $263 = $262 << 18;
  $264 = (($x) + 44|0);
  $265 = HEAP32[$264>>2]|0;
  $266 = (($x) + 28|0);
  $267 = HEAP32[$266>>2]|0;
  $268 = (($265) + ($267))|0;
  $269 = $268 >>> 14;
  $270 = $263 | $269;
  $271 = (($x) + 60|0);
  $272 = HEAP32[$271>>2]|0;
  $273 = $272 ^ $270;
  HEAP32[$271>>2] = $273;
  $274 = HEAP32[$x>>2]|0;
  $275 = (($x) + 12|0);
  $276 = HEAP32[$275>>2]|0;
  $277 = (($274) + ($276))|0;
  $278 = $277 << 7;
  $279 = HEAP32[$x>>2]|0;
  $280 = (($x) + 12|0);
  $281 = HEAP32[$280>>2]|0;
  $282 = (($279) + ($281))|0;
  $283 = $282 >>> 25;
  $284 = $278 | $283;
  $285 = (($x) + 4|0);
  $286 = HEAP32[$285>>2]|0;
  $287 = $286 ^ $284;
  HEAP32[$285>>2] = $287;
  $288 = (($x) + 4|0);
  $289 = HEAP32[$288>>2]|0;
  $290 = HEAP32[$x>>2]|0;
  $291 = (($289) + ($290))|0;
  $292 = $291 << 9;
  $293 = (($x) + 4|0);
  $294 = HEAP32[$293>>2]|0;
  $295 = HEAP32[$x>>2]|0;
  $296 = (($294) + ($295))|0;
  $297 = $296 >>> 23;
  $298 = $292 | $297;
  $299 = (($x) + 8|0);
  $300 = HEAP32[$299>>2]|0;
  $301 = $300 ^ $298;
  HEAP32[$299>>2] = $301;
  $302 = (($x) + 8|0);
  $303 = HEAP32[$302>>2]|0;
  $304 = (($x) + 4|0);
  $305 = HEAP32[$304>>2]|0;
  $306 = (($303) + ($305))|0;
  $307 = $306 << 13;
  $308 = (($x) + 8|0);
  $309 = HEAP32[$308>>2]|0;
  $310 = (($x) + 4|0);
  $311 = HEAP32[$310>>2]|0;
  $312 = (($309) + ($311))|0;
  $313 = $312 >>> 19;
  $314 = $307 | $313;
  $315 = (($x) + 12|0);
  $316 = HEAP32[$315>>2]|0;
  $317 = $316 ^ $314;
  HEAP32[$315>>2] = $317;
  $318 = (($x) + 12|0);
  $319 = HEAP32[$318>>2]|0;
  $320 = (($x) + 8|0);
  $321 = HEAP32[$320>>2]|0;
  $322 = (($319) + ($321))|0;
  $323 = $322 << 18;
  $324 = (($x) + 12|0);
  $325 = HEAP32[$324>>2]|0;
  $326 = (($x) + 8|0);
  $327 = HEAP32[$326>>2]|0;
  $328 = (($325) + ($327))|0;
  $329 = $328 >>> 14;
  $330 = $323 | $329;
  $331 = HEAP32[$x>>2]|0;
  $332 = $331 ^ $330;
  HEAP32[$x>>2] = $332;
  $333 = (($x) + 20|0);
  $334 = HEAP32[$333>>2]|0;
  $335 = (($x) + 16|0);
  $336 = HEAP32[$335>>2]|0;
  $337 = (($334) + ($336))|0;
  $338 = $337 << 7;
  $339 = (($x) + 20|0);
  $340 = HEAP32[$339>>2]|0;
  $341 = (($x) + 16|0);
  $342 = HEAP32[$341>>2]|0;
  $343 = (($340) + ($342))|0;
  $344 = $343 >>> 25;
  $345 = $338 | $344;
  $346 = (($x) + 24|0);
  $347 = HEAP32[$346>>2]|0;
  $348 = $347 ^ $345;
  HEAP32[$346>>2] = $348;
  $349 = (($x) + 24|0);
  $350 = HEAP32[$349>>2]|0;
  $351 = (($x) + 20|0);
  $352 = HEAP32[$351>>2]|0;
  $353 = (($350) + ($352))|0;
  $354 = $353 << 9;
  $355 = (($x) + 24|0);
  $356 = HEAP32[$355>>2]|0;
  $357 = (($x) + 20|0);
  $358 = HEAP32[$357>>2]|0;
  $359 = (($356) + ($358))|0;
  $360 = $359 >>> 23;
  $361 = $354 | $360;
  $362 = (($x) + 28|0);
  $363 = HEAP32[$362>>2]|0;
  $364 = $363 ^ $361;
  HEAP32[$362>>2] = $364;
  $365 = (($x) + 28|0);
  $366 = HEAP32[$365>>2]|0;
  $367 = (($x) + 24|0);
  $368 = HEAP32[$367>>2]|0;
  $369 = (($366) + ($368))|0;
  $370 = $369 << 13;
  $371 = (($x) + 28|0);
  $372 = HEAP32[$371>>2]|0;
  $373 = (($x) + 24|0);
  $374 = HEAP32[$373>>2]|0;
  $375 = (($372) + ($374))|0;
  $376 = $375 >>> 19;
  $377 = $370 | $376;
  $378 = (($x) + 16|0);
  $379 = HEAP32[$378>>2]|0;
  $380 = $379 ^ $377;
  HEAP32[$378>>2] = $380;
  $381 = (($x) + 16|0);
  $382 = HEAP32[$381>>2]|0;
  $383 = (($x) + 28|0);
  $384 = HEAP32[$383>>2]|0;
  $385 = (($382) + ($384))|0;
  $386 = $385 << 18;
  $387 = (($x) + 16|0);
  $388 = HEAP32[$387>>2]|0;
  $389 = (($x) + 28|0);
  $390 = HEAP32[$389>>2]|0;
  $391 = (($388) + ($390))|0;
  $392 = $391 >>> 14;
  $393 = $386 | $392;
  $394 = (($x) + 20|0);
  $395 = HEAP32[$394>>2]|0;
  $396 = $395 ^ $393;
  HEAP32[$394>>2] = $396;
  $397 = (($x) + 40|0);
  $398 = HEAP32[$397>>2]|0;
  $399 = (($x) + 36|0);
  $400 = HEAP32[$399>>2]|0;
  $401 = (($398) + ($400))|0;
  $402 = $401 << 7;
  $403 = (($x) + 40|0);
  $404 = HEAP32[$403>>2]|0;
  $405 = (($x) + 36|0);
  $406 = HEAP32[$405>>2]|0;
  $407 = (($404) + ($406))|0;
  $408 = $407 >>> 25;
  $409 = $402 | $408;
  $410 = (($x) + 44|0);
  $411 = HEAP32[$410>>2]|0;
  $412 = $411 ^ $409;
  HEAP32[$410>>2] = $412;
  $413 = (($x) + 44|0);
  $414 = HEAP32[$413>>2]|0;
  $415 = (($x) + 40|0);
  $416 = HEAP32[$415>>2]|0;
  $417 = (($414) + ($416))|0;
  $418 = $417 << 9;
  $419 = (($x) + 44|0);
  $420 = HEAP32[$419>>2]|0;
  $421 = (($x) + 40|0);
  $422 = HEAP32[$421>>2]|0;
  $423 = (($420) + ($422))|0;
  $424 = $423 >>> 23;
  $425 = $418 | $424;
  $426 = (($x) + 32|0);
  $427 = HEAP32[$426>>2]|0;
  $428 = $427 ^ $425;
  HEAP32[$426>>2] = $428;
  $429 = (($x) + 32|0);
  $430 = HEAP32[$429>>2]|0;
  $431 = (($x) + 44|0);
  $432 = HEAP32[$431>>2]|0;
  $433 = (($430) + ($432))|0;
  $434 = $433 << 13;
  $435 = (($x) + 32|0);
  $436 = HEAP32[$435>>2]|0;
  $437 = (($x) + 44|0);
  $438 = HEAP32[$437>>2]|0;
  $439 = (($436) + ($438))|0;
  $440 = $439 >>> 19;
  $441 = $434 | $440;
  $442 = (($x) + 36|0);
  $443 = HEAP32[$442>>2]|0;
  $444 = $443 ^ $441;
  HEAP32[$442>>2] = $444;
  $445 = (($x) + 36|0);
  $446 = HEAP32[$445>>2]|0;
  $447 = (($x) + 32|0);
  $448 = HEAP32[$447>>2]|0;
  $449 = (($446) + ($448))|0;
  $450 = $449 << 18;
  $451 = (($x) + 36|0);
  $452 = HEAP32[$451>>2]|0;
  $453 = (($x) + 32|0);
  $454 = HEAP32[$453>>2]|0;
  $455 = (($452) + ($454))|0;
  $456 = $455 >>> 14;
  $457 = $450 | $456;
  $458 = (($x) + 40|0);
  $459 = HEAP32[$458>>2]|0;
  $460 = $459 ^ $457;
  HEAP32[$458>>2] = $460;
  $461 = (($x) + 60|0);
  $462 = HEAP32[$461>>2]|0;
  $463 = (($x) + 56|0);
  $464 = HEAP32[$463>>2]|0;
  $465 = (($462) + ($464))|0;
  $466 = $465 << 7;
  $467 = (($x) + 60|0);
  $468 = HEAP32[$467>>2]|0;
  $469 = (($x) + 56|0);
  $470 = HEAP32[$469>>2]|0;
  $471 = (($468) + ($470))|0;
  $472 = $471 >>> 25;
  $473 = $466 | $472;
  $474 = (($x) + 48|0);
  $475 = HEAP32[$474>>2]|0;
  $476 = $475 ^ $473;
  HEAP32[$474>>2] = $476;
  $477 = (($x) + 48|0);
  $478 = HEAP32[$477>>2]|0;
  $479 = (($x) + 60|0);
  $480 = HEAP32[$479>>2]|0;
  $481 = (($478) + ($480))|0;
  $482 = $481 << 9;
  $483 = (($x) + 48|0);
  $484 = HEAP32[$483>>2]|0;
  $485 = (($x) + 60|0);
  $486 = HEAP32[$485>>2]|0;
  $487 = (($484) + ($486))|0;
  $488 = $487 >>> 23;
  $489 = $482 | $488;
  $490 = (($x) + 52|0);
  $491 = HEAP32[$490>>2]|0;
  $492 = $491 ^ $489;
  HEAP32[$490>>2] = $492;
  $493 = (($x) + 52|0);
  $494 = HEAP32[$493>>2]|0;
  $495 = (($x) + 48|0);
  $496 = HEAP32[$495>>2]|0;
  $497 = (($494) + ($496))|0;
  $498 = $497 << 13;
  $499 = (($x) + 52|0);
  $500 = HEAP32[$499>>2]|0;
  $501 = (($x) + 48|0);
  $502 = HEAP32[$501>>2]|0;
  $503 = (($500) + ($502))|0;
  $504 = $503 >>> 19;
  $505 = $498 | $504;
  $506 = (($x) + 56|0);
  $507 = HEAP32[$506>>2]|0;
  $508 = $507 ^ $505;
  HEAP32[$506>>2] = $508;
  $509 = (($x) + 56|0);
  $510 = HEAP32[$509>>2]|0;
  $511 = (($x) + 52|0);
  $512 = HEAP32[$511>>2]|0;
  $513 = (($510) + ($512))|0;
  $514 = $513 << 18;
  $515 = (($x) + 56|0);
  $516 = HEAP32[$515>>2]|0;
  $517 = (($x) + 52|0);
  $518 = HEAP32[$517>>2]|0;
  $519 = (($516) + ($518))|0;
  $520 = $519 >>> 14;
  $521 = $514 | $520;
  $522 = (($x) + 60|0);
  $523 = HEAP32[$522>>2]|0;
  $524 = $523 ^ $521;
  HEAP32[$522>>2] = $524;
  $525 = $i;
  $526 = (($525) + 2)|0;
  $i = $526;
 }
 $i = 0;
 while(1) {
  $527 = $i;
  $528 = ($527>>>0)<(16);
  if (!($528)) {
   break;
  }
  $529 = $i;
  $530 = (($x) + ($529<<2)|0);
  $531 = HEAP32[$530>>2]|0;
  $532 = $i;
  $533 = (($B32) + ($532<<2)|0);
  $534 = HEAP32[$533>>2]|0;
  $535 = (($534) + ($531))|0;
  HEAP32[$533>>2] = $535;
  $536 = $i;
  $537 = (($536) + 1)|0;
  $i = $537;
 }
 $i = 0;
 while(1) {
  $538 = $i;
  $539 = ($538>>>0)<(16);
  if (!($539)) {
   break;
  }
  $540 = $i;
  $541 = $540<<2;
  $542 = $0;
  $543 = (($542) + ($541)|0);
  $544 = $i;
  $545 = (($B32) + ($544<<2)|0);
  $546 = HEAP32[$545>>2]|0;
  _libcperciva_le32enc($543,$546);
  $547 = $i;
  $548 = (($547) + 1)|0;
  $i = $548;
 }
 STACKTOP = sp;return;
}
function _libcperciva_le32dec($pp) {
 $pp = $pp|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $pp;
 $1 = $0;
 $p = $1;
 $2 = $p;
 $3 = HEAP8[$2>>0]|0;
 $4 = $3&255;
 $5 = $p;
 $6 = (($5) + 1|0);
 $7 = HEAP8[$6>>0]|0;
 $8 = $7&255;
 $9 = $8 << 8;
 $10 = (($4) + ($9))|0;
 $11 = $p;
 $12 = (($11) + 2|0);
 $13 = HEAP8[$12>>0]|0;
 $14 = $13&255;
 $15 = $14 << 16;
 $16 = (($10) + ($15))|0;
 $17 = $p;
 $18 = (($17) + 3|0);
 $19 = HEAP8[$18>>0]|0;
 $20 = $19&255;
 $21 = $20 << 24;
 $22 = (($16) + ($21))|0;
 STACKTOP = sp;return ($22|0);
}
function _libcperciva_le32enc($pp,$x) {
 $pp = $pp|0;
 $x = $x|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $pp;
 $1 = $x;
 $2 = $0;
 $p = $2;
 $3 = $1;
 $4 = $3 & 255;
 $5 = $4&255;
 $6 = $p;
 HEAP8[$6>>0] = $5;
 $7 = $1;
 $8 = $7 >>> 8;
 $9 = $8 & 255;
 $10 = $9&255;
 $11 = $p;
 $12 = (($11) + 1|0);
 HEAP8[$12>>0] = $10;
 $13 = $1;
 $14 = $13 >>> 16;
 $15 = $14 & 255;
 $16 = $15&255;
 $17 = $p;
 $18 = (($17) + 2|0);
 HEAP8[$18>>0] = $16;
 $19 = $1;
 $20 = $19 >>> 24;
 $21 = $20 & 255;
 $22 = $21&255;
 $23 = $p;
 $24 = (($23) + 3|0);
 HEAP8[$24>>0] = $22;
 STACKTOP = sp;return;
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$$i = 0, $$3$i = 0, $$4$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i25 = 0, $$pre$i25$i = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i26$iZ2D = 0, $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre57$i$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0, $$sum$i$i = 0, $$sum$i$i$i = 0;
 var $$sum$i14$i = 0, $$sum$i15$i = 0, $$sum$i18$i = 0, $$sum$i21$i = 0, $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i16$i = 0, $$sum1$i22$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum10$pre$i$i = 0, $$sum107$i = 0, $$sum108$i = 0, $$sum109$i = 0;
 var $$sum11$i = 0, $$sum11$i$i = 0, $$sum11$i24$i = 0, $$sum110$i = 0, $$sum111$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0, $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum13$i = 0, $$sum13$i$i = 0, $$sum14$i$i = 0;
 var $$sum14$pre$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0, $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i17$i = 0, $$sum2$i19$i = 0, $$sum2$i23$i = 0, $$sum2$pre$i = 0, $$sum20$i$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0;
 var $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum26$pre$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i$i = 0, $$sum3$i27 = 0, $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0, $$sum4$i28 = 0, $$sum40$i$i = 0;
 var $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0, $$sum8$pre = 0, $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0;
 var $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0;
 var $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0;
 var $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0;
 var $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0, $1073 = 0;
 var $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0;
 var $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0;
 var $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0;
 var $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0;
 var $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0;
 var $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0;
 var $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0;
 var $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0;
 var $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0;
 var $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0;
 var $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0;
 var $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0;
 var $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0;
 var $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0;
 var $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0;
 var $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0;
 var $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0;
 var $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0;
 var $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0;
 var $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0;
 var $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0;
 var $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0;
 var $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0;
 var $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0;
 var $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0;
 var $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0;
 var $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0;
 var $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0;
 var $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0;
 var $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0;
 var $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0;
 var $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0;
 var $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0;
 var $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0;
 var $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0;
 var $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0;
 var $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0;
 var $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0;
 var $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0;
 var $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0, $F5$0$i = 0;
 var $I1$0$c$i$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$025$i = 0, $K2$014$i$i = 0, $K8$052$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i18 = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i17 = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$013$i$i = 0;
 var $T$024$i = 0, $T$051$i$i = 0, $br$0$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i29 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond19$i = 0, $or$cond2$i = 0;
 var $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0, $or$cond8$not$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i15 = 0, $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$329$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0;
 var $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0, $t$228$i = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0;
 var $v$330$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($bytes>>>0)<(245);
 do {
  if ($0) {
   $1 = ($bytes>>>0)<(11);
   if ($1) {
    $5 = 16;
   } else {
    $2 = (($bytes) + 11)|0;
    $3 = $2 & -8;
    $5 = $3;
   }
   $4 = $5 >>> 3;
   $6 = HEAP32[72>>2]|0;
   $7 = $6 >>> $4;
   $8 = $7 & 3;
   $9 = ($8|0)==(0);
   if (!($9)) {
    $10 = $7 & 1;
    $11 = $10 ^ 1;
    $12 = (($11) + ($4))|0;
    $13 = $12 << 1;
    $14 = ((72 + ($13<<2)|0) + 40|0);
    $$sum10 = (($13) + 2)|0;
    $15 = ((72 + ($$sum10<<2)|0) + 40|0);
    $16 = HEAP32[$15>>2]|0;
    $17 = (($16) + 8|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = ($14|0)==($18|0);
    do {
     if ($19) {
      $20 = 1 << $12;
      $21 = $20 ^ -1;
      $22 = $6 & $21;
      HEAP32[72>>2] = $22;
     } else {
      $23 = HEAP32[((72 + 16|0))>>2]|0;
      $24 = ($18>>>0)<($23>>>0);
      if ($24) {
       _abort();
       // unreachable;
      }
      $25 = (($18) + 12|0);
      $26 = HEAP32[$25>>2]|0;
      $27 = ($26|0)==($16|0);
      if ($27) {
       HEAP32[$25>>2] = $14;
       HEAP32[$15>>2] = $18;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $28 = $12 << 3;
    $29 = $28 | 3;
    $30 = (($16) + 4|0);
    HEAP32[$30>>2] = $29;
    $$sum1112 = $28 | 4;
    $31 = (($16) + ($$sum1112)|0);
    $32 = HEAP32[$31>>2]|0;
    $33 = $32 | 1;
    HEAP32[$31>>2] = $33;
    $mem$0 = $17;
    STACKTOP = sp;return ($mem$0|0);
   }
   $34 = HEAP32[((72 + 8|0))>>2]|0;
   $35 = ($5>>>0)>($34>>>0);
   if ($35) {
    $36 = ($7|0)==(0);
    if (!($36)) {
     $37 = $7 << $4;
     $38 = 2 << $4;
     $39 = (0 - ($38))|0;
     $40 = $38 | $39;
     $41 = $37 & $40;
     $42 = (0 - ($41))|0;
     $43 = $41 & $42;
     $44 = (($43) + -1)|0;
     $45 = $44 >>> 12;
     $46 = $45 & 16;
     $47 = $44 >>> $46;
     $48 = $47 >>> 5;
     $49 = $48 & 8;
     $50 = $49 | $46;
     $51 = $47 >>> $49;
     $52 = $51 >>> 2;
     $53 = $52 & 4;
     $54 = $50 | $53;
     $55 = $51 >>> $53;
     $56 = $55 >>> 1;
     $57 = $56 & 2;
     $58 = $54 | $57;
     $59 = $55 >>> $57;
     $60 = $59 >>> 1;
     $61 = $60 & 1;
     $62 = $58 | $61;
     $63 = $59 >>> $61;
     $64 = (($62) + ($63))|0;
     $65 = $64 << 1;
     $66 = ((72 + ($65<<2)|0) + 40|0);
     $$sum4 = (($65) + 2)|0;
     $67 = ((72 + ($$sum4<<2)|0) + 40|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = (($68) + 8|0);
     $70 = HEAP32[$69>>2]|0;
     $71 = ($66|0)==($70|0);
     do {
      if ($71) {
       $72 = 1 << $64;
       $73 = $72 ^ -1;
       $74 = $6 & $73;
       HEAP32[72>>2] = $74;
      } else {
       $75 = HEAP32[((72 + 16|0))>>2]|0;
       $76 = ($70>>>0)<($75>>>0);
       if ($76) {
        _abort();
        // unreachable;
       }
       $77 = (($70) + 12|0);
       $78 = HEAP32[$77>>2]|0;
       $79 = ($78|0)==($68|0);
       if ($79) {
        HEAP32[$77>>2] = $66;
        HEAP32[$67>>2] = $70;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $80 = $64 << 3;
     $81 = (($80) - ($5))|0;
     $82 = $5 | 3;
     $83 = (($68) + 4|0);
     HEAP32[$83>>2] = $82;
     $84 = (($68) + ($5)|0);
     $85 = $81 | 1;
     $$sum56 = $5 | 4;
     $86 = (($68) + ($$sum56)|0);
     HEAP32[$86>>2] = $85;
     $87 = (($68) + ($80)|0);
     HEAP32[$87>>2] = $81;
     $88 = HEAP32[((72 + 8|0))>>2]|0;
     $89 = ($88|0)==(0);
     if (!($89)) {
      $90 = HEAP32[((72 + 20|0))>>2]|0;
      $91 = $88 >>> 3;
      $92 = $91 << 1;
      $93 = ((72 + ($92<<2)|0) + 40|0);
      $94 = HEAP32[72>>2]|0;
      $95 = 1 << $91;
      $96 = $94 & $95;
      $97 = ($96|0)==(0);
      if ($97) {
       $98 = $94 | $95;
       HEAP32[72>>2] = $98;
       $$sum8$pre = (($92) + 2)|0;
       $$pre = ((72 + ($$sum8$pre<<2)|0) + 40|0);
       $$pre$phiZ2D = $$pre;$F4$0 = $93;
      } else {
       $$sum9 = (($92) + 2)|0;
       $99 = ((72 + ($$sum9<<2)|0) + 40|0);
       $100 = HEAP32[$99>>2]|0;
       $101 = HEAP32[((72 + 16|0))>>2]|0;
       $102 = ($100>>>0)<($101>>>0);
       if ($102) {
        _abort();
        // unreachable;
       } else {
        $$pre$phiZ2D = $99;$F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D>>2] = $90;
      $103 = (($F4$0) + 12|0);
      HEAP32[$103>>2] = $90;
      $104 = (($90) + 8|0);
      HEAP32[$104>>2] = $F4$0;
      $105 = (($90) + 12|0);
      HEAP32[$105>>2] = $93;
     }
     HEAP32[((72 + 8|0))>>2] = $81;
     HEAP32[((72 + 20|0))>>2] = $84;
     $mem$0 = $69;
     STACKTOP = sp;return ($mem$0|0);
    }
    $106 = HEAP32[((72 + 4|0))>>2]|0;
    $107 = ($106|0)==(0);
    if ($107) {
     $nb$0 = $5;
    } else {
     $108 = (0 - ($106))|0;
     $109 = $106 & $108;
     $110 = (($109) + -1)|0;
     $111 = $110 >>> 12;
     $112 = $111 & 16;
     $113 = $110 >>> $112;
     $114 = $113 >>> 5;
     $115 = $114 & 8;
     $116 = $115 | $112;
     $117 = $113 >>> $115;
     $118 = $117 >>> 2;
     $119 = $118 & 4;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $121 >>> 1;
     $123 = $122 & 2;
     $124 = $120 | $123;
     $125 = $121 >>> $123;
     $126 = $125 >>> 1;
     $127 = $126 & 1;
     $128 = $124 | $127;
     $129 = $125 >>> $127;
     $130 = (($128) + ($129))|0;
     $131 = ((72 + ($130<<2)|0) + 304|0);
     $132 = HEAP32[$131>>2]|0;
     $133 = (($132) + 4|0);
     $134 = HEAP32[$133>>2]|0;
     $135 = $134 & -8;
     $136 = (($135) - ($5))|0;
     $rsize$0$i = $136;$t$0$i = $132;$v$0$i = $132;
     while(1) {
      $137 = (($t$0$i) + 16|0);
      $138 = HEAP32[$137>>2]|0;
      $139 = ($138|0)==(0|0);
      if ($139) {
       $140 = (($t$0$i) + 20|0);
       $141 = HEAP32[$140>>2]|0;
       $142 = ($141|0)==(0|0);
       if ($142) {
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $143 = (($144) + 4|0);
      $145 = HEAP32[$143>>2]|0;
      $146 = $145 & -8;
      $147 = (($146) - ($5))|0;
      $148 = ($147>>>0)<($rsize$0$i>>>0);
      $$rsize$0$i = $148 ? $147 : $rsize$0$i;
      $$v$0$i = $148 ? $144 : $v$0$i;
      $rsize$0$i = $$rsize$0$i;$t$0$i = $144;$v$0$i = $$v$0$i;
     }
     $149 = HEAP32[((72 + 16|0))>>2]|0;
     $150 = ($v$0$i>>>0)<($149>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($v$0$i) + ($5)|0);
     $152 = ($v$0$i>>>0)<($151>>>0);
     if (!($152)) {
      _abort();
      // unreachable;
     }
     $153 = (($v$0$i) + 24|0);
     $154 = HEAP32[$153>>2]|0;
     $155 = (($v$0$i) + 12|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==($v$0$i|0);
     do {
      if ($157) {
       $167 = (($v$0$i) + 20|0);
       $168 = HEAP32[$167>>2]|0;
       $169 = ($168|0)==(0|0);
       if ($169) {
        $170 = (($v$0$i) + 16|0);
        $171 = HEAP32[$170>>2]|0;
        $172 = ($171|0)==(0|0);
        if ($172) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;$RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;$RP$0$i = $167;
       }
       while(1) {
        $173 = (($R$0$i) + 20|0);
        $174 = HEAP32[$173>>2]|0;
        $175 = ($174|0)==(0|0);
        if (!($175)) {
         $R$0$i = $174;$RP$0$i = $173;
         continue;
        }
        $176 = (($R$0$i) + 16|0);
        $177 = HEAP32[$176>>2]|0;
        $178 = ($177|0)==(0|0);
        if ($178) {
         break;
        } else {
         $R$0$i = $177;$RP$0$i = $176;
        }
       }
       $179 = ($RP$0$i>>>0)<($149>>>0);
       if ($179) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP$0$i>>2] = 0;
        $R$1$i = $R$0$i;
        break;
       }
      } else {
       $158 = (($v$0$i) + 8|0);
       $159 = HEAP32[$158>>2]|0;
       $160 = ($159>>>0)<($149>>>0);
       if ($160) {
        _abort();
        // unreachable;
       }
       $161 = (($159) + 12|0);
       $162 = HEAP32[$161>>2]|0;
       $163 = ($162|0)==($v$0$i|0);
       if (!($163)) {
        _abort();
        // unreachable;
       }
       $164 = (($156) + 8|0);
       $165 = HEAP32[$164>>2]|0;
       $166 = ($165|0)==($v$0$i|0);
       if ($166) {
        HEAP32[$161>>2] = $156;
        HEAP32[$164>>2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $180 = ($154|0)==(0|0);
     do {
      if (!($180)) {
       $181 = (($v$0$i) + 28|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = ((72 + ($182<<2)|0) + 304|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($v$0$i|0)==($184|0);
       if ($185) {
        HEAP32[$183>>2] = $R$1$i;
        $cond$i = ($R$1$i|0)==(0|0);
        if ($cond$i) {
         $186 = 1 << $182;
         $187 = $186 ^ -1;
         $188 = HEAP32[((72 + 4|0))>>2]|0;
         $189 = $188 & $187;
         HEAP32[((72 + 4|0))>>2] = $189;
         break;
        }
       } else {
        $190 = HEAP32[((72 + 16|0))>>2]|0;
        $191 = ($154>>>0)<($190>>>0);
        if ($191) {
         _abort();
         // unreachable;
        }
        $192 = (($154) + 16|0);
        $193 = HEAP32[$192>>2]|0;
        $194 = ($193|0)==($v$0$i|0);
        if ($194) {
         HEAP32[$192>>2] = $R$1$i;
        } else {
         $195 = (($154) + 20|0);
         HEAP32[$195>>2] = $R$1$i;
        }
        $196 = ($R$1$i|0)==(0|0);
        if ($196) {
         break;
        }
       }
       $197 = HEAP32[((72 + 16|0))>>2]|0;
       $198 = ($R$1$i>>>0)<($197>>>0);
       if ($198) {
        _abort();
        // unreachable;
       }
       $199 = (($R$1$i) + 24|0);
       HEAP32[$199>>2] = $154;
       $200 = (($v$0$i) + 16|0);
       $201 = HEAP32[$200>>2]|0;
       $202 = ($201|0)==(0|0);
       do {
        if (!($202)) {
         $203 = HEAP32[((72 + 16|0))>>2]|0;
         $204 = ($201>>>0)<($203>>>0);
         if ($204) {
          _abort();
          // unreachable;
         } else {
          $205 = (($R$1$i) + 16|0);
          HEAP32[$205>>2] = $201;
          $206 = (($201) + 24|0);
          HEAP32[$206>>2] = $R$1$i;
          break;
         }
        }
       } while(0);
       $207 = (($v$0$i) + 20|0);
       $208 = HEAP32[$207>>2]|0;
       $209 = ($208|0)==(0|0);
       if (!($209)) {
        $210 = HEAP32[((72 + 16|0))>>2]|0;
        $211 = ($208>>>0)<($210>>>0);
        if ($211) {
         _abort();
         // unreachable;
        } else {
         $212 = (($R$1$i) + 20|0);
         HEAP32[$212>>2] = $208;
         $213 = (($208) + 24|0);
         HEAP32[$213>>2] = $R$1$i;
         break;
        }
       }
      }
     } while(0);
     $214 = ($rsize$0$i>>>0)<(16);
     if ($214) {
      $215 = (($rsize$0$i) + ($5))|0;
      $216 = $215 | 3;
      $217 = (($v$0$i) + 4|0);
      HEAP32[$217>>2] = $216;
      $$sum4$i = (($215) + 4)|0;
      $218 = (($v$0$i) + ($$sum4$i)|0);
      $219 = HEAP32[$218>>2]|0;
      $220 = $219 | 1;
      HEAP32[$218>>2] = $220;
     } else {
      $221 = $5 | 3;
      $222 = (($v$0$i) + 4|0);
      HEAP32[$222>>2] = $221;
      $223 = $rsize$0$i | 1;
      $$sum$i35 = $5 | 4;
      $224 = (($v$0$i) + ($$sum$i35)|0);
      HEAP32[$224>>2] = $223;
      $$sum1$i = (($rsize$0$i) + ($5))|0;
      $225 = (($v$0$i) + ($$sum1$i)|0);
      HEAP32[$225>>2] = $rsize$0$i;
      $226 = HEAP32[((72 + 8|0))>>2]|0;
      $227 = ($226|0)==(0);
      if (!($227)) {
       $228 = HEAP32[((72 + 20|0))>>2]|0;
       $229 = $226 >>> 3;
       $230 = $229 << 1;
       $231 = ((72 + ($230<<2)|0) + 40|0);
       $232 = HEAP32[72>>2]|0;
       $233 = 1 << $229;
       $234 = $232 & $233;
       $235 = ($234|0)==(0);
       if ($235) {
        $236 = $232 | $233;
        HEAP32[72>>2] = $236;
        $$sum2$pre$i = (($230) + 2)|0;
        $$pre$i = ((72 + ($$sum2$pre$i<<2)|0) + 40|0);
        $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $231;
       } else {
        $$sum3$i = (($230) + 2)|0;
        $237 = ((72 + ($$sum3$i<<2)|0) + 40|0);
        $238 = HEAP32[$237>>2]|0;
        $239 = HEAP32[((72 + 16|0))>>2]|0;
        $240 = ($238>>>0)<($239>>>0);
        if ($240) {
         _abort();
         // unreachable;
        } else {
         $$pre$phi$iZ2D = $237;$F1$0$i = $238;
        }
       }
       HEAP32[$$pre$phi$iZ2D>>2] = $228;
       $241 = (($F1$0$i) + 12|0);
       HEAP32[$241>>2] = $228;
       $242 = (($228) + 8|0);
       HEAP32[$242>>2] = $F1$0$i;
       $243 = (($228) + 12|0);
       HEAP32[$243>>2] = $231;
      }
      HEAP32[((72 + 8|0))>>2] = $rsize$0$i;
      HEAP32[((72 + 20|0))>>2] = $151;
     }
     $244 = (($v$0$i) + 8|0);
     $mem$0 = $244;
     STACKTOP = sp;return ($mem$0|0);
    }
   } else {
    $nb$0 = $5;
   }
  } else {
   $245 = ($bytes>>>0)>(4294967231);
   if ($245) {
    $nb$0 = -1;
   } else {
    $246 = (($bytes) + 11)|0;
    $247 = $246 & -8;
    $248 = HEAP32[((72 + 4|0))>>2]|0;
    $249 = ($248|0)==(0);
    if ($249) {
     $nb$0 = $247;
    } else {
     $250 = (0 - ($247))|0;
     $251 = $246 >>> 8;
     $252 = ($251|0)==(0);
     if ($252) {
      $idx$0$i = 0;
     } else {
      $253 = ($247>>>0)>(16777215);
      if ($253) {
       $idx$0$i = 31;
      } else {
       $254 = (($251) + 1048320)|0;
       $255 = $254 >>> 16;
       $256 = $255 & 8;
       $257 = $251 << $256;
       $258 = (($257) + 520192)|0;
       $259 = $258 >>> 16;
       $260 = $259 & 4;
       $261 = $260 | $256;
       $262 = $257 << $260;
       $263 = (($262) + 245760)|0;
       $264 = $263 >>> 16;
       $265 = $264 & 2;
       $266 = $261 | $265;
       $267 = (14 - ($266))|0;
       $268 = $262 << $265;
       $269 = $268 >>> 15;
       $270 = (($267) + ($269))|0;
       $271 = $270 << 1;
       $272 = (($270) + 7)|0;
       $273 = $247 >>> $272;
       $274 = $273 & 1;
       $275 = $274 | $271;
       $idx$0$i = $275;
      }
     }
     $276 = ((72 + ($idx$0$i<<2)|0) + 304|0);
     $277 = HEAP32[$276>>2]|0;
     $278 = ($277|0)==(0|0);
     L126: do {
      if ($278) {
       $rsize$2$i = $250;$t$1$i = 0;$v$2$i = 0;
      } else {
       $279 = ($idx$0$i|0)==(31);
       if ($279) {
        $283 = 0;
       } else {
        $280 = $idx$0$i >>> 1;
        $281 = (25 - ($280))|0;
        $283 = $281;
       }
       $282 = $247 << $283;
       $rsize$0$i15 = $250;$rst$0$i = 0;$sizebits$0$i = $282;$t$0$i14 = $277;$v$0$i16 = 0;
       while(1) {
        $284 = (($t$0$i14) + 4|0);
        $285 = HEAP32[$284>>2]|0;
        $286 = $285 & -8;
        $287 = (($286) - ($247))|0;
        $288 = ($287>>>0)<($rsize$0$i15>>>0);
        if ($288) {
         $289 = ($286|0)==($247|0);
         if ($289) {
          $rsize$2$i = $287;$t$1$i = $t$0$i14;$v$2$i = $t$0$i14;
          break L126;
         } else {
          $rsize$1$i = $287;$v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
        }
        $290 = (($t$0$i14) + 20|0);
        $291 = HEAP32[$290>>2]|0;
        $292 = $sizebits$0$i >>> 31;
        $293 = ((($t$0$i14) + ($292<<2)|0) + 16|0);
        $294 = HEAP32[$293>>2]|0;
        $295 = ($291|0)==(0|0);
        $296 = ($291|0)==($294|0);
        $or$cond$i = $295 | $296;
        $rst$1$i = $or$cond$i ? $rst$0$i : $291;
        $297 = ($294|0)==(0|0);
        $298 = $sizebits$0$i << 1;
        if ($297) {
         $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $298;$t$0$i14 = $294;$v$0$i16 = $v$1$i;
        }
       }
      }
     } while(0);
     $299 = ($t$1$i|0)==(0|0);
     $300 = ($v$2$i|0)==(0|0);
     $or$cond19$i = $299 & $300;
     if ($or$cond19$i) {
      $301 = 2 << $idx$0$i;
      $302 = (0 - ($301))|0;
      $303 = $301 | $302;
      $304 = $248 & $303;
      $305 = ($304|0)==(0);
      if ($305) {
       $nb$0 = $247;
       break;
      }
      $306 = (0 - ($304))|0;
      $307 = $304 & $306;
      $308 = (($307) + -1)|0;
      $309 = $308 >>> 12;
      $310 = $309 & 16;
      $311 = $308 >>> $310;
      $312 = $311 >>> 5;
      $313 = $312 & 8;
      $314 = $313 | $310;
      $315 = $311 >>> $313;
      $316 = $315 >>> 2;
      $317 = $316 & 4;
      $318 = $314 | $317;
      $319 = $315 >>> $317;
      $320 = $319 >>> 1;
      $321 = $320 & 2;
      $322 = $318 | $321;
      $323 = $319 >>> $321;
      $324 = $323 >>> 1;
      $325 = $324 & 1;
      $326 = $322 | $325;
      $327 = $323 >>> $325;
      $328 = (($326) + ($327))|0;
      $329 = ((72 + ($328<<2)|0) + 304|0);
      $330 = HEAP32[$329>>2]|0;
      $t$2$ph$i = $330;
     } else {
      $t$2$ph$i = $t$1$i;
     }
     $331 = ($t$2$ph$i|0)==(0|0);
     if ($331) {
      $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
     } else {
      $rsize$329$i = $rsize$2$i;$t$228$i = $t$2$ph$i;$v$330$i = $v$2$i;
      while(1) {
       $332 = (($t$228$i) + 4|0);
       $333 = HEAP32[$332>>2]|0;
       $334 = $333 & -8;
       $335 = (($334) - ($247))|0;
       $336 = ($335>>>0)<($rsize$329$i>>>0);
       $$rsize$3$i = $336 ? $335 : $rsize$329$i;
       $t$2$v$3$i = $336 ? $t$228$i : $v$330$i;
       $337 = (($t$228$i) + 16|0);
       $338 = HEAP32[$337>>2]|0;
       $339 = ($338|0)==(0|0);
       if (!($339)) {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $338;$v$330$i = $t$2$v$3$i;
        continue;
       }
       $340 = (($t$228$i) + 20|0);
       $341 = HEAP32[$340>>2]|0;
       $342 = ($341|0)==(0|0);
       if ($342) {
        $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $341;$v$330$i = $t$2$v$3$i;
       }
      }
     }
     $343 = ($v$3$lcssa$i|0)==(0|0);
     if ($343) {
      $nb$0 = $247;
     } else {
      $344 = HEAP32[((72 + 8|0))>>2]|0;
      $345 = (($344) - ($247))|0;
      $346 = ($rsize$3$lcssa$i>>>0)<($345>>>0);
      if ($346) {
       $347 = HEAP32[((72 + 16|0))>>2]|0;
       $348 = ($v$3$lcssa$i>>>0)<($347>>>0);
       if ($348) {
        _abort();
        // unreachable;
       }
       $349 = (($v$3$lcssa$i) + ($247)|0);
       $350 = ($v$3$lcssa$i>>>0)<($349>>>0);
       if (!($350)) {
        _abort();
        // unreachable;
       }
       $351 = (($v$3$lcssa$i) + 24|0);
       $352 = HEAP32[$351>>2]|0;
       $353 = (($v$3$lcssa$i) + 12|0);
       $354 = HEAP32[$353>>2]|0;
       $355 = ($354|0)==($v$3$lcssa$i|0);
       do {
        if ($355) {
         $365 = (($v$3$lcssa$i) + 20|0);
         $366 = HEAP32[$365>>2]|0;
         $367 = ($366|0)==(0|0);
         if ($367) {
          $368 = (($v$3$lcssa$i) + 16|0);
          $369 = HEAP32[$368>>2]|0;
          $370 = ($369|0)==(0|0);
          if ($370) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $369;$RP$0$i17 = $368;
          }
         } else {
          $R$0$i18 = $366;$RP$0$i17 = $365;
         }
         while(1) {
          $371 = (($R$0$i18) + 20|0);
          $372 = HEAP32[$371>>2]|0;
          $373 = ($372|0)==(0|0);
          if (!($373)) {
           $R$0$i18 = $372;$RP$0$i17 = $371;
           continue;
          }
          $374 = (($R$0$i18) + 16|0);
          $375 = HEAP32[$374>>2]|0;
          $376 = ($375|0)==(0|0);
          if ($376) {
           break;
          } else {
           $R$0$i18 = $375;$RP$0$i17 = $374;
          }
         }
         $377 = ($RP$0$i17>>>0)<($347>>>0);
         if ($377) {
          _abort();
          // unreachable;
         } else {
          HEAP32[$RP$0$i17>>2] = 0;
          $R$1$i20 = $R$0$i18;
          break;
         }
        } else {
         $356 = (($v$3$lcssa$i) + 8|0);
         $357 = HEAP32[$356>>2]|0;
         $358 = ($357>>>0)<($347>>>0);
         if ($358) {
          _abort();
          // unreachable;
         }
         $359 = (($357) + 12|0);
         $360 = HEAP32[$359>>2]|0;
         $361 = ($360|0)==($v$3$lcssa$i|0);
         if (!($361)) {
          _abort();
          // unreachable;
         }
         $362 = (($354) + 8|0);
         $363 = HEAP32[$362>>2]|0;
         $364 = ($363|0)==($v$3$lcssa$i|0);
         if ($364) {
          HEAP32[$359>>2] = $354;
          HEAP32[$362>>2] = $357;
          $R$1$i20 = $354;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $378 = ($352|0)==(0|0);
       do {
        if (!($378)) {
         $379 = (($v$3$lcssa$i) + 28|0);
         $380 = HEAP32[$379>>2]|0;
         $381 = ((72 + ($380<<2)|0) + 304|0);
         $382 = HEAP32[$381>>2]|0;
         $383 = ($v$3$lcssa$i|0)==($382|0);
         if ($383) {
          HEAP32[$381>>2] = $R$1$i20;
          $cond$i21 = ($R$1$i20|0)==(0|0);
          if ($cond$i21) {
           $384 = 1 << $380;
           $385 = $384 ^ -1;
           $386 = HEAP32[((72 + 4|0))>>2]|0;
           $387 = $386 & $385;
           HEAP32[((72 + 4|0))>>2] = $387;
           break;
          }
         } else {
          $388 = HEAP32[((72 + 16|0))>>2]|0;
          $389 = ($352>>>0)<($388>>>0);
          if ($389) {
           _abort();
           // unreachable;
          }
          $390 = (($352) + 16|0);
          $391 = HEAP32[$390>>2]|0;
          $392 = ($391|0)==($v$3$lcssa$i|0);
          if ($392) {
           HEAP32[$390>>2] = $R$1$i20;
          } else {
           $393 = (($352) + 20|0);
           HEAP32[$393>>2] = $R$1$i20;
          }
          $394 = ($R$1$i20|0)==(0|0);
          if ($394) {
           break;
          }
         }
         $395 = HEAP32[((72 + 16|0))>>2]|0;
         $396 = ($R$1$i20>>>0)<($395>>>0);
         if ($396) {
          _abort();
          // unreachable;
         }
         $397 = (($R$1$i20) + 24|0);
         HEAP32[$397>>2] = $352;
         $398 = (($v$3$lcssa$i) + 16|0);
         $399 = HEAP32[$398>>2]|0;
         $400 = ($399|0)==(0|0);
         do {
          if (!($400)) {
           $401 = HEAP32[((72 + 16|0))>>2]|0;
           $402 = ($399>>>0)<($401>>>0);
           if ($402) {
            _abort();
            // unreachable;
           } else {
            $403 = (($R$1$i20) + 16|0);
            HEAP32[$403>>2] = $399;
            $404 = (($399) + 24|0);
            HEAP32[$404>>2] = $R$1$i20;
            break;
           }
          }
         } while(0);
         $405 = (($v$3$lcssa$i) + 20|0);
         $406 = HEAP32[$405>>2]|0;
         $407 = ($406|0)==(0|0);
         if (!($407)) {
          $408 = HEAP32[((72 + 16|0))>>2]|0;
          $409 = ($406>>>0)<($408>>>0);
          if ($409) {
           _abort();
           // unreachable;
          } else {
           $410 = (($R$1$i20) + 20|0);
           HEAP32[$410>>2] = $406;
           $411 = (($406) + 24|0);
           HEAP32[$411>>2] = $R$1$i20;
           break;
          }
         }
        }
       } while(0);
       $412 = ($rsize$3$lcssa$i>>>0)<(16);
       L204: do {
        if ($412) {
         $413 = (($rsize$3$lcssa$i) + ($247))|0;
         $414 = $413 | 3;
         $415 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$415>>2] = $414;
         $$sum18$i = (($413) + 4)|0;
         $416 = (($v$3$lcssa$i) + ($$sum18$i)|0);
         $417 = HEAP32[$416>>2]|0;
         $418 = $417 | 1;
         HEAP32[$416>>2] = $418;
        } else {
         $419 = $247 | 3;
         $420 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$420>>2] = $419;
         $421 = $rsize$3$lcssa$i | 1;
         $$sum$i2334 = $247 | 4;
         $422 = (($v$3$lcssa$i) + ($$sum$i2334)|0);
         HEAP32[$422>>2] = $421;
         $$sum1$i24 = (($rsize$3$lcssa$i) + ($247))|0;
         $423 = (($v$3$lcssa$i) + ($$sum1$i24)|0);
         HEAP32[$423>>2] = $rsize$3$lcssa$i;
         $424 = $rsize$3$lcssa$i >>> 3;
         $425 = ($rsize$3$lcssa$i>>>0)<(256);
         if ($425) {
          $426 = $424 << 1;
          $427 = ((72 + ($426<<2)|0) + 40|0);
          $428 = HEAP32[72>>2]|0;
          $429 = 1 << $424;
          $430 = $428 & $429;
          $431 = ($430|0)==(0);
          do {
           if ($431) {
            $432 = $428 | $429;
            HEAP32[72>>2] = $432;
            $$sum14$pre$i = (($426) + 2)|0;
            $$pre$i25 = ((72 + ($$sum14$pre$i<<2)|0) + 40|0);
            $$pre$phi$i26Z2D = $$pre$i25;$F5$0$i = $427;
           } else {
            $$sum17$i = (($426) + 2)|0;
            $433 = ((72 + ($$sum17$i<<2)|0) + 40|0);
            $434 = HEAP32[$433>>2]|0;
            $435 = HEAP32[((72 + 16|0))>>2]|0;
            $436 = ($434>>>0)<($435>>>0);
            if (!($436)) {
             $$pre$phi$i26Z2D = $433;$F5$0$i = $434;
             break;
            }
            _abort();
            // unreachable;
           }
          } while(0);
          HEAP32[$$pre$phi$i26Z2D>>2] = $349;
          $437 = (($F5$0$i) + 12|0);
          HEAP32[$437>>2] = $349;
          $$sum15$i = (($247) + 8)|0;
          $438 = (($v$3$lcssa$i) + ($$sum15$i)|0);
          HEAP32[$438>>2] = $F5$0$i;
          $$sum16$i = (($247) + 12)|0;
          $439 = (($v$3$lcssa$i) + ($$sum16$i)|0);
          HEAP32[$439>>2] = $427;
          break;
         }
         $440 = $rsize$3$lcssa$i >>> 8;
         $441 = ($440|0)==(0);
         if ($441) {
          $I7$0$i = 0;
         } else {
          $442 = ($rsize$3$lcssa$i>>>0)>(16777215);
          if ($442) {
           $I7$0$i = 31;
          } else {
           $443 = (($440) + 1048320)|0;
           $444 = $443 >>> 16;
           $445 = $444 & 8;
           $446 = $440 << $445;
           $447 = (($446) + 520192)|0;
           $448 = $447 >>> 16;
           $449 = $448 & 4;
           $450 = $449 | $445;
           $451 = $446 << $449;
           $452 = (($451) + 245760)|0;
           $453 = $452 >>> 16;
           $454 = $453 & 2;
           $455 = $450 | $454;
           $456 = (14 - ($455))|0;
           $457 = $451 << $454;
           $458 = $457 >>> 15;
           $459 = (($456) + ($458))|0;
           $460 = $459 << 1;
           $461 = (($459) + 7)|0;
           $462 = $rsize$3$lcssa$i >>> $461;
           $463 = $462 & 1;
           $464 = $463 | $460;
           $I7$0$i = $464;
          }
         }
         $465 = ((72 + ($I7$0$i<<2)|0) + 304|0);
         $$sum2$i = (($247) + 28)|0;
         $466 = (($v$3$lcssa$i) + ($$sum2$i)|0);
         HEAP32[$466>>2] = $I7$0$i;
         $$sum3$i27 = (($247) + 16)|0;
         $467 = (($v$3$lcssa$i) + ($$sum3$i27)|0);
         $$sum4$i28 = (($247) + 20)|0;
         $468 = (($v$3$lcssa$i) + ($$sum4$i28)|0);
         HEAP32[$468>>2] = 0;
         HEAP32[$467>>2] = 0;
         $469 = HEAP32[((72 + 4|0))>>2]|0;
         $470 = 1 << $I7$0$i;
         $471 = $469 & $470;
         $472 = ($471|0)==(0);
         if ($472) {
          $473 = $469 | $470;
          HEAP32[((72 + 4|0))>>2] = $473;
          HEAP32[$465>>2] = $349;
          $$sum5$i = (($247) + 24)|0;
          $474 = (($v$3$lcssa$i) + ($$sum5$i)|0);
          HEAP32[$474>>2] = $465;
          $$sum6$i = (($247) + 12)|0;
          $475 = (($v$3$lcssa$i) + ($$sum6$i)|0);
          HEAP32[$475>>2] = $349;
          $$sum7$i = (($247) + 8)|0;
          $476 = (($v$3$lcssa$i) + ($$sum7$i)|0);
          HEAP32[$476>>2] = $349;
          break;
         }
         $477 = HEAP32[$465>>2]|0;
         $478 = ($I7$0$i|0)==(31);
         if ($478) {
          $486 = 0;
         } else {
          $479 = $I7$0$i >>> 1;
          $480 = (25 - ($479))|0;
          $486 = $480;
         }
         $481 = (($477) + 4|0);
         $482 = HEAP32[$481>>2]|0;
         $483 = $482 & -8;
         $484 = ($483|0)==($rsize$3$lcssa$i|0);
         L225: do {
          if ($484) {
           $T$0$lcssa$i = $477;
          } else {
           $485 = $rsize$3$lcssa$i << $486;
           $K12$025$i = $485;$T$024$i = $477;
           while(1) {
            $493 = $K12$025$i >>> 31;
            $494 = ((($T$024$i) + ($493<<2)|0) + 16|0);
            $489 = HEAP32[$494>>2]|0;
            $495 = ($489|0)==(0|0);
            if ($495) {
             break;
            }
            $487 = $K12$025$i << 1;
            $488 = (($489) + 4|0);
            $490 = HEAP32[$488>>2]|0;
            $491 = $490 & -8;
            $492 = ($491|0)==($rsize$3$lcssa$i|0);
            if ($492) {
             $T$0$lcssa$i = $489;
             break L225;
            } else {
             $K12$025$i = $487;$T$024$i = $489;
            }
           }
           $496 = HEAP32[((72 + 16|0))>>2]|0;
           $497 = ($494>>>0)<($496>>>0);
           if ($497) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$494>>2] = $349;
            $$sum11$i = (($247) + 24)|0;
            $498 = (($v$3$lcssa$i) + ($$sum11$i)|0);
            HEAP32[$498>>2] = $T$024$i;
            $$sum12$i = (($247) + 12)|0;
            $499 = (($v$3$lcssa$i) + ($$sum12$i)|0);
            HEAP32[$499>>2] = $349;
            $$sum13$i = (($247) + 8)|0;
            $500 = (($v$3$lcssa$i) + ($$sum13$i)|0);
            HEAP32[$500>>2] = $349;
            break L204;
           }
          }
         } while(0);
         $501 = (($T$0$lcssa$i) + 8|0);
         $502 = HEAP32[$501>>2]|0;
         $503 = HEAP32[((72 + 16|0))>>2]|0;
         $504 = ($T$0$lcssa$i>>>0)<($503>>>0);
         if ($504) {
          _abort();
          // unreachable;
         }
         $505 = ($502>>>0)<($503>>>0);
         if ($505) {
          _abort();
          // unreachable;
         } else {
          $506 = (($502) + 12|0);
          HEAP32[$506>>2] = $349;
          HEAP32[$501>>2] = $349;
          $$sum8$i = (($247) + 8)|0;
          $507 = (($v$3$lcssa$i) + ($$sum8$i)|0);
          HEAP32[$507>>2] = $502;
          $$sum9$i = (($247) + 12)|0;
          $508 = (($v$3$lcssa$i) + ($$sum9$i)|0);
          HEAP32[$508>>2] = $T$0$lcssa$i;
          $$sum10$i = (($247) + 24)|0;
          $509 = (($v$3$lcssa$i) + ($$sum10$i)|0);
          HEAP32[$509>>2] = 0;
          break;
         }
        }
       } while(0);
       $510 = (($v$3$lcssa$i) + 8|0);
       $mem$0 = $510;
       STACKTOP = sp;return ($mem$0|0);
      } else {
       $nb$0 = $247;
      }
     }
    }
   }
  }
 } while(0);
 $511 = HEAP32[((72 + 8|0))>>2]|0;
 $512 = ($nb$0>>>0)>($511>>>0);
 if (!($512)) {
  $513 = (($511) - ($nb$0))|0;
  $514 = HEAP32[((72 + 20|0))>>2]|0;
  $515 = ($513>>>0)>(15);
  if ($515) {
   $516 = (($514) + ($nb$0)|0);
   HEAP32[((72 + 20|0))>>2] = $516;
   HEAP32[((72 + 8|0))>>2] = $513;
   $517 = $513 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $518 = (($514) + ($$sum2)|0);
   HEAP32[$518>>2] = $517;
   $519 = (($514) + ($511)|0);
   HEAP32[$519>>2] = $513;
   $520 = $nb$0 | 3;
   $521 = (($514) + 4|0);
   HEAP32[$521>>2] = $520;
  } else {
   HEAP32[((72 + 8|0))>>2] = 0;
   HEAP32[((72 + 20|0))>>2] = 0;
   $522 = $511 | 3;
   $523 = (($514) + 4|0);
   HEAP32[$523>>2] = $522;
   $$sum1 = (($511) + 4)|0;
   $524 = (($514) + ($$sum1)|0);
   $525 = HEAP32[$524>>2]|0;
   $526 = $525 | 1;
   HEAP32[$524>>2] = $526;
  }
  $527 = (($514) + 8|0);
  $mem$0 = $527;
  STACKTOP = sp;return ($mem$0|0);
 }
 $528 = HEAP32[((72 + 12|0))>>2]|0;
 $529 = ($nb$0>>>0)<($528>>>0);
 if ($529) {
  $530 = (($528) - ($nb$0))|0;
  HEAP32[((72 + 12|0))>>2] = $530;
  $531 = HEAP32[((72 + 24|0))>>2]|0;
  $532 = (($531) + ($nb$0)|0);
  HEAP32[((72 + 24|0))>>2] = $532;
  $533 = $530 | 1;
  $$sum = (($nb$0) + 4)|0;
  $534 = (($531) + ($$sum)|0);
  HEAP32[$534>>2] = $533;
  $535 = $nb$0 | 3;
  $536 = (($531) + 4|0);
  HEAP32[$536>>2] = $535;
  $537 = (($531) + 8|0);
  $mem$0 = $537;
  STACKTOP = sp;return ($mem$0|0);
 }
 $538 = HEAP32[544>>2]|0;
 $539 = ($538|0)==(0);
 do {
  if ($539) {
   $540 = (_sysconf(30)|0);
   $541 = (($540) + -1)|0;
   $542 = $541 & $540;
   $543 = ($542|0)==(0);
   if ($543) {
    HEAP32[((544 + 8|0))>>2] = $540;
    HEAP32[((544 + 4|0))>>2] = $540;
    HEAP32[((544 + 12|0))>>2] = -1;
    HEAP32[((544 + 16|0))>>2] = -1;
    HEAP32[((544 + 20|0))>>2] = 0;
    HEAP32[((72 + 444|0))>>2] = 0;
    $544 = (_time((0|0))|0);
    $545 = $544 & -16;
    $546 = $545 ^ 1431655768;
    HEAP32[544>>2] = $546;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $547 = (($nb$0) + 48)|0;
 $548 = HEAP32[((544 + 8|0))>>2]|0;
 $549 = (($nb$0) + 47)|0;
 $550 = (($548) + ($549))|0;
 $551 = (0 - ($548))|0;
 $552 = $550 & $551;
 $553 = ($552>>>0)>($nb$0>>>0);
 if (!($553)) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $554 = HEAP32[((72 + 440|0))>>2]|0;
 $555 = ($554|0)==(0);
 if (!($555)) {
  $556 = HEAP32[((72 + 432|0))>>2]|0;
  $557 = (($556) + ($552))|0;
  $558 = ($557>>>0)<=($556>>>0);
  $559 = ($557>>>0)>($554>>>0);
  $or$cond1$i = $558 | $559;
  if ($or$cond1$i) {
   $mem$0 = 0;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $560 = HEAP32[((72 + 444|0))>>2]|0;
 $561 = $560 & 4;
 $562 = ($561|0)==(0);
 L269: do {
  if ($562) {
   $563 = HEAP32[((72 + 24|0))>>2]|0;
   $564 = ($563|0)==(0|0);
   L271: do {
    if ($564) {
     label = 182;
    } else {
     $sp$0$i$i = ((72 + 448|0));
     while(1) {
      $565 = HEAP32[$sp$0$i$i>>2]|0;
      $566 = ($565>>>0)>($563>>>0);
      if (!($566)) {
       $567 = (($sp$0$i$i) + 4|0);
       $568 = HEAP32[$567>>2]|0;
       $569 = (($565) + ($568)|0);
       $570 = ($569>>>0)>($563>>>0);
       if ($570) {
        break;
       }
      }
      $571 = (($sp$0$i$i) + 8|0);
      $572 = HEAP32[$571>>2]|0;
      $573 = ($572|0)==(0|0);
      if ($573) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $572;
      }
     }
     $574 = ($sp$0$i$i|0)==(0|0);
     if ($574) {
      label = 182;
     } else {
      $597 = HEAP32[((72 + 12|0))>>2]|0;
      $598 = (($550) - ($597))|0;
      $599 = $598 & $551;
      $600 = ($599>>>0)<(2147483647);
      if ($600) {
       $601 = (_sbrk(($599|0))|0);
       $602 = HEAP32[$sp$0$i$i>>2]|0;
       $603 = HEAP32[$567>>2]|0;
       $604 = (($602) + ($603)|0);
       $605 = ($601|0)==($604|0);
       $$3$i = $605 ? $599 : 0;
       $$4$i = $605 ? $601 : (-1);
       $br$0$i = $601;$ssize$1$i = $599;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $575 = (_sbrk(0)|0);
     $576 = ($575|0)==((-1)|0);
     if ($576) {
      $tsize$0323841$i = 0;
     } else {
      $577 = $575;
      $578 = HEAP32[((544 + 4|0))>>2]|0;
      $579 = (($578) + -1)|0;
      $580 = $579 & $577;
      $581 = ($580|0)==(0);
      if ($581) {
       $ssize$0$i = $552;
      } else {
       $582 = (($579) + ($577))|0;
       $583 = (0 - ($578))|0;
       $584 = $582 & $583;
       $585 = (($552) - ($577))|0;
       $586 = (($585) + ($584))|0;
       $ssize$0$i = $586;
      }
      $587 = HEAP32[((72 + 432|0))>>2]|0;
      $588 = (($587) + ($ssize$0$i))|0;
      $589 = ($ssize$0$i>>>0)>($nb$0>>>0);
      $590 = ($ssize$0$i>>>0)<(2147483647);
      $or$cond$i29 = $589 & $590;
      if ($or$cond$i29) {
       $591 = HEAP32[((72 + 440|0))>>2]|0;
       $592 = ($591|0)==(0);
       if (!($592)) {
        $593 = ($588>>>0)<=($587>>>0);
        $594 = ($588>>>0)>($591>>>0);
        $or$cond2$i = $593 | $594;
        if ($or$cond2$i) {
         $tsize$0323841$i = 0;
         break;
        }
       }
       $595 = (_sbrk(($ssize$0$i|0))|0);
       $596 = ($595|0)==($575|0);
       $ssize$0$$i = $596 ? $ssize$0$i : 0;
       $$$i = $596 ? $575 : (-1);
       $br$0$i = $595;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     $606 = (0 - ($ssize$1$i))|0;
     $607 = ($tbase$0$i|0)==((-1)|0);
     if (!($607)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $608 = ($br$0$i|0)!=((-1)|0);
     $609 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $608 & $609;
     $610 = ($ssize$1$i>>>0)<($547>>>0);
     $or$cond6$i = $or$cond5$i & $610;
     do {
      if ($or$cond6$i) {
       $611 = HEAP32[((544 + 8|0))>>2]|0;
       $612 = (($549) - ($ssize$1$i))|0;
       $613 = (($612) + ($611))|0;
       $614 = (0 - ($611))|0;
       $615 = $613 & $614;
       $616 = ($615>>>0)<(2147483647);
       if ($616) {
        $617 = (_sbrk(($615|0))|0);
        $618 = ($617|0)==((-1)|0);
        if ($618) {
         (_sbrk(($606|0))|0);
         $tsize$0323841$i = $tsize$0$i;
         break L291;
        } else {
         $619 = (($615) + ($ssize$1$i))|0;
         $ssize$2$i = $619;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$i;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while(0);
     $620 = ($br$0$i|0)==((-1)|0);
     if ($620) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   $621 = HEAP32[((72 + 444|0))>>2]|0;
   $622 = $621 | 4;
   HEAP32[((72 + 444|0))>>2] = $622;
   $tsize$1$i = $tsize$0323841$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while(0);
 if ((label|0) == 199) {
  $623 = ($552>>>0)<(2147483647);
  if ($623) {
   $624 = (_sbrk(($552|0))|0);
   $625 = (_sbrk(0)|0);
   $notlhs$i = ($624|0)!=((-1)|0);
   $notrhs$i = ($625|0)!=((-1)|0);
   $or$cond8$not$i = $notrhs$i & $notlhs$i;
   $626 = ($624>>>0)<($625>>>0);
   $or$cond9$i = $or$cond8$not$i & $626;
   if ($or$cond9$i) {
    $627 = $625;
    $628 = $624;
    $629 = (($627) - ($628))|0;
    $630 = (($nb$0) + 40)|0;
    $631 = ($629>>>0)>($630>>>0);
    $$tsize$1$i = $631 ? $629 : $tsize$1$i;
    if ($631) {
     $tbase$247$i = $624;$tsize$246$i = $$tsize$1$i;
     label = 202;
    }
   }
  }
 }
 if ((label|0) == 202) {
  $632 = HEAP32[((72 + 432|0))>>2]|0;
  $633 = (($632) + ($tsize$246$i))|0;
  HEAP32[((72 + 432|0))>>2] = $633;
  $634 = HEAP32[((72 + 436|0))>>2]|0;
  $635 = ($633>>>0)>($634>>>0);
  if ($635) {
   HEAP32[((72 + 436|0))>>2] = $633;
  }
  $636 = HEAP32[((72 + 24|0))>>2]|0;
  $637 = ($636|0)==(0|0);
  L311: do {
   if ($637) {
    $638 = HEAP32[((72 + 16|0))>>2]|0;
    $639 = ($638|0)==(0|0);
    $640 = ($tbase$247$i>>>0)<($638>>>0);
    $or$cond10$i = $639 | $640;
    if ($or$cond10$i) {
     HEAP32[((72 + 16|0))>>2] = $tbase$247$i;
    }
    HEAP32[((72 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((72 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((72 + 460|0))>>2] = 0;
    $641 = HEAP32[544>>2]|0;
    HEAP32[((72 + 36|0))>>2] = $641;
    HEAP32[((72 + 32|0))>>2] = -1;
    $i$02$i$i = 0;
    while(1) {
     $642 = $i$02$i$i << 1;
     $643 = ((72 + ($642<<2)|0) + 40|0);
     $$sum$i$i = (($642) + 3)|0;
     $644 = ((72 + ($$sum$i$i<<2)|0) + 40|0);
     HEAP32[$644>>2] = $643;
     $$sum1$i$i = (($642) + 2)|0;
     $645 = ((72 + ($$sum1$i$i<<2)|0) + 40|0);
     HEAP32[$645>>2] = $643;
     $646 = (($i$02$i$i) + 1)|0;
     $exitcond$i$i = ($646|0)==(32);
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i = $646;
     }
    }
    $647 = (($tsize$246$i) + -40)|0;
    $648 = (($tbase$247$i) + 8|0);
    $649 = $648;
    $650 = $649 & 7;
    $651 = ($650|0)==(0);
    if ($651) {
     $655 = 0;
    } else {
     $652 = (0 - ($649))|0;
     $653 = $652 & 7;
     $655 = $653;
    }
    $654 = (($tbase$247$i) + ($655)|0);
    $656 = (($647) - ($655))|0;
    HEAP32[((72 + 24|0))>>2] = $654;
    HEAP32[((72 + 12|0))>>2] = $656;
    $657 = $656 | 1;
    $$sum$i14$i = (($655) + 4)|0;
    $658 = (($tbase$247$i) + ($$sum$i14$i)|0);
    HEAP32[$658>>2] = $657;
    $$sum2$i$i = (($tsize$246$i) + -36)|0;
    $659 = (($tbase$247$i) + ($$sum2$i$i)|0);
    HEAP32[$659>>2] = 40;
    $660 = HEAP32[((544 + 16|0))>>2]|0;
    HEAP32[((72 + 28|0))>>2] = $660;
   } else {
    $sp$075$i = ((72 + 448|0));
    while(1) {
     $661 = HEAP32[$sp$075$i>>2]|0;
     $662 = (($sp$075$i) + 4|0);
     $663 = HEAP32[$662>>2]|0;
     $664 = (($661) + ($663)|0);
     $665 = ($tbase$247$i|0)==($664|0);
     if ($665) {
      label = 214;
      break;
     }
     $666 = (($sp$075$i) + 8|0);
     $667 = HEAP32[$666>>2]|0;
     $668 = ($667|0)==(0|0);
     if ($668) {
      break;
     } else {
      $sp$075$i = $667;
     }
    }
    if ((label|0) == 214) {
     $669 = (($sp$075$i) + 12|0);
     $670 = HEAP32[$669>>2]|0;
     $671 = $670 & 8;
     $672 = ($671|0)==(0);
     if ($672) {
      $673 = ($636>>>0)>=($661>>>0);
      $674 = ($636>>>0)<($tbase$247$i>>>0);
      $or$cond49$i = $673 & $674;
      if ($or$cond49$i) {
       $675 = (($663) + ($tsize$246$i))|0;
       HEAP32[$662>>2] = $675;
       $676 = HEAP32[((72 + 12|0))>>2]|0;
       $677 = (($676) + ($tsize$246$i))|0;
       $678 = (($636) + 8|0);
       $679 = $678;
       $680 = $679 & 7;
       $681 = ($680|0)==(0);
       if ($681) {
        $685 = 0;
       } else {
        $682 = (0 - ($679))|0;
        $683 = $682 & 7;
        $685 = $683;
       }
       $684 = (($636) + ($685)|0);
       $686 = (($677) - ($685))|0;
       HEAP32[((72 + 24|0))>>2] = $684;
       HEAP32[((72 + 12|0))>>2] = $686;
       $687 = $686 | 1;
       $$sum$i18$i = (($685) + 4)|0;
       $688 = (($636) + ($$sum$i18$i)|0);
       HEAP32[$688>>2] = $687;
       $$sum2$i19$i = (($677) + 4)|0;
       $689 = (($636) + ($$sum2$i19$i)|0);
       HEAP32[$689>>2] = 40;
       $690 = HEAP32[((544 + 16|0))>>2]|0;
       HEAP32[((72 + 28|0))>>2] = $690;
       break;
      }
     }
    }
    $691 = HEAP32[((72 + 16|0))>>2]|0;
    $692 = ($tbase$247$i>>>0)<($691>>>0);
    if ($692) {
     HEAP32[((72 + 16|0))>>2] = $tbase$247$i;
    }
    $693 = (($tbase$247$i) + ($tsize$246$i)|0);
    $sp$168$i = ((72 + 448|0));
    while(1) {
     $694 = HEAP32[$sp$168$i>>2]|0;
     $695 = ($694|0)==($693|0);
     if ($695) {
      label = 224;
      break;
     }
     $696 = (($sp$168$i) + 8|0);
     $697 = HEAP32[$696>>2]|0;
     $698 = ($697|0)==(0|0);
     if ($698) {
      break;
     } else {
      $sp$168$i = $697;
     }
    }
    if ((label|0) == 224) {
     $699 = (($sp$168$i) + 12|0);
     $700 = HEAP32[$699>>2]|0;
     $701 = $700 & 8;
     $702 = ($701|0)==(0);
     if ($702) {
      HEAP32[$sp$168$i>>2] = $tbase$247$i;
      $703 = (($sp$168$i) + 4|0);
      $704 = HEAP32[$703>>2]|0;
      $705 = (($704) + ($tsize$246$i))|0;
      HEAP32[$703>>2] = $705;
      $706 = (($tbase$247$i) + 8|0);
      $707 = $706;
      $708 = $707 & 7;
      $709 = ($708|0)==(0);
      if ($709) {
       $713 = 0;
      } else {
       $710 = (0 - ($707))|0;
       $711 = $710 & 7;
       $713 = $711;
      }
      $712 = (($tbase$247$i) + ($713)|0);
      $$sum107$i = (($tsize$246$i) + 8)|0;
      $714 = (($tbase$247$i) + ($$sum107$i)|0);
      $715 = $714;
      $716 = $715 & 7;
      $717 = ($716|0)==(0);
      if ($717) {
       $720 = 0;
      } else {
       $718 = (0 - ($715))|0;
       $719 = $718 & 7;
       $720 = $719;
      }
      $$sum108$i = (($720) + ($tsize$246$i))|0;
      $721 = (($tbase$247$i) + ($$sum108$i)|0);
      $722 = $721;
      $723 = $712;
      $724 = (($722) - ($723))|0;
      $$sum$i21$i = (($713) + ($nb$0))|0;
      $725 = (($tbase$247$i) + ($$sum$i21$i)|0);
      $726 = (($724) - ($nb$0))|0;
      $727 = $nb$0 | 3;
      $$sum1$i22$i = (($713) + 4)|0;
      $728 = (($tbase$247$i) + ($$sum1$i22$i)|0);
      HEAP32[$728>>2] = $727;
      $729 = HEAP32[((72 + 24|0))>>2]|0;
      $730 = ($721|0)==($729|0);
      L348: do {
       if ($730) {
        $731 = HEAP32[((72 + 12|0))>>2]|0;
        $732 = (($731) + ($726))|0;
        HEAP32[((72 + 12|0))>>2] = $732;
        HEAP32[((72 + 24|0))>>2] = $725;
        $733 = $732 | 1;
        $$sum42$i$i = (($$sum$i21$i) + 4)|0;
        $734 = (($tbase$247$i) + ($$sum42$i$i)|0);
        HEAP32[$734>>2] = $733;
       } else {
        $735 = HEAP32[((72 + 20|0))>>2]|0;
        $736 = ($721|0)==($735|0);
        if ($736) {
         $737 = HEAP32[((72 + 8|0))>>2]|0;
         $738 = (($737) + ($726))|0;
         HEAP32[((72 + 8|0))>>2] = $738;
         HEAP32[((72 + 20|0))>>2] = $725;
         $739 = $738 | 1;
         $$sum40$i$i = (($$sum$i21$i) + 4)|0;
         $740 = (($tbase$247$i) + ($$sum40$i$i)|0);
         HEAP32[$740>>2] = $739;
         $$sum41$i$i = (($738) + ($$sum$i21$i))|0;
         $741 = (($tbase$247$i) + ($$sum41$i$i)|0);
         HEAP32[$741>>2] = $738;
         break;
        }
        $$sum2$i23$i = (($tsize$246$i) + 4)|0;
        $$sum109$i = (($$sum2$i23$i) + ($720))|0;
        $742 = (($tbase$247$i) + ($$sum109$i)|0);
        $743 = HEAP32[$742>>2]|0;
        $744 = $743 & 3;
        $745 = ($744|0)==(1);
        if ($745) {
         $746 = $743 & -8;
         $747 = $743 >>> 3;
         $748 = ($743>>>0)<(256);
         L356: do {
          if ($748) {
           $$sum3738$i$i = $720 | 8;
           $$sum119$i = (($$sum3738$i$i) + ($tsize$246$i))|0;
           $749 = (($tbase$247$i) + ($$sum119$i)|0);
           $750 = HEAP32[$749>>2]|0;
           $$sum39$i$i = (($tsize$246$i) + 12)|0;
           $$sum120$i = (($$sum39$i$i) + ($720))|0;
           $751 = (($tbase$247$i) + ($$sum120$i)|0);
           $752 = HEAP32[$751>>2]|0;
           $753 = $747 << 1;
           $754 = ((72 + ($753<<2)|0) + 40|0);
           $755 = ($750|0)==($754|0);
           do {
            if (!($755)) {
             $756 = HEAP32[((72 + 16|0))>>2]|0;
             $757 = ($750>>>0)<($756>>>0);
             if ($757) {
              _abort();
              // unreachable;
             }
             $758 = (($750) + 12|0);
             $759 = HEAP32[$758>>2]|0;
             $760 = ($759|0)==($721|0);
             if ($760) {
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $761 = ($752|0)==($750|0);
           if ($761) {
            $762 = 1 << $747;
            $763 = $762 ^ -1;
            $764 = HEAP32[72>>2]|0;
            $765 = $764 & $763;
            HEAP32[72>>2] = $765;
            break;
           }
           $766 = ($752|0)==($754|0);
           do {
            if ($766) {
             $$pre57$i$i = (($752) + 8|0);
             $$pre$phi58$i$iZ2D = $$pre57$i$i;
            } else {
             $767 = HEAP32[((72 + 16|0))>>2]|0;
             $768 = ($752>>>0)<($767>>>0);
             if ($768) {
              _abort();
              // unreachable;
             }
             $769 = (($752) + 8|0);
             $770 = HEAP32[$769>>2]|0;
             $771 = ($770|0)==($721|0);
             if ($771) {
              $$pre$phi58$i$iZ2D = $769;
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $772 = (($750) + 12|0);
           HEAP32[$772>>2] = $752;
           HEAP32[$$pre$phi58$i$iZ2D>>2] = $750;
          } else {
           $$sum34$i$i = $720 | 24;
           $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
           $773 = (($tbase$247$i) + ($$sum110$i)|0);
           $774 = HEAP32[$773>>2]|0;
           $$sum5$i$i = (($tsize$246$i) + 12)|0;
           $$sum111$i = (($$sum5$i$i) + ($720))|0;
           $775 = (($tbase$247$i) + ($$sum111$i)|0);
           $776 = HEAP32[$775>>2]|0;
           $777 = ($776|0)==($721|0);
           do {
            if ($777) {
             $$sum67$i$i = $720 | 16;
             $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
             $788 = (($tbase$247$i) + ($$sum117$i)|0);
             $789 = HEAP32[$788>>2]|0;
             $790 = ($789|0)==(0|0);
             if ($790) {
              $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
              $791 = (($tbase$247$i) + ($$sum118$i)|0);
              $792 = HEAP32[$791>>2]|0;
              $793 = ($792|0)==(0|0);
              if ($793) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $792;$RP$0$i$i = $791;
              }
             } else {
              $R$0$i$i = $789;$RP$0$i$i = $788;
             }
             while(1) {
              $794 = (($R$0$i$i) + 20|0);
              $795 = HEAP32[$794>>2]|0;
              $796 = ($795|0)==(0|0);
              if (!($796)) {
               $R$0$i$i = $795;$RP$0$i$i = $794;
               continue;
              }
              $797 = (($R$0$i$i) + 16|0);
              $798 = HEAP32[$797>>2]|0;
              $799 = ($798|0)==(0|0);
              if ($799) {
               break;
              } else {
               $R$0$i$i = $798;$RP$0$i$i = $797;
              }
             }
             $800 = HEAP32[((72 + 16|0))>>2]|0;
             $801 = ($RP$0$i$i>>>0)<($800>>>0);
             if ($801) {
              _abort();
              // unreachable;
             } else {
              HEAP32[$RP$0$i$i>>2] = 0;
              $R$1$i$i = $R$0$i$i;
              break;
             }
            } else {
             $$sum3536$i$i = $720 | 8;
             $$sum112$i = (($$sum3536$i$i) + ($tsize$246$i))|0;
             $778 = (($tbase$247$i) + ($$sum112$i)|0);
             $779 = HEAP32[$778>>2]|0;
             $780 = HEAP32[((72 + 16|0))>>2]|0;
             $781 = ($779>>>0)<($780>>>0);
             if ($781) {
              _abort();
              // unreachable;
             }
             $782 = (($779) + 12|0);
             $783 = HEAP32[$782>>2]|0;
             $784 = ($783|0)==($721|0);
             if (!($784)) {
              _abort();
              // unreachable;
             }
             $785 = (($776) + 8|0);
             $786 = HEAP32[$785>>2]|0;
             $787 = ($786|0)==($721|0);
             if ($787) {
              HEAP32[$782>>2] = $776;
              HEAP32[$785>>2] = $779;
              $R$1$i$i = $776;
              break;
             } else {
              _abort();
              // unreachable;
             }
            }
           } while(0);
           $802 = ($774|0)==(0|0);
           if ($802) {
            break;
           }
           $$sum30$i$i = (($tsize$246$i) + 28)|0;
           $$sum113$i = (($$sum30$i$i) + ($720))|0;
           $803 = (($tbase$247$i) + ($$sum113$i)|0);
           $804 = HEAP32[$803>>2]|0;
           $805 = ((72 + ($804<<2)|0) + 304|0);
           $806 = HEAP32[$805>>2]|0;
           $807 = ($721|0)==($806|0);
           do {
            if ($807) {
             HEAP32[$805>>2] = $R$1$i$i;
             $cond$i$i = ($R$1$i$i|0)==(0|0);
             if (!($cond$i$i)) {
              break;
             }
             $808 = 1 << $804;
             $809 = $808 ^ -1;
             $810 = HEAP32[((72 + 4|0))>>2]|0;
             $811 = $810 & $809;
             HEAP32[((72 + 4|0))>>2] = $811;
             break L356;
            } else {
             $812 = HEAP32[((72 + 16|0))>>2]|0;
             $813 = ($774>>>0)<($812>>>0);
             if ($813) {
              _abort();
              // unreachable;
             }
             $814 = (($774) + 16|0);
             $815 = HEAP32[$814>>2]|0;
             $816 = ($815|0)==($721|0);
             if ($816) {
              HEAP32[$814>>2] = $R$1$i$i;
             } else {
              $817 = (($774) + 20|0);
              HEAP32[$817>>2] = $R$1$i$i;
             }
             $818 = ($R$1$i$i|0)==(0|0);
             if ($818) {
              break L356;
             }
            }
           } while(0);
           $819 = HEAP32[((72 + 16|0))>>2]|0;
           $820 = ($R$1$i$i>>>0)<($819>>>0);
           if ($820) {
            _abort();
            // unreachable;
           }
           $821 = (($R$1$i$i) + 24|0);
           HEAP32[$821>>2] = $774;
           $$sum3132$i$i = $720 | 16;
           $$sum114$i = (($$sum3132$i$i) + ($tsize$246$i))|0;
           $822 = (($tbase$247$i) + ($$sum114$i)|0);
           $823 = HEAP32[$822>>2]|0;
           $824 = ($823|0)==(0|0);
           do {
            if (!($824)) {
             $825 = HEAP32[((72 + 16|0))>>2]|0;
             $826 = ($823>>>0)<($825>>>0);
             if ($826) {
              _abort();
              // unreachable;
             } else {
              $827 = (($R$1$i$i) + 16|0);
              HEAP32[$827>>2] = $823;
              $828 = (($823) + 24|0);
              HEAP32[$828>>2] = $R$1$i$i;
              break;
             }
            }
           } while(0);
           $$sum115$i = (($$sum2$i23$i) + ($$sum3132$i$i))|0;
           $829 = (($tbase$247$i) + ($$sum115$i)|0);
           $830 = HEAP32[$829>>2]|0;
           $831 = ($830|0)==(0|0);
           if ($831) {
            break;
           }
           $832 = HEAP32[((72 + 16|0))>>2]|0;
           $833 = ($830>>>0)<($832>>>0);
           if ($833) {
            _abort();
            // unreachable;
           } else {
            $834 = (($R$1$i$i) + 20|0);
            HEAP32[$834>>2] = $830;
            $835 = (($830) + 24|0);
            HEAP32[$835>>2] = $R$1$i$i;
            break;
           }
          }
         } while(0);
         $$sum9$i$i = $746 | $720;
         $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
         $836 = (($tbase$247$i) + ($$sum116$i)|0);
         $837 = (($746) + ($726))|0;
         $oldfirst$0$i$i = $836;$qsize$0$i$i = $837;
        } else {
         $oldfirst$0$i$i = $721;$qsize$0$i$i = $726;
        }
        $838 = (($oldfirst$0$i$i) + 4|0);
        $839 = HEAP32[$838>>2]|0;
        $840 = $839 & -2;
        HEAP32[$838>>2] = $840;
        $841 = $qsize$0$i$i | 1;
        $$sum10$i$i = (($$sum$i21$i) + 4)|0;
        $842 = (($tbase$247$i) + ($$sum10$i$i)|0);
        HEAP32[$842>>2] = $841;
        $$sum11$i24$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
        $843 = (($tbase$247$i) + ($$sum11$i24$i)|0);
        HEAP32[$843>>2] = $qsize$0$i$i;
        $844 = $qsize$0$i$i >>> 3;
        $845 = ($qsize$0$i$i>>>0)<(256);
        if ($845) {
         $846 = $844 << 1;
         $847 = ((72 + ($846<<2)|0) + 40|0);
         $848 = HEAP32[72>>2]|0;
         $849 = 1 << $844;
         $850 = $848 & $849;
         $851 = ($850|0)==(0);
         do {
          if ($851) {
           $852 = $848 | $849;
           HEAP32[72>>2] = $852;
           $$sum26$pre$i$i = (($846) + 2)|0;
           $$pre$i25$i = ((72 + ($$sum26$pre$i$i<<2)|0) + 40|0);
           $$pre$phi$i26$iZ2D = $$pre$i25$i;$F4$0$i$i = $847;
          } else {
           $$sum29$i$i = (($846) + 2)|0;
           $853 = ((72 + ($$sum29$i$i<<2)|0) + 40|0);
           $854 = HEAP32[$853>>2]|0;
           $855 = HEAP32[((72 + 16|0))>>2]|0;
           $856 = ($854>>>0)<($855>>>0);
           if (!($856)) {
            $$pre$phi$i26$iZ2D = $853;$F4$0$i$i = $854;
            break;
           }
           _abort();
           // unreachable;
          }
         } while(0);
         HEAP32[$$pre$phi$i26$iZ2D>>2] = $725;
         $857 = (($F4$0$i$i) + 12|0);
         HEAP32[$857>>2] = $725;
         $$sum27$i$i = (($$sum$i21$i) + 8)|0;
         $858 = (($tbase$247$i) + ($$sum27$i$i)|0);
         HEAP32[$858>>2] = $F4$0$i$i;
         $$sum28$i$i = (($$sum$i21$i) + 12)|0;
         $859 = (($tbase$247$i) + ($$sum28$i$i)|0);
         HEAP32[$859>>2] = $847;
         break;
        }
        $860 = $qsize$0$i$i >>> 8;
        $861 = ($860|0)==(0);
        do {
         if ($861) {
          $I7$0$i$i = 0;
         } else {
          $862 = ($qsize$0$i$i>>>0)>(16777215);
          if ($862) {
           $I7$0$i$i = 31;
           break;
          }
          $863 = (($860) + 1048320)|0;
          $864 = $863 >>> 16;
          $865 = $864 & 8;
          $866 = $860 << $865;
          $867 = (($866) + 520192)|0;
          $868 = $867 >>> 16;
          $869 = $868 & 4;
          $870 = $869 | $865;
          $871 = $866 << $869;
          $872 = (($871) + 245760)|0;
          $873 = $872 >>> 16;
          $874 = $873 & 2;
          $875 = $870 | $874;
          $876 = (14 - ($875))|0;
          $877 = $871 << $874;
          $878 = $877 >>> 15;
          $879 = (($876) + ($878))|0;
          $880 = $879 << 1;
          $881 = (($879) + 7)|0;
          $882 = $qsize$0$i$i >>> $881;
          $883 = $882 & 1;
          $884 = $883 | $880;
          $I7$0$i$i = $884;
         }
        } while(0);
        $885 = ((72 + ($I7$0$i$i<<2)|0) + 304|0);
        $$sum12$i$i = (($$sum$i21$i) + 28)|0;
        $886 = (($tbase$247$i) + ($$sum12$i$i)|0);
        HEAP32[$886>>2] = $I7$0$i$i;
        $$sum13$i$i = (($$sum$i21$i) + 16)|0;
        $887 = (($tbase$247$i) + ($$sum13$i$i)|0);
        $$sum14$i$i = (($$sum$i21$i) + 20)|0;
        $888 = (($tbase$247$i) + ($$sum14$i$i)|0);
        HEAP32[$888>>2] = 0;
        HEAP32[$887>>2] = 0;
        $889 = HEAP32[((72 + 4|0))>>2]|0;
        $890 = 1 << $I7$0$i$i;
        $891 = $889 & $890;
        $892 = ($891|0)==(0);
        if ($892) {
         $893 = $889 | $890;
         HEAP32[((72 + 4|0))>>2] = $893;
         HEAP32[$885>>2] = $725;
         $$sum15$i$i = (($$sum$i21$i) + 24)|0;
         $894 = (($tbase$247$i) + ($$sum15$i$i)|0);
         HEAP32[$894>>2] = $885;
         $$sum16$i$i = (($$sum$i21$i) + 12)|0;
         $895 = (($tbase$247$i) + ($$sum16$i$i)|0);
         HEAP32[$895>>2] = $725;
         $$sum17$i$i = (($$sum$i21$i) + 8)|0;
         $896 = (($tbase$247$i) + ($$sum17$i$i)|0);
         HEAP32[$896>>2] = $725;
         break;
        }
        $897 = HEAP32[$885>>2]|0;
        $898 = ($I7$0$i$i|0)==(31);
        if ($898) {
         $906 = 0;
        } else {
         $899 = $I7$0$i$i >>> 1;
         $900 = (25 - ($899))|0;
         $906 = $900;
        }
        $901 = (($897) + 4|0);
        $902 = HEAP32[$901>>2]|0;
        $903 = $902 & -8;
        $904 = ($903|0)==($qsize$0$i$i|0);
        L445: do {
         if ($904) {
          $T$0$lcssa$i28$i = $897;
         } else {
          $905 = $qsize$0$i$i << $906;
          $K8$052$i$i = $905;$T$051$i$i = $897;
          while(1) {
           $913 = $K8$052$i$i >>> 31;
           $914 = ((($T$051$i$i) + ($913<<2)|0) + 16|0);
           $909 = HEAP32[$914>>2]|0;
           $915 = ($909|0)==(0|0);
           if ($915) {
            break;
           }
           $907 = $K8$052$i$i << 1;
           $908 = (($909) + 4|0);
           $910 = HEAP32[$908>>2]|0;
           $911 = $910 & -8;
           $912 = ($911|0)==($qsize$0$i$i|0);
           if ($912) {
            $T$0$lcssa$i28$i = $909;
            break L445;
           } else {
            $K8$052$i$i = $907;$T$051$i$i = $909;
           }
          }
          $916 = HEAP32[((72 + 16|0))>>2]|0;
          $917 = ($914>>>0)<($916>>>0);
          if ($917) {
           _abort();
           // unreachable;
          } else {
           HEAP32[$914>>2] = $725;
           $$sum23$i$i = (($$sum$i21$i) + 24)|0;
           $918 = (($tbase$247$i) + ($$sum23$i$i)|0);
           HEAP32[$918>>2] = $T$051$i$i;
           $$sum24$i$i = (($$sum$i21$i) + 12)|0;
           $919 = (($tbase$247$i) + ($$sum24$i$i)|0);
           HEAP32[$919>>2] = $725;
           $$sum25$i$i = (($$sum$i21$i) + 8)|0;
           $920 = (($tbase$247$i) + ($$sum25$i$i)|0);
           HEAP32[$920>>2] = $725;
           break L348;
          }
         }
        } while(0);
        $921 = (($T$0$lcssa$i28$i) + 8|0);
        $922 = HEAP32[$921>>2]|0;
        $923 = HEAP32[((72 + 16|0))>>2]|0;
        $924 = ($T$0$lcssa$i28$i>>>0)<($923>>>0);
        if ($924) {
         _abort();
         // unreachable;
        }
        $925 = ($922>>>0)<($923>>>0);
        if ($925) {
         _abort();
         // unreachable;
        } else {
         $926 = (($922) + 12|0);
         HEAP32[$926>>2] = $725;
         HEAP32[$921>>2] = $725;
         $$sum20$i$i = (($$sum$i21$i) + 8)|0;
         $927 = (($tbase$247$i) + ($$sum20$i$i)|0);
         HEAP32[$927>>2] = $922;
         $$sum21$i$i = (($$sum$i21$i) + 12)|0;
         $928 = (($tbase$247$i) + ($$sum21$i$i)|0);
         HEAP32[$928>>2] = $T$0$lcssa$i28$i;
         $$sum22$i$i = (($$sum$i21$i) + 24)|0;
         $929 = (($tbase$247$i) + ($$sum22$i$i)|0);
         HEAP32[$929>>2] = 0;
         break;
        }
       }
      } while(0);
      $$sum1819$i$i = $713 | 8;
      $930 = (($tbase$247$i) + ($$sum1819$i$i)|0);
      $mem$0 = $930;
      STACKTOP = sp;return ($mem$0|0);
     }
    }
    $sp$0$i$i$i = ((72 + 448|0));
    while(1) {
     $931 = HEAP32[$sp$0$i$i$i>>2]|0;
     $932 = ($931>>>0)>($636>>>0);
     if (!($932)) {
      $933 = (($sp$0$i$i$i) + 4|0);
      $934 = HEAP32[$933>>2]|0;
      $935 = (($931) + ($934)|0);
      $936 = ($935>>>0)>($636>>>0);
      if ($936) {
       break;
      }
     }
     $937 = (($sp$0$i$i$i) + 8|0);
     $938 = HEAP32[$937>>2]|0;
     $sp$0$i$i$i = $938;
    }
    $$sum$i15$i = (($934) + -47)|0;
    $$sum1$i16$i = (($934) + -39)|0;
    $939 = (($931) + ($$sum1$i16$i)|0);
    $940 = $939;
    $941 = $940 & 7;
    $942 = ($941|0)==(0);
    if ($942) {
     $945 = 0;
    } else {
     $943 = (0 - ($940))|0;
     $944 = $943 & 7;
     $945 = $944;
    }
    $$sum2$i17$i = (($$sum$i15$i) + ($945))|0;
    $946 = (($931) + ($$sum2$i17$i)|0);
    $947 = (($636) + 16|0);
    $948 = ($946>>>0)<($947>>>0);
    $949 = $948 ? $636 : $946;
    $950 = (($949) + 8|0);
    $951 = (($tsize$246$i) + -40)|0;
    $952 = (($tbase$247$i) + 8|0);
    $953 = $952;
    $954 = $953 & 7;
    $955 = ($954|0)==(0);
    if ($955) {
     $959 = 0;
    } else {
     $956 = (0 - ($953))|0;
     $957 = $956 & 7;
     $959 = $957;
    }
    $958 = (($tbase$247$i) + ($959)|0);
    $960 = (($951) - ($959))|0;
    HEAP32[((72 + 24|0))>>2] = $958;
    HEAP32[((72 + 12|0))>>2] = $960;
    $961 = $960 | 1;
    $$sum$i$i$i = (($959) + 4)|0;
    $962 = (($tbase$247$i) + ($$sum$i$i$i)|0);
    HEAP32[$962>>2] = $961;
    $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
    $963 = (($tbase$247$i) + ($$sum2$i$i$i)|0);
    HEAP32[$963>>2] = 40;
    $964 = HEAP32[((544 + 16|0))>>2]|0;
    HEAP32[((72 + 28|0))>>2] = $964;
    $965 = (($949) + 4|0);
    HEAP32[$965>>2] = 27;
    ;HEAP32[$950+0>>2]=HEAP32[((72 + 448|0))+0>>2]|0;HEAP32[$950+4>>2]=HEAP32[((72 + 448|0))+4>>2]|0;HEAP32[$950+8>>2]=HEAP32[((72 + 448|0))+8>>2]|0;HEAP32[$950+12>>2]=HEAP32[((72 + 448|0))+12>>2]|0;
    HEAP32[((72 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((72 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((72 + 460|0))>>2] = 0;
    HEAP32[((72 + 456|0))>>2] = $950;
    $966 = (($949) + 28|0);
    HEAP32[$966>>2] = 7;
    $967 = (($949) + 32|0);
    $968 = ($967>>>0)<($935>>>0);
    if ($968) {
     $970 = $966;
     while(1) {
      $969 = (($970) + 4|0);
      HEAP32[$969>>2] = 7;
      $971 = (($970) + 8|0);
      $972 = ($971>>>0)<($935>>>0);
      if ($972) {
       $970 = $969;
      } else {
       break;
      }
     }
    }
    $973 = ($949|0)==($636|0);
    if (!($973)) {
     $974 = $949;
     $975 = $636;
     $976 = (($974) - ($975))|0;
     $977 = (($636) + ($976)|0);
     $$sum3$i$i = (($976) + 4)|0;
     $978 = (($636) + ($$sum3$i$i)|0);
     $979 = HEAP32[$978>>2]|0;
     $980 = $979 & -2;
     HEAP32[$978>>2] = $980;
     $981 = $976 | 1;
     $982 = (($636) + 4|0);
     HEAP32[$982>>2] = $981;
     HEAP32[$977>>2] = $976;
     $983 = $976 >>> 3;
     $984 = ($976>>>0)<(256);
     if ($984) {
      $985 = $983 << 1;
      $986 = ((72 + ($985<<2)|0) + 40|0);
      $987 = HEAP32[72>>2]|0;
      $988 = 1 << $983;
      $989 = $987 & $988;
      $990 = ($989|0)==(0);
      do {
       if ($990) {
        $991 = $987 | $988;
        HEAP32[72>>2] = $991;
        $$sum10$pre$i$i = (($985) + 2)|0;
        $$pre$i$i = ((72 + ($$sum10$pre$i$i<<2)|0) + 40|0);
        $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $986;
       } else {
        $$sum11$i$i = (($985) + 2)|0;
        $992 = ((72 + ($$sum11$i$i<<2)|0) + 40|0);
        $993 = HEAP32[$992>>2]|0;
        $994 = HEAP32[((72 + 16|0))>>2]|0;
        $995 = ($993>>>0)<($994>>>0);
        if (!($995)) {
         $$pre$phi$i$iZ2D = $992;$F$0$i$i = $993;
         break;
        }
        _abort();
        // unreachable;
       }
      } while(0);
      HEAP32[$$pre$phi$i$iZ2D>>2] = $636;
      $996 = (($F$0$i$i) + 12|0);
      HEAP32[$996>>2] = $636;
      $997 = (($636) + 8|0);
      HEAP32[$997>>2] = $F$0$i$i;
      $998 = (($636) + 12|0);
      HEAP32[$998>>2] = $986;
      break;
     }
     $999 = $976 >>> 8;
     $1000 = ($999|0)==(0);
     if ($1000) {
      $I1$0$i$i = 0;
     } else {
      $1001 = ($976>>>0)>(16777215);
      if ($1001) {
       $I1$0$i$i = 31;
      } else {
       $1002 = (($999) + 1048320)|0;
       $1003 = $1002 >>> 16;
       $1004 = $1003 & 8;
       $1005 = $999 << $1004;
       $1006 = (($1005) + 520192)|0;
       $1007 = $1006 >>> 16;
       $1008 = $1007 & 4;
       $1009 = $1008 | $1004;
       $1010 = $1005 << $1008;
       $1011 = (($1010) + 245760)|0;
       $1012 = $1011 >>> 16;
       $1013 = $1012 & 2;
       $1014 = $1009 | $1013;
       $1015 = (14 - ($1014))|0;
       $1016 = $1010 << $1013;
       $1017 = $1016 >>> 15;
       $1018 = (($1015) + ($1017))|0;
       $1019 = $1018 << 1;
       $1020 = (($1018) + 7)|0;
       $1021 = $976 >>> $1020;
       $1022 = $1021 & 1;
       $1023 = $1022 | $1019;
       $I1$0$i$i = $1023;
      }
     }
     $1024 = ((72 + ($I1$0$i$i<<2)|0) + 304|0);
     $1025 = (($636) + 28|0);
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1025>>2] = $I1$0$c$i$i;
     $1026 = (($636) + 20|0);
     HEAP32[$1026>>2] = 0;
     $1027 = (($636) + 16|0);
     HEAP32[$1027>>2] = 0;
     $1028 = HEAP32[((72 + 4|0))>>2]|0;
     $1029 = 1 << $I1$0$i$i;
     $1030 = $1028 & $1029;
     $1031 = ($1030|0)==(0);
     if ($1031) {
      $1032 = $1028 | $1029;
      HEAP32[((72 + 4|0))>>2] = $1032;
      HEAP32[$1024>>2] = $636;
      $1033 = (($636) + 24|0);
      HEAP32[$1033>>2] = $1024;
      $1034 = (($636) + 12|0);
      HEAP32[$1034>>2] = $636;
      $1035 = (($636) + 8|0);
      HEAP32[$1035>>2] = $636;
      break;
     }
     $1036 = HEAP32[$1024>>2]|0;
     $1037 = ($I1$0$i$i|0)==(31);
     if ($1037) {
      $1045 = 0;
     } else {
      $1038 = $I1$0$i$i >>> 1;
      $1039 = (25 - ($1038))|0;
      $1045 = $1039;
     }
     $1040 = (($1036) + 4|0);
     $1041 = HEAP32[$1040>>2]|0;
     $1042 = $1041 & -8;
     $1043 = ($1042|0)==($976|0);
     L499: do {
      if ($1043) {
       $T$0$lcssa$i$i = $1036;
      } else {
       $1044 = $976 << $1045;
       $K2$014$i$i = $1044;$T$013$i$i = $1036;
       while(1) {
        $1052 = $K2$014$i$i >>> 31;
        $1053 = ((($T$013$i$i) + ($1052<<2)|0) + 16|0);
        $1048 = HEAP32[$1053>>2]|0;
        $1054 = ($1048|0)==(0|0);
        if ($1054) {
         break;
        }
        $1046 = $K2$014$i$i << 1;
        $1047 = (($1048) + 4|0);
        $1049 = HEAP32[$1047>>2]|0;
        $1050 = $1049 & -8;
        $1051 = ($1050|0)==($976|0);
        if ($1051) {
         $T$0$lcssa$i$i = $1048;
         break L499;
        } else {
         $K2$014$i$i = $1046;$T$013$i$i = $1048;
        }
       }
       $1055 = HEAP32[((72 + 16|0))>>2]|0;
       $1056 = ($1053>>>0)<($1055>>>0);
       if ($1056) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$1053>>2] = $636;
        $1057 = (($636) + 24|0);
        HEAP32[$1057>>2] = $T$013$i$i;
        $1058 = (($636) + 12|0);
        HEAP32[$1058>>2] = $636;
        $1059 = (($636) + 8|0);
        HEAP32[$1059>>2] = $636;
        break L311;
       }
      }
     } while(0);
     $1060 = (($T$0$lcssa$i$i) + 8|0);
     $1061 = HEAP32[$1060>>2]|0;
     $1062 = HEAP32[((72 + 16|0))>>2]|0;
     $1063 = ($T$0$lcssa$i$i>>>0)<($1062>>>0);
     if ($1063) {
      _abort();
      // unreachable;
     }
     $1064 = ($1061>>>0)<($1062>>>0);
     if ($1064) {
      _abort();
      // unreachable;
     } else {
      $1065 = (($1061) + 12|0);
      HEAP32[$1065>>2] = $636;
      HEAP32[$1060>>2] = $636;
      $1066 = (($636) + 8|0);
      HEAP32[$1066>>2] = $1061;
      $1067 = (($636) + 12|0);
      HEAP32[$1067>>2] = $T$0$lcssa$i$i;
      $1068 = (($636) + 24|0);
      HEAP32[$1068>>2] = 0;
      break;
     }
    }
   }
  } while(0);
  $1069 = HEAP32[((72 + 12|0))>>2]|0;
  $1070 = ($1069>>>0)>($nb$0>>>0);
  if ($1070) {
   $1071 = (($1069) - ($nb$0))|0;
   HEAP32[((72 + 12|0))>>2] = $1071;
   $1072 = HEAP32[((72 + 24|0))>>2]|0;
   $1073 = (($1072) + ($nb$0)|0);
   HEAP32[((72 + 24|0))>>2] = $1073;
   $1074 = $1071 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1075 = (($1072) + ($$sum$i32)|0);
   HEAP32[$1075>>2] = $1074;
   $1076 = $nb$0 | 3;
   $1077 = (($1072) + 4|0);
   HEAP32[$1077>>2] = $1076;
   $1078 = (($1072) + 8|0);
   $mem$0 = $1078;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $1079 = (___errno_location()|0);
 HEAP32[$1079>>2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$pre = 0, $$pre$phi68Z2D = 0, $$pre$phi70Z2D = 0, $$pre$phiZ2D = 0, $$pre67 = 0, $$pre69 = 0, $$sum = 0, $$sum16$pre = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum2324 = 0, $$sum25 = 0, $$sum26 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0;
 var $$sum31 = 0, $$sum32 = 0, $$sum33 = 0, $$sum34 = 0, $$sum35 = 0, $$sum36 = 0, $$sum37 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0;
 var $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0;
 var $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0;
 var $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0;
 var $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0;
 var $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0;
 var $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0;
 var $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0;
 var $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0;
 var $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0;
 var $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0;
 var $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0;
 var $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0;
 var $322 = 0, $323 = 0, $324 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $I18$0$c = 0, $K19$057 = 0;
 var $R$0 = 0, $R$1 = 0, $R7$0 = 0, $R7$1 = 0, $RP$0 = 0, $RP9$0 = 0, $T$0$lcssa = 0, $T$056 = 0, $cond = 0, $cond54 = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($mem|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = (($mem) + -8|0);
 $2 = HEAP32[((72 + 16|0))>>2]|0;
 $3 = ($1>>>0)<($2>>>0);
 if ($3) {
  _abort();
  // unreachable;
 }
 $4 = (($mem) + -4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & 3;
 $7 = ($6|0)==(1);
 if ($7) {
  _abort();
  // unreachable;
 }
 $8 = $5 & -8;
 $$sum = (($8) + -8)|0;
 $9 = (($mem) + ($$sum)|0);
 $10 = $5 & 1;
 $11 = ($10|0)==(0);
 do {
  if ($11) {
   $12 = HEAP32[$1>>2]|0;
   $13 = ($6|0)==(0);
   if ($13) {
    STACKTOP = sp;return;
   }
   $$sum2 = (-8 - ($12))|0;
   $14 = (($mem) + ($$sum2)|0);
   $15 = (($12) + ($8))|0;
   $16 = ($14>>>0)<($2>>>0);
   if ($16) {
    _abort();
    // unreachable;
   }
   $17 = HEAP32[((72 + 20|0))>>2]|0;
   $18 = ($14|0)==($17|0);
   if ($18) {
    $$sum3 = (($8) + -4)|0;
    $104 = (($mem) + ($$sum3)|0);
    $105 = HEAP32[$104>>2]|0;
    $106 = $105 & 3;
    $107 = ($106|0)==(3);
    if (!($107)) {
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    HEAP32[((72 + 8|0))>>2] = $15;
    $108 = HEAP32[$104>>2]|0;
    $109 = $108 & -2;
    HEAP32[$104>>2] = $109;
    $110 = $15 | 1;
    $$sum26 = (($$sum2) + 4)|0;
    $111 = (($mem) + ($$sum26)|0);
    HEAP32[$111>>2] = $110;
    HEAP32[$9>>2] = $15;
    STACKTOP = sp;return;
   }
   $19 = $12 >>> 3;
   $20 = ($12>>>0)<(256);
   if ($20) {
    $$sum36 = (($$sum2) + 8)|0;
    $21 = (($mem) + ($$sum36)|0);
    $22 = HEAP32[$21>>2]|0;
    $$sum37 = (($$sum2) + 12)|0;
    $23 = (($mem) + ($$sum37)|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = $19 << 1;
    $26 = ((72 + ($25<<2)|0) + 40|0);
    $27 = ($22|0)==($26|0);
    if (!($27)) {
     $28 = ($22>>>0)<($2>>>0);
     if ($28) {
      _abort();
      // unreachable;
     }
     $29 = (($22) + 12|0);
     $30 = HEAP32[$29>>2]|0;
     $31 = ($30|0)==($14|0);
     if (!($31)) {
      _abort();
      // unreachable;
     }
    }
    $32 = ($24|0)==($22|0);
    if ($32) {
     $33 = 1 << $19;
     $34 = $33 ^ -1;
     $35 = HEAP32[72>>2]|0;
     $36 = $35 & $34;
     HEAP32[72>>2] = $36;
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    $37 = ($24|0)==($26|0);
    if ($37) {
     $$pre69 = (($24) + 8|0);
     $$pre$phi70Z2D = $$pre69;
    } else {
     $38 = ($24>>>0)<($2>>>0);
     if ($38) {
      _abort();
      // unreachable;
     }
     $39 = (($24) + 8|0);
     $40 = HEAP32[$39>>2]|0;
     $41 = ($40|0)==($14|0);
     if ($41) {
      $$pre$phi70Z2D = $39;
     } else {
      _abort();
      // unreachable;
     }
    }
    $42 = (($22) + 12|0);
    HEAP32[$42>>2] = $24;
    HEAP32[$$pre$phi70Z2D>>2] = $22;
    $p$0 = $14;$psize$0 = $15;
    break;
   }
   $$sum28 = (($$sum2) + 24)|0;
   $43 = (($mem) + ($$sum28)|0);
   $44 = HEAP32[$43>>2]|0;
   $$sum29 = (($$sum2) + 12)|0;
   $45 = (($mem) + ($$sum29)|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = ($46|0)==($14|0);
   do {
    if ($47) {
     $$sum31 = (($$sum2) + 20)|0;
     $57 = (($mem) + ($$sum31)|0);
     $58 = HEAP32[$57>>2]|0;
     $59 = ($58|0)==(0|0);
     if ($59) {
      $$sum30 = (($$sum2) + 16)|0;
      $60 = (($mem) + ($$sum30)|0);
      $61 = HEAP32[$60>>2]|0;
      $62 = ($61|0)==(0|0);
      if ($62) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;$RP$0 = $60;
      }
     } else {
      $R$0 = $58;$RP$0 = $57;
     }
     while(1) {
      $63 = (($R$0) + 20|0);
      $64 = HEAP32[$63>>2]|0;
      $65 = ($64|0)==(0|0);
      if (!($65)) {
       $R$0 = $64;$RP$0 = $63;
       continue;
      }
      $66 = (($R$0) + 16|0);
      $67 = HEAP32[$66>>2]|0;
      $68 = ($67|0)==(0|0);
      if ($68) {
       break;
      } else {
       $R$0 = $67;$RP$0 = $66;
      }
     }
     $69 = ($RP$0>>>0)<($2>>>0);
     if ($69) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum35 = (($$sum2) + 8)|0;
     $48 = (($mem) + ($$sum35)|0);
     $49 = HEAP32[$48>>2]|0;
     $50 = ($49>>>0)<($2>>>0);
     if ($50) {
      _abort();
      // unreachable;
     }
     $51 = (($49) + 12|0);
     $52 = HEAP32[$51>>2]|0;
     $53 = ($52|0)==($14|0);
     if (!($53)) {
      _abort();
      // unreachable;
     }
     $54 = (($46) + 8|0);
     $55 = HEAP32[$54>>2]|0;
     $56 = ($55|0)==($14|0);
     if ($56) {
      HEAP32[$51>>2] = $46;
      HEAP32[$54>>2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $70 = ($44|0)==(0|0);
   if ($70) {
    $p$0 = $14;$psize$0 = $15;
   } else {
    $$sum32 = (($$sum2) + 28)|0;
    $71 = (($mem) + ($$sum32)|0);
    $72 = HEAP32[$71>>2]|0;
    $73 = ((72 + ($72<<2)|0) + 304|0);
    $74 = HEAP32[$73>>2]|0;
    $75 = ($14|0)==($74|0);
    if ($75) {
     HEAP32[$73>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $76 = 1 << $72;
      $77 = $76 ^ -1;
      $78 = HEAP32[((72 + 4|0))>>2]|0;
      $79 = $78 & $77;
      HEAP32[((72 + 4|0))>>2] = $79;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    } else {
     $80 = HEAP32[((72 + 16|0))>>2]|0;
     $81 = ($44>>>0)<($80>>>0);
     if ($81) {
      _abort();
      // unreachable;
     }
     $82 = (($44) + 16|0);
     $83 = HEAP32[$82>>2]|0;
     $84 = ($83|0)==($14|0);
     if ($84) {
      HEAP32[$82>>2] = $R$1;
     } else {
      $85 = (($44) + 20|0);
      HEAP32[$85>>2] = $R$1;
     }
     $86 = ($R$1|0)==(0|0);
     if ($86) {
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
    $87 = HEAP32[((72 + 16|0))>>2]|0;
    $88 = ($R$1>>>0)<($87>>>0);
    if ($88) {
     _abort();
     // unreachable;
    }
    $89 = (($R$1) + 24|0);
    HEAP32[$89>>2] = $44;
    $$sum33 = (($$sum2) + 16)|0;
    $90 = (($mem) + ($$sum33)|0);
    $91 = HEAP32[$90>>2]|0;
    $92 = ($91|0)==(0|0);
    do {
     if (!($92)) {
      $93 = HEAP32[((72 + 16|0))>>2]|0;
      $94 = ($91>>>0)<($93>>>0);
      if ($94) {
       _abort();
       // unreachable;
      } else {
       $95 = (($R$1) + 16|0);
       HEAP32[$95>>2] = $91;
       $96 = (($91) + 24|0);
       HEAP32[$96>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum34 = (($$sum2) + 20)|0;
    $97 = (($mem) + ($$sum34)|0);
    $98 = HEAP32[$97>>2]|0;
    $99 = ($98|0)==(0|0);
    if ($99) {
     $p$0 = $14;$psize$0 = $15;
    } else {
     $100 = HEAP32[((72 + 16|0))>>2]|0;
     $101 = ($98>>>0)<($100>>>0);
     if ($101) {
      _abort();
      // unreachable;
     } else {
      $102 = (($R$1) + 20|0);
      HEAP32[$102>>2] = $98;
      $103 = (($98) + 24|0);
      HEAP32[$103>>2] = $R$1;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;$psize$0 = $8;
  }
 } while(0);
 $112 = ($p$0>>>0)<($9>>>0);
 if (!($112)) {
  _abort();
  // unreachable;
 }
 $$sum25 = (($8) + -4)|0;
 $113 = (($mem) + ($$sum25)|0);
 $114 = HEAP32[$113>>2]|0;
 $115 = $114 & 1;
 $116 = ($115|0)==(0);
 if ($116) {
  _abort();
  // unreachable;
 }
 $117 = $114 & 2;
 $118 = ($117|0)==(0);
 if ($118) {
  $119 = HEAP32[((72 + 24|0))>>2]|0;
  $120 = ($9|0)==($119|0);
  if ($120) {
   $121 = HEAP32[((72 + 12|0))>>2]|0;
   $122 = (($121) + ($psize$0))|0;
   HEAP32[((72 + 12|0))>>2] = $122;
   HEAP32[((72 + 24|0))>>2] = $p$0;
   $123 = $122 | 1;
   $124 = (($p$0) + 4|0);
   HEAP32[$124>>2] = $123;
   $125 = HEAP32[((72 + 20|0))>>2]|0;
   $126 = ($p$0|0)==($125|0);
   if (!($126)) {
    STACKTOP = sp;return;
   }
   HEAP32[((72 + 20|0))>>2] = 0;
   HEAP32[((72 + 8|0))>>2] = 0;
   STACKTOP = sp;return;
  }
  $127 = HEAP32[((72 + 20|0))>>2]|0;
  $128 = ($9|0)==($127|0);
  if ($128) {
   $129 = HEAP32[((72 + 8|0))>>2]|0;
   $130 = (($129) + ($psize$0))|0;
   HEAP32[((72 + 8|0))>>2] = $130;
   HEAP32[((72 + 20|0))>>2] = $p$0;
   $131 = $130 | 1;
   $132 = (($p$0) + 4|0);
   HEAP32[$132>>2] = $131;
   $133 = (($p$0) + ($130)|0);
   HEAP32[$133>>2] = $130;
   STACKTOP = sp;return;
  }
  $134 = $114 & -8;
  $135 = (($134) + ($psize$0))|0;
  $136 = $114 >>> 3;
  $137 = ($114>>>0)<(256);
  do {
   if ($137) {
    $138 = (($mem) + ($8)|0);
    $139 = HEAP32[$138>>2]|0;
    $$sum2324 = $8 | 4;
    $140 = (($mem) + ($$sum2324)|0);
    $141 = HEAP32[$140>>2]|0;
    $142 = $136 << 1;
    $143 = ((72 + ($142<<2)|0) + 40|0);
    $144 = ($139|0)==($143|0);
    if (!($144)) {
     $145 = HEAP32[((72 + 16|0))>>2]|0;
     $146 = ($139>>>0)<($145>>>0);
     if ($146) {
      _abort();
      // unreachable;
     }
     $147 = (($139) + 12|0);
     $148 = HEAP32[$147>>2]|0;
     $149 = ($148|0)==($9|0);
     if (!($149)) {
      _abort();
      // unreachable;
     }
    }
    $150 = ($141|0)==($139|0);
    if ($150) {
     $151 = 1 << $136;
     $152 = $151 ^ -1;
     $153 = HEAP32[72>>2]|0;
     $154 = $153 & $152;
     HEAP32[72>>2] = $154;
     break;
    }
    $155 = ($141|0)==($143|0);
    if ($155) {
     $$pre67 = (($141) + 8|0);
     $$pre$phi68Z2D = $$pre67;
    } else {
     $156 = HEAP32[((72 + 16|0))>>2]|0;
     $157 = ($141>>>0)<($156>>>0);
     if ($157) {
      _abort();
      // unreachable;
     }
     $158 = (($141) + 8|0);
     $159 = HEAP32[$158>>2]|0;
     $160 = ($159|0)==($9|0);
     if ($160) {
      $$pre$phi68Z2D = $158;
     } else {
      _abort();
      // unreachable;
     }
    }
    $161 = (($139) + 12|0);
    HEAP32[$161>>2] = $141;
    HEAP32[$$pre$phi68Z2D>>2] = $139;
   } else {
    $$sum5 = (($8) + 16)|0;
    $162 = (($mem) + ($$sum5)|0);
    $163 = HEAP32[$162>>2]|0;
    $$sum67 = $8 | 4;
    $164 = (($mem) + ($$sum67)|0);
    $165 = HEAP32[$164>>2]|0;
    $166 = ($165|0)==($9|0);
    do {
     if ($166) {
      $$sum9 = (($8) + 12)|0;
      $177 = (($mem) + ($$sum9)|0);
      $178 = HEAP32[$177>>2]|0;
      $179 = ($178|0)==(0|0);
      if ($179) {
       $$sum8 = (($8) + 8)|0;
       $180 = (($mem) + ($$sum8)|0);
       $181 = HEAP32[$180>>2]|0;
       $182 = ($181|0)==(0|0);
       if ($182) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $181;$RP9$0 = $180;
       }
      } else {
       $R7$0 = $178;$RP9$0 = $177;
      }
      while(1) {
       $183 = (($R7$0) + 20|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($184|0)==(0|0);
       if (!($185)) {
        $R7$0 = $184;$RP9$0 = $183;
        continue;
       }
       $186 = (($R7$0) + 16|0);
       $187 = HEAP32[$186>>2]|0;
       $188 = ($187|0)==(0|0);
       if ($188) {
        break;
       } else {
        $R7$0 = $187;$RP9$0 = $186;
       }
      }
      $189 = HEAP32[((72 + 16|0))>>2]|0;
      $190 = ($RP9$0>>>0)<($189>>>0);
      if ($190) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0>>2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $167 = (($mem) + ($8)|0);
      $168 = HEAP32[$167>>2]|0;
      $169 = HEAP32[((72 + 16|0))>>2]|0;
      $170 = ($168>>>0)<($169>>>0);
      if ($170) {
       _abort();
       // unreachable;
      }
      $171 = (($168) + 12|0);
      $172 = HEAP32[$171>>2]|0;
      $173 = ($172|0)==($9|0);
      if (!($173)) {
       _abort();
       // unreachable;
      }
      $174 = (($165) + 8|0);
      $175 = HEAP32[$174>>2]|0;
      $176 = ($175|0)==($9|0);
      if ($176) {
       HEAP32[$171>>2] = $165;
       HEAP32[$174>>2] = $168;
       $R7$1 = $165;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $191 = ($163|0)==(0|0);
    if (!($191)) {
     $$sum18 = (($8) + 20)|0;
     $192 = (($mem) + ($$sum18)|0);
     $193 = HEAP32[$192>>2]|0;
     $194 = ((72 + ($193<<2)|0) + 304|0);
     $195 = HEAP32[$194>>2]|0;
     $196 = ($9|0)==($195|0);
     if ($196) {
      HEAP32[$194>>2] = $R7$1;
      $cond54 = ($R7$1|0)==(0|0);
      if ($cond54) {
       $197 = 1 << $193;
       $198 = $197 ^ -1;
       $199 = HEAP32[((72 + 4|0))>>2]|0;
       $200 = $199 & $198;
       HEAP32[((72 + 4|0))>>2] = $200;
       break;
      }
     } else {
      $201 = HEAP32[((72 + 16|0))>>2]|0;
      $202 = ($163>>>0)<($201>>>0);
      if ($202) {
       _abort();
       // unreachable;
      }
      $203 = (($163) + 16|0);
      $204 = HEAP32[$203>>2]|0;
      $205 = ($204|0)==($9|0);
      if ($205) {
       HEAP32[$203>>2] = $R7$1;
      } else {
       $206 = (($163) + 20|0);
       HEAP32[$206>>2] = $R7$1;
      }
      $207 = ($R7$1|0)==(0|0);
      if ($207) {
       break;
      }
     }
     $208 = HEAP32[((72 + 16|0))>>2]|0;
     $209 = ($R7$1>>>0)<($208>>>0);
     if ($209) {
      _abort();
      // unreachable;
     }
     $210 = (($R7$1) + 24|0);
     HEAP32[$210>>2] = $163;
     $$sum19 = (($8) + 8)|0;
     $211 = (($mem) + ($$sum19)|0);
     $212 = HEAP32[$211>>2]|0;
     $213 = ($212|0)==(0|0);
     do {
      if (!($213)) {
       $214 = HEAP32[((72 + 16|0))>>2]|0;
       $215 = ($212>>>0)<($214>>>0);
       if ($215) {
        _abort();
        // unreachable;
       } else {
        $216 = (($R7$1) + 16|0);
        HEAP32[$216>>2] = $212;
        $217 = (($212) + 24|0);
        HEAP32[$217>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum20 = (($8) + 12)|0;
     $218 = (($mem) + ($$sum20)|0);
     $219 = HEAP32[$218>>2]|0;
     $220 = ($219|0)==(0|0);
     if (!($220)) {
      $221 = HEAP32[((72 + 16|0))>>2]|0;
      $222 = ($219>>>0)<($221>>>0);
      if ($222) {
       _abort();
       // unreachable;
      } else {
       $223 = (($R7$1) + 20|0);
       HEAP32[$223>>2] = $219;
       $224 = (($219) + 24|0);
       HEAP32[$224>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $225 = $135 | 1;
  $226 = (($p$0) + 4|0);
  HEAP32[$226>>2] = $225;
  $227 = (($p$0) + ($135)|0);
  HEAP32[$227>>2] = $135;
  $228 = HEAP32[((72 + 20|0))>>2]|0;
  $229 = ($p$0|0)==($228|0);
  if ($229) {
   HEAP32[((72 + 8|0))>>2] = $135;
   STACKTOP = sp;return;
  } else {
   $psize$1 = $135;
  }
 } else {
  $230 = $114 & -2;
  HEAP32[$113>>2] = $230;
  $231 = $psize$0 | 1;
  $232 = (($p$0) + 4|0);
  HEAP32[$232>>2] = $231;
  $233 = (($p$0) + ($psize$0)|0);
  HEAP32[$233>>2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $234 = $psize$1 >>> 3;
 $235 = ($psize$1>>>0)<(256);
 if ($235) {
  $236 = $234 << 1;
  $237 = ((72 + ($236<<2)|0) + 40|0);
  $238 = HEAP32[72>>2]|0;
  $239 = 1 << $234;
  $240 = $238 & $239;
  $241 = ($240|0)==(0);
  if ($241) {
   $242 = $238 | $239;
   HEAP32[72>>2] = $242;
   $$sum16$pre = (($236) + 2)|0;
   $$pre = ((72 + ($$sum16$pre<<2)|0) + 40|0);
   $$pre$phiZ2D = $$pre;$F16$0 = $237;
  } else {
   $$sum17 = (($236) + 2)|0;
   $243 = ((72 + ($$sum17<<2)|0) + 40|0);
   $244 = HEAP32[$243>>2]|0;
   $245 = HEAP32[((72 + 16|0))>>2]|0;
   $246 = ($244>>>0)<($245>>>0);
   if ($246) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $243;$F16$0 = $244;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $247 = (($F16$0) + 12|0);
  HEAP32[$247>>2] = $p$0;
  $248 = (($p$0) + 8|0);
  HEAP32[$248>>2] = $F16$0;
  $249 = (($p$0) + 12|0);
  HEAP32[$249>>2] = $237;
  STACKTOP = sp;return;
 }
 $250 = $psize$1 >>> 8;
 $251 = ($250|0)==(0);
 if ($251) {
  $I18$0 = 0;
 } else {
  $252 = ($psize$1>>>0)>(16777215);
  if ($252) {
   $I18$0 = 31;
  } else {
   $253 = (($250) + 1048320)|0;
   $254 = $253 >>> 16;
   $255 = $254 & 8;
   $256 = $250 << $255;
   $257 = (($256) + 520192)|0;
   $258 = $257 >>> 16;
   $259 = $258 & 4;
   $260 = $259 | $255;
   $261 = $256 << $259;
   $262 = (($261) + 245760)|0;
   $263 = $262 >>> 16;
   $264 = $263 & 2;
   $265 = $260 | $264;
   $266 = (14 - ($265))|0;
   $267 = $261 << $264;
   $268 = $267 >>> 15;
   $269 = (($266) + ($268))|0;
   $270 = $269 << 1;
   $271 = (($269) + 7)|0;
   $272 = $psize$1 >>> $271;
   $273 = $272 & 1;
   $274 = $273 | $270;
   $I18$0 = $274;
  }
 }
 $275 = ((72 + ($I18$0<<2)|0) + 304|0);
 $276 = (($p$0) + 28|0);
 $I18$0$c = $I18$0;
 HEAP32[$276>>2] = $I18$0$c;
 $277 = (($p$0) + 20|0);
 HEAP32[$277>>2] = 0;
 $278 = (($p$0) + 16|0);
 HEAP32[$278>>2] = 0;
 $279 = HEAP32[((72 + 4|0))>>2]|0;
 $280 = 1 << $I18$0;
 $281 = $279 & $280;
 $282 = ($281|0)==(0);
 L199: do {
  if ($282) {
   $283 = $279 | $280;
   HEAP32[((72 + 4|0))>>2] = $283;
   HEAP32[$275>>2] = $p$0;
   $284 = (($p$0) + 24|0);
   HEAP32[$284>>2] = $275;
   $285 = (($p$0) + 12|0);
   HEAP32[$285>>2] = $p$0;
   $286 = (($p$0) + 8|0);
   HEAP32[$286>>2] = $p$0;
  } else {
   $287 = HEAP32[$275>>2]|0;
   $288 = ($I18$0|0)==(31);
   if ($288) {
    $296 = 0;
   } else {
    $289 = $I18$0 >>> 1;
    $290 = (25 - ($289))|0;
    $296 = $290;
   }
   $291 = (($287) + 4|0);
   $292 = HEAP32[$291>>2]|0;
   $293 = $292 & -8;
   $294 = ($293|0)==($psize$1|0);
   L205: do {
    if ($294) {
     $T$0$lcssa = $287;
    } else {
     $295 = $psize$1 << $296;
     $K19$057 = $295;$T$056 = $287;
     while(1) {
      $303 = $K19$057 >>> 31;
      $304 = ((($T$056) + ($303<<2)|0) + 16|0);
      $299 = HEAP32[$304>>2]|0;
      $305 = ($299|0)==(0|0);
      if ($305) {
       break;
      }
      $297 = $K19$057 << 1;
      $298 = (($299) + 4|0);
      $300 = HEAP32[$298>>2]|0;
      $301 = $300 & -8;
      $302 = ($301|0)==($psize$1|0);
      if ($302) {
       $T$0$lcssa = $299;
       break L205;
      } else {
       $K19$057 = $297;$T$056 = $299;
      }
     }
     $306 = HEAP32[((72 + 16|0))>>2]|0;
     $307 = ($304>>>0)<($306>>>0);
     if ($307) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$304>>2] = $p$0;
      $308 = (($p$0) + 24|0);
      HEAP32[$308>>2] = $T$056;
      $309 = (($p$0) + 12|0);
      HEAP32[$309>>2] = $p$0;
      $310 = (($p$0) + 8|0);
      HEAP32[$310>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $311 = (($T$0$lcssa) + 8|0);
   $312 = HEAP32[$311>>2]|0;
   $313 = HEAP32[((72 + 16|0))>>2]|0;
   $314 = ($T$0$lcssa>>>0)<($313>>>0);
   if ($314) {
    _abort();
    // unreachable;
   }
   $315 = ($312>>>0)<($313>>>0);
   if ($315) {
    _abort();
    // unreachable;
   } else {
    $316 = (($312) + 12|0);
    HEAP32[$316>>2] = $p$0;
    HEAP32[$311>>2] = $p$0;
    $317 = (($p$0) + 8|0);
    HEAP32[$317>>2] = $312;
    $318 = (($p$0) + 12|0);
    HEAP32[$318>>2] = $T$0$lcssa;
    $319 = (($p$0) + 24|0);
    HEAP32[$319>>2] = 0;
    break;
   }
  }
 } while(0);
 $320 = HEAP32[((72 + 32|0))>>2]|0;
 $321 = (($320) + -1)|0;
 HEAP32[((72 + 32|0))>>2] = $321;
 $322 = ($321|0)==(0);
 if ($322) {
  $sp$0$in$i = ((72 + 456|0));
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $323 = ($sp$0$i|0)==(0|0);
  $324 = (($sp$0$i) + 8|0);
  if ($323) {
   break;
  } else {
   $sp$0$in$i = $324;
  }
 }
 HEAP32[((72 + 32|0))>>2] = -1;
 STACKTOP = sp;return;
}
function runPostSets() {
 
}
function _i64Subtract(a, b, c, d) {
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a - c)>>>0;
    h = (b - d)>>>0;
    h = (b - d - (((c>>>0) > (a>>>0))|0))>>>0; // Borrow one from high word to low word on underflow.
    return ((tempRet0 = h,l|0)|0);
}
function _i64Add(a, b, c, d) {
    /*
      x = a + b*2^32
      y = c + d*2^32
      result = l + h*2^32
    */
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a + c)>>>0;
    h = (b + d + (((l>>>0) < (a>>>0))|0))>>>0; // Add carry from low word to high word on overflow.
    return ((tempRet0 = h,l|0)|0);
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[((ptr)>>0)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[((ptr)>>0)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _bitshift64Shl(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = (high << bits) | ((low&(ander << (32 - bits))) >>> (32 - bits));
      return low << bits;
    }
    tempRet0 = low << (bits - 32);
    return 0;
}
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[((curr)>>0)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}
function _memcpy(dest, src, num) {

    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}
function _bitshift64Lshr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >>> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = 0;
    return (high >>> (bits - 32))|0;
  }
function _bitshift64Ashr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = (high|0) < 0 ? -1 : 0;
    return (high >> (bits - 32))|0;
  }
function _llvm_ctlz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = ((HEAP8[(((ctlz_i8)+(x >>> 24))>>0)])|0);
    if ((ret|0) < 8) return ret|0;
    ret = ((HEAP8[(((ctlz_i8)+((x >> 16)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = ((HEAP8[(((ctlz_i8)+((x >> 8)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 16)|0;
    return (((HEAP8[(((ctlz_i8)+(x&0xff))>>0)])|0) + 24)|0;
  }

function _llvm_cttz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = ((HEAP8[(((cttz_i8)+(x & 0xff))>>0)])|0);
    if ((ret|0) < 8) return ret|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 8)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 16)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 16)|0;
    return (((HEAP8[(((cttz_i8)+(x >>> 24))>>0)])|0) + 24)|0;
  }

// ======== compiled code from system/lib/compiler-rt , see readme therein
function ___muldsi3($a, $b) {
  $a = $a | 0;
  $b = $b | 0;
  var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
  $1 = $a & 65535;
  $2 = $b & 65535;
  $3 = Math_imul($2, $1) | 0;
  $6 = $a >>> 16;
  $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
  $11 = $b >>> 16;
  $12 = Math_imul($11, $1) | 0;
  return (tempRet0 = (($8 >>> 16) + (Math_imul($11, $6) | 0) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, 0 | ($8 + $12 << 16 | $3 & 65535)) | 0;
}
function ___divdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $7$0 = 0, $7$1 = 0, $8$0 = 0, $10$0 = 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  $7$0 = $2$0 ^ $1$0;
  $7$1 = $2$1 ^ $1$1;
  $8$0 = ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, 0) | 0;
  $10$0 = _i64Subtract($8$0 ^ $7$0, tempRet0 ^ $7$1, $7$0, $7$1) | 0;
  return (tempRet0 = tempRet0, $10$0) | 0;
}
function ___remdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $10$0 = 0, $10$1 = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  $rem = __stackBase__ | 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, $rem) | 0;
  $10$0 = _i64Subtract(HEAP32[$rem >> 2] ^ $1$0, HEAP32[$rem + 4 >> 2] ^ $1$1, $1$0, $1$1) | 0;
  $10$1 = tempRet0;
  STACKTOP = __stackBase__;
  return (tempRet0 = $10$1, $10$0) | 0;
}
function ___muldi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0, $2 = 0;
  $x_sroa_0_0_extract_trunc = $a$0;
  $y_sroa_0_0_extract_trunc = $b$0;
  $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
  $1$1 = tempRet0;
  $2 = Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0;
  return (tempRet0 = ((Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $2 | 0) + $1$1 | $1$1 & 0, 0 | $1$0 & -1) | 0;
}
function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0;
  $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
  return (tempRet0 = tempRet0, $1$0) | 0;
}
function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  $rem = __stackBase__ | 0;
  ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
  STACKTOP = __stackBase__;
  return (tempRet0 = HEAP32[$rem + 4 >> 2] | 0, HEAP32[$rem >> 2] | 0) | 0;
}
function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  $rem = $rem | 0;
  var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $49 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $86 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $117 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $154$0 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $q_sroa_0_0_insert_insert77$1 = 0, $_0$0 = 0, $_0$1 = 0;
  $n_sroa_0_0_extract_trunc = $a$0;
  $n_sroa_1_4_extract_shift$0 = $a$1;
  $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
  $d_sroa_0_0_extract_trunc = $b$0;
  $d_sroa_1_4_extract_shift$0 = $b$1;
  $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
  if (($n_sroa_1_4_extract_trunc | 0) == 0) {
    $4 = ($rem | 0) != 0;
    if (($d_sroa_1_4_extract_trunc | 0) == 0) {
      if ($4) {
        HEAP32[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
        HEAP32[$rem + 4 >> 2] = 0;
      }
      $_0$1 = 0;
      $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$4) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    }
  }
  $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
  do {
    if (($d_sroa_0_0_extract_trunc | 0) == 0) {
      if ($17) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
          HEAP32[$rem + 4 >> 2] = 0;
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      if (($n_sroa_0_0_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0;
          HEAP32[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
      if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0 | $a$0 & -1;
          HEAP32[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
        }
        $_0$1 = 0;
        $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $49 = _llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0;
      $51 = $49 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
      if ($51 >>> 0 <= 30) {
        $57 = $51 + 1 | 0;
        $58 = 31 - $51 | 0;
        $sr_1_ph = $57;
        $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
        $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
        $q_sroa_0_1_ph = 0;
        $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
        break;
      }
      if (($rem | 0) == 0) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = 0 | $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$17) {
        $117 = _llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0;
        $119 = $117 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        if ($119 >>> 0 <= 31) {
          $125 = $119 + 1 | 0;
          $126 = 31 - $119 | 0;
          $130 = $119 - 31 >> 31;
          $sr_1_ph = $125;
          $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
          $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
          $q_sroa_0_1_ph = 0;
          $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
          break;
        }
        if (($rem | 0) == 0) {
          $_0$1 = 0;
          $_0$0 = 0;
          return (tempRet0 = $_0$1, $_0$0) | 0;
        }
        HEAP32[$rem >> 2] = 0 | $a$0 & -1;
        HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
      if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
        $86 = (_llvm_ctlz_i32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 | 0;
        $88 = $86 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        $89 = 64 - $88 | 0;
        $91 = 32 - $88 | 0;
        $92 = $91 >> 31;
        $95 = $88 - 32 | 0;
        $105 = $95 >> 31;
        $sr_1_ph = $88;
        $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
        $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
        $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
        $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
        break;
      }
      if (($rem | 0) != 0) {
        HEAP32[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
        HEAP32[$rem + 4 >> 2] = 0;
      }
      if (($d_sroa_0_0_extract_trunc | 0) == 1) {
        $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$0 = 0 | $a$0 & -1;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      } else {
        $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
        $_0$1 = 0 | $n_sroa_1_4_extract_trunc >>> ($78 >>> 0);
        $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
    }
  } while (0);
  if (($sr_1_ph | 0) == 0) {
    $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
    $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
    $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
    $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = 0;
  } else {
    $d_sroa_0_0_insert_insert99$0 = 0 | $b$0 & -1;
    $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
    $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0, $d_sroa_0_0_insert_insert99$1, -1, -1) | 0;
    $137$1 = tempRet0;
    $q_sroa_1_1198 = $q_sroa_1_1_ph;
    $q_sroa_0_1199 = $q_sroa_0_1_ph;
    $r_sroa_1_1200 = $r_sroa_1_1_ph;
    $r_sroa_0_1201 = $r_sroa_0_1_ph;
    $sr_1202 = $sr_1_ph;
    $carry_0203 = 0;
    while (1) {
      $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
      $149 = $carry_0203 | $q_sroa_0_1199 << 1;
      $r_sroa_0_0_insert_insert42$0 = 0 | ($r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31);
      $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
      _i64Subtract($137$0, $137$1, $r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1) | 0;
      $150$1 = tempRet0;
      $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
      $152 = $151$0 & 1;
      $154$0 = _i64Subtract($r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1, $151$0 & $d_sroa_0_0_insert_insert99$0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1) | 0;
      $r_sroa_0_0_extract_trunc = $154$0;
      $r_sroa_1_4_extract_trunc = tempRet0;
      $155 = $sr_1202 - 1 | 0;
      if (($155 | 0) == 0) {
        break;
      } else {
        $q_sroa_1_1198 = $147;
        $q_sroa_0_1199 = $149;
        $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
        $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
        $sr_1202 = $155;
        $carry_0203 = $152;
      }
    }
    $q_sroa_1_1_lcssa = $147;
    $q_sroa_0_1_lcssa = $149;
    $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
    $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = $152;
  }
  $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
  $q_sroa_0_0_insert_ext75$1 = 0;
  $q_sroa_0_0_insert_insert77$1 = $q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1;
  if (($rem | 0) != 0) {
    HEAP32[$rem >> 2] = 0 | $r_sroa_0_1_lcssa;
    HEAP32[$rem + 4 >> 2] = $r_sroa_1_1_lcssa | 0;
  }
  $_0$1 = (0 | $q_sroa_0_0_insert_ext75$0) >>> 31 | $q_sroa_0_0_insert_insert77$1 << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
  $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
  return (tempRet0 = $_0$1, $_0$0) | 0;
}
// =======================================================================



// EMSCRIPTEN_END_FUNCS

    

  // EMSCRIPTEN_END_FUNCS
  

    return { _i64Subtract: _i64Subtract, _free: _free, _scrypt_wrapper: _scrypt_wrapper, _i64Add: _i64Add, _strlen: _strlen, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _libcperciva_HMAC_SHA256_Buf: _libcperciva_HMAC_SHA256_Buf, _bitshift64Shl: _bitshift64Shl, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0 };
  })
  // EMSCRIPTEN_END_ASM
  ({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "min": Math_min, "_fflush": _fflush, "_abort": _abort, "___setErrNo": ___setErrNo, "_sbrk": _sbrk, "_time": _time, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_sysconf": _sysconf, "___errno_location": ___errno_location, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity }, buffer);
  var real__i64Subtract = asm["_i64Subtract"]; asm["_i64Subtract"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__i64Subtract.apply(null, arguments);
};

var real__scrypt_wrapper = asm["_scrypt_wrapper"]; asm["_scrypt_wrapper"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__scrypt_wrapper.apply(null, arguments);
};

var real__i64Add = asm["_i64Add"]; asm["_i64Add"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__i64Add.apply(null, arguments);
};

var real__strlen = asm["_strlen"]; asm["_strlen"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__strlen.apply(null, arguments);
};

var real__libcperciva_HMAC_SHA256_Buf = asm["_libcperciva_HMAC_SHA256_Buf"]; asm["_libcperciva_HMAC_SHA256_Buf"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__libcperciva_HMAC_SHA256_Buf.apply(null, arguments);
};

var real__bitshift64Shl = asm["_bitshift64Shl"]; asm["_bitshift64Shl"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__bitshift64Shl.apply(null, arguments);
};

var real_runPostSets = asm["runPostSets"]; asm["runPostSets"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_runPostSets.apply(null, arguments);
};
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _free = Module["_free"] = asm["_free"];
var _scrypt_wrapper = Module["_scrypt_wrapper"] = asm["_scrypt_wrapper"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _libcperciva_HMAC_SHA256_Buf = Module["_libcperciva_HMAC_SHA256_Buf"] = asm["_libcperciva_HMAC_SHA256_Buf"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
  
  Runtime.stackAlloc = asm['stackAlloc'];
  Runtime.stackSave = asm['stackSave'];
  Runtime.stackRestore = asm['stackRestore'];
  Runtime.setTempRet0 = asm['setTempRet0'];
  Runtime.getTempRet0 = asm['getTempRet0'];
  

// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (typeof Module['locateFile'] === 'function') {
    memoryInitializer = Module['locateFile'](memoryInitializer);
  } else if (Module['memoryInitializerPrefixURL']) {
    memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      for (var i = 0; i < data.length; i++) {
        assert(HEAPU8[STATIC_BASE + i] === 0, "area for memory initializer should not have been touched before it's loaded");
      }
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram']), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    exit(ret);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return; 

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  if (Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') called, but noExitRuntime, so not exiting');
    return;
  }

  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  if (ENVIRONMENT_IS_NODE) {
    // Work around a node.js bug where stdout buffer is not flushed at process exit:
    // Instead of process.exit() directly, wait for stdout flush event.
    // See https://github.com/joyent/node/issues/1669 and https://github.com/kripken/emscripten/issues/2582
    // Workaround is based on https://github.com/RReverser/acorn/commit/50ab143cecc9ed71a2d66f78b4aec3bb2e9844f6
    process['stdout']['once']('drain', function () {
      process['exit'](status);
    });
    console.log(' '); // Make sure to print something to force the drain event to occur, in case the stdout buffer was empty.
    // Work around another node bug where sometimes 'drain' is never fired - make another effort
    // to emit the exit status, after a significant delay (if node hasn't fired drain by then, give up)
    setTimeout(function() {
      process['exit'](status);
    }, 500);
  } else
  if (ENVIRONMENT_IS_SHELL && typeof quit === 'function') {
    quit(status);
  }
  // if we reach here, we must throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



