/*! kairos v0.4.0 2013-08-19 */
/*global _: false, define: false, exports: false */
(function (exports) {

  function create () {

    var
      errors = {};

    /**
     * @public
     * @constructor AccessDenied
     *
     * @param {String} [message]
     */
    function AccessDenied (message) {
      this.name = 'AccessDenied';
      this.message = message || 'Access is denied';
    }
    AccessDenied.prototype = new Error();
    AccessDenied.prototype.constructor = AccessDenied;
    errors.AccessDenied = AccessDenied;

    /**
     * @public
     * @constructor DuplicateError
     *
     * @param {String} [message]
     */
    function DuplicateError (message) {
      this.name = 'DuplicateError';
      this.message = message || 'Duplicate values found';
    }
    DuplicateError.prototype = new Error();
    DuplicateError.prototype.constructor = DuplicateError;
    errors.DuplicateError = DuplicateError;

    /**
     * @public
     * @constructor ImmutableError
     *
     * @param {String} [message]
     */
    function ImmutableError (message) {
      this.name = 'ImmutableError';
      this.message = message || 'This object is immutable';
    }
    ImmutableError.prototype = new Error();
    ImmutableError.prototype.constructor = ImmutableError;
    errors.ImmutableError = ImmutableError;

    /**
     * @public
     * @constructor MissingParameter
     *
     * @param {String} [message]
     */
    function MissingParameter (message) {
      this.name = 'MissingParameter';
      this.message = message || 'No value was provided';
    }
    MissingParameter.prototype = new Error();
    MissingParameter.prototype.constructor = MissingParameter;
    errors.MissingParameter = MissingParameter;

    return errors;
  }

  if ('function' === typeof define && define.amd) {
    define('kairos_errors', [], create);
  } else {
    exports.KairosErrors = create();
  }

}('object' === typeof exports && exports || this));

/*global _: false, define: false, require: false, exports: false */
(function (exports) {

  function create (_) {
    function KairosEvent (name, timeFrame) {
      this.eventTime = (new Date()).getTime();
      this.eventName = name;
      this.timeFrameName = timeFrame.getName();
      this.userData = timeFrame.getData();
      this.getDurationRelativeTo = _.bind(timeFrame.getDurationRelativeTo, timeFrame);
    }

    return KairosEvent;
  }

  if ('function' === typeof define && define.amd) {
    define('kairos_event', ['underscore'], create);
  } else {
    exports.KairosEvent = create(
      ('function' === typeof require && require('underscore')) || exports._ || _
    );
  }

}('object' === typeof exports && exports || this));

