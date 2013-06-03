/*global KairosTimeFrame: false, KairosCollection: false, KairosEvent: false, _: false, jasmine: false, describe: false, xdescribe: false, it: false, xit: false, expect: false, waitsFor: false, runs: false */
describe('KairosCollection', function () {
  describe('Constructor', function () {
    it('should construct with no arguments', function () {
      var collection;
      expect(function () {
        collection = new KairosCollection();
      }).not.toThrow();
      expect(collection).toEqual(jasmine.any(KairosCollection));
    });

    it('should construct with an empty array', function () {
      var collection;
      expect(function () {
        collection = new KairosCollection([]);
      }).not.toThrow();
      expect(collection).toEqual(jasmine.any(KairosCollection));
    });

    it('should construct with a array of KairosTimeFrames', function () {
      var collection;
      expect(function () {
        collection = new KairosCollection([
          new KairosTimeFrame(),
          new KairosTimeFrame()
        ]);
      }).not.toThrow();
      expect(collection).toEqual(jasmine.any(KairosCollection));
    });

    it('should construct with an array of (KairosTimeFrame options) hashes', function () {
      var collection;
      expect(function () {
        collection = new KairosCollection([
          {},
          {}
        ]);
      }).not.toThrow();
      expect(collection).toEqual(jasmine.any(KairosCollection));
    });

    it('should construct with a mixed array of KairosTimeFrames and hashes', function () {
      var collection;
      expect(function () {
        collection = new KairosCollection([
          new KairosTimeFrame(),
          {}
        ]);
      }).not.toThrow();
      expect(collection).toEqual(jasmine.any(KairosCollection));
    });

    it('should enforce uniqueness of KairosTimeFrames names (if name is present)', function () {
      expect(function () {
        new KairosCollection([
          new KairosTimeFrame('foo'),
          {
            name: 'foo'
          }
        ]);
      }).toThrow();

      var collection = new KairosCollection([
        new KairosTimeFrame('foo')
      ]);

      expect(function () {
        collection.addFrame(new KairosTimeFrame('foo'));
      }).toThrow();
    });
  });

  describe('API', function () {
    var collection = new KairosCollection();

    it('should have a start method', function () {
      expect(collection.start).toEqual(jasmine.any(Function));
    });

    it('should have a stop method', function () {
      expect(collection.stop).toEqual(jasmine.any(Function));
    });

    it('should have a mute method', function () {
      expect(collection.mute).toEqual(jasmine.any(Function));
    });

    it('should have a unmute method', function () {
      expect(collection.unmute).toEqual(jasmine.any(Function));
    });

    it('should have a subscribe method', function () {
      expect(collection.subscribe).toEqual(jasmine.any(Function));
    });

    it('should have a publish method', function () {
      expect(collection.publish).toEqual(jasmine.any(Function));
    });

    it('should have an unsubscribe method', function () {
      expect(collection.unsubscribe).toEqual(jasmine.any(Function));
    });

    it('should have a toJSON method', function () {
      expect(collection.toJSON).toEqual(jasmine.any(Function));
      expect(collection.toJson).toEqual(jasmine.any(Function));
    });

    it('should have a toString method', function () {
      expect(collection.toString).toEqual(jasmine.any(Function));
    });

    it('should have a logger', function () {
      expect(collection.logger).toEqual(jasmine.any(Object));
      expect(collection.logger.log).toEqual(jasmine.any(Function));
      expect(collection.logger.info).toEqual(jasmine.any(Function));
      expect(collection.logger.debug).toEqual(jasmine.any(Function));
      expect(collection.logger.warn).toEqual(jasmine.any(Function));
      expect(collection.logger.error).toEqual(jasmine.any(Function));
    });

    it('should have an pushTimeFrame method', function () {
      expect(collection.pushTimeFrame).toEqual(jasmine.any(Function));
    });
  });

  describe('Chaining', function () {
    var collection = new KairosCollection();

    it('should make the start method chainable', function () {
      expect(collection.start()).toBe(collection);
    });

    it('should make the stop method chainable', function () {
      expect(collection.stop()).toBe(collection);
    });

    it('should make the mute method chainable', function () {
      expect(collection.mute()).toBe(collection);
    });

    it('should make the unmute method chainable', function () {
      expect(collection.unmute()).toBe(collection);
    });

    it('should make the subscribe method chainable', function () {
      expect(collection.subscribe()).toBe(collection);
    });

    it('should make the publish method chainable', function () {
      expect(collection.publish()).toBe(collection);
    });

    it('should make the unsubscribe method chainable', function () {
      expect(collection.unsubscribe([])).toBe(collection);
    });

    it('should make the pushTimeFrame method chainable', function () {
      expect(collection.pushTimeFrame({})).toBe(collection);
    });
  });

  describe('Accessors', function () {
    var
      timeFrame = new KairosTimeFrame('test', {
        namedTimes: {
          'foo': '1000'
        }
      }),
      arr = [timeFrame],
      collection = new KairosCollection(arr);

    it('should expose a setter for the named times', function () {
      expect(collection.extendNamedTimes).toEqual(jasmine.any(Function));
    });

    it('should throw an error if you call the named times setter with no value', function () {
      expect(collection.extendNamedTimes).toThrow();
    });

    it('should make the named times setter chainable', function () {
      expect(collection.extendNamedTimes({})).toBe(collection);
    });

    it('should expose a getter for all frames', function () {
      expect(collection.getTimeFrames).toEqual(jasmine.any(Function));
      expect(collection.getTimeFrames()).toEqual([timeFrame]);
      expect(collection.getTimeFrames()).not.toBe(arr);
    });

    it('should expose a getter for a named frame', function () {
      expect(collection.getNamedTimeFrame).toEqual(jasmine.any(Function));
      expect(collection.getNamedTimeFrame('test')).toEqual(timeFrame);
    });

    it('should throw an error if you call the named frame getter with no value', function () {
      expect(collection.getNamedTimeFrame).toThrow();
    });
  });

  describe('Notifications', function () {
    it('should publish when any KairosTimeFrames begins', function () {
      var began = false;

      new KairosCollection([
        new KairosTimeFrame({
          beginsAt: '100ms after now'
        })
      ]).subscribe('timeFrameBegan', function () {
          began = true;
        })
        .start();

      waitsFor(function () {
        return began;
      });

      runs(function () {
        expect(began).toBe(true);
      });
    });

    it('should publish when any KairosTimeFrames ends', function () {
      var ended = false;

      new KairosCollection([
        new KairosTimeFrame({
          endsAt: '100ms after now'
        })
      ]).subscribe('timeFrameEnded', function () {
          ended = true;
        })
        .start();

      waitsFor(function () {
        return ended;
      });

      runs(function () {
        expect(ended).toBe(true);
      });
    });

    it('should publish when any KairosTimeFrames ticks', function () {
      var ticked = false;

      new KairosCollection([
        new KairosTimeFrame({
          ticksEvery: '100ms'
        })
      ]).subscribe('timeFrameTicked', function () {
          ticked = true;
        })
        .start();

      waitsFor(function () {
        return ticked;
      });

      runs(function () {
        expect(ticked).toBe(true);
      });
    });

    it('should publish when any KairosTimeFrames mutes', function () {
      var muted = false;

      new KairosCollection([
        new KairosTimeFrame()
      ]).subscribe('timeFrameMuted', function () {
          muted = true;
        })
        .start()
        .mute();

      runs(function () {
        expect(muted).toBe(true);
      });
    });

    it('should publish when any KairosTimeFrames unmutes', function () {
      var unmuted = false;

      new KairosCollection([
        new KairosTimeFrame()
      ]).subscribe('timeFrameUnmuted', function () {
          unmuted = true;
        })
        .start()
        .mute()
        .unmute();

      runs(function () {
        expect(unmuted).toBe(true);
      });
    });

    it('should republish KairosTimeFrames specific publishes', function () {
      var
        began = false,
        ended = false,
        ticked = false,
        muted = false,
        unmuted = false;

      new KairosCollection([
        new KairosTimeFrame('test', {
          beginsAt: '100ms after now',
          endsAt: '200ms after now',
          ticksEvery: '50ms'
        })
      ]).subscribe('test/began', function () {
          began = true;
        })
        .subscribe('test/ended', function () {
          ended = true;
        })
        .subscribe('test/ticked', function () {
          ticked = true;
        })
        .subscribe('test/muted', function () {
          muted = true;
        })
        .subscribe('test/unmuted', function () {
          unmuted = true;
        })
        .start()
        .mute()
        .unmute();

      waitsFor(function () {
        return ended;
      });

      runs(function () {
        expect(began).toBe(true);
        expect(ended).toBe(true);
        expect(ticked).toBe(true);
        expect(muted).toBe(true);
        expect(unmuted).toBe(true);
      });
    });

    it('should provide a KairosEvent instance to subscribers', function () {
      var
        eventObjectsReceived = [],
        ended = false;

      new KairosCollection([
        new KairosTimeFrame('test', {
          beginsAt: '100ms after now',
          endsAt: '200ms after now',
          ticksEvery: '50ms'
        })
      ]).subscribe('timeFrameEnded',   function () { ended = true; })
        .subscribe('timeFrameBegan',   function (ev) { eventObjectsReceived.push(ev); })
        .subscribe('timeFrameEnded',   function (ev) { eventObjectsReceived.push(ev); })
        .subscribe('timeFrameTicked',  function (ev) { eventObjectsReceived.push(ev); })
        .subscribe('timeFrameMuted',   function (ev) { eventObjectsReceived.push(ev); })
        .subscribe('timeFrameUnmuted', function (ev) { eventObjectsReceived.push(ev); })
        .subscribe('test/began',       function (ev) { eventObjectsReceived.push(ev); })
        .subscribe('test/ended',       function (ev) { eventObjectsReceived.push(ev); })
        .subscribe('test/ticked',      function (ev) { eventObjectsReceived.push(ev); })
        .subscribe('test/muted',       function (ev) { eventObjectsReceived.push(ev); })
        .subscribe('test/unmuted',     function (ev) { eventObjectsReceived.push(ev); })
        .start()
        .mute()
        .unmute();

      waitsFor(function () {
        return ended;
      });

      runs(function () {
        expect(eventObjectsReceived.length).toBe(10);
        expect(eventObjectsReceived[0]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[1]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[2]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[3]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[4]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[5]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[6]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[7]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[8]).toEqual(jasmine.any(KairosEvent));
        expect(eventObjectsReceived[9]).toEqual(jasmine.any(KairosEvent));
      });
    });

    it('should wire up notifications for KairosTimeFrames added via pushTimeFrame', function () {
      var
        collection = new KairosCollection(),
        began = false;

      collection.pushTimeFrame(new KairosTimeFrame({
        beginsAt: '100ms after now'
      }));

      collection.subscribe('timeFrameBegan', function () {
        began = true;
      });

      collection.start();

      waitsFor(function () {
        return began;
      });

      runs(function () {
        expect(began).toBe(true);
      });
    });
  });

  describe('Control', function () {
    it('should invoke start on all KairosTimeFrames on start', function () {
      var
        started = false,
        timeFrame = new KairosTimeFrame();

      timeFrame.start = function () {
        started = true;
      };

      new KairosCollection([timeFrame]).start();

      expect(started).toBe(true);
    });

    it('should invoke stop on all KairosTimeFrames on stop', function () {
      var
        stopped = false,
        timeFrame = new KairosTimeFrame();

      timeFrame.stop = function () {
        stopped = true;
      };

      new KairosCollection([timeFrame]).start().stop();

      expect(stopped).toBe(true);
    });

    it('should invoke mute on all KairosTimeFrames on mute', function () {
      var
        muted = false,
        timeFrame = new KairosTimeFrame();

      timeFrame.mute = function () {
        muted = true;
      };

      new KairosCollection([timeFrame]).start().mute();

      expect(muted).toBe(true);
    });

    it('should invoke unmute on all KairosTimeFrames on unmute', function () {
      var
        unmuted = false,
        timeFrame = new KairosTimeFrame();

      timeFrame.unmute = function () {
        unmuted = true;
      };

      new KairosCollection([timeFrame]).start().mute().unmute();

      expect(unmuted).toBe(true);
    });
  });

  describe('Misc', function () {
    it('should make private data inaccessible directly', function () {
      var collection = new KairosCollection();

      expect(collection._private).toThrow();
    });

    xit('should render as json', function () {
      var collection = new KairosCollection();


    });

    it('should render as a string', function () {
      var collection = new KairosCollection();

      expect(typeof collection.toString()).toBe('string');
    });
  });
});