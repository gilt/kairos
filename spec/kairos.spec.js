/* global KairosScheduler: false, describe: false, xdescribe: false, it: false, xit: false, expect: false, waitsFor: false, runs: false */
describe('Kairos', function () {
  // NOTE:
  //   Several of these tests are to ensure that things happen at the correct
  //   time. Unfortunately, setTimeout is intrinsically inaccurate, so a certain
  //   amount of imprecision is unavoidable.  We've taken steps to minimize
  //   the imprecision, but, YMMV.
  var TIMING_PRECISION = 15;

  describe('TimeFrame', function () {
    describe('Constructor', function () {
      it('should construct with no arguments');
      
      it('should construct with only a name argument');
      
      it('should construct with an options argument');
      
      it('should construct with both a name and an options argument');

      it('should construct with a name in the options argument');
    });

    describe('API', function () {
      it('should have a start method');

      it('should have a stop method');

      it('should have a pause method');

      it('should have a resume method');

      it('should have a subscribe method');

      it('should have a publish method');

      it('should have an unsubscribe method');

      it('should have a toJSON method');

      it('should have a toString method');

      it('should have a logger');

      it('should have a clone method');
    });

    describe('Chaining', function () {
      it('should make the start method chainable');

      it('should make the stop method chainable');

      it('should make the pause method chainable');

      it('should make the resume method chainable');

      it('should make the subscribe method chainable');

      it('should make the publish method chainable');

      it('should make the unsubscribe method chainable');
    });

    describe('Accessors', function () {
      it('should expose a getter for the original beginsAt parameter');

      it('should expose a getter for the normalized beginsAt parameter');

      it('should expose a setter for the beginsAt parameter');

      it('should make the beginsAt setter chainable');

      it('should expose a getter for the original endsAt parameter');

      it('should expose a getter for the normalized endsAt parameter');

      it('should expose a setter for the endsAt parameter');

      it('should make the endsAt setter chainable');

      it('should expose a getter for the original ticksEvery parameter');

      it('should expose a getter for the normalized ticksEvery parameter');

      it('should expose a setter for the ticksEvery parameter');

      it('should make the ticksEvery setter chainable');

      it('should expose a getter for the original relativeTo parameter');

      it('should expose a getter for the normalized relativeTo parameter');

      it('should expose a setter for the relativeTo parameter');

      it('should make the relativeTo setter chainable');

      it('should expose a getter for the original syncTo parameter');

      it('should expose a getter for the normalized syncTo parameter');

      it('should expose a setter for the syncTo parameter');

      it('should make the syncTo setter chainable');

      it('should expose a getter for the original named times');

      it('should expose a getter for the normalized named times');

      it('should expose a setter for the named times');

      it('should make the named times setter chainable');

      it('should expose a getter for the name parameter');

      it('should expose a getter for the data parameter');

      it('should expose a setter for the data parameter');

      it('should make the data setter chainable');

      it('should expose a getter for isStarted');

      it('should expose a getter for isEnded');

      it('should expose a getter for isMuted');

      it('should expose a getter for isStopped');

      it('should expose a getter for the duration relative to the relativeTo time');

      it('should make all setters immutable once start has been called');
    });

    describe('Defaults', function () {
      it('should default named times to epoch(0) + now(new Date()) + never(Infinity)');

      it('should default beginsAt to epoch');

      it('should default endsAt to never');

      it('should default relativeTo to beginsAt');
    });

    describe('Normalization', function () {
      it('should normalize beginsAt');

      it('should normalize endsAt');

      it('should normalize ticksEvery');

      it('should normalize relativeTo');

      it('should normalize syncTo');

      it('should normalize named times');

      it('should not replace extant named times');

      it('should log an error if you attempt to set an extant named time');
    });

    describe('Notifications', function () {
      it('should publish when the frame starts');

      it('should publish when the frame ends');

      it('should publish when the frame ticks');

      it('should publish when the frame pauses');

      it('should publish when the frame resumes');

      it('should provide the KairosTimeFrame instance to subscribers');
    });

    describe('Execution', function () {
      it('should start on time (BRITTLE)');

      it('should end on time (BRITTLE)');

      it('should stop ticking when the frame ends');

      it('should be able to sync to an arbitrary interval');

      it('should, by default, sync to the millisecond portion of the start time, adjusted by the millisecond portion of the ticksEvery duration');
    });

    describe('Control', function () {
      it('should not fire any events until start has been called');

      it('should not fire any events if stop has been called');

      it('should not start if we are already started');

      it('should not fire any "ticked" events if muted');

      it('should still fire "started" events when muted');

      it('should still fire "ended" events when muted');

      it('should not fire missed "ticked" events when unmuted');

      it('should start firing new "ticked" events when unmuted');

      it('should not unmute if not muted');

      it('should not unmute if not started');

      it('should not unmute if ended');

      it('should not unmute if stopped');
    });

    describe('Misc', function () {
      it('should reset state(isStarted/isEnded/isStopped/isMuted) when cloned');
    });
  });
  
  describe('Container', function () {
    describe('Constructor', function () {
      it('should construct with a array of KairosTimeFrames');

      it('should construct with an array of (KairosTimeFrame options) hashes');

      it('should construct with a mixed array of KairosTimeFrames and hashes');

      it('should enforce uniqueness of KairosTimeFrames names (if name is present)');
    });

    describe('API', function () {
      it('should have a start method');

      it('should have a stop method');

      it('should have a pause method');

      it('should have a resume method');

      it('should have a subscribe method');

      it('should have a publish method');

      it('should have an unsubscribe method');

      it('should have a toJSON method');

      it('should have a toString method');

      it('should have a logger');

      it('should have an addFrame method');
    });

    describe('Chaining', function () {
      it('should make the start method chainable');

      it('should make the stop method chainable');

      it('should make the pause method chainable');

      it('should make the resume method chainable');

      it('should make the subscribe method chainable');

      it('should make the publish method chainable');

      it('should make the unsubscribe method chainable');

      it('should make the addFrame method chainable');
    });

    describe('Accessors', function () {
      it('should expose a getter for the original named times');

      it('should expose a getter for the normalized named times');

      it('should expose a setter for the named times');

      it('should make the named times setter chainable');

    });

    describe('Defaults', function () {
      it('should default named times to the unique aggregate of all named times in all KairosTimeFrames');
    });

    describe('Normalization', function () {
      it('should normalize named times');

      it('should not replace extant named times');
    });

    describe('Notifications', function () {
      it('should publish when any KairosTimeFrames starts');

      it('should publish when any KairosTimeFrames ends');

      it('should publish when any KairosTimeFrames ticks');

      it('should publish when any KairosTimeFrames pauses');

      it('should publish when any KairosTimeFrames resumes');

      it('should republish KairosTimeFrames specific publishes');
    });

    describe('Control', function () {
      it('should invoke start on all KairosTimeFrames on start');

      it('should invoke stop on all KairosTimeFrames on stop');

      it('should invoke pause on all KairosTimeFrames on pause');

      it('should invoke resume on all KairosTimeFrames on resume');
    });
  });
  
  // OLD SPECS:

  xdescribe('Scheduler', function () {
    xdescribe('Constructor', function () {
      it('should privately expose its options as "_options"', function () {
        var
          kairos = new KairosScheduler();

        expect(kairos._options).not.toBeUndefined();
      });

      it('should have a "times" field consisting of named timestamps (in milliseconds)', function () {
        var
          kairos1 = new KairosScheduler(),
          kairos2 = new KairosScheduler({
            times: {
              'test': 0
            }
          });

        expect(kairos1._options.times).toEqual({});
        expect(kairos2._options.times).toEqual({ 'test': 0 });
      });

      it('should normalize "times" by converting Date objects to timestamps', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'test': (new Date(0))
            }
          });

        expect(kairos._options.times).toEqual({ 'test': 0 });
      });

      it('should have a "frames" field consisting of an array of frame objects', function () {
        var
          kairos1 = new KairosScheduler(),
          kairos2 = new KairosScheduler({
            frames: [{}]
          });

        expect(kairos1._options.frames).toEqual([]);
        expect(kairos2._options.frames.length).toBe(1);
      });

      it('should default the "sync" property of each frame to true', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              sync: true
            }, {
              sync: false
            }, {
            }]
          });

        expect(kairos._options.frames[0].sync).toBe(true);
        expect(kairos._options.frames[1].sync).toBe(false);
        expect(kairos._options.frames[2].sync).toBe(true);
      });

      it('should lookup named "relatedTo" times from the list of "times"', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'test': new Date(1000)
            },
            frames: [{
              begin: {},
              relatedTo: 'test'
            }]
          });

        expect(kairos._options.frames[0].relatedTo).toBe(1000);
      });

      it('should convert "relatedTo" Date objects to milliseconds', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {},
              relatedTo: new Date(1000)
            }]
          });

        expect(kairos._options.frames[0].relatedTo).toBe(1000);
      });

      it('should default and/or convert the "begin" property to a timestamp (milliseconds) with a default of 0', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {}
            }, {
              begin: 1000
            }, {
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(0);
        expect(kairos._options.frames[1].begin).toBe(1000);
        expect(kairos._options.frames[2].begin).toBe(0);
      });

      it('should convert a "begin" Date object to a timestamp', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: (new Date(1000))
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(1000);
      });

      it('should lookup "begin.at" times from the list of "times"', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'test': new Date(1000)
            },
            frames: [{
              begin: {
                at: 'test'
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(1000);
      });

      it('should convert "begin.at" Date objects to milliseconds', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                at: new Date(1000)
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(1000);
      });

      it('should convert a "starting" + "after" begin time to milliseconds', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                starting: 1000,
                after: 0
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(1000);
      });

      it('should convert a "starting" + "before" begin time to milliseconds', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                starting: 1000,
                before: 0
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(-1000);
      });

      it('should convert a "starting" time that is a LDML style duration string', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                starting: '1s',
                after: 0
              }
            }, {
              begin: {
                starting: 'PT1M',
                after: 0
              }
            }, {
              begin: {
                starting: '1h',
                after: 0
              }
            }, {
              begin: {
                starting: '1d',
                after: 0
              }
            }, {
              begin: {
                starting: 'P1M',
                after: 0
              }
            }, {
              begin: {
                starting: '1y',
                after: 0
              }
            }, {
              begin: {
                starting: 'PT1H15M30S',
                after: 0
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(1000);
        expect(kairos._options.frames[1].begin).toBe(60 * 1000);
        expect(kairos._options.frames[2].begin).toBe(60 * 60 * 1000);
        expect(kairos._options.frames[3].begin).toBe(24 * 60 * 60 * 1000);
        expect(kairos._options.frames[4].begin).toBe(30 * 24 * 60 * 60 * 1000);
        expect(kairos._options.frames[5].begin).toBe(365 * 24 * 60 * 60 * 1000);
        expect(kairos._options.frames[6].begin).toBe(4530000);
      });

      it('should lookup "before" or "after" times from the list of "times"', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'test': (new Date(0))
            },
            frames: [{
              begin: {
                starting: 1000,
                before: 'test'
              }
            }, {
              begin: {
                starting: 1000,
                after: 'test'
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(-1000);
        expect(kairos._options.frames[1].begin).toBe(1000);
      });

      it('should convert "before" or "after" Date objects to a milliseconds', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                starting: 1000,
                before: (new Date(0))
              }
            }, {
              begin: {
                starting: 1000,
                after: (new Date(0))
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(-1000);
        expect(kairos._options.frames[1].begin).toBe(1000);
      });

      it('should use the default value if "starting" is provided with neither "before" nor "after"', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                starting: 1000
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(0);
      });

      it('should convert an "interpolated" + "between" + "and" begin time to milliseconds', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                interpolated: 0.5,
                between: 0,
                and: 1000
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(500);
      });

      it('should convert an "interpolated" in string form (50%) to decimal form (0.5)', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                interpolated: '50%',
                between: 0,
                and: 1000
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(500);
      });

      it('should lookup "between" or "after" times from the list of "times"', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'then': 0,
              'later': 1000
            },
            frames: [{
              begin: {
                interpolated: '50%',
                between: 'then',
                and: 'later'
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(500);
      });

      it('should convert "between" or "after" Date Objects to milliseconds', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                interpolated: '50%',
                between: (new Date(0)),
                and: (new Date(1000))
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(500);
      });

      it('should default and/or convert the "end" property to a timestamp (milliseconds) with a default of the "begin" value of the next frame or infinity', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                at: 0
              }
            }, {
              begin: {
                at: 1000
              },
              end: {
                at: 2000
              }
            }, {
              begin: {
                at: 3000
              }
            }]
          });

        expect(kairos._options.frames[0].end).toBe(1000);
        expect(kairos._options.frames[1].end).toBe(2000);
        expect(kairos._options.frames[2].end).toBe(Infinity);
      });

      it('should convert LDML style intervals into milliseconds', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                at: 0
              },
              interval: 1000
            }, {
              begin: {
                at: 10000
              },
              interval: '2s'
            }]
          });

        expect(kairos._options.frames[0].interval).toBe(1000);
        expect(kairos._options.frames[1].interval).toBe(2000);
      });
    });

    xdescribe('Natural Language', function () {
      it('should parse "begin" strings of the form "starting 2s after foo" with variations', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'foo': new Date(0)
            },
            frames: [{
              begin: 'starting 2s after foo'
            }, {
              begin: '2s after foo'
            }, {
              begin: '2 seconds after foo'
            }, {
              begin: '5 minutes and 2 seconds after foo'
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(2000);
        expect(kairos._options.frames[1].begin).toBe(2000);
        expect(kairos._options.frames[2].begin).toBe(2000);
        expect(kairos._options.frames[3].begin).toBe(302000);
      });

      it('should parse "begin" strings of the form "starting 2s before foo." with variations', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'foo': new Date(0)
            },
            frames: [{
              begin: 'starting 2s before foo'
            }, {
              begin: '2s before foo'
            }, {
              begin: '2 seconds before foo'
            }, {
              begin: '2 seconds and 5 minutes before foo'
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(-2000);
        expect(kairos._options.frames[1].begin).toBe(-2000);
        expect(kairos._options.frames[2].begin).toBe(-2000);
        expect(kairos._options.frames[3].begin).toBe(-302000);
      });

      it('should parse "begin" strings of the form "interpolated 50% between foo and bar" with variations', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'foo': 0,
              'bar': 1000
            },
            frames: [{
              begin: 'interpolated 50% between foo and bar'
            }, {
              begin: '50% between foo and bar'
            }, {
              begin: '0.5 between foo and bar'
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(500);
        expect(kairos._options.frames[1].begin).toBe(500);
        expect(kairos._options.frames[2].begin).toBe(500);
      });

      it('should parse "begin" strings of the form "at foo" with variations', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'foo': new Date(1000)
            },
            frames: [{
              begin: 'at foo'
            }, {
              begin: 'foo'
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(1000);
        expect(kairos._options.frames[1].begin).toBe(1000);
      });

      it('should use a duration of 0 if it cannot parse a natural language duration', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                starting: 'una minuto',
                before: (new Date(1000))
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(1000);
      });
    });

    xdescribe('Notifications', function () {
      it('should have a pubsub system', function () {
        var
          kairos = new KairosScheduler({}),
          received = false;

        kairos.subscribe('testing', function () {
          received = true;
        });

        kairos.publish('testing');

        expect(received).toBe(true);
      });

      it('should publish when a frame starts', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'now': new Date()
            },
            frames: [{
            }, {
              begin: {
                starting: 50,
                after: 'now'
              }
            }]
          }),
          received = false

        kairos.subscribe('frameStarted', function () {
          received = true;
        });

        waitsFor(function () {
          return received;
        });

        runs(function () {
          expect(received).toBe(true);
        });
      });

      it('should send duration with all frame notifications', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'now': new Date()
            },
            frames: [{
            }, {
              begin: {
                starting: 50,
                after: 'now'
              },
              relatedTo: 'now'
            }]
          }),
          received = false,
          durationReceived = null;

        kairos.subscribe('frameStarted', function (duration) {
          received = true;
          durationReceived = duration;
        });

        waitsFor(function () {
          return received;
        });

        runs(function () {
          expect(durationReceived).toBeLessThan(50 + TIMING_PRECISION);
        });
      });

      it('should send relatedTime with all frame notifications', function () {
        var
          now = new Date().getTime(),
          kairos = new KairosScheduler({
            times: {
              'now': now
            },
            frames: [{
            }, {
              begin: {
                starting: 50,
                after: 'now'
              },
              relatedTo: 'now'
            }]
          }),
          received = false,
          momentReceived = null;

        kairos.subscribe('frameStarted', function (duration, moment) {
          received = true;
          momentReceived = moment;
        });

        waitsFor(function () {
          return received;
        });

        runs(function () {
          expect(momentReceived).toBe(now);
        });
      });

      it('should send data with all frame notifications', function () {
        var
          now = new Date().getTime(),
          kairos = new KairosScheduler({
            times: {
              'now': now
            },
            frames: [{
            }, {
              begin: {
                starting: 50,
                after: 'now'
              },
              data: {
                foo: 'bar'
              }
            }]
          }),
          received = false,
          dataReceived = null;

        kairos.subscribe('frameStarted', function (duration, moment, data) {
          received = true;
          dataReceived = data;
        });

        waitsFor(function () {
          return received;
        });

        runs(function () {
          expect(dataReceived).toEqual({ foo: 'bar' });
        });
      });

      it('should publish a named event when a named frame starts', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'test': (new Date()).getTime() + 60000
            },
            frames: [{
              begin: {
                at: 0
              }
            }, {
              begin: {
                starting: '59s',
                before: 'test'
              },
              name: 'test',
              data: {}
            }]
          }),
          received = false,
          dataReceived = null;

        kairos.subscribe('test/started', function (duration, moment, data) {
          received = true;
          dataReceived = data;
        });

        waitsFor(function () {
          return received;
        });

        runs(function () {
          expect(dataReceived).toEqual({});
        });
      });

      it('should publish when a frame ticks', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'test': (new Date()).getTime() + 60000
            },
            frames: [{
              begin: {
                at: 0
              },
              relatedTo: 'test',
              interval: 1000
            }]
          }),
          received = false,
          durationReceived = null;

        kairos.subscribe('frameTicked', function (duration, moment, data) {
          received = true;
          durationReceived = duration;
        });

        waitsFor(function () {
          return received;
        });

        runs(function () {
          expect(Math.floor(durationReceived / 1000)).toBe(59);
        });
      });

      it('should publish a named event when a named frame ticks', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'test': (new Date()).getTime() + 60000
            },
            frames: [{
              begin: {
                at: 0
              },
              relatedTo: 'test',
              interval: 1000,
              name: 'test'
            }]
          }),
          received = false,
          durationReceived = null;

        kairos.subscribe('test/ticked', function (duration, moment, data) {
          received = true;
          durationReceived = duration;
        });

        waitsFor(function () {
          return received;
        });

        runs(function () {
          expect(Math.floor(durationReceived / 1000)).toBe(59);
        });
      });

      it('should send a tick duration of 0 if no "relatedTo" field is set', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'test': (new Date()).getTime() + 60000
            },
            frames: [{
              begin: {
                at: 0
              },
              interval: 1000
            }]
          }),
          received = false,
          durationReceived = null;

        kairos.subscribe('frameTicked', function (duration, moment, data) {
          received = true;
          durationReceived = duration;
        });

        waitsFor(function () {
          return received;
        });

        runs(function () {
          expect(durationReceived).toBe(0);
        });
      });

      it('should publish when a frame ends', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'now': (new Date())
            },
            frames: [{
              end: {
                starting: '1s',
                after: 'now'
              },
              data: {}
            }]
          }),
          received = false,
          dataReceived = null;

        kairos.subscribe('frameEnded', function (duration, moment, data) {
          received = true;
          dataReceived = data;
        });

        waitsFor(function () {
          return received;
        });

        runs(function () {
          expect(dataReceived).toEqual({});
        });
      });

      it('should publish a named event when a named frame ends', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'now': (new Date())
            },
            frames: [{
              end: {
                starting: '1s',
                after: 'now'
              },
              name: 'test',
              data: {}
            }]
          }),
          received = false,
          dataReceived = null;

        kairos.subscribe('test/ended', function (duration, moment, data) {
          received = true;
          dataReceived = data;
        });

        waitsFor(function () {
          return received;
        });

        runs(function () {
          expect(dataReceived).toEqual({});
        });
      });
    });

    xdescribe('Scheduling', function () {
      it('should be able to run an arbitrary number of frames', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'test': (new Date()).getTime() + 60000
            },
            frames: [{
              begin: {
                at: 0
              }
            }, {
              begin: {
                starting: '59s',
                before: 'test'
              }
            }, {
              begin: {
                starting: '58s',
                before: 'test'
              }
            }]
          }),
          frameCount = 1;

        kairos.subscribe('frameStarted', function () {
          frameCount += 1;
        });

        waitsFor(function () {
          return 3 === frameCount;
        });

        runs(function () {
          expect(frameCount).toEqual(3);
        });
      });

      it('should be able to use an arbitrary number of times', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'later': (new Date()).getTime() + 60000,
              'now': (new Date())
            },
            frames: [{
              begin: {
                at: 'now'
              }
            }, {
              begin: {
                starting: '1s',
                after: 'now'
              }
            }, {
              begin: {
                starting: '58s',
                before: 'later'
              }
            }]
          }),
          frameCount = 1;

        kairos.subscribe('frameStarted', function () {
          frameCount += 1;
        });

        waitsFor(function () {
          return 3 === frameCount;
        });

        runs(function () {
          expect(frameCount).toEqual(3);
        });
      });

      it('should start each frame on time (BRITTLE)', function () {
        var
          now = (new Date()).getTime(),
          expectedStartTime = now + 1000,
          kairos = new KairosScheduler({
            times: {
              now: now
            },
            frames: [{
              begin: {
                starting: '1s',
                after: 'now'
              }
            }]
          }),
          startReceived = false,
          startTime = null;


        kairos.subscribe('frameStarted', function () {
          startReceived = true;
          startTime = (new Date()).getTime();
        });

        waitsFor(function () {
          return startReceived;
        });

        runs(function () {
          expect(Math.abs(expectedStartTime - startTime)).toBeLessThan(TIMING_PRECISION); // seen max of 148
        });

      });

      it('should end each frame on time (BRITTLE)', function () {
        var
          now = (new Date()).getTime(),
          expectedEndTime = now + 1000,
          kairos = new KairosScheduler({
            times: {
              now: now
            },
            frames: [{
              end: {
                starting: '1s',
                after: 'now'
              }
            }]
          }),
          endReceived = false,
          endTime = null;

        kairos.subscribe('frameEnded', function () {
          endReceived = true;
          endTime = (new Date()).getTime();
        });

        waitsFor(function () {
          return endReceived;
        });

        runs(function () {
          expect(Math.abs(expectedEndTime - endTime)).toBeLessThan(TIMING_PRECISION);
        });

      });

      it('should stop ticking a frame when that frame ends', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'now': (new Date())
            },
            frames: [{
              begin: {
                at: 'now'
              },
              relatedTo: 'now',
              interval: 2000,
              sync: false // don't sync, to make this test more predictable
            }, {
              begin: {
                starting: '3s',
                after: 'now'
              }
            }, {
              begin: {
                starting: '5s',
                after: 'now'
              }
            }]
          }),
          ticksReceived = 0,
          frameChanges = 0;

        kairos.subscribe('frameTicked', function (duration, moment, data) {
          if (0 !== duration) { // ignore ticks from the non-interval frames
            ticksReceived += 1;
          }
        });

        kairos.subscribe('frameStarted', function () {
          frameChanges += 1;
        });

        waitsFor(function () {
          return 2 === frameChanges;
        });

        runs(function () {
          expect(ticksReceived).toBe(1);
        });
      });

      it('should be able to sync to an arbitary interval', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              interval: 1000,
              sync: 500
            }]
          }),
          tickReceived = false,
          tickTime;

        kairos.subscribe('frameTicked', function () {
          tickReceived = true;
          tickTime = (new Date()).getTime();
        });

        waitsFor(function () {
          return tickReceived;
        });

        runs(function () {
          var tick = tickTime % 500;
          if (250 < tick) {
            tick = 500 - tick;
          }
          expect(tick).toBeLessThan(TIMING_PRECISION);
        });
      });
    });

    xdescribe('Start/Pause/Resume', function () {
      it('should have a start method', function () {
        var
          kairos = new KairosScheduler({
            autoStart: false
          });

        expect(kairos.start).not.toThrow();
      });

      it('should have a pause method', function () {
        var
          kairos = new KairosScheduler();

        expect(kairos.pause).not.toThrow();
      });

      it('should have a resume method', function () {
        var
          kairos = new KairosScheduler();

        expect(kairos.resume).not.toThrow();
      });

      it('should not fire any events until start has been called (assuming autoStart is false)', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: 0
            }],
            autoStart: false
          }),
          startReceived = false;

        // normally, if autoStart were true, any frames that started in the past
        // would be started before we got to this line.
        kairos.subscribe('frameStarted', function () {
          startReceived = true;
        });

        expect(startReceived).toBe(false); // sanity check

        kairos.start();

        expect(startReceived).toBe(true);
      });

      it('should not fire frameTicked events after pause is called', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              interval: 100,
              sync: false
            }]
          }),
          tickReceived = false,
          waitFinished = false;

        kairos.subscribe('frameTicked', function () {
          tickReceived = true;
        });

        waitsFor(function () {
          return tickReceived;
        });

        runs(function () {
          kairos.pause();

          tickReceived = false; // reset

          setTimeout(function () {
            waitFinished = true;
          }, 200);
        });

        waitsFor(function () {
          return waitFinished;
        });

        runs(function () {
          expect(tickReceived).toBe(false);
        });
      });

      it('should still fire frameStarted events while paused', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: (new Date()).getTime() + 100
            }]
          }),
          startReceived = false,
          waitFinished = false;

        kairos.subscribe('frameStarted', function () {
          startReceived = true;
        });

        kairos.pause();

        expect(startReceived).toBe(false); // sanity check

        setTimeout(function () {
          waitFinished = true;
        }, 150);

        waitsFor(function () {
          return waitFinished;
        });

        runs(function () {
          expect(startReceived).toBe(true);
        });
      });

      it('should still fire frameEnded events while paused', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              end: (new Date()).getTime() + 100
            }]
          }),
          endReceived = false,
          waitFinished = false;

        kairos.subscribe('frameEnded', function () {
          endReceived = true;
        });

        kairos.pause();

        expect(endReceived).toBe(false); // sanity check

        setTimeout(function () {
          waitFinished = true;
        }, 150);

        waitsFor(function () {
          return waitFinished;
        });

        runs(function () {
          expect(endReceived).toBe(true);
        });
      });

      it('should resume firing frameTicked events after resume is called', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              interval: 100,
              sync: false
            }]
          }),
          tickReceived = false,
          waitFinished = false;

        kairos.subscribe('frameTicked', function () {
          tickReceived = true;
        });

        kairos.pause();

        setTimeout(function () {
          waitFinished = true;
        }, 200);

        waitsFor(function () {
          return waitFinished;
        });

        runs(function () {
          expect(tickReceived).toBe(false);

          kairos.resume();

          waitFinished = false; // reset

          setTimeout(function () {
            waitFinished = true;
          }, 200);
        });

        waitsFor(function () {
          return waitFinished;
        });

        runs(function () {
          expect(tickReceived).toBe(true);
        });
      });

      it('should not resume if we are not paused', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              interval: 100,
              sync: false
            }]
          }),
          ticksReceived = 0,
          waitFinished = false;

        kairos.subscribe('frameTicked', function () {
          ticksReceived += 1;
        });

        kairos.resume();

        setTimeout(function () {
          waitFinished = true;
        }, 150);

        waitsFor(function () {
          return waitFinished;
        });

        runs(function () {
          expect(ticksReceived).toBe(1);
        });
      });

      it('should not resume if we are not started', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'now': (new Date())
            },
            frames: [{
              begin: {
                starting: 'PT1M',
                after: 'now'
              },
              interval: 100,
              sync: false
            }]
          }),
          tickReceived = false,
          waitFinished = false;

        kairos.subscribe('frameTicked', function () {
          tickReceived = true;
        });

        kairos.pause();
        kairos.resume();

        setTimeout(function () {
          waitFinished = true;
        }, 150);

        waitsFor(function () {
          return waitFinished;
        });

        runs(function () {
          expect(tickReceived).toBe(false);
        });
      });

      it('should not resume if we are ended', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'now': (new Date())
            },
            frames: [{
              end: {
                starting: 'PT1M',
                before: 'now'
              },
              interval: 100,
              sync: false
            }]
          }),
          tickReceived = false,
          waitFinished = false;

        kairos.subscribe('frameTicked', function () {
          tickReceived = true;
        });

        kairos.pause();
        kairos.resume();

        setTimeout(function () {
          waitFinished = true;
        }, 150);

        waitsFor(function () {
          return waitFinished;
        });

        runs(function () {
          expect(tickReceived).toBe(false);
        });
      });

      it('should not start if are already started', function () {
        var
          kairos = new KairosScheduler({
            frames: [{}]
          }),
          startReceived = false;

        kairos.subscribe('frameStarted', function () {
          startReceived = true;
        });

        kairos.start();

        expect(startReceived).toBe(false);
      });
    });

    xdescribe('Add Frame', function () {
      it('should have an "addFrame" method', function () {
        var
          kairos = new KairosScheduler();

        expect((function () { kairos.addFrame({}) })).not.toThrow();
      });

      it('should add the frame to the (internal) list of frames', function () {
        var
          kairos = new KairosScheduler();

        expect(kairos._options.frames.length).toBe(0);
        expect(kairos._frames.length).toBe(0);

        kairos.addFrame({});

        expect(kairos._options.frames.length).toBe(1);
        expect(kairos._frames.length).toBe(1);
      });

      it('should normalize a frame added via addFrame', function () {
        var
          kairos = new KairosScheduler({
            times: {
              'epoch': 0
            }
          });

        kairos.addFrame({
          begin: {
            starting: '1s',
            after: 'epoch'
          },
          interval: '5s'
        });

        expect(kairos._options.frames[0]).toEqual({
          begin: 1000,
          end: Infinity,
          interval: 5000,
          sync: true
        });
      });

      it('should NOT add a named frame if a frame with the same name already exists', function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              name: 'foo'
            }]
          });

        expect(kairos._frames.length).toBe(1);

        kairos.addFrame({
          name: 'bar'
        });

        expect(kairos._frames.length).toBe(2);

        kairos.addFrame({
          name: 'foo'
        });

        expect(kairos._frames.length).toBe(2);
      });

      it('should start an added frame if start has already been called', function () {
        var
          kairos = new KairosScheduler(),
          startReceived = false;

        kairos.subscribe('foo/started', function () {
          startReceived = true;
        });

        kairos.addFrame({ name: 'foo' });

        expect(startReceived).toBe(true);
      });

      it('should NOT start an added frame if start has not been called', function () {
        var
          kairos = new KairosScheduler({ autoStart: false }),
          startReceived = false;

        kairos.subscribe('foo/started', function () {
          startReceived = true;
        });

        kairos.addFrame({ name: 'foo' });

        expect(startReceived).toBe(false);
      });
    });

    xit('should have a toJSON method on the KairosFrame, to prevent cycles', function () {
      var
        kairos = new KairosScheduler({
          frames: [{}]
        });

      expect(kairos._frames[0].toJSON).not.toThrow();
      expect(kairos._frames[0].toJSON()).toEqual(jasmine.any(Object));
    });
  });
});