/*global _: false, KairosEvent: false, KairosErrors: false, define: false, require: false, exports: false */
(function (exports, privateKey) {
  var
    root = this;

  function LogChannel (channel) {
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
  }

  function create (_, KairosEvent, errors) {
    var
      DEFAULT_NAMED_TIMES = ['epoch', 'now', 'never'],

      DURATION_MULTIPLIERS = [
        1000 * 60 * 60 * 24 * 365,
        1000 * 60 * 60 * 24 * 30,
        1000 * 60 * 60 * 24,
        1000 * 60 * 60,
        1000 * 60,
        1000,
        1
      ],

      NATURAL_LANGUAGE_PARSERS = [
        {
          mode: 'interpolated',
          regex: /(?:(?:interpolated)\s+)?(.*)\s+(?:between|from)\s+(.*)\s+(?:and|to)\s+(.*)/
        },
        {
          mode: 'after',
          regex: /(?:(?:starting)\s+)?(.*)\s+(?:after|from|following)\s+(.*)/
        },
        {
          mode: 'before',
          regex: /(?:(?:starting)\s+)?(.*)\s+(?:before|until|preceeding)\s+(.*)/
        },
        {
          mode: 'at',
          regex: /at\s+(.*)/ // with this one, the at is required, to avoid an infinite loop in the case of garbage
        }
      ],

      DURATION_PARSER = new RegExp(
        '^' +
          '\\s*P?\\s*' +
          '(?:' +
          '(\\d+(?:[\\.,]\\d+)?)' + // {Years}
          'Y' +
          ')?' +
          '\\s*' +
          '(?:' +
          '(\\d+(?:[\\.,]\\d+)?)' + // {Months}
          'M' +
          ')?' +
          '\\s*' +
          '(?:' +
          '(\\d+(?:[\\.,]\\d+)?)' + // {Days}
          'D' +
          ')?' +
          '\\s*T?\\s*' +
          '(?:' +
          '(\\d+(?:[\\.,]\\d+)?)' + // {Hours}
          'H' +
          ')?' +
          '\\s*' +
          '(?:' +
          '(\\d+(?:[\\.,]\\d+)?)' + // {Minutes}
          'M' +
          ')?' +
          '\\s*' +
          '(?:' +
          '(\\d+(?:[\\.,]\\d+)?)' + // {Seconds}
          'S' +
          ')?' +
          '$',
        'i'
      ),

      NATURAL_LANGUAGE_DURATION_PARSER = /(\d+(?:[\\.,]\\d+)?)\s*(y(?:ear)?s?)?(mon(?:th)?s?)?(d(?:ay)?s?)?(h(?:our)?s?)?(min(?:ute)?s?)?(s(?:econd)?s)?(m(?:illi)?s(?:econds?)?)?/gi;

    /**
     * Normalizes a duration in one of several forms into a simple number of ms.
     *
     * Accepted forms:
     *   {Number} of milliseconds, e.g. 1000
     *   {String}:
     *     Number of milliseconds, e.g. "1000"
     *     ISO-8601 Duration form (PnYnMnDTnHnMnH), e.g. 'PT1H15M'
     *     Natural Language form, e.g. '1 Hour and 15 Minutes'
     *
     * @private
     * @method  normalizeDuration
     *
     * @note    This will be replaced by horo (https://github.com/gilt/horo)
     *
     * @param   {String|Number} duration
     *
     * @return  {Number}
     */
    function normalizeDuration (duration) {

      // First, check to see if the duration is already a number, e.g. 1000,
      // if so, we don't need to do anything
      if (_.isNumber(duration)) {
        return duration;

        // Presumably, the duration is a string, but let's make sure
      } else if (_.isString(duration)) {
        // Check to see if our duration is a number in string form, e.g. "1000",
        // if so, we just need to parse it
        if (parseFloat(duration).toString() === duration) {
          return parseFloat(duration);
        }

        // Try parsing it as an ISO-8601 Duration, if so, this is easy
        var parts = duration.match(DURATION_PARSER); // Parses LDML only

        if (parts) {
          // Drop the 'all' portion of the match, leaving only individual values
          parts = parts.splice(1);
        } else {

          // We weren't able to parse it as an ISO-8601 Duration, so...
          // ...it's time to get our hands dirty

          // We want to return something similar to what the ISO-8601 Duration parser returns
          parts = [0,0,0,0,0,0,0];

          // We want to extract our values using the (en-us) natural language parser
          duration.replace(NATURAL_LANGUAGE_DURATION_PARSER, function (all, qty) {
            var index = 6; // Default to the milliseconds field

            // The qty is easy to get, but what about the unit? Find it!
            _.find(_.rest(arguments, 2), function (v, i) {
              index = i;
              return !!v;
            });
            parts[index] = parseFloat(qty);
          });
        }

        // Ok, we now have an array of [years, months, days, hours, minutes, seconds, milliseconds]
        // We want to convert that to just milliseconds
        return _.reduce(
          _.map(
            parts,
            function (n, i) {
              return (parseInt(n, 10) * DURATION_MULTIPLIERS[i]) || 0;
            }
          ),
          function (sum, n) {
            return sum + n;
          },
          0);

      }

      // If we can't parse it, default to 0
      return 0;
    }

    /**
     * Normalizes a moment in one of several forms into an unix timestamp.
     *
     * Accepted forms:
     *   {Number} of milliseconds, e.g. 1000
     *   {Date}
     *   {String}:
     *     Number of milliseconds, e.g. "1000"
     *     ISO-8601 Date form (yyyy-mm-ddThh:mm:ss), e.g. '2013-03-29'
     *     ISO-8601 Duration form (PnYnMnDTnHnMnH), e.g. 'PT1H15M'
     *     Named Time, e.g. 'now' or 'saleStart'
     *     Sentence form, offsetting a moment with a duration,
     *       e.g. '1 hour after lunch'
     *     Sentence form, interpolating two moments,
     *       e.g. '50% between lunch and dinner'
     *
     * @private
     * @method  normalizeMoment
     *
     * @note    This will be replaced by horo (https://github.com/gilt/horo)
     *
     * @param   {String|Number|Date} moment
     * @param   {Object}             namedTimes
     *
     * @return  {Number}
     */
    function normalizeMoment (moment, namedTimes) {

      // First, check to see if the moment is already a number, e.g. 1000,
      // if so, we don't need to do anything
      if (_.isNumber(moment)) {
        return moment;

        // Second, check to see if the moment is a Date object,
        // if so, just extract the milliseconds
      } else if (_.isDate(moment)) {
        return moment.getTime();

        // Presumably, the moment is a string, but let's make sure
      } else if (_.isString(moment)) {

        // Check to see if our moment is a number in string form, e.g. "1000",
        // if so, we just need to parse it
        if (parseFloat(moment).toString() === moment) {
          return parseFloat(moment);
        }

        // Look for our moment as a named time
        if (!_.isUndefined(namedTimes[moment])) {
          return namedTimes[moment];
        }

        // Can we parse our moment as date?
        if (!isNaN(Date.parse(moment))) {
          return Date.parse(moment);
        }

        // We weren't able to parse it easily ... it's time to get our hands dirty

        // Iterate over our natural language parsers until we find one that matches
        _.find(NATURAL_LANGUAGE_PARSERS, function (parser) {
          var results = moment.match(parser.regex);

          if (results) {

            // Since we matched, let's see what mode we're in
            switch (parser.mode) {
              case 'interpolated':
                // We're going to interpolate between 2 moments
                moment = {
                  interpolated: parseFloat(results[1]) * (/%/.test(results[1]) ? 0.01 : 1),
                  between: results[2],
                  and: results[3]
                };
                break;
              case 'after':
                // We're going to add a duration to a moment
                moment = {
                  starting: results[1],
                  after: results[2]
                };
                break;
              case 'before':
                // We're going to subtract a duration from a moment
                moment = {
                  starting: results[1],
                  before: results[2]
                };
                break;
              case 'at':
                // We're actually AT a moment
                moment = {
                  at: results[1]
                };
            }
          }

          return !!results;
        });

      }

      // Either the original moment is a hash, or we created a hash from a string form
      if (_.isObject(moment)) {

        // Simple case, it's a named time
        if (!_.isUndefined(moment.at)) {
          return normalizeMoment(moment.at, namedTimes);
        }

        // Almost as simple, just subtract/add a duration from a moment
        else if (!_.isUndefined(moment.starting)) {

          if (!_.isUndefined(moment.after)) {
            return normalizeMoment(moment.after, namedTimes) + normalizeDuration(moment.starting);
          } else if (!_.isUndefined(moment.before)) {
            return normalizeMoment(moment.before, namedTimes) - normalizeDuration(moment.starting);
          }

        }

        // More complex: interpolate between 2 moments
        else if (_.isNumber(moment.interpolated) && !_.isUndefined(moment.between) && !_.isUndefined(moment.and)) {

          return normalizeMoment(moment.between, namedTimes) + (
            normalizeMoment(moment.and, namedTimes) -
              normalizeMoment(moment.between, namedTimes)
            ) * moment.interpolated;

        }
      }

      // If we can't parse it, default to 0
      return 0;
    }

    /**
     * Freezes the normalized forms of each parameter that can be normalized.
     *
     * @private
     * @method  freeze
     */
    function freeze () {
      var
        p = this._private(privateKey);

      p.normalizedBeginsAt = this.getBeginsAt();
      p.normalizedEndsAt = this.getEndsAt();
      p.normalizedTicksEvery = this.getTicksEvery();
      p.normalizedSyncsTo = this.getSyncsTo();
      p.normalizedNamedTimes = this.getNamedTimes();
    }

    /**
     * Calculates when the next tick will occur.
     *
     * @private
     * @method  getNextTick
     *
     * @return  {Number}
     */
    function getNextTick () {
      var
        now = (new Date()).getTime(),
        interval = this.getTicksEvery(),
        sync = this.getSyncsTo();

      return now +
        interval -
        (
          sync ?
            (now + interval) % sync
            : 0
          );
    }

    /**
     * Ticks during a time frame.
     *
     * @private
     * @method    tick
     *
     * @publishes 'ticked'
     */
    function tick () {
      var
        p = this._private(privateKey);

      this.publish('ticked', new KairosEvent('ticked', this));

      p.tickTimeout = setTimeout(
        _.bind(tick, this),
        getNextTick.call(this) - (new Date()).getTime()
      );
    }

    /**
     * Ends a time frame.
     *
     * @private
     * @method    end
     *
     * @publishes 'ended'
     */
    function end () {
      var
        p = this._private(privateKey);

      p.isEnded = true;

      clearTimeout(p.tickTimeout);

      this.logger.info('Ending KairosTimeFrame', this.toJson());
      this.publish('ended', new KairosEvent('ended', this));
    }

    /**
     * Begins a time frame.
     *
     * @private
     * @method    begin
     *
     * @publishes 'began'
     */
    function begin () {
      var
        p = this._private(privateKey);

      p.isBegun = true;

      this.logger.info('Starting KairosTimeFrame', this.toJson());
      this.publish('began', new KairosEvent('began', this));

      if (this.getTicksEvery()) {
        p.tickTimeout = setTimeout(
          _.bind(tick, this),
          getNextTick.call(this) - (new Date()).getTime()
        );
      }

      if (Infinity !== this.getEndsAt()) {
        p.endTimeout = setTimeout(
          _.bind(end, this),
          this.getEndsAt() - (new Date()).getTime()
        );
      }
    }

    /**
     * Creates a new time frame.
     *
     * @public
     * @constructor KairosTimeFrame
     *
     * @param {String} [name]
     * @param {Object} [params]
     *
     * @usage:
     *  var myTimeFrame = new KairosTimeFrame({
     *    beginsAt: '2012-04-01T12:00-0400',
     *    endsAt: '36 hours after beginsAt',
     *    ticksEvery: '1 hour'
     *  }).subscribe('began', onBegin)
     *    .subscribe('ended', onEnd)
     *    .subscribe('ticked', onTick)
     *    .start()
     *
     *  var myOtherTimeFrame = new KairosTimeFrame('foo')
     *    .beginsAt('2012-04-01T12:00-0400')
     *    .endsAt('36 hours after beginsAt')
     *    .start()
     *    .subscribe('began', onBegin)
     *    .subscribe('ended', onEnd)
     *    .subscribe('ticked', onTick)
     *    .start()
     */
    function KairosTimeFrame (name, params) {
      this.logger.info('Creating a new Kairos Time Frame');

      var privateData = _.extend({
        beginsAt: 'epoch',
        endsAt: 'never',
        namedTimes: {},
        name: _.isString(name) ? name : null
      }, (_.isObject(name) ? name : params), {
        isStarted: false,
        isStopped: false,
        isMuted: false,
        isBegun: false,
        isEnded: false,
        notifyChannels: {}
      });

      _.defaults(privateData.namedTimes, {
        epoch: 0,
        now: (new Date()).getTime(),
        never: Infinity
      });

      /**
       * Our private data needs to be accessible from our prototypes, but not be
       * accessible otherwise. We accomplish this using a lock & key.
       *
       * @private
       * @method  _private
       *
       * @param   {String} key
       *
       * @return  {Object}
       *
       * @throws  {AccessDenied}
       */
      this._private = function (key) {
        if (key === privateKey) {
          return privateData;
        }
        throw new errors.AccessDenied();
      };
    }

    _.extend(KairosTimeFrame.prototype, {

      /**
       * Starts a frame.
       *
       * A quick note on terminology:
       *   "begin", in this context, means the the moment when things start to
       *     happen, e.g. it corresponds to the 'beginsAt' parameter.
       *   "start", in this context, is a control command, meaning, I'm done with
       *     setup, go start doing stuff, or wait until "begin" to do so.
       *
       * @public
       * @method start
       *
       * @return {KairosTimeFrame}
       *
       * @usage:
       *   myTimeFrame.start()
       */
      start: function () {
        if (!this.isStarted() && !this.isStopped()) {
          var
            p = this._private(privateKey),
            now = (new Date()).getTime();

          freeze.call(this);

          p.isStarted = true;

          if (this.getEndsAt() <= now) {
            p.isEnded = true;
          } else if (this.getBeginsAt() <= now) {
            begin.call(this);
          } else {

            p.startTimeout = setTimeout(
              _.bind(begin, this),
              this.getBeginsAt() - (new Date()).getTime()
            );
          }
        }

        return this;
      },

      /**
       * Permanently stops the time frame. Everything gets shut down, and can not
       * be restarted.
       *
       * @public
       * @destructor
       * @method     stop
       *
       * @return     {KairosTimeFrame}
       *
       * @usage:
       *   myTimeFrame.stop()
       */
      stop: function () {
        if (!this.isStopped()) {
          var
            p = this._private(privateKey);

          p.isStopped = true;

          clearTimeout(p.startTimeout);
          clearTimeout(p.tickTimeout);
          clearTimeout(p.endTimeout);
        }

        return this;
      },

      /**
       * Mutes tick notifications. Begin and end notifications still occur, but
       * this will prevent a spam of ticks.
       *
       * @public
       * @method    mute
       *
       * @publishes 'muted'
       *
       * @return    {KairosTimeFrame}
       *
       * @usage:
       *   myTimeFrame.mute()
       */
      mute: function () {
        var p = this._private(privateKey);

        if (!p.isMuted) {
          p.isMuted = true;

          clearTimeout(p.tickTimeout);

          this.publish('muted', new KairosEvent('muted', this));
        }

        return this;
      },

      /**
       * Unmutes (resumes) tick notifications.
       *
       * @public
       * @method    unmute
       *
       * @publishes 'unmuted'
       *
       * @return    {KairosTimeFrame}
       *
       * @usage:
       *   myTimeFrame.unmute()
       */
      unmute: function () {
        var p = this._private(privateKey);

        if (p.isMuted) {
          p.isMuted = false;

          if (this.getTicksEvery() && p.isStarted && !p.isStopped && p.isBegun && !p.isEnded) {
            p.tickTimeout = setTimeout(
              _.bind(tick, this),
              getNextTick.call(this) - (new Date()).getTime()
            );
          }

          this.publish('unmuted', new KairosEvent('unmuted', this));
        }

        return this;
      },

      /**
       * Subscribes a function to a given channel.
       *
       * @public
       * @method subscribe
       *
       * @param  {String}   channel
       * @param  {Function} fn
       *
       * @return {KairosTimeFrame}
       *
       * @usage:
       *   myTimeFrame.subscribe('foo', function (bar) { ... }
       */
      subscribe: function (channel, fn) {
        var notifyChannels = this._private(privateKey).notifyChannels;

        if (!notifyChannels[channel]) {
          notifyChannels[channel] = [];
        }
        notifyChannels[channel].push(fn);

        return this;
      },

      /**
       * Publishes an event on a given channel.
       *
       * @public
       * @method publish
       *
       * @param  {String} channel
       * @param  {Mixed}  [args]
       * @param  {Object} [scope]
       *
       * @return {KairosTimeFrame}
       *
       * @usage:
       *   myTimeFrame.publish('foo', bar);
       */
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

      /**
       * Unsubscribes a function from a given channel.
       *
       * @public
       * @method unsubscribe
       *
       * @param  {Mixed} handle
       *
       * @return {KairosTimeFrame}
       *
       * @usage:
       *   myTimeFrame.unsubscribe(['foo', fooFn])
       */
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

      /**
       * Returns a representation of this frame suitable for json serialization.
       *
       * @public
       * @method toJSON
       *
       * @alias toJson
       *
       * @return {Object}
       */
      toJSON: function () {
        return {
          name: this.getName(),
          state: {
            is_started: this.isStarted(),
            is_stopped: this.isEnded(),
            is_begun: this.isBegun(),
            is_ended: this.isEnded(),
            is_muted: this.isMuted()
          },
          begins_at: this.getBeginsAt(),
          ends_at: this.getEndsAt(),
          ticks_every: this.getTicksEvery(),
          sync_to: this.getSyncsTo(),
          named_times: this.getNamedTimes(),
          data: this.getData()
        };
      },

      /**
       * Returns a string representation of this time frame.
       *
       * @public
       * @method toString
       *
       * @return {String}
       */
      toString: function () {
        return JSON.stringify(this.toJson(), null, 2);
      },

      logger: {
        log:   new LogChannel('log'),
        info:  new LogChannel('info'),
        debug: new LogChannel('debug'),
        warn:  new LogChannel('warn'),
        error: new LogChannel('error')
      },

      /**
       * Has start been called on this time frame?
       *
       * @public
       * @method isStarted
       * @getter
       *
       * @return {Boolean}
       */
      isStarted: function () {
        return this._private(privateKey).isStarted;
      },

      /**
       * Has stop been called on this time frame?
       *
       * @public
       * @method isStopped
       * @getter
       *
       * @return {Boolean}
       */
      isStopped: function () {
        return this._private(privateKey).isStopped;
      },

      /**
       * Is this time frame currently muted?
       *
       * @public
       * @method isMuted
       * @getter
       *
       * @return {Boolean}
       */
      isMuted: function () {
        return this._private(privateKey).isMuted;
      },

      /**
       * Has this frame begun yet?
       *
       * @public
       * @method isBegun
       * @getter
       *
       * @return {Boolean}
       */
      isBegun: function () {
        return this._private(privateKey).isBegun;
      },

      /**
       * Has this frame ended yet?
       *
       * @public
       * @method isBegun
       * @getter
       *
       * @return {Boolean}
       */
      isEnded: function () {
        return this._private(privateKey).isEnded;
      },

      /**
       * Returns the name of this time frame.
       *
       * @public
       * @method getName
       * @getter
       *
       * @return {String}
       */
      getName: function () {
        return this._private(privateKey).name;
      },

      /**
       * Gets the millisecond value (or the original value) of the 'beginsAt'
       * property.
       *
       * @public
       * @method getBeginsAt
       * @getter
       *
       * @param  {Object}  [opts]
       * @param  {Boolean} [opts.originalValue=false]
       *
       * @return {Number|Mixed}
       *
       * @usage:
       *   myTimeFrame.getBeginsAt() // 1234567890
       *   myTimeFrame.getBeginsAt({ originalValue: true }) // 'PT1H after noon'
       */
      getBeginsAt: function (opts) {
        opts = _.extend({
          originalValue: false
        }, opts);

        var
          p = this._private(privateKey),
          tmp;

        if (opts.originalValue) {
          return p.beginsAt;
        } else if (this.isStarted()) {
          return p.normalizedBeginsAt;
        } else {
          tmp = _.clone(p.namedTimes);

          _.each(p.namedTimes, function (time, name) {
            tmp[name] = normalizeMoment(time, tmp);
          });

          return normalizeMoment(p.beginsAt, tmp);
        }
      },

      /**
       * Gets the millisecond value (or the original value) of the 'endsAt'
       * property.
       *
       * @public
       * @method getEndsAt
       * @getter
       *
       * @param  {Object}  [opts]
       * @param  {Boolean} [opts.originalValue=false]
       *
       * @return {Number|Mixed}
       *
       * @usage:
       *   myTimeFrame.getEndsAt() // 1234567890
       *   myTimeFrame.getEndsAt({ originalValue: true }) // 'PT1H after noon'
       */
      getEndsAt: function (opts) {
        opts = _.extend({
          originalValue: false
        }, opts);

        var
          p = this._private(privateKey),
          tmp;

        if (opts.originalValue) {
          return p.endsAt;
        } else if (this.isStarted()) {
          return p.normalizedEndsAt;
        } else {
          tmp = _.clone(p.namedTimes);

          _.each(p.namedTimes, function (time, name) {
            tmp[name] = normalizeMoment(time, tmp);
          });

          tmp.beginsAt = normalizeMoment(p.beginsAt, tmp);

          return normalizeMoment(p.endsAt, tmp);
        }
      },

      /**
       * Gets the millisecond value (or the original value) of the 'ticksEvery'
       * property.
       *
       * @public
       * @method getTicksEvery
       * @getter
       *
       * @param  {Object}  [opts]
       * @param  {Boolean} [opts.originalValue=false]
       *
       * @return {Number|Mixed}
       *
       * @usage:
       *   myTimeFrame.getTicksEvery() // 5000
       *   myTimeFrame.getTicksEvery({ originalValue: true }) // '5 seconds'
       */
      getTicksEvery: function (opts) {
        opts = _.extend({
          originalValue: false
        }, opts);

        var p = this._private(privateKey);

        if (opts.originalValue) {
          return p.ticksEvery;
        } else if (this.isStarted()) {
          return p.normalizedTicksEvery;
        } else {
          return normalizeDuration(p.ticksEvery);
        }
      },

      /**
       * Gets the millisecond value (or the original value) of the 'syncsTo'
       * property.
       *
       * @public
       * @method getSyncsTo
       * @getter
       *
       * @param  {Object}  [opts]
       * @param  {Boolean} [opts.originalValue=false]
       *
       * @return {Number|Mixed}
       *
       * @usage:
       *   myTimeFrame.getSyncsTo() // 2500
       *   myTimeFrame.getSyncsTo({ originalValue: true }) 'PT2.5S'
       */
      getSyncsTo: function (opts) {
        opts = _.extend({
          originalValue: false
        }, opts);

        var p = this._private(privateKey);

        if (opts.originalValue) {
          return p.syncsTo;
        } else if (this.isStarted()) {
          return p.normalizedSyncsTo;
        } else {
          return normalizeDuration(p.syncsTo);
        }
      },

      /**
       * Gets the millisecond values (or the original values) of all of the named
       * times. Can also include the default named times (epoch, now, never)
       *
       * @public
       * @method getNamedTimes
       * @getter
       *
       * @param  {Object}  [opts]
       * @param  {Boolean} [opts.originalValue=false]
       * @param  {Boolean} [opts.includeDefaults=false]
       *
       * @return {Object}
       *
       * @usage:
       *   myTimeFrame.getNamedTimes() // { noon: 1234567890 }
       *   myTimeFrame.getNamedTimes({ originalValues: true }) // { noon: '2013-04-01T12:00' }
       *   myTimeFrame.getNamedTimes({ includeDefaults: true }) // { noon: 1234567890, epoch: 0, now: 2345678901, never: Infinity }
       *   myTimeFrame.getNamedTimes({ originalValues: true, includeDefaults: true }) // { noon: '2013-04-01T12:00', epoch: 0, now: 2345678901, never: Infinity }
       */
      getNamedTimes: function (opts) {
        opts = _.extend({
          originalValue: false,
          includeDefaults: false
        }, opts);

        var
          p = this._private(privateKey),
          tmp,
          result = {};

        if (opts.originalValue) {
          _.each(p.namedTimes, function (time, name) {
            if (opts.includeDefaults || !_.contains(DEFAULT_NAMED_TIMES, name)) {
              result[name] = time;
            }
          });
        } else if (this.isStarted()) {
          // There is no need to exclude defaults here, since they are already excluded
          result = _.clone(p.normalizedNamedTimes);
        } else {
          tmp = _.extend({
            beginsAt: normalizeMoment(p.beginsAt, p.namedTimes)
          }, p.namedTimes);

          tmp.endsAt = normalizeMoment(p.endsAt, tmp);

          _.each(p.namedTimes, function (time, name) {
            if (opts.includeDefaults || !_.contains(DEFAULT_NAMED_TIMES, name)) {
              result[name] = normalizeMoment(time, tmp);
            }
          });
        }
        return result;
      },

      /**
       * Extends the set of named times.
       *
       * @public
       * @method extendNamedTimes
       *
       * @param  {Object} obj
       *
       * @return {KairosTimeFrame}
       *
       * @throws {MissingParameter|ImmutableError}
       */
      extendNamedTimes: function (obj) {
        if (!obj) {
          throw new errors.MissingParameter();
        } else if (!this.isStarted()) {
          _.extend(this._private(privateKey).namedTimes, obj);
        } else {
          throw new errors.ImmutableError();
        }

        return this;
      },

      /**
       * Returns the 'data' parameter, which is intended for use by consumers.
       *
       * @public
       * @method getData
       * @getter
       *
       * @return {Object}
       */
      getData: function () {
        return this._private(privateKey).data;
      },

      /**
       * Gets the current duration relative to a named time.
       *
       * @public
       * @method getDurationRelativeTo
       *
       * @param  {String} time
       *
       * @return {Number}
       */
      getDurationRelativeTo: function (time) {
        if (_.isUndefined(time)) {
          throw new errors.MissingParameter();
        } else {
          var origin = this._private(privateKey).namedTimes[time];
          return origin - (new Date()).getTime();
        }
      },

      version: '0.4.0'
    });

    KairosTimeFrame.prototype.toJson = KairosTimeFrame.prototype.toJSON;

    KairosTimeFrame.version = '0.4.0';

    return KairosTimeFrame;
  }

  if ('function' === typeof define && define.amd) {
    define('kairos_time_frame', ['underscore', 'kairos_event', 'kairos_errors'], create);
  } else {
    exports.KairosTimeFrame = create(
      ('function' === typeof require && require('underscore'))      || exports._            || _,
      ('function' === typeof require && require('./kairos_event'))  || exports.KairosEvent  || KairosEvent,
      ('function' === typeof require && require('./kairos_errors')) || exports.KairosErrors || KairosErrors
    );
  }

}(
  'object' === typeof exports && exports || this,
  Math.floor(Math.random() * 10000000 + 10000000).toString(36)
));

