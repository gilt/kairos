/*global KairosTimeFrame: false, KairosCollection: false, KairosEvent: false, _: false, jasmine: false, describe: false, xdescribe: false, it: false, xit: false, expect: false, waitsFor: false, runs: false */
describe('KairosTimeFrame', function () {
  // NOTE:
  //   Several of these tests are to ensure that things happen at the correct
  //   time. Unfortunately, setTimeout is intrinsically inaccurate, so a certain
  //   amount of imprecision is unavoidable.  We've taken steps to minimize
  //   the imprecision, but, YMMV.
  var TIMING_PRECISION = 15;

  describe('Constructor', function () {
    it('should construct with no arguments', function () {
      var timeFrame;
      expect(function () {
        timeFrame = new KairosTimeFrame();
      }).not.toThrow();
      expect(timeFrame).toEqual(jasmine.any(KairosTimeFrame));
    });

    it('should construct with only a name argument', function () {
      var timeFrame;
      expect(function () {
        timeFrame = new KairosTimeFrame('test');
      }).not.toThrow();
      expect(timeFrame).toEqual(jasmine.any(KairosTimeFrame));
    });

    it('should construct with an options argument', function () {
      var timeFrame;
      expect(function () {
        timeFrame = new KairosTimeFrame({});
      }).not.toThrow();
      expect(timeFrame).toEqual(jasmine.any(KairosTimeFrame));
    });

    it('should construct with both a name and an options argument', function () {
      var timeFrame;
      expect(function () {
        timeFrame = new KairosTimeFrame('test', {});
      }).not.toThrow();
      expect(timeFrame).toEqual(jasmine.any(KairosTimeFrame));
    });

    it('should construct with a name in the options argument', function () {
      var timeFrame;
      expect(function () {
        timeFrame = new KairosTimeFrame({ name: 'test' });
      }).not.toThrow();
      expect(timeFrame).toEqual(jasmine.any(KairosTimeFrame));
    });
  });

  describe('API', function () {
    var timeFrame = new KairosTimeFrame();

    it('should have a start method', function () {
      expect(timeFrame.start).toEqual(jasmine.any(Function));
    });

    it('should have a stop method', function () {
      expect(timeFrame.stop).toEqual(jasmine.any(Function));
    });

    it('should have a mute method', function () {
      expect(timeFrame.mute).toEqual(jasmine.any(Function));
    });

    it('should have a unmute method', function () {
      expect(timeFrame.unmute).toEqual(jasmine.any(Function));
    });

    it('should have a subscribe method', function () {
      expect(timeFrame.subscribe).toEqual(jasmine.any(Function));
    });

    it('should have a publish method', function () {
      expect(timeFrame.publish).toEqual(jasmine.any(Function));
    });

    it('should have an unsubscribe method', function () {
      expect(timeFrame.unsubscribe).toEqual(jasmine.any(Function));
    });

    it('should have a toJSON method', function () {
      expect(timeFrame.toJSON).toEqual(jasmine.any(Function));
      expect(timeFrame.toJson).toEqual(jasmine.any(Function));
    });

    it('should have a toString method', function () {
      expect(timeFrame.toString).toEqual(jasmine.any(Function));
    });

    it('should have a logger', function () {
      expect(timeFrame.logger).toEqual(jasmine.any(Object));
      expect(timeFrame.logger.log).toEqual(jasmine.any(Function));
      expect(timeFrame.logger.info).toEqual(jasmine.any(Function));
      expect(timeFrame.logger.debug).toEqual(jasmine.any(Function));
      expect(timeFrame.logger.warn).toEqual(jasmine.any(Function));
      expect(timeFrame.logger.error).toEqual(jasmine.any(Function));
    });
  });

  describe('Chaining', function () {
    var timeFrame = new KairosTimeFrame();

    it('should make the start method chainable', function () {
      expect(timeFrame.start()).toBe(timeFrame);
    });

    it('should make the stop method chainable', function () {
      expect(timeFrame.stop()).toBe(timeFrame);
    });

    it('should make the mute method chainable', function () {
      expect(timeFrame.mute()).toBe(timeFrame);
    });

    it('should make the unmute method chainable', function () {
      expect(timeFrame.unmute()).toBe(timeFrame);
    });

    it('should make the subscribe method chainable', function () {
      expect(timeFrame.subscribe()).toBe(timeFrame);
    });

    it('should make the publish method chainable', function () {
      expect(timeFrame.publish()).toBe(timeFrame);
    });

    it('should make the unsubscribe method chainable', function () {
      expect(timeFrame.unsubscribe([])).toBe(timeFrame);
    });
  });

  describe('Accessors', function () {
    var timeFrame = new KairosTimeFrame('test', {
      beginsAt: '1000',// simplest possible non-normal values
      endsAt: '2000',
      ticksEvery: '3000',
      syncsTo: '5000',
      namedTimes: {
        foo: '6000'
      },
      data: {
        foo: 'bar'
      }
    });

    it('should expose a getter for the (normalized) beginsAt parameter', function () {
      expect(timeFrame.getBeginsAt).toEqual(jasmine.any(Function));
      expect(timeFrame.getBeginsAt()).toBe(1000);
    });

    it('should expose a getter for the original beginsAt parameter', function () {
      expect(timeFrame.getBeginsAt({ originalValue: true })).toBe('1000');
    });

    it('should expose a setter for the beginsAt parameter', function () {
      expect(timeFrame.setBeginsAt).toEqual(jasmine.any(Function));
    });

    it('should expose a getter for the (normalized) endsAt parameter', function () {
      expect(timeFrame.getEndsAt).toEqual(jasmine.any(Function));
      expect(timeFrame.getEndsAt()).toBe(2000);
    });

    it('should expose a getter for the original endsAt parameter', function () {
      expect(timeFrame.getEndsAt({ originalValue: true })).toBe('2000');
    });

    it('should not expose a setter for the endsAt parameter', function () {
      expect(timeFrame.endsAt).toBeUndefined();
    });

    xit('should throw an error if you call the endsAt setter with no value', function () {
      expect(timeFrame.endsAt).toThrow();
    });

    xit('should make the endsAt setter chainable', function () {
      expect(timeFrame.endsAt(2500)).toBe(timeFrame);
    });

    it('should expose a getter for the (normalized) ticksEvery parameter', function () {
      expect(timeFrame.getTicksEvery).toEqual(jasmine.any(Function));
      expect(timeFrame.getTicksEvery()).toBe(3000);
    });

    it('should expose a getter for the original ticksEvery parameter', function () {
      expect(timeFrame.getTicksEvery({ originalValue: true })).toBe('3000');
    });

    it('should not expose a setter for the ticksEvery parameter', function () {
      expect(timeFrame.ticksEvery).toBeUndefined();
    });

    xit('should throw an error if you call the ticksEvery setter with no value', function () {
      expect(timeFrame.ticksEvery).toThrow();
    });

    xit('should make the ticksEvery setter chainable', function () {
      expect(timeFrame.ticksEvery(3500)).toBe(timeFrame);
    });

    it('should expose a getter for the (normalized) syncsTo parameter', function () {
      expect(timeFrame.getSyncsTo).toEqual(jasmine.any(Function));
      expect(timeFrame.getSyncsTo()).toBe(5000);
    });

    it('should expose a getter for the original syncsTo parameter', function () {
      expect(timeFrame.getSyncsTo({ originalValue: true })).toBe('5000');
    });

    it('should not expose a setter for the syncsTo parameter', function () {
      expect(timeFrame.syncsTo).toBeUndefined();
    });

    xit('should throw an error if you call the syncsTo setter with no value', function () {
      expect(timeFrame.syncsTo).toThrow();
    });

    xit('should make the syncsTo setter chainable', function () {
      expect(timeFrame.syncsTo(5500)).toBe(timeFrame);
    });

    it('should expose a getter for the (normalized) named times', function () {
      expect(timeFrame.getNamedTimes).toEqual(jasmine.any(Function));
      expect(timeFrame.getNamedTimes()).toEqual({ foo: 6000 });
    });

    it('should expose a getter for the original named times', function () {
      expect(timeFrame.getNamedTimes({ originalValue: true })).toEqual({ foo: '6000' });
    });

    it('should expose a setter for the named times', function () {
      expect(timeFrame.extendNamedTimes).toEqual(jasmine.any(Function));
    });

    it('should throw an error if you call the named times setter with no value', function () {
      expect(timeFrame.extendNamedTimes).toThrow();
    });

    it('should make the named times setter chainable', function () {
      expect(timeFrame.extendNamedTimes({})).toBe(timeFrame);
    });

    it('should expose a getter for the name parameter', function () {
      expect(timeFrame.getName).toEqual(jasmine.any(Function));
      expect(timeFrame.getName()).toBe('test');
    });

    it('should expose a getter for the data parameter', function () {
      expect(timeFrame.getData).toEqual(jasmine.any(Function));
      expect(timeFrame.getData()).toEqual({ foo: 'bar' });
    });

    it('should not expose a setter for the data parameter', function () {
      expect(timeFrame.setData).toBeUndefined();
    });

    xit('should throw an error if you call the data setter with no value', function () {
      expect(timeFrame.setData).toThrow();
    });

    xit('should make the data setter chainable', function () {
      expect(timeFrame.setData({})).toBe(timeFrame);
    });

    it('should expose a getter for isBegun', function () {
      expect(timeFrame.isBegun).toEqual(jasmine.any(Function));
      expect(typeof timeFrame.isBegun()).toBe('boolean');
    });

    it('should expose a getter for isEnded', function () {
      expect(timeFrame.isEnded).toEqual(jasmine.any(Function));
      expect(typeof timeFrame.isEnded()).toBe('boolean');
    });

    it('should expose a getter for isMuted', function () {
      expect(timeFrame.isMuted).toEqual(jasmine.any(Function));
      expect(typeof timeFrame.isMuted()).toBe('boolean');
    });

    it('should expose a getter for isStarted', function () {
      expect(timeFrame.isStarted).toEqual(jasmine.any(Function));
      expect(typeof timeFrame.isStarted()).toBe('boolean');
    });

    it('should expose a getter for isStopped', function () {
      expect(timeFrame.isStopped).toEqual(jasmine.any(Function));
      expect(typeof timeFrame.isStopped()).toBe('boolean');
    });

    it('should expose a getter for the duration relative to a named time', function () {
      expect(timeFrame.getDurationRelativeTo).toEqual(jasmine.any(Function));
      expect(timeFrame.getDurationRelativeTo('foo')).toEqual(jasmine.any(Number));

      expect(new KairosTimeFrame({}).getDurationRelativeTo('now')).toBeLessThan(TIMING_PRECISION);
    });

    it('should throw an error if you call the relative duration getter with no value', function () {
      expect(timeFrame.getDurationRelativeTo).toThrow();
    });

    it('should throw an error if you attempt to call extendNamedTimes after start has been called', function () {
      timeFrame.start();

      expect(function () { timeFrame.extendNamedTimes({ foo: 7000 }); }).toThrow();
    });

    it('should make namedTimes immutable once start has been called', function () {
      expect(timeFrame.getNamedTimes()).not.toEqual({ foo: 7000 });
    });
  });

  describe('Accessor for beginsAt', function () {
    var
      timeFrame,
      hasBegun = false;

    timeFrame = new KairosTimeFrame('test', {
      beginsAt: (new Date()).getTime() + 2000,
      endsAt: (new Date()).getTime() + 5000
    });

    it('should throw an error if you call it with no value', function () {
      expect(timeFrame.setBeginsAt).toThrow();
    });

    it('should allow setting before the frame starts', function () {
      var newTime = (new Date()).getTime() + 500;
      timeFrame.setBeginsAt(newTime);
      expect(timeFrame.getBeginsAt()).toEqual(newTime);
    });

    it('should disallow setting after the frame starts', function () {
      timeFrame.subscribe('began', function () {
        hasBegun = true;
      });

      timeFrame.start();

      waitsFor(function () {
        return hasBegun;
      });

      runs(function () {
        expect(function () { timeFrame.setBeginsAt((new Date()).getTime()); }).toThrow();
      });
    });
  });

  describe('Defaults', function () {
    var
      now = (new Date()).getTime(),
      timeFrame = new KairosTimeFrame();

    it('should default named times to epoch(0) + now(new Date()) + never(Infinity)', function () {
      expect(timeFrame.getNamedTimes({ includeDefaults: true }).epoch).toBe(0);
      expect(timeFrame.getNamedTimes({ includeDefaults: true }).now - now).toBeLessThan(50); // inexact
      expect(timeFrame.getNamedTimes({ includeDefaults: true }).never).toBe(Infinity);
    });

    it('should default beginsAt to epoch', function () {
      expect(timeFrame.getBeginsAt({ originalValue: true })).toBe('epoch');
      expect(timeFrame.getBeginsAt()).toBe(0);
    });

    it('should default endsAt to never', function () {
      expect(timeFrame.getEndsAt({ originalValue: true })).toBe('never');
      expect(timeFrame.getEndsAt()).toBe(Infinity);
    });
  });

  describe('Normalization', function () {
    it('should normalize beginsAt', function () {
      expect((new KairosTimeFrame({ beginsAt: '1000' })).getBeginsAt()).toBe(1000);

      expect((new KairosTimeFrame({ beginsAt: 'epoch' })).getBeginsAt()).toBe(0);

      expect((new KairosTimeFrame({ beginsAt: '1970-01-02' })).getBeginsAt()).toBe(24 * 60 * 60 * 1000); // might need to be offset by timezone

      expect((new KairosTimeFrame({ beginsAt: '1 hour after epoch' })).getBeginsAt()).toBe(60 * 60 * 1000);

      // Skipping additional tests since horo will do so exhaustively
      // Except that for code coverage, we will cover a few additional ones, just this once:

      expect((new KairosTimeFrame({ beginsAt: 'P1D after epoch' })).getBeginsAt()).toBe(24 * 60 * 60 * 1000);

      expect((new KairosTimeFrame({ beginsAt: new Date(100) })).getBeginsAt()).toBe(100);

      expect((new KairosTimeFrame({ beginsAt: { at: 1000 } })).getBeginsAt()).toBe(1000);

      expect((new KairosTimeFrame({ beginsAt: 'at 5000' })).getBeginsAt()).toBe(5000);

      expect((new KairosTimeFrame({ beginsAt: '1 hour before epoch' })).getBeginsAt()).toBe(-60 * 60 * 1000);

      expect((new KairosTimeFrame({ beginsAt: '0.25 between epoch and 1 hour after epoch' })).getBeginsAt()).toBe(0.25 * 60 * 60 * 1000);

      expect((new KairosTimeFrame({ beginsAt: '75% between epoch and 1 hour after epoch' })).getBeginsAt()).toBe(0.75 * 60 * 60 * 1000);

      // bad data:

      expect((new KairosTimeFrame({ beginsAt: 'garbage' })).getBeginsAt()).toBe(0);

      // TODO: Should it throw if the data is bad?
      expect((new KairosTimeFrame({ beginsAt: { starting: 'PT1H' } })).getBeginsAt()).toBe(0);

      expect((new KairosTimeFrame({ beginsAt: { interpolated: 0.5 } })).getBeginsAt()).toBe(0);

      // TODO: Perhaps the part after the 'h' in hours should not be dropped. 'h' or 'hours' or 'hour'?
      expect((new KairosTimeFrame({ beginsAt: '2 queens after epoch' })).getBeginsAt()).toBe(0);
    });

    it('should normalize endsAt', function () {
      expect((new KairosTimeFrame({ endsAt: '1000' })).getEndsAt()).toBe(1000);

      expect((new KairosTimeFrame({ endsAt: 'epoch' })).getEndsAt()).toBe(0);

      expect((new KairosTimeFrame({ endsAt: '1970-01-02' })).getEndsAt()).toBe(24 * 60 * 60 * 1000); // might need to be offset by timezone

      expect((new KairosTimeFrame({ endsAt: '1 hour after epoch' })).getEndsAt()).toBe(60 * 60 * 1000);

      // Skipping additional tests since horo will do so exhaustively
    });

    it('should normalize ticksEvery', function () {
      expect((new KairosTimeFrame({ ticksEvery: '1000' })).getTicksEvery()).toBe(1000);

      expect((new KairosTimeFrame({ ticksEvery: '1 hour' })).getTicksEvery()).toBe(60 * 60 * 1000);

      // Skipping additional tests since horo will do so exhaustively
    });

    it('should normalize syncsTo', function () {
      expect((new KairosTimeFrame({ syncsTo: '1000' })).getSyncsTo()).toBe(1000);

      expect((new KairosTimeFrame({ syncsTo: '1 hour' })).getSyncsTo()).toBe(60 * 60 * 1000);

      // Skipping additional tests since horo will do so exhaustively
    });

    it('should normalize named times', function () {
      var timeFrame = new KairosTimeFrame({
        namedTimes: {
          'foo': '1000'
        }
      });

      expect(timeFrame.getNamedTimes().foo).toBe(1000);

      timeFrame.extendNamedTimes({ 'bar': '1970-01-02' });

      expect(timeFrame.getNamedTimes().bar).toBe(24 * 60 * 60 * 1000); // might need to be offset by timezone

      // Skipping additional tests since horo will do so exhaustively
    });

    it('should replace extant named times', function () {
      var timeFrame = new KairosTimeFrame({
        namedTimes: {
          'foo': '1000'
        }
      });

      timeFrame.extendNamedTimes({
        'foo': '2000'
      });

      expect(timeFrame.getNamedTimes().foo).toBe(2000);
    });

    it('should throw an error if you call a getter that can not be evaluated due to a missing named time', function () {
      var timeFrame = new KairosTimeFrame({
        beginsAt: 'foo',
        endsAt: 'bar'
      });

      expect(timeFrame.getBeginsAt).toThrow();
      expect(timeFrame.getEndsAt).toThrow();
    });

    it('should throw an error if you call start and any named time references cannot be evaluated', function () {
      var timeFrame = new KairosTimeFrame({
        beginsAt: 'foo',
        endsAt: 'bar'
      });

      expect(timeFrame.start).toThrow();
    });
  });

  describe('Notifications', function () {
    it('should publish when the frame starts', function () {
      var begun = false;

      new KairosTimeFrame({
        beginsAt: '50ms after now'
      }).subscribe('began', function () { begun = true; })
        .start();

      waitsFor(function () {
        return begun;
      });

      runs(function () {
        expect(begun).toBe(true);
      });
    });

    it('should publish when the frame ends', function () {
      var ended = false;

      new KairosTimeFrame({
        endsAt: '50ms after now'
      }).subscribe('ended', function () { ended = true; })
        .start();

      waitsFor(function () {
        return ended;
      });

      runs(function () {
        expect(ended).toBe(true);
      });
    });

    it('should publish when the frame ticks', function () {
      var ticked = false;

      new KairosTimeFrame({
        ticksEvery: '50ms'
      }).subscribe('ticked', function () { ticked = true; })
        .start();

      waitsFor(function () {
        return ticked;
      });

      runs(function () {
        expect(ticked).toBe(true);
      });
    });

    it('should publish when the frame mutes', function () {
      var muted = false;

      new KairosTimeFrame()
        .subscribe('muted', function () { muted = true; })
        .start()
        .mute();

      expect(muted).toBe(true);
    });

    it('should publish when the frame unmutes', function () {
      var unmuted = false;

      new KairosTimeFrame()
        .subscribe('unmuted', function () { unmuted = true; })
        .start()
        .mute()
        .unmute();

      expect(unmuted).toBe(true);
    });

    it('should provide a KairosEvent instance to subscribers', function () {
      var
        ended = false,
        eventObjectsReceived = [],
        eventsReceived = [];

      new KairosTimeFrame({
        beginsAt: '50ms after now',
        endsAt: '150ms after beginsAt',
        ticksEvery: '100ms' // hopefully, this will tick exactly once
      }).subscribe('ended',   function () { ended = true; })
        .subscribe('began',   function (ev) { eventsReceived.push('began');   eventObjectsReceived.push(ev); })
        .subscribe('ended',   function (ev) { eventsReceived.push('ended');   eventObjectsReceived.push(ev); })
        .subscribe('ticked',  function (ev) { eventsReceived.push('ticked');  eventObjectsReceived.push(ev); })
        .subscribe('muted',   function (ev) { eventsReceived.push('muted');   eventObjectsReceived.push(ev); })
        .subscribe('unmuted', function (ev) { eventsReceived.push('unmuted'); eventObjectsReceived.push(ev); })
        .start()
        .mute()
        .unmute();

      waitsFor(function () {
        return ended;
      });

      runs(function () {
        expect(eventsReceived).toEqual(['muted', 'unmuted', 'began', 'ticked', 'ended']);
        expect(eventObjectsReceived[0]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[1]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[2]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[3]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[4]).toEqual(jasmine.any(KairosEvent));
      });
    });

    it('should not expose a KairosTimeFrame via KairosEvent', function () {
      var
        begun = false,
        event;

      new KairosTimeFrame({
        beginsAt: '50ms after now'
      }).subscribe('began', function (ev) { begun = true; event = ev; })
        .start();

      waitsFor(function () {
        return begun;
      });

      runs(function () {
        expect(event.timeFrame).toBeUndefined();
      });
    });

    it('should expose user data on KairosEvent', function () {
      var
        begun = false,
        event;

      new KairosTimeFrame({
        beginsAt: '50ms after now',
        data: { test: true }
      }).subscribe('began', function (ev) { begun = true; event = ev; })
        .start();

      waitsFor(function () {
        return begun;
      });

      runs(function () {
        expect(event.userData).toEqual({ test: true });
      });
    });

    it('should not add the name of the event to the KairosEvent', function () {
      var
        begun = false,
        event;

      new KairosTimeFrame({
        beginsAt: '50ms after now'
      }).subscribe('began', function (ev) { begun = true; event = ev; })
        .start();

      waitsFor(function () {
        return begun;
      });

      runs(function () {
        expect(event.eventName).toBe('began');
      });
    });

    it('should not add the name of the timeFrame to the KairosEvent', function () {
      var
        begun = false,
        event;

      new KairosTimeFrame('foo', {
        beginsAt: '50ms after now'
      }).subscribe('began', function (ev) { begun = true; event = ev; })
        .start();

      waitsFor(function () {
        return begun;
      });

      runs(function () {
        expect(event.timeFrameName).toBe('foo');
      });
    });

    it('should not add the time when the event was fired to the KairosEvent', function () {
      var
        begun = false,
        event;

      new KairosTimeFrame({
        beginsAt: '50ms after now'
      }).subscribe('began', function (ev) { begun = true; event = ev; })
        .start();

      waitsFor(function () {
        return begun;
      });

      runs(function () {
        expect(event.eventTime).toEqual(jasmine.any(Number));
      });
    });

    it('should not expose KairosTimeFrames getDurationRelativeTo method via KairosEvent', function () {
      var
        begun = false,
        event;

      new KairosTimeFrame({
        beginsAt: '50ms after now'
      }).subscribe('began', function (ev) { begun = true; event = ev; })
        .start();

      waitsFor(function () {
        return begun;
      });

      runs(function () {
        expect(event.getDurationRelativeTo('now')).toBeLessThan(0);
      });
    });
  });

  describe('Execution', function () {
    it('should start on time (BRITTLE)', function () {
      var
        begun = false,
        startTime;

      new KairosTimeFrame({
        beginsAt: '100ms after now'
      }).subscribe('began', function (ev) {
        begun = true;
        startTime = ev.getDurationRelativeTo('now');
      }).start();

      waitsFor(function () {
        return begun;
      });

      runs(function () {
        expect(startTime).toBeLessThan(100 + TIMING_PRECISION);
      });
    });

    it('should end on time (BRITTLE)', function () {
      var
        ended = false,
        endTime;

      new KairosTimeFrame({
        endsAt: '100ms after now'
      }).subscribe('ended', function (ev) {
        ended = true;
        endTime = ev.getDurationRelativeTo('now');
      }).start();

      waitsFor(function () {
        return ended;
      });

      runs(function () {
        expect(endTime).toBeLessThan(100 + TIMING_PRECISION);
      });
    });

    it('should stop ticking when the frame ends', function () {
      var
        tickedBeforeEnd = false,
        tickedAfterEnd = false,
        sufficientTimeHasElapsed = false,
        frame;

      function tickBeforeEnd () { tickedBeforeEnd = true; }

      frame = new KairosTimeFrame({
        endsAt: '100ms after now',
        ticksEvery: 50
      }).subscribe('ticked', tickBeforeEnd)
        .subscribe('ended', function () {
          frame.unsubscribe(['ticked', tickBeforeEnd]);
          frame.subscribe('ticked', function () {
            tickedAfterEnd = true;
          });
        })
        .start();

      waitsFor(function () {
        return sufficientTimeHasElapsed;
      });

      setTimeout(function () {
        sufficientTimeHasElapsed = true;
      }, 200);

      runs(function () {
        expect(tickedBeforeEnd).toBe(true);
        expect(tickedAfterEnd).toBe(false);
      });
    });

    it('should be able to sync ticks to an arbitrary interval (BRITTLE)', function () {
      var
        ticked = false,
        tickTime;

      new KairosTimeFrame({
        ticksEvery: 1000,
        syncsTo: 500
      }).start()
        .subscribe('ticked', function () {
          tickTime = (new Date()).getTime();
          ticked = true;
        });

      waitsFor(function () {
        return ticked;
      });

      runs(function () {
        expect(tickTime % 500).toBeLessThan(TIMING_PRECISION);
      });
    });

    it('should, by default, sync to the millisecond portion of the start time, adjusted by the millisecond portion of the ticksEvery duration (EXTRA BRITTLE)', function () {
      var
        ticked = false,
        tickTime,
        now = (new Date()).getTime();

      new KairosTimeFrame({
        ticksEvery: 1000
      }).subscribe('ticked', function () {
          tickTime = (new Date()).getTime();
          ticked = true;
        })
        .start();

      waitsFor(function () {
        return ticked;
      });

      runs(function () {
        expect((tickTime - now + TIMING_PRECISION) % 1000).toBeLessThan(TIMING_PRECISION * 2);
      });
    });
  });

  describe('Control', function () {
    it('should not fire any events until start has been called', function () {
      var
        begun = false,
        ended = false,
        ticked = false,
        timeHasPassed = false,
        timeFrame = new KairosTimeFrame({
          beginsAt: '100ms after now',
          endsAt: '200ms after beginsAt',
          ticksEvery: '50ms' // 100ms SHOULD have worked, but it didn't. end happened first. TODO: fix, or find out where my math went sideways
        }).subscribe('began', function () {
          begun = true;
        }).subscribe('ended', function () {
          ended = true;
        }).subscribe('ticked', function () {
          ticked = true;
        });

      setTimeout(function () {
        timeHasPassed = true;
      }, 200);

      waitsFor(function () {
        return timeHasPassed;
      });

      runs(function () {
        expect(begun).toBe(false);
        expect(ticked).toBe(false);
        timeFrame.start();
      });

      waitsFor(function () {
        return ended;
      });

      runs(function () {
        expect(ticked).toBe(true);
      });
    });

    it('should not fire any events if stop has been called', function () {
      var
        begun = false,
        ended = false,
        ticked = false,
        timeHasPassed = false;

      new KairosTimeFrame({
        beginsAt: '100ms after now',
        endsAt: '200ms after now',
        ticksEvery: 50
      }).subscribe('began', function () {
        begun = true;
      }).subscribe('ended', function () {
        ended = true;
      }).subscribe('ticked', function () {
        ticked = true;
      }).start()
        .stop();

      setTimeout(function () {
        timeHasPassed = true;
      }, 300);

      waitsFor(function () {
        return timeHasPassed;
      });

      runs(function () {
        expect(begun).toBe(false);
        expect(ticked).toBe(false);
        expect(ended).toBe(false);
      });
    });

    it('should not start if we have already begun', function () {
      var
        starts = 0;

      new KairosTimeFrame({
        beginsAt: '100ms after now'
      }).subscribe('began', function () {
        starts += 1;
      }).start()
        .start();

      waitsFor(function () {
        return 0 < starts;
      });

      runs(function () {
        expect(starts).toBe(1);
      });
    });

    it('should not fire any "ticked" events if muted', function () {
      var
        ticked = false,
        timeElapsed = false;

      new KairosTimeFrame({
        ticksEvery: '100ms'
      }).subscribe('ticked', function () {
          ticked = true;
        })
        .start()
        .mute();

      waitsFor(function () {
        return timeElapsed;
      });

      setTimeout(function () {
        timeElapsed = true;
      }, 200);

      runs(function () {
        expect(ticked).toBe(false);
      });
    });

    it('should still fire "begun" events when muted', function () {
      var
        begun = false,
        timeElapsed = false;

      new KairosTimeFrame({
        beginsAt: '100ms from now'
      }).subscribe('began', function () {
          begun = true;
        })
        .start()
        .mute();

      waitsFor(function () {
        return timeElapsed;
      });

      setTimeout(function () {
        timeElapsed = true;
      }, 200);

      runs(function () {
        expect(begun).toBe(true);
      });
    });

    it('should still fire "ended" events when muted', function () {
      var
        ended = false,
        timeElapsed = false;

      new KairosTimeFrame({
        endsAt: '100ms from now'
      }).subscribe('ended', function () {
          ended = true;
        })
        .start()
        .mute();

      waitsFor(function () {
        return timeElapsed;
      });

      setTimeout(function () {
        timeElapsed = true;
      }, 200);

      runs(function () {
        expect(ended).toBe(true);
      });
    });

    it('should not fire missed "ticked" events when unmuted', function () {
      var
        ticksReceived = 0,
        timeElapsed = false,

        timeFrame = new KairosTimeFrame({
          ticksEvery: '100ms'
        }).subscribe('ticked', function () {
            ticksReceived += 1;
          })
          .start()
          .mute();

      waitsFor(function () {
        return timeElapsed;
      });

      setTimeout(function () {
        timeElapsed = true;
      }, 200);

      runs(function () {
        timeFrame.unmute();
        expect(ticksReceived).toBe(0); // instead of 1 or 2
      });
    });

    it('should start firing new "ticked" events when unmuted', function () {
      var
        ticked = false,
        timeFrame = new KairosTimeFrame({
          ticksEvery: '100ms'
        }).subscribe('ticked', function () {
            ticked = true;
          })
          .start()
          .mute()
          .unmute();

      waitsFor(function () {
        return ticked;
      });

      runs(function () {
        expect(ticked).toBe(true);
      });
    });

    it('should not unmute if not muted', function () {
      var
        unmuted = false;

      new KairosTimeFrame()
        .subscribe('unmuted', function () {
          unmuted = true;
        })
        .unmute();

      expect(unmuted).toBe(false);
    });

    it('should not mute if already muted', function () {
      var
        muted = false;

      new KairosTimeFrame()
        .mute()
        .subscribe('muted', function () {
          muted = true;
        })
        .mute();

      expect(muted).toBe(false);
    });
  });

  describe('Misc', function () {
    it('should make private data inaccessible directly', function () {
      var timeFrame = new KairosTimeFrame();

      expect(timeFrame._private).toThrow();
    });

    it('should render as json', function () {
      var
        now = new Date().getTime(),
        timeFrame = new KairosTimeFrame('foo', {
          beginsAt: 'PT1S after foo',
          endsAt: '2 seconds after beginsAt',
          ticksEvery: '3 seconds',
          namedTimes: {
            'foo': '500000'
          },
          data: {
            'foo': 'bar'
          }
        }),
        json = timeFrame.toJson();

      expect(_.isObject(json)).toBe(true);
      expect(json.name).toBe('foo');
      expect(json.state).toEqual({
        is_started: false,
        is_stopped: false,
        is_begun: false,
        is_ended: false,
        is_muted: false
      });
      expect(json.begins_at).toBe(501000);
      expect(json.ends_at).toBe(503000);
      expect(json.ticks_every).toBe(3000);
      expect(json.sync_to).toBe(0);
      expect(json.named_times).toEqual({
        'foo': 500000
      });
      expect(json.data).toEqual({
        'foo': 'bar'
      });
    });

    it('should render as a string', function () {
      var timeFrame = new KairosTimeFrame('foo', {
        beginsAt: 'PT1S after foo',
        endsAt: '2 seconds after beginsAt',
        ticksEvery: '3 seconds',
        namedTimes: {
          'foo': '500000'
        },
        data: {
          'foo': 'bar'
        }
      });

      expect(typeof timeFrame.toString()).toBe('string');
    });
  });
});