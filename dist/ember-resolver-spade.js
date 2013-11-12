// ==========================================================================
// Project:   Ember - JavaScript Application Framework
// Copyright: Copyright 2013 Stefan Penner and Ember App Kit Contributors
// License:   Licensed under MIT license
//            See https://raw.github.com/stefanpenner/ember-jj-abrams-resolver/master/LICENSE
// ==========================================================================


 // Version: 0.0.1

minispade.register('ember-resolver/core', "(function() {/*globals define registry requirejs */\n\ndefine(\"resolver\",\n  [\"exports\"],\n  function() {\n    \"use strict\";\n  /*\n   *\n   * This module defines a subclass of Ember.DefaultResolver that works with\n   * ES6 modules transpiled into AMD, and provides injections to classes that\n   * implement `extend` (as is typical with Ember).\n   *\n   */\n\n  // Return module or null\n  function tryRequire(deps) {\n    try {\n      return require(deps, null, null, true /* force sync */);\n    } catch (err) {\n      return null;\n    }\n  }\n\n  function classFactory(klass) {\n    return {\n      create: function (injections) {\n        if (typeof klass.extend === 'function') {\n          return klass.extend(injections);\n        } else {\n          return klass;\n        }\n      }\n    };\n  }\n\n  var underscore = Ember.String.underscore;\n  var classify = Ember.String.classify;\n  var get = Ember.get;\n\n  function parseName(fullName) {\n    /*jshint validthis:true */\n\n    var nameParts = fullName.split(\":\"),\n        type = nameParts[0], fullNameWithoutType = nameParts[1],\n        name = fullNameWithoutType,\n        namespace = get(this, 'namespace'),\n        root = namespace;\n\n    return {\n      fullName: fullName,\n      type: type,\n      fullNameWithoutType: fullNameWithoutType,\n      name: name,\n      root: root,\n      resolveMethodName: \"resolve\" + classify(type)\n    };\n  }\n\n  function chooseModuleName(moduleName) {\n    var underscoredModuleName = Ember.String.underscore(moduleName);\n\n    if (moduleName !== underscoredModuleName && tryRequire(moduleName) && tryRequire(underscoredModuleName)) {\n      throw new TypeError(\"Ambigous module names: `\" + moduleName + \"` and `\" + underscoredModuleName + \"`\");\n    }\n\n    if (tryRequire(moduleName)) {\n      return moduleName;\n    } else if (tryRequire(moduleName)) {\n      return underscoredModuleName;\n    } else {\n      return moduleName;\n    }\n  }\n\n  function resolveRouter(parsedName) {\n    /*jshint validthis:true */\n\n    var prefix = this.namespace.modulePrefix,\n        routerModule;\n\n    if (parsedName.fullName === 'router:main') {\n      // for now, lets keep the router at app/router.js\n      routerModule = tryRequire(prefix + '/router');\n      if (routerModule) {\n        if (routerModule.default) { routerModule = routerModule.default; }\n\n        return routerModule;\n      }\n    }\n  }\n\n  function resolveOther(parsedName) {\n    /*jshint validthis:true */\n\n    var prefix = this.namespace.modulePrefix;\n    Ember.assert('module prefix must be defined', prefix);\n\n    var pluralizedType = parsedName.type + 's';\n    var name = parsedName.fullNameWithoutType;\n\n    var moduleName = prefix + '/' +  pluralizedType + '/' + name;\n\n    // allow treat all dashed and all underscored as the same thing\n    // supports components with dashes and other stuff with underscores.\n    var normalizedModuleName = chooseModuleName(moduleName);\n\n    var module = tryRequire(normalizedModuleName);\n    if (module) {\n      if (module.default) { module = module.default; }\n\n      if (module === undefined) {\n        throw new Error(\" Expected to find: '\" + parsedName.fullName + \"' within '\" + normalizedModuleName + \"' but got 'undefined'. Did you forget to `export default` within '\" + normalizedModuleName + \"'?\");\n      }\n\n      if (this.shouldWrapInClassFactory(module, parsedName)) {\n        module = classFactory(module);\n      }\n\n      if (Ember.ENV.LOG_MODULE_RESOLVER) {\n        Ember.Logger.info('hit', moduleName);\n      }\n\n      return module;\n    } else {\n      if (Ember.ENV.LOG_MODULE_RESOLVER) {\n        Ember.Logger.info('miss', moduleName);\n      }\n      return this._super(parsedName);\n    }\n  }\n  // Ember.DefaultResolver docs:\n  //   https://github.com/emberjs/ember.js/blob/master/packages/ember-application/lib/system/resolver.js\n  var Resolver = Ember.DefaultResolver.extend({\n    resolveTemplate: resolveOther,\n    resolveOther: resolveOther,\n    resolveRouter: resolveRouter,\n    parseName: parseName,\n    shouldWrapInClassFactory: function(module, parsedName){\n      return false;\n    },\n    normalize: function(fullName) {\n      // replace `.` with `/` in order to make nested controllers work in the following cases\n      // 1. `needs: ['posts/post']`\n      // 2. `{{render \"posts/post\"}}`\n      // 3. `this.render('posts/post')` from Route\n      return Ember.String.dasherize(fullName.replace(/\\./g, '/'));\n    }\n  });\n\n  Resolver.default = Resolver;\n  return Resolver;\n});\n\n})();\n//@ sourceURL=ember-resolver/core");minispade.register('ember-resolver', "(function() {minispade.require('ember-resolver/core');\n\n})();\n//@ sourceURL=ember-resolver");