/*global _: false, KairosTimeFrame: false, KairosErrors: false, define: false, require: false, exports: false */
(function (exports, privateKey) {
  var
    root = this;

  function LogChannel (channel) {
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
  }

  function create (_, KairosTimeFrame, errors) {
    /**
     * Wires up began/ended/ticked/muted/unmuted proxy subscriptions for a frame.
     *
     * @private
     * @method  wireupSubscriptions
     *
     * @param   {KairosTimeFrame} frame
     */
    function wireupSubscriptions (frame) {
      var self = this;

      frame.subscribe('began', function (ev) {
        self.publish('timeFrameBegan', [ev]);
        if (ev.timeFrameName) {
          self.publish(ev.timeFrameName + '/began', [ev]);
        }
      });

      frame.subscribe('ended', function (ev) {
        self.publish('timeFrameEnded', [ev]);
        if (ev.timeFrameName) {
          self.publish(ev.timeFrameName + '/ended', [ev]);
        }
      });

      frame.subscribe('ticked', function (ev) {
        self.publish('timeFrameTicked', [ev]);
        if (ev.timeFrameName) {
          self.publish(ev.timeFrameName + '/ticked', [ev]);
        }
      });

      frame.subscribe('muted', function (ev) {
        self.publish('timeFrameMuted', [ev]);
        if (ev.timeFrameName) {
          self.publish(ev.timeFrameName + '/muted', [ev]);
        }
      });

      frame.subscribe('unmuted', function (ev) {
        self.publish('timeFrameUnmuted', [ev]);
        if (ev.timeFrameName) {
          self.publish(ev.timeFrameName + '/unmuted', [ev]);
        }
      });
    }

    /**
     * Creates a collection of time frames.
     *
     * @public
     * @constructor KairosCollection
     * @constructor
     *
     * @param {KairosTimeFrame[]|Object[]} frames
     *
     * @throws {DuplicateError}
     *
     * @usage:
     *   myCollection = new KairosCollection([
     *     new KairosTimeFrame('foo'),
     *     new KairosTimeFrame({
     *       beginsAt: 'now'
     *     }),
     *     {
     *       beginsAt: 'epoch'
     *     }
     *   ]).start()
     */
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
        throw new errors.DuplicateError('Duplicate names found');
      }

      _.each(privateData.frames, _.bind(wireupSubscriptions, this));

      /**
       * Our private data needs to be accessible from our prototypes, but not be
       * accessible otherwise. We accomplish this using a lock & key.
       *
       * @private
       * @method  _private
       *
       * @param   {String} key
       *
       * @return  {Object}
       *
       * @throws  {AccessDenied}
       */
      this._private = function (key) {
        if (key === privateKey) {
          return privateData;
        }
        throw new errors.AccessDenied();
      };
    }

    _.extend(KairosCollection.prototype, {

      /**
       * Starts each frame in the collection.
       *
       * @public
       * @method start
       *
       * @return {KairosCollection}
       */
      start: function () {
        _.invoke(this._private(privateKey).frames, 'start');

        return this;
      },

      /**
       * Stops each frame in the collection.
       *
       * @public
       * @method stop
       *
       * @return {KairosCollection}
       */
      stop: function () {
        _.invoke(this._private(privateKey).frames, 'stop');

        return this;
      },

      /**
       * Mutes each frame in the collection.
       *
       * @public
       * @method mute
       *
       * @return {KairosCollection}
       */
      mute: function () {
        _.invoke(this._private(privateKey).frames, 'mute');

        return this;
      },

      /**
       * Unmutes each frame in the collection.
       *
       * @public
       * @method unmute
       *
       * @return {KairosCollection}
       */
      unmute: function () {
        _.invoke(this._private(privateKey).frames, 'unmute');

        return this;
      },

      /**
       * Subscribes a function to a given channel.
       *
       * @public
       * @method subscribe
       *
       * @param  {String}   channel
       * @param  {Function} fn
       *
       * @return {KairosCollection}
       *
       * @usage:
       *   myCollection.subscribe('foo', function (bar) { ... }
       */
      subscribe: function (channel, fn) {
        var notifyChannels = this._private(privateKey).notifyChannels;

        if (!notifyChannels[channel]) {
          notifyChannels[channel] = [];
        }
        notifyChannels[channel].push(fn);

        return this;
      },

      /**
       * Publishes an event on a given channel.
       *
       * @public
       * @method publish
       *
       * @param  {String} channel
       * @param  {Mixed}  [args]
       * @param  {Object} [scope]
       *
       * @return {KairosCollection}
       *
       * @usage:
       *   myCollection.publish('foo', bar);
       */
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

      /**
       * Unsubscribes a function from a given channel.
       *
       * @public
       * @method unsubscribe
       *
       * @param  {Mixed} handle
       *
       * @return {KairosCollection}
       *
       * @usage:
       *   myCollection.unsubscribe(['foo', fooFn])
       */
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

      /**
       * Returns a representation of this collection suitable for json
       * serialization.
       *
       * @public
       * @method toJSON
       *
       * @alias toJson
       *
       * @todo
       *
       * @return {Object}
       */
      toJSON: function () {
        return {};
      }, // TODO

      /**
       * Returns a string representation of this time frame.
       *
       * @public
       * @method toString
       *
       * @return {String}
       */
      toString: function () {
        return JSON.stringify(this.toJson(), null, 2);
      },

      logger: {
        log:   new LogChannel('log'),
        info:  new LogChannel('info'),
        debug: new LogChannel('debug'),
        warn:  new LogChannel('warn'),
        error: new LogChannel('error')
      },

      /**
       * Extends the set of named times in each frame.
       *
       * @public
       * @method extendNamedTimes
       *
       * @param  {Object} obj
       *
       * @return {KairosCollection}
       *
       * @throws {MissingParameter|ImmutableError}
       *
       * @usage:
       *   myCollection.extendNamedTimes({
       *     foo: new Date('1234-05-06')
       *   })
       */
      extendNamedTimes: function (obj) {
        _.invoke(this._private(privateKey).frames, 'extendNamedTimes', obj);

        return this;
      },

      /**
       * Adds a time frame to the collection.
       *
       * @public
       * @method pushTimeFrame
       *
       * @param  {KairosTimeFrame|Object} frame
       *
       * @return {KairosCollection}
       *
       * @usage:
       *   myCollection.pushTimeFrame(new KairosTimeFrame())
       *   myCollection.pushTimeFrame({
       *     beginsAt: 'noon'
       *     })
       */
      pushTimeFrame: function (frame) {
        if (!(frame instanceof KairosTimeFrame)) {
          frame = new KairosTimeFrame(frame);
        }

        this.logger.info('Adding new Time Frame', frame);

        this._private(privateKey).frames.push(frame);

        wireupSubscriptions.call(this, frame);

        return this;
      },

      /**
       * Gets all of the time frames in the collection.
       *
       * @public
       * @method getTimeFrames
       * @getter
       *
       * @return {KairosTimeFrame[]}
       */
      getTimeFrames: function () {
        return _.clone(this._private(privateKey).frames);
      },

      /**
       * Finds a single time frame by name.
       *
       * @public
       * @method getNamedTimeFrame
       *
       * @param  {String} name
       *
       * @return {KairosTimeFrame}
       *
       * @throws {MissingParameter}
       */
      getNamedTimeFrame: function (name) {
        if (!name) {
          throw new errors.MissingParameter('No name was provided');
        } else {
          return _.find(this._private(privateKey).frames, function (frame) {
            return frame.getName() === name;
          });
        }
      },

      version: '0.4.0'
    });

    KairosCollection.prototype.toJson = KairosCollection.prototype.toJSON;

    KairosCollection.version = '0.4.0';

    return KairosCollection;
  }

  if ('function' === typeof define && define.amd) {
    define('kairos_collection', ['underscore', 'kairos_time_frame', 'kairos_errors'], create);
  } else {
    exports.KairosCollection = create(
      ('function' === typeof require && require('underscore'))                          || exports._               || _,
      ('function' === typeof require && require('./kairos_time_frame').KairosTimeFrame) || exports.KairosTimeFrame || KairosTimeFrame,
      ('function' === typeof require && require('./kairos_errors'))                     || exports.KairosErrors    || KairosErrors
    );
  }
}(
  'object' === typeof exports && exports || this,
  Math.floor(Math.random() * 10000000 + 10000000).toString(36)
));