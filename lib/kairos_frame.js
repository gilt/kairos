/* global _: false */
(function(exports, _) {

  /**
   * Calculates the start time of the next tick, optionally synchronized to the
   * users clock.
   *
   * @private
   * @method  nextTick
   *
   * @param  {Number}         now       Current timestamp
   * @param  {Number}         interval  Length of a tick in milliseconds
   * @param  {Number|Boolean} sync      Should we sync? If true, sync to the same interval as the interval parameter. If a number, sync to that number of milliseconds on the user's clock
   *
   * @return {Number}
   */
  function nextTick (now, interval, sync) {
    return now +
      interval -
      (
        sync ?
          (now + interval) %
            (true === sync ?
              interval
              : sync)
          : 0
      );
  }

  /**
   * The tick event
   *
   * @private
   * @method  tick
   *
   * @publishes frameTicked
   * @publishes frameTicked/{name}
   */
  function tick () {
    if (this.isStarted() && !this.isEnded()) {
      var
        now,
        message = [
          this._data,
          (this._relatedTime - (new Date()).getTime()) || 0
        ];

      this._parent.publish('frameTicked', message);

      if (this._name) {
        this._parent.publish('frameTicked/' + this._name, message);
      }

      if (this._tickInterval) {
        now = (new Date()).getTime();
        this._tickTimeout = setTimeout(_.bind(tick, this), nextTick(now, this._tickInterval, this._syncTicks) - now);
      }
    }
  }

  /**
   * The end event
   *
   * @private
   * @method  end
   *
   * @publishes frameEnded
   * @publishes frameEnded/{name}
   */
  function end () {
    if (!this.isEnded()) {
      this._ended = true;

      clearTimeout(this._tickTimeout);

      var
        message = [
          this._data,
          (this._relatedTime - (new Date()).getTime()) || 0
        ];

      this._parent.logger.info('Ending Frame', this._name);
      this._parent.publish('frameEnded', message);

      if (this._name) {
        this._parent.publish('frameEnded/' + this._name, message);
      }
    }
  }

  /**
   * The start event. Starts ticks and schedules the end event
   *
   * @private
   * @method  start
   *
   * @publishes frameStarted
   * @publishes frameStarted/{name}
   */
  function start () {
    if (!this.isStarted()) {
      this._started = true;

      var
        message = [
          this._data,
          (this._relatedTime - (new Date()).getTime()) || 0
        ];

      this._parent.logger.info('Starting Frame', this._name);
      this._parent.publish('frameStarted', message);

      if (this._name) {
        this._parent.publish('frameStarted/' + this._name, message);
      }

      // QUESTION: should this be called immediately, or on a timeout?
      if (this._tickInterval) {
        tick.call(this);
      }

      if (Infinity !== this._endsAt) {
        setTimeout(_.bind(end, this), this._endsAt - (new Date()).getTime());
      }
    }
  }

  /**
   * Creates a new KairosFrame
   *
   * @public
   * @constructor
   *
   * @param {KairosScheduler} parent  The scheduler this frame belongs to
   * @param {Object}          frame   Normalized data about this frame
   */
  function KairosFrame (parent, frame) {
    this._parent = parent;
    this._name = frame.name;
    this._beginsAt = frame.begin;
    this._endsAt = frame.end;
    this._tickInterval = frame.interval;
    this._syncTicks = frame.sync;
    this._relatedTime = frame.relatedTo;
    this._data = frame.data;
    this._paused = false;
    this._started = false;
    this._ended = false;

    if (this._tickInterval) {
      this._parent.logger.info('Kairos Frame created that will tick every ' + this._tickInterval + 'ms from ' + this._beginsAt + ' until ' + this._endsAt);
    } else {
      this._parent.logger.info('Kairos Frame created that begins at ' + this._beginsAt + ' and ends at ' + this._endsAt);
    }
  }

  _.extend(KairosFrame.prototype, {

    /**
     * Start the frame
     *
     * @public
     * @method start
     */
    start: function () {
      var now = (new Date()).getTime();
      if (this._beginsAt <= now) {
        start.call(this);
      } else {
        setTimeout(_.bind(start, this), this._beginsAt - now);
      }
    },

    /**
     * Pause frame ticks
     *
     * @public
     * @method pause
     */
    pause: function () {
      clearTimeout(this._tickTimeout);
      this._paused = true;
    },

    /**
     * Resume paused frame ticking
     *
     * @public
     * @method resume
     */
    resume: function () {
      if (this.isPaused()) {
        this._paused = false;
        if (this.isStarted() && !this.isEnded()) {
          tick.call(this);
        }
      }
    },

    /**
     * Is the frame started?
     *
     * @public
     * @method   isStarted
     * @accessor
     *
     * @return {Boolean}
     */
    isStarted: function () {
      return this._started;
    },

    /**
     * Is the frame ended?
     *
     * @public
     * @method   isEnded
     * @accessor
     *
     * @return {Boolean}
     */
    isEnded: function () {
      return this._ended;
    },

    /**
     * Is the frame paused?
     *
     * @public
     * @method   isPaused
     * @accessor
     *
     * @return {Boolean}
     */
    isPaused: function () {
      return this._paused;
    },

    /**
     * Returns a representation of this frame that is suitable for json serialization.
     *
     * @public
     * @method toJSON
     *
     * @return {Object}
     */
    toJSON: function () {
      return {
        name: this._name,
        begins_at: this._beginsAt,
        ends_at: this.endsAt,
        tick_interval: this.tickInterval,
        sync_ticks: this.syncTicks,
        related_time: this.relatedTime,
        data: this._data
      };
    }
  });

  exports.KairosFrame = KairosFrame;

}(
  'object' === typeof exports && exports || this, // exports
  this._ || this.require && require('underscore') // _
));