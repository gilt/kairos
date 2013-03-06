describe("Kairos", function () {
  describe("Scheduler", function () {
    describe("Constructor", function () {
      it("should privately expose its options as '_options'", function () {
        var
          kairos = new KairosScheduler();

        expect(kairos._options).not.toBeUndefined();
      });

      it("should have a 'times' field consisting of named timestamps (in milliseconds)", function () {
        var
          kairos1 = new KairosScheduler(),
          kairos2 = new KairosScheduler({
            times: {
              "test": 0
            }
          });

        expect(kairos1._options.times).toEqual({});
        expect(kairos2._options.times).toEqual({ "test": 0 });
      });

      it("should normalize 'times' by converting Date objects to timestamps", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "test": (new Date(0))
            }
          });

        expect(kairos._options.times).toEqual({ "test": 0 });
      });

      it("should have a 'frames' field consisting of an array of frame objects", function () {
        var
          kairos1 = new KairosScheduler(),
          kairos2 = new KairosScheduler({
            frames: [{}]
          });

        expect(kairos1._options.frames).toEqual([]);
        expect(kairos2._options.frames.length).toBe(1);
      });

      it("should default the 'sync' property of each frame to true", function () {
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

      it("should default and/or convert the 'begin' property to a timestamp (milliseconds) with a default of 0", function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {}
            }, {
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(0);
        expect(kairos._options.frames[1].begin).toBe(0);
      });

      it("should lookup named 'relatedTo' times from the list of 'times'", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "test": new Date(0)
            },
            frames: [{
              begin: {},
              relatedTo: "test"
            }]
          });

        expect(kairos._options.frames[0].relatedTo).toBe(0);
      });

      it("should convert 'relatedTo' Date objects to milliseconds", function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {},
              relatedTo: new Date(0)
            }]
          });

        expect(kairos._options.frames[0].relatedTo).toBe(0);
      });

      it("should lookup 'begin.at' times from the list of 'times'", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "test": new Date(0)
            },
            frames: [{
              begin: {
                at: "test"
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(0);
      });

      it("should convert 'begin.at' Date objects to milliseconds", function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                at: new Date(0)
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(0);
      });

      it("should convert a 'starting' + 'after' begin time to milliseconds", function () {
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

      it("should convert a 'starting' + 'before' begin time to milliseconds", function () {
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

      it("should convert a 'starting' time that is a LDML style duration string", function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                starting: "1s",
                after: 0
              }
            }, {
              begin: {
                starting: "PT1M",
                after: 0
              }
            }, {
              begin: {
                starting: "1h",
                after: 0
              }
            }, {
              begin: {
                starting: "1d",
                after: 0
              }
            }, {
              begin: {
                starting: "P1M",
                after: 0
              }
            }, {
              begin: {
                starting: "1y",
                after: 0
              }
            }, {
              begin: {
                starting: "PT1H15M30S",
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

      it("should lookup 'before' or 'after' times from the list of 'times'", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "test": (new Date(0))
            },
            frames: [{
              begin: {
                starting: 1000,
                before: "test"
              }
            }, {
              begin: {
                starting: 1000,
                after: "test"
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(-1000);
        expect(kairos._options.frames[1].begin).toBe(1000);
      });

      it("should convert 'before' or 'after' Date objects to a milliseconds", function () {
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

      it("should convert an 'interpolated' + 'between' + 'and' begin time to milliseconds", function () {
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

      it("should convert an 'interpolated' in string form (50%) to decimal form (0.5)", function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                interpolated: "50%",
                between: 0,
                and: 1000
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(500);
      });

      it("should lookup 'between' or 'after' times from the list of 'times'", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "then": 0,
              "later": 1000
            },
            frames: [{
              begin: {
                interpolated: "50%",
                between: "then",
                and: "later"
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(500);
      });

      it("should convert 'between' or 'after' Date Objects to milliseconds", function () {
        var
          kairos = new KairosScheduler({
            frames: [{
              begin: {
                interpolated: "50%",
                between: (new Date(0)),
                and: (new Date(1000))
              }
            }]
          });

        expect(kairos._options.frames[0].begin).toBe(500);
      });

      it("should default and/or convert the 'end' property to a timestamp (milliseconds) with a default of the 'begin' value of the next frame or infinity", function () {
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

      it("should convert LDML style intervals into milliseconds", function () {
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
              interval: "2s"
            }]
          });

        expect(kairos._options.frames[0].interval).toBe(1000);
        expect(kairos._options.frames[1].interval).toBe(2000);
      });
    });

    describe("Notifications", function () {
      it("should have a pubsub system", function () {
        var
          kairos = new KairosScheduler({}),
          received = false;

        kairos.subscribe("testing", function () {
          received = true;
        });

        kairos.publish("testing");

        expect(received).toBe(true);
      });

      it("should publish once per tick", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "test": (new Date()).getTime() + 60000
            },
            frames: [{
              begin: {
                at: 0
              },
              relatedTo: "test",
              interval: 1000
            }]
          }),
          received = false,
          durationReceived = null;

        kairos.subscribe("frameTicked", function (frame, duration) {
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

      it("should send a tick duration of 0 if no relatedTo field is set", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "test": (new Date()).getTime() + 60000
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

        kairos.subscribe("frameTicked", function (frame, duration) {
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

      it("should publish when a frame changes", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "test": (new Date()).getTime() + 60000
            },
            frames: [{
              begin: {
                at: 0
              }
            }, {
              begin: {
                starting: "59s",
                before: "test"
              },
              data: {}
            }]
          }),
          received = false,
          dataReceived = null;

        kairos.subscribe("frameStarted", function (data, duration) {
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

      it("should publish a frame specific event when a frame changes", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "test": (new Date()).getTime() + 60000
            },
            frames: [{
              begin: {
                at: 0
              }
            }, {
              begin: {
                starting: "59s",
                before: "test"
              },
              frameName: "test",
              data: {}
            }]
          }),
          received = false,
          dataReceived = null;

        kairos.subscribe("frameStarted/test", function (data, duration) {
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

    describe("Scheduling", function () {
      it("should be able to run an arbitrary number of frames", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "test": (new Date()).getTime() + 60000
            },
            frames: [{
              begin: {
                at: 0
              }
            }, {
              begin: {
                starting: "59s",
                before: "test"
              }
            }, {
              begin: {
                starting: "58s",
                before: "test"
              }
            }]
          }),
          frameCount = 1;

        kairos.subscribe("frameStarted", function () {
          frameCount += 1;
        });

        waitsFor(function () {
          return 3 === frameCount;
        });

        runs(function () {
          expect(frameCount).toEqual(3);
        });
      });

      it("should be able to use an arbitrary number of times", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "later": (new Date()).getTime() + 60000,
              "now": (new Date())
            },
            frames: [{
              begin: {
                at: "now"
              }
            }, {
              begin: {
                starting: "1s",
                after: "now"
              }
            }, {
              begin: {
                starting: "58s",
                before: "later"
              }
            }]
          }),
          frameCount = 1;

        kairos.subscribe("frameStarted", function () {
          frameCount += 1;
        });

        waitsFor(function () {
          return 3 === frameCount;
        });

        runs(function () {
          expect(frameCount).toEqual(3);
        });
      });

      it("should switch to the next frame even if doing so would be mid-tick", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "now": (new Date())
            },
            frames: [{
              begin: {
                at: "now"
              },
              relatedTo: "now",
              interval: 2000,
              sync: false // don't sync, to make this test more predictable
            }, {
              begin: {
                starting: "3s",
                after: "now"
              }
            }]
          }),
          ticksReceived = 0,
          frameChanges = 0;

        kairos.subscribe("frameTicked", function (data, duration) {
          if (0 !== duration) { // ignore ticks from the non-interval frames
            ticksReceived += 1;
          }
        });

        kairos.subscribe("frameStarted", function () {
          frameChanges += 1;
        });

        waitsFor(function () {
          return 1 === frameChanges;
        });

        runs(function () {
          expect(ticksReceived).toBe(1);
        });
      });

      it("should stop ticking when changing frames", function () {
        var
          kairos = new KairosScheduler({
            times: {
              "now": (new Date())
            },
            frames: [{
              begin: {
                at: "now"
              },
              relatedTo: "now",
              interval: 2000,
              sync: false // don't sync, to make this test more predictable
            }, {
              begin: {
                starting: "3s",
                after: "now"
              }
            }, {
              begin: {
                starting: "5s",
                after: "now"
              }
            }]
          }),
          ticksReceived = 0,
          frameChanges = 0;

        kairos.subscribe("frameTicked", function (data, duration) {
          if (0 !== duration) { // ignore ticks from the non-interval frames
            ticksReceived += 1;
          }
        });

        kairos.subscribe("frameStarted", function () {
          frameChanges += 1;
        });

        waitsFor(function () {
          return 2 === frameChanges;
        });

        runs(function () {
          expect(ticksReceived).toBe(1);
        });
      });
    });
  });
});