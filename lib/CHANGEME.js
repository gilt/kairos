/* global _: false */
(function(exports, _) {

  var
    root = this,
    logChannelFactory = function (channel) {
      // Have to do some fancy shit here since all the console methods are native,
      // you can't use apply on them in all browsers and you can't alias them in
      // all browsers.
      return function (text, args) {
        if (root.console && console[channel]) { // Allow late binding, e.g. Firebug
          args = [].splice.call(arguments, 1);
          if (0 === args.length) { // Handle the simple use-case first, to avoid the possibility of an error, and the associated overhead
            console[channel](text);
          } else {
            try { // This part is in a try-catch since in several browsers, you're not allowed to use apply on a native method
              console[channel].apply(null, [].splice.call(arguments, 0));
            } catch (e) { // In those cases, just dump the args
              console[channel](text, args);
            }
          }
        }
      };
    };

  exports.CHANGEME = function CHANGEME () {
    this.logger.info('CHANGEME SAYS HELLO');
  };

  _.extend(exports.CHANGEME.prototype, {

    /**
     * Publishes an event on a given channel.
     *
     * @public
     * @method publish
     *
     * @param {String} channel         A channel on which to publish
     * @param {Mixed}  [args]          An array of arguments to be passed to the subscribers, or a single argument
     * @param {Object} [scope=window]  Scope in which to execute the subscribers (defaults to window)
     */
    publish: function (channel, args, scope) {
      var self = this;

      if (self._notifyChannels && self._notifyChannels[channel]) {
        if (!_.isArray(args)) {
          args = [args];
        }

        _.each(self._notifyChannels[channel], function (fn) {
          try {
            fn.apply(scope, args);
          } catch (e) {
            self.logger.error(e);
          }
        });
      }
    },

    /**
     * Subscribes a function to a given channel.
     *
     * @public
     * @method subscribe
     *
     * @param  {String}   channel  A channel on which to listen
     * @param  {Function} fn       A function to be called when the subscribed event publishes
     */
    subscribe: function (channel, fn) {
      if (!this._notifyChannels) {
        this._notifyChannels = {};
      }
      if (!this._notifyChannels[channel]) {
        this._notifyChannels[channel] = [];
      }
      this._notifyChannels[channel].push(fn);
    },


    logger: {
      log:   logChannelFactory('log'),
      info:  logChannelFactory('info'),
      debug: logChannelFactory('debug'),
      warn:  logChannelFactory('warn'),
      error: logChannelFactory('error')
    }
  });

}(
  'object' === typeof exports && exports || this, // exports
  this._ || this.require && require('underscore') // _
));
