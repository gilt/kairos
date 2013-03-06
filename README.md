
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

Kairos is a sorta kinda natural language task scheduler.

TODO: more descriptive description.

## Features

- TODO
- something
- another feature
- yep, we got more

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
          begin: "lunch",
          end: {
            interpolated: "50%",
            between: "lunch",
            and: "dinner"
          },
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


TODO

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
