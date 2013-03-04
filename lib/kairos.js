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
    },

    DURATION_MULTIPLIERS = [
      1000 * 60 * 60 * 24 * 365,
      1000 * 60 * 60 * 24 * 30,
      1000 * 60 * 60 * 24,
      1000 * 60 * 60,
      1000 * 60,
      1000
    ],
    DURATION_PARSER = new RegExp(
      '^' +
        '\\s*P?\\s*' +
        '(?:' +
          '(\\d+)' + // {Years}
          'Y' +
        ')?' +
        '\\s*' +
        '(?:' +
          '(\\d+)' + // {Months}
          'M' +
        ')?' +
        '\\s*' +
        '(?:' +
          '(\\d+)' + // {Days}
          'D' +
        ')?' +
        '\\s*T?\\s*' +
        '(?:' +
          '(\\d+)' + // {Hours}
          'H' +
        ')?' +
        '\\s*' +
        '(?:' +
          '(\\d+)' + // {Minutes}
          'M' +
        ')?' +
        '\\s*' +
        '(?:' +
          '(\\d+)' + // {Seconds}
          'S' +
        ')?' +
      '$',
      'i'
    );

  /**
   * @private
   * @method  millisecondsFromDuration
   *
   * @param   {String} duration  LDML style duration string
   *
   * @return  {Number}
   */
  function millisecondsFromDuration (duration) {
    return _.reduce(
      _.map(
        duration.match(DURATION_PARSER).splice(1),
        function (n, i) {
          return (parseInt(n, 10) * DURATION_MULTIPLIERS[i]) || 0;
        }
      ),
      function (sum, n) {
        return sum + n;
      },
      0);
  }

  /**
   * @private
   * @method  normalizeFrames
   *
   * @param  {Object}          options                              Options hash
   * @param  {Object}          options.times                        Key/value pair of named times, and timestamps or data attributes containing a timestamp
   * @param  {Object[]}        options.frames                       Set of frames
   * @param  {Number|String}   options.frames.relatedTo             Time to count towards/from
   * @param  {Number}          [options.frames.interval]            Interval between renders
   * @param  {String}          [options.frames.frameName]           If this frame is named, we'll fire a special pubsub event when we reach it
   * @param  {Boolean|Number}  [options.frames.sync=true]           Should we ensure that we render exactly on the (second/minute/hour/day) ?
   * @param  {Object}          options.frames.begin                 When does a frame begin?
   * @param  {Number|String}   [options.frames.begin.at]            Begin at a specific time, e.g. 0 or "teatime" or 1234567890
   * @param  {Number|String}   [options.frames.begin.starting]      Offset by an LDML duration or a number of milliseconds, e.g. "5M" or 1000
   * @param  {Number|String}   [options.frames.begin.after]         Begin {offset} after this time, e.g. "teatime" or 1234567890
   * @param  {Number|String}   [options.frames.begin.before]        Begin {offset} before this time, e.g. "teatime" or 1234567890
   * @param  {Number|String}   [options.frames.begin.interpolated]  Begin at a percent {between} this time {and} another time, e.g. 0.5 or "50%"
   * @param  {Number|String}   [options.frames.begin.between]       Begin {at}% between this time {and} another time, e.g. "teatime" or 1234567890
   * @param  {Number|String}   [options.frames.begin.and]           Begin {at}% {between} this time and another time, e.g. "teatime" or 1234567890
   */
  function normalizeFrames (options) {
    _.each(options.times, function (time, name) {
      if (_.isDate(time)) {
        options.times[name] = time.getTime();
      }
    });

    _.each(options.frames, function (frame) {
      if (_.isUndefined(frame.sync)) {
        frame.sync = true;
      }

      /*
       timeToRender and (under begin) at, after, before, between, & and, can all
       be either a timestamp or a named time. For each of them, checks to see if
       it is a named time, and if so, replaces it with the corresponding
       timestamp.
       */
      if (_.isString(frame.timeToRender))  { frame.timeToRender  = options.times[frame.timeToRender];  }
      if (_.isString(frame.begin.at))      { frame.begin.at      = options.times[frame.begin.at];      }
      if (_.isString(frame.begin.after))   { frame.begin.after   = options.times[frame.begin.after];   }
      if (_.isString(frame.begin.before))  { frame.begin.before  = options.times[frame.begin.before];  }
      if (_.isString(frame.begin.between)) { frame.begin.between = options.times[frame.begin.between]; }
      if (_.isString(frame.begin.and))     { frame.begin.and     = options.times[frame.begin.and];     }

      /* Checks for a date or moment */
      if (frame.begin.at && !_.isNumber(frame.begin.at)) {
        if (_.isDate(frame.begin.at)) {
          frame.begin.at = frame.begin.at.getTime();
        }
      }

      /*
       begin.interpolated is a percent, in either decimal form, or string form.
       We want to normalize this to decimal form.
       */
      if (_.isString(frame.begin.interpolated)) {
        frame.begin.interpolated = parseFloat(frame.begin.interpolated) / 100;
      }

      /*
       begin.interpolated is a percent, in either decimal form, or string form.
       We want to normalize this to decimal form.
       */
      if (_.isString(frame.begin.interpolated)) {
        frame.begin.interpolated = parseFloat(frame.begin.interpolated) / 100;
      }

      /*
       begin.starting is a duration, in either millisecond form, or LDML string
       form. We want to normalize this to millisecond form.
       */
      if (_.isString(frame.begin.starting)) {
        frame.begin.starting = millisecondsFromDuration(frame.begin.starting);
      }

      /*
       interval is a duration, in either millisecond form, or LDML string form.
       We want to normalize this to millisecond form.
       */
      if (_.isString(frame.interval)) {
        frame.interval = millisecondsFromDuration(frame.interval);
      }

      /* The simplest scenario: starts the frame at a specific time */
      if (_.isNumber(frame.begin.at)) {

        frame.begin = frame.begin.at;

        /* Starts the frame at an offset before or after a specific time */
      } else if (_.isNumber(frame.begin.starting)) {
        if (_.isNumber(frame.begin.before)) {

          frame.begin = frame.begin.before - frame.begin.starting;

        } else if(_.isNumber(frame.begin.after)) {

          frame.begin = frame.begin.after  + frame.begin.starting;

        }

        /*
         In this scenario, the frame will begin at a moment that is interpolated
         between two specific times.
         */
      } else if (
        _.isNumber(frame.begin.interpolated) &&
          _.isNumber(frame.begin.between) &&
          _.isNumber(frame.begin.and)) {

        frame.begin = frame.begin.between + (frame.begin.and - frame.begin.between) * frame.begin.interpolated;

      }
    });
  }

  /**
   * Selects the current frame.
   *
   * @private
   * @method  currentFrame
   *
   * @param  {Object[]} frames  Set of frames
   *
   * @return {Object}
   */
  function currentFrame (frames) {
    var now = (new Date()).getTime();
    return _.last(_.select(frames, function (frame) {
      return frame.begin <= now;
    }));
  }

  /**
   * Selects the next frame.
   *
   * @private
   * @method  nextFrame
   *
   * @param  {Object[]} frames  Set of frames
   *
   * @return {Object}
   */
  function nextFrame (frames) {
    var now = (new Date()).getTime();
    return _.find(frames, function (frame) {
      return frame.begin > now;
    });
  }

  /**
   * Determines the start time of the next interval or frame, accounting for
   * syncing if it is requested.
   *
   * @private
   * @method  nextTick
   *
   * @param  {Object}          thisFrame             The current frame
   * @param  {Number}          [thisFrame.interval]  Interval until the next time
   * @param  {Number|Boolean}  [thisFrame.sync]      Should the time be sync'd to the nearest N milliseconds (which might be the same as the interval)
   * @param  {Object}          laterFrame            The next frame, if it exists
   * @param  {Number}          laterFrame.begin      When the next frame starts
   *
   * @return {Number|Boolean}
   */
  function nextTick (thisFrame, laterFrame) {
    var now, nextInterval = false;

    /* Are we rerendering this frame periodically? */
    if (thisFrame.interval) {
      /* If so, we need to know when we currently are */
      now = (new Date()).getTime();

      /* And do some math. For an explanation of this math, buy me a beer */
      nextInterval =                       // example:
        now +                              //   123123
          thisFrame.interval -             // + 15000 = 138123
          (                                // - 3123  = 135000
            thisFrame.sync ?
              (now + thisFrame.interval) % //   138123
                (true === thisFrame.sync ? // % 15000 = 3123
                  thisFrame.interval
                  : thisFrame.sync)
              : 0
            );
    }

    /* If there is a later frame */
    if (laterFrame) {
      /* And we can rerender this frame */
      if (nextInterval) {
        /* Return the lesser of two timestamps */
        return Math.min(nextInterval, laterFrame.begin);
      } else {
        /* Otherwise, just return the next frame's start time */
        return laterFrame.begin;
      }
    } else {
      /* Or the next interval, if it exists */
      return nextInterval;
    }
  }

  /**
   * @private
   * @method  renderLoop
   */
  function renderLoop () {
    console.info('RENDER LOOP', this, this._options);

    var
      self = this,
      frame = currentFrame(self._options.frames),
      next, now;

    /*
     We shouldn't ever not have a time frame, unless there are no frames at
     all. If this happens, report it, and give up.
     */
    if (!frame) {
      self.logger.error('No Time Frame Available');
      return;
    }

    /* If this is the first time we're rendering this frame, we have some housework to take care of */
    if (!frame.started) {
      frame.started = true;

      self.logger.info('Frame is Changing to %o', frame);

      /*
       Let interested parties know that the frame just changed. Include the
       rendered element and the current frame
       */
      self.publish('frameChanged', frame);

      /*
       If we have a frame name, we publish on an additional channel, and add
       a state class to the container element
       */
      if (frame.frameName) {
        self.publish('frameChanged/' + frame.frameName, frame);
      }
    }

    now = (new Date()).getTime();

    self.publish('tick', frame.timeToRender - now);

    /* Calculates the next time we need to render, if at all */
    next = nextTick(frame, nextFrame(this._options.frames));

    if (next) {
      /* If we need to render, schedules it */
      self._timeout = setTimeout(function () {
        renderLoop.call(self);
      }, next - now);
    }
  }

  /**
   * Creates a new Kairos
   *
   * @public
   * @constructor Kairos
   *
   * @param  {Object}          options                              Options hash
   * @param  {Object}          options.times                        Key/value pair of named times, and timestamps or data attributes containing a timestamp
   * @param  {Object[]}        options.frames                       Set of frames
   * @param  {Number|String}   options.frames.relatedTo             Time to count towards/from
   * @param  {Number}          [options.frames.interval]            Interval between renders
   * @param  {String}          [options.frames.frameName]           If this frame is named, we'll fire a special pubsub event when we reach it
   * @param  {Boolean|Number}  [options.frames.sync=true]           Should we ensure that we render exactly on the (second/minute/hour/day) ?
   * @param  {Object}          options.frames.begin                 When does a frame begin?
   * @param  {Number|String}   [options.frames.begin.at]            Begin at a specific time, e.g. 0 or "teatime" or 1234567890
   * @param  {Number|String}   [options.frames.begin.starting]      Offset by an LDML duration or a number of milliseconds, e.g. "5M" or 1000
   * @param  {Number|String}   [options.frames.begin.after]         Begin {offset} after this time, e.g. "teatime" or 1234567890
   * @param  {Number|String}   [options.frames.begin.before]        Begin {offset} before this time, e.g. "teatime" or 1234567890
   * @param  {Number|String}   [options.frames.begin.interpolated]  Begin at a percent {between} this time {and} another time, e.g. 0.5 or "50%"
   * @param  {Number|String}   [options.frames.begin.between]       Begin {at}% between this time {and} another time, e.g. "teatime" or 1234567890
   * @param  {Number|String}   [options.frames.begin.and]           Begin {at}% {between} this time and another time, e.g. "teatime" or 1234567890
   */
  function Kairos (options) {
    _.defaults(options, {
      times: {},
      frames: []
    });

    normalizeFrames(options);
    this._options = options;
    this.logger.info('Kairos created with options', JSON.stringify(options));

    renderLoop.call(this);
  }

  _.extend(Kairos.prototype, {

    pause: function () {
      clearTimeout(this._timeout);
      this._isPaused = true;
    },

    resume: function () {
      if (this._isPaused) {
        this._isPaused = false;
        renderLoop.call(this);
      }
    },

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

  exports.Kairos = Kairos;

}(
  'object' === typeof exports && exports || this, // exports
  this._ || this.require && require('underscore') // _
));
