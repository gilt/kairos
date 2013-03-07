# Kairos (TODO: BUILD STATUS ICON)

[Kairos](http://en.wikipedia.org/wiki/Kairos) (καιρός) /kī¦räs/ is an ancient
Greek word meaning the right or opportune moment (the supreme moment). The
ancient Greeks had two words for time, chronos and kairos. While the former
refers to chronological or sequential time, the latter signifies a time
between, a moment of indeterminate time in which something special happens.
What the special something is depends on who is using the word. While chronos
is quantitative, kairos has a qualitative nature. In rhetoric kairos is "a
passing instant when an opening appears which must be driven through with force
if success is to be achieved."

Kairos is a (time) frame scheduler. Each frame has both a beginning and an
ending, and can tick periodically. Notifications will be published when frames start, end, and tick. Kairos can be used for many purposes: a clock or
countdown, a calendar, job runner, or even part of a game engine.

## Features

- Concurrent frame execution
- Notifications for frame start, end, and tick events
- Natural language scheduling syntax
- Scheduling relative to named times
- Calculates durations relative to named times
- Pause/Resume ticking
- Exhaustively tested

## Usage

    // Moderately Complex Example:
    var myScheduler = new KairosScheduler({
      times: {
        "epoch": 0,
        "now": (new Date()),
        "lunchTime": 1362589200000,
        "dinnerTime": 1362616200000
      },
      frames: [
      
        // This frame will start in 1970 (we tested using the office time
        // machine) and will end when the next frame starts.
        {
          begin: 0,
          name: "history"
        },
        
        // The first "real" frame, which starts… …NOW!  This frame will end in 1
        // hour, and we will get a tick every minute, on the minute.
        {
          begin: {
            at: "now"
          },
          end: {
            starting: "1H",
            after: "now"
          },
          name: "nextHour",
          interval: "1M"          
        },
        
        // This one will start an hour before lunch, will tick every 15 seconds
        // until the start of the next frame (lunch time) and the tick will
        // receive a duration in milliseconds relative to the "lunch" time.
        {
          begin: {
            starting: "1H",
            before: "lunch"
          },
          name: "lateMorning",
          interval: 15000,
          relatedTo: "lunch",
          data: {
            menu: {...}
          }
        },
        
        // The "earlyAfternoon" timeframe starts at lunch time and ends halfway
        // between lunch and dinner.  Ticks will be fired every 15 minutes.
        {
          begin: "at lunch",
          end: "50% between lunch and dinner"
          name: "earlyAfternoon",
          interval: "15M",
          relatedTo: "lunch",
          data: {
            dessertMenu: {...}
          }
        }
      ]
    });
    
    myScheduler.subscribe("frameStarted/lateMorning", renderMenu);
    myScheduler.subscribe("frameStarted/earlyAfternoon", renderMenu);
    myScheduler.subscribe("frameEnded/earlyAfternoon", destroyMenu);
    myScheduler.subscribe("frameTicked/lateMorning", renderLunchCountdown);
    myScheduler.subscribe("frameTicked/earlyAfternoon", renderSiestaClock);
    
    $(".pauseButton").toggle(
      _.bind(KairosScheduler.prototype.pause, myScheduler), 
      _.bind(KairosScheduler.prototype.resume, myScheduler)
    );

## API

### new KairosScheduler()

Creates a new scheduler using the times and frames passed in.

    new KairosScheduler({
      times: {},
      frames: []
    });
    
- times are key/value pairs of names, and timestamps or date objects.
- frames is an array of frame configurations.
  - Each frame has a begin time, and an end time. Both are optional.
    - If a begin time is omitted, it is assumed to be 1970 (epoch)
    - If an end time is omitted, it is assumed to be the begin time of the next
      frame (in the original frame configuration array) or Infinity
    - Possible values for a begin/end:
      - Unix timestamp
      - Date object
      - Hash, in one of these 4 forms

            {
              starting: {Number|String},
              before: {Number|Date|String}
            } 

        or
            
            {
              starting: {Number|String},
              after: {Number|Date|String}
            }
            
        or
          
            {
              interpolated: {Float|String},
              between: {Number|Date|String},
              and: {Number|Date|String}
            }
            
        or
            
            {
              at: {Number|Date|String}
            }
        
        "starting" is a duration, in either
          - milliseconds, e.g. 300000
          - LDML, e.g. "PT5M"
          - Natural Language, e.g. "5 Minutes"
          
        "interpolated" is a percentage, as either
          - a floating point, e.g. 0.5
          - or a percent string, e.g. "50%"
          
        the remaining fields (before, after, between, and, & at) are times:
          - a unix timestamp
          - a date object
          - or a named time
      - String, in a form which is basically the hash form concatenated:
        - "starting 5 minutes before foo"
        - "1 hour after foo"
        - "50% from foo to bar"
        - "foo"
  - Frames have an optional "relatedTo" field, from which a duration is derived.
    - This field can be a number, date, or named time
  - Frames have an optional name field, which is used for frame specific notifications (below)
  - Frames have an optional data field, which is passed to all notifications.
  - Frames have an optional interval field, which if provided, will cause tick
    notifications periodically while the frame is active.
  - Frames have a sync field, which is defaulted to true. If syncing is enabled,
    ticks will be synchronized to the users clock, ex:
    
    If interval is 1000, and we start at 0 (hop in that timemachine), and syncing
    is turned off, events might fire at the following timestamps:

        0, 1015, 2035, 3205, 4310, 5425, 6445
    As you can see, we quickly wind up drifting off target.
    
    If, however, we enable syncing, and try again
    (obv, this assumes a many-worlds theory of timetravel)
    
        0, 1005, 2010, 3006, 4011, 5001, 6009
    We've compensated for drift. Yay! It get's better! Let's say we didn't start at 0.
    Maybe we actually started at 563!
    
        563, 1004, 2011, 3015, 4012, 5010, 6007
    As you can plainly see, from the scientific study (rofl) we immediately corrected
    for an initial error.
    

### KairosScheduler::publish()

Publishes a notification. Intended for internal use.

    myKairosScheduler.publish("foo", [fooData1, fooData2]);
    
### KairosScheduler::subscribe()

Subscribes to a published notification.

    myKairosScheduler.subscribe("foo", function (fooData1, fooData2) {
      …
    });
    
- Six types of notification are sent by KairosScheduler:
  - Three "global" notifications:
    - frameStarted
    - frameEnded
    - frameTicked
  - And three "frame specific" notifications:
    - frameStarted/{frameName}
    - frameEnded/{frameName}
    - frameTicked/{frameName}
- All six types of notification get the same 2 arguments passed in:
  - duration, since/until the 'relatedTo' time
  - data, from the original frame configuration
    
### KairosScheduler::start()

Starts the scheduler. By default, the scheduler will autostart, however, if
autoStart: false is passed to the constructor, manual starting will be required.

    myKairosScheduler.start();
    
### KairosScheduler::pause()

Pauses tick notifications. Start/End notifications are not affected.

    myKairosScheduler.pause();
    
### KairosScheduler::resume()

Resumed paused tick notifications.

    myKairosScheduler.resume();

## Contributing

We use grunt for running tests and such, so, if you want to contribute, you
should to install grunt's cli `sudo npm install -g grunt-cli`. Once you have
done so, you can run any of our grunt tasks: `grunt watch`, `grunt test`,
`grunt build`, `grunt release:(major or minor or patch)`

## License

Copyright 2013 Gilt Groupe, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
