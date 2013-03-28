/* global _: false */
(function (exports, _, KairosTimeFrame, privateKey) {

  function logChannelFactory (channel) {
    // Have to do some fancy shit here since all the console methods are native,
    // you can't use apply on them in all browsers and you can't alias them in
    // all browsers.
    return function (text, args) {
      if (exports.console && console[channel]) { // Allow late binding, e.g. Firebug
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
  }

  function wireupSubscriptions (frame) {
    var self = this;

    frame.subscribe('began', function (f) {
      self.publish('timeFrameBegan', [f]);
      if (f.getName()) {
        self.publish(f.getName() + '/began', [f]);
      }
    });

    frame.subscribe('ended', function (f) {
      self.publish('timeFrameEnded', [f]);
      if (f.getName()) {
        self.publish(f.getName() + '/ended', [f]);
      }
    });

    frame.subscribe('ticked', function (f) {
      self.publish('timeFrameTicked', [f]);
      if (f.getName()) {
        self.publish(f.getName() + '/ticked', [f]);
      }
    });

    frame.subscribe('muted', function (f) {
      self.publish('timeFrameMuted', [f]);
      if (f.getName()) {
        self.publish(f.getName() + '/muted', [f]);
      }
    });

    frame.subscribe('unmuted', function (f) {
      self.publish('timeFrameUnmuted', [f]);
      if (f.getName()) {
        self.publish(f.getName() + '/unmuted', [f]);
      }
    });
  }

  function KairosCollection (frames) {
    this.logger.info('Creating a new Kairos Collection');

    var
      privateData = {
        frames: _.map(frames, function (frame) {
          if (frame instanceof KairosTimeFrame) {
            return frame;
          } else {
            return new KairosTimeFrame(frame);
          }
        }),
        notifyChannels: {}
      },
      names = _.compact(_.invoke(privateData.frames, 'getName'));

    if (names.length !== _.unique(names).length) {
      throw 'Duplicate Names';
    }

    _.each(privateData.frames, _.bind(wireupSubscriptions, this));

    this._private = function (key) {
      if (key === privateKey) {
        return privateData;
      }
      throw 'Access Denied';
    };
  }

  _.extend(KairosCollection.prototype, {
    start: function () {
      _.invoke(this._private(privateKey).frames, 'start');

      return this;
    },

    stop: function () {
      _.invoke(this._private(privateKey).frames, 'stop');

      return this;
    },

    mute: function () {
      _.invoke(this._private(privateKey).frames, 'mute');

      return this;
    },

    unmute: function () {
      _.invoke(this._private(privateKey).frames, 'unmute');

      return this;
    },

    subscribe: function (channel, fn) {
      var notifyChannels = this._private(privateKey).notifyChannels;

      if (!notifyChannels[channel]) {
        notifyChannels[channel] = [];
      }
      notifyChannels[channel].push(fn);

      return this;
    },

    publish: function (channel, args, scope) {
      var
        self = this,
        notifyChannels = this._private(privateKey).notifyChannels;

      if (notifyChannels[channel]) {
        if (!_.isArray(args)) {
          args = [args];
        }

        _.each(notifyChannels[channel], function (fn) {
          try {
            fn.apply(scope, args);
          } catch (e) {
            self.logger.error(e);
          }
        });
      }

      return this;
    },

    unsubscribe: function (handle) {
      var
        notifyChannels = this._private(privateKey).notifyChannels,
        channel = handle[0],
        fn = handle[1],
        i;

      if (notifyChannels[channel]) {
        for (i = 0; i < notifyChannels[channel].length; i += 1) {
          if (notifyChannels[channel][i] === fn) {
            notifyChannels[channel].splice(i, 1);
          }
        }
      }

      return this;
    },

    toJSON: function () {
      return {};
    }, // TODO

    toString: function () {
      return JSON.stringify(this.toJson(), null, 2);
    },

    logger: {
      log:   logChannelFactory('log'),
      info:  logChannelFactory('info'),
      debug: logChannelFactory('debug'),
      warn:  logChannelFactory('warn'),
      error: logChannelFactory('error')
    },

    pushTimeFrame: function (frame) {
      if (!(frame instanceof KairosTimeFrame)) {
        frame = new KairosTimeFrame(frame);
      }

      this.logger.info('Adding new Time Frame', frame);

      this._private(privateKey).frames.push(frame);

      wireupSubscriptions.call(this, frame);

      return this;
    },

    extendNamedTimes: function (obj) {
      _.invoke(this._private(privateKey).frames, 'extendNamedTimes', obj);

      return this;
    },

    getTimeFrames: function () {
      return _.clone(this._private(privateKey).frames);
    },

    getNamedTimeFrame: function (name) {
      if (!name) {
        throw 'No Name Provided';
      } else {
        return _.find(this._private(privateKey).frames, function (frame) {
          return frame.getName() === name;
        });
      }
    }
  });

  KairosCollection.prototype.toJson = KairosCollection.prototype.toJSON;

  exports.KairosCollection = KairosCollection;

}(
  'object' === typeof exports && exports || this,
  'object' === typeof exports && (require && require('underscore')) || this._ || _,
  'object' === typeof exports && exports.KairosTimeFrame || this.KairosTimeFrame,
  Math.floor(Math.random() * 10000000 + 10000000).toString(36)
));