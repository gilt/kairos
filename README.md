# Kairos [![Build Status](https://api.travis-ci.org/gilt/kairos.png?branch=master)](https://travis-ci.org/gilt/kairos)[![Coverage Status](https://coveralls.io/repos/gilt/kairos/badge.png)](https://coveralls.io/r/gilt/kairos)

Kairos is a time frame scheduler.

A KairosTimeFrame instance is bounded by both beginning and ending times,
and can optionally tick at a given interval. Notifications are published
when frames begin, end, and tick.

A KairosCollection object can roll up several frames, allowing them to be
stopped, started, and modified simultaneously.

Kairos can be used for many purposes: a clock or countdown, a calendar, a job
runner, or even part of a game engine. One of our use cases at Gilt is the
messaging a user sees around a sale time. We want to increase urgency as a sale
nears its start time, notify the user how much time remains once the sale
begins, and indicate the sale has ended after it's over. A KairosCollection with
multiple KairosTimeFrame instances helps us to do this.

## Features

- Concurrent frame execution
- Notifications for frame start, end, and tick events
- Natural language scheduling syntax
- Scheduling relative to named times
- Calculates durations relative to named times
- Mute and unmute tick events
- Exhaustively tested

## Usage

A frame has a begin time and an end time. These are the bounds of the frame.
Starting and stopping the frame can be done at any time.

### A Note About Begin, End, Start, and Stop

A time frame has a begin time and an end time, occupying a unique period in
history. Starting and stopping the frame can be done anytime, though each frame
can only be stopped and started once.

If you start the frame before its beginning time and let it run, it will
publish events when it begins and ends. If you start the frame sometime between
its beginning and ending bounds and let it run, it will publish a begin event
immediately and an end event when it ends. If you start the frame after its
beginning bound and stop it before its ending bound, it will fire a begin event
immediately and no end event. Finally, if you start the frame after it is
"over", it will not fire any events.

### Simple Trivial Example

Here's a simple example, counting down the time until lunch:

```javascript
var lunchFrame = new KairosTimeFrame('lunchFrame', { // the name of this frame is 'lunchFrame'
    beginsAt: 'now', // 'now' is a built-in time corresponding to the time of the instance construction
    endsAt: 'lunch', // 'lunch' is a named time that is not yet available
    ticksEvery: '1 minute', // ticks will be published at 1-minute intervals
  }).extendNamedTimes({
    lunch: '2012-01-01 12:00:00' // now we provide the named time 'lunch' to the frame
  }).start(); // and finally start the frame
```

It will publish ticks every minute from the time the page loads ('now') until
the named time 'lunch' occurs. The frame instance exposes a method
getDurationRelativeTo() which provides access to the milliseconds remaining until
lunch.

### Slightly More Complex Example Using a Collection

Let's make a more complex example, with three unique time frames prior to
lunch. We'll wait to provide the named time 'lunch' until we make the
collection, so each frame can share it. We'll also wait to start the frames
and use the collection to start all of them at once.

```javascript
// This frame begins when the page loads, and ends two minutes before a
// named time 'lunch', which must either be provided to the frame or to
// the collection that holds the frame. The 'now' named time is provided
// by default to all frames, along with 'never' and 'epoch'.
var beforeLunchFrame = new KairosTimeFrame('beforeLunch', {
    beginsAt: 'now',
    endsAt: '2 minutes before lunch',
    ticksEvery:'1 minute'
  }).extendNamedTimes({
    lunch: '2012-01-01 12:00:00'
  });

// This frame begins two minutes before the named time 'lunch', and also
// will publish tick events, every second, while it is running. The tick
// events will make an event object available.
var almostLunchFrame = new KairosTimeFrame('almostLunch', {
    beginsAt: '2 minutes before lunch'
    endsAt: 'lunch'
    ticksEvery: '1 second'
  });

// This frame begins at the named time 'lunch', and will be active for an
// infinite time after that.
var lunchtimeFrame = new KairosTimeFrame('lunchTime', {
    beginsAt: 'lunch'
  });

// This is a collection to hold all three frames. It allows named times to
// be provided to all frames at once, and allows subscribers to be attached
// in one place. The start method will propagate down to all three frames.
var frameCollection = new KairosCollection([beforeLunchFrame, almostLunchFrame, lunchtimeFrame])
  .extendNamedTimes({ 'lunch' : '2012-01-01 12:00:00' })
  .subscribe('beforeLunch/ticked', function (event) {
    console.log('Time till lunch: ' + (event.getDurationRelativeTo('lunch') * 1000 * 60) + ' minutes');
  })
  .subscribe('almostLunch/ticked', function (event) {
    console.log('Time till lunch: ' + (event.getDurationRelativeTo('lunch') * 1000) + ' seconds');
  })
  .subscribe('lunchTime/began', function () {
    alert('You should be at lunch now!');
  })
  .start();

// This will mute the tick events published by the two frames that have a
// tick interval specified, by calling mute() on all of the frames in the
// collection.
$('.stop-reminding-me-already').toggle(
  function () {
    frameCollection.mute();
  },
  function () {
    frameCollection.unmute();
  }
);
```

### Real-Life Example

At Gilt, we wrap Kairos with our own logic to prevent overlapping time frames
and provide formatting. So, the following example shows what we use Kairos for,
but not how we actually implement it in our own codebase.

```javascript
// Creates several frames, with explicit non-overlapping begin and end
// times. The ones that tick will be used for countdown clocks.
var frames = [
  new KairosTimeFrame('beforeStart', {
    endsAt: 'saleStart',
    ticksEvery: '1 minute'
  }),
  new KairosTimeFrame('newSale', {
    beginsAt: 'saleStart',
    endsAt: '12 hours after saleStart'
  }),
  new KairosTimeFrame('saleRunning', {
    beginsAt: '12 hours after saleStart',
    endsAt: '24 hours before saleEnd',
    ticksEvery: '1 hour'
  }),
  new KairosTimeFrame('lastDay', {
    beginsAt: '24 hours before saleEnd',
    endsAt: '1 hour before saleEnd',
    ticksEvery: '1 hour'
  }),
  new KairosTimeFrame('endingSoon', {
    beginsAt: '1 hour before saleEnd',
    endsAt: 'saleEnd',
    ticksEvery: '1 minute'
  }),
  new KairosTimeFrame('ended', {
    beginsAt: 'saleEnd'
  })
];

// The frame constructor code above refers to named times that are not
// specified in the frames themselves. This way, the collection can be
// instantiated and given exact start and end times for the currently
// displayed sales. The subscriber is contrived, since our internal code
// actually takes the duration provided by the current frame and passes it
// to a formatter to display the countdown timers.
var frameCollection = new KairosCollection(frames)
  .extendNamedTimes({
    saleStart: '2012-01-01 12:00:00',
    saleEnd: '2012-01-02 18:00:00'
  })
  .subscribe('timeFrameBegan', function (event) {
    // Display the right message to the customer. Note that this would
    // actually use a data object within each frame that contains a format
    // string, and pass it through a formatter to show countdown clocks.
  });
```

## Feature Overview

### Basic Construction

Creates a new time frame.

```javascript
new KairosTimeFrame('foo')
  .start();
```

By default it will begin
at the epoch in 1970 and run forever, with no ticks. So it won't really do you
much good at all.

```javascript
new KairosTimeFrame('foo', {
    beginsAt: '2012-01-01 12:00:00',
    endsAt: '2012-01-01 18:00:00'
  }).start();
```

Now you have a time frame that will begin at noon and end at 6pm on the first
of January, 2012. It will not tick, but it will publish events when it begins
and when it ends. If start() is called between the begin and end times, a begin
event will be published immediately. If start() is called after the end time,
nothing will happen.

Times can be specified in a number of ways:

  - Unix timestamp
  - JavaScript Date object
  - String to be passed to the Date() constructor
  - A named time
  - A relative time using natural language

The last two options are the most interesting, so we'll look at a couple of
examples. First, let's use a named time.

### Named Times

Using named times gives flexibility to have the configuration for the frame
construction in one place, and to decorate them on page load with a given set
of specific times. The following code sets up a frame that uses two named times
and then starts them in a separate statement, providing the frame with the two
named times.

```javascript
var tf = new KairosTimeFrame('foo', {
  beginsAt: 'bar',
  endsAt: 'baz'
});

tf.extendNamedTimes({
  bar: '2012-01-01 12:00:00',
  baz: '2012-01-01 18:00:00'
}).start();
```

### Natural Language

Using natural language syntax allows for much more readable code. The above
example could also be written:

```javascript
var tf = new KairosTimeFrame('foo', {
  beginsAt: 'bar',
  endsAt: '6 hours after bar'
});

tf.extendNamedTimes({
  bar: '2012-01-01 12:00:00'
}).start();
```

The begin time behaves like another named time, so you can also do this:

```javascript
var tf = new KairosTimeFrame('foo', {
  beginsAt: 'bar',
  endsAt: '6 hours after beginsAt'
});

tf.extendNamedTimes({
  bar: '2012-01-01 12:00:00'
}).start();
```

### ISO-8601 Duration Syntax

[ISO-8601 duration syntax](http://en.wikipedia.org/wiki/ISO_8601#Durations)
can also be used, combined with natural language.

```javascript
var tf = new KairosTimeFrame('foo', {
  beginsAt: 'bar',
  endsAt: 'PT 6H after bar' // or 'pt 6h after bar' or '6h after bar'
});

tf.extendNamedTimes({
  bar: '2012-01-01 12:00:00'
}).start();
```

Of course, the named time is just a stand-in for an explicit time, so that time
can be used directly instead.

```javascript
var tf = new KairosTimeFrame('foo', {
  beginsAt: 1325437200000,
  endsAt: 'PT 6H after 1325437200000'
}).start();
```

### Interpolation

Interpolation can be used instead of using exact times.

```javascript
var tf = new KairosTimeFrame('foo', {
  beginsAt: 'bar',
  endsAt: '50% between bar and baz' // or '0.5 between bar and baz'
}).extendNamedTimes({
  bar: '2012-01-01 12:00:00',
  baz: '2012-01-02 00:00:00'
}).start();
```

Interpolation can be a percentage string, or a floating point number ('0.4
between bar and baz'). This example will have an end time of 6pm.

### Ticking

Frames can send tick events at a specified interval. This is useful for a clock
or a countdown application. The tick event contains a getDurationRelativeTo()
method that will retrieve the milliseconds relative to a named time.

```javascript
var tf = new KairosTimeFrame('foo', {
  beginsAt: '2012-01-01 12:00:00',
  endsAt: '2012-01-01 18:00:00',
  ticksEvery: '1 minute'
}).start();
```

Then you can then subscribe to the events:

```javascript
tf.subscribe('ticked', function (event) {
  console.log(event.getDurationRelativeTo('endsAt') * 60 * 60 + ' minutes left!');
});
```

The ticksEvery field can be in milliseconds, ISO-8601, or natural language
syntax.

### Muting

The frame can be muted or unmuted, which toggles whether tick events are
published. If muted, the start and end events for the timeframe will still be
published, but ticks will not.

```javascript
tf = new KairosTimeFrame('foo', {
  beginsAt: '2012-01-01 12:00:00',
  endsAt: '2012-01-01 18:00:00',
  ticksEvery: '1 second'
}).start();
```

If start() occurs before or during the frame, a begin event will be published.
Tick events will begin firing immediately also, once per second.

```javascript
tf.mute();
```

Tick events will not be published anymore. If the endsAt time is reached, the
ended event will be published, and the frame will be history. If the endsAt
time has not been reached,

```javascript
tf.unmute();
```

will resume the publishing of tick events until the endsAt time is reached.

### Syncing

By default, time frames will be as accurate as possible. If a frame that ticks
every half hour begins at 3:15, the next tick will occur at 3:45, within the
general margin of error that setTimeout requires us to accept.

```javascript
var tf = new KairosTimeFrame({
  beginsAt: '2012-01-01 15:15:00',
  endsAt: '2012-01-01 14:15:00',
  ticksEvery: '30 minutes'
}).start();
```

This will publish tick events at 3:15pm, 3:45pm, and 4:15pm.

You might, instead, want to sync to the nearest full-value unit on the user's
machine.

```javascript
var tf = new KairosTimeFrame({
  beginsAt: '2012-01-01 15:15:00',
  endsAt: '2012-01-01 14:15:00',
  ticksEvery: '30 minutes',
  syncsTo: '30 minutes'
}).start();
```

This will publish tick events at 3:30pm, 4:00pm, and 4:30pm.

Let's look at this with milliseconds instead of half hours. Without Kairos,
setTimeout gets further and further off over time, so a one-second timer
might tick at

    0, 1015, 2035, 3205, 4310, 5425, 6445

Kairos by default syncs times to the correct interval, so that:

```javascript
var tf = new KairosTimeFrame({
  ticksEvery: '1 second'
}).start();
```

will tick at, perhaps,

    0, 1005, 2010, 3006, 4011, 5001, 6009

We always compensate for the normal setTimeout drift, and will be within a few
milliseconds of the interval specified. If we started the timer 500ms after
the epoch (and had a time machine):

```javascript
var tf = new KairosTimeFrame({
  beginsAt: 500,
  ticksEvery: '1 second'
}).start();
```

the timer might tick at

    563, 1552, 2501, 3509, 4511, 5514, 6502

Note that the interval of 1 second is maintained, relative to the start time
of 500ms after the epoch.

However, we might want to sync to the user's clock, and tick exactly on the
second. In this case, syncing can be turned on using the syncsTo option:

```javascript
var tf = new KairosFrame({
  beginsAt: 500,
  ticksEvery: '1 second',
  syncsTo: '1 second'
}).start();
```

Even though the start time is at 500ms after the epoch, the syncsTo option will
cause the ticks to occur perhaps at:

    1002, 2011, 3009, 4013, 5000, 6002

To summarize, ticks will always occur at the correct interval, minus normal
unavoidable setTimeout variation; and the syncsTo option gives you the ability
to coordinate the first tick, and thus the subsequent ticks, with the user's
clock.

### Data

Frames can include a data object which will be passed to all of the published
events.

```javascript
var tf = new KairosTimeFrame('foo', {
  data: {
    bar: 1,
    baz: 2
  }
});

tf.subscribe('ended', function (event) {
  console.log(event.userData);
});
```

This is useful for passing along format strings or other relevant information.

## KairosCollection

The KairosCollection constructor takes an array of time frames, and allows you
to interact with all of them simultaneously. The API is detailed in the wiki,
but here are the main methods available. Most of the methods simply proxy
through to the same methods in the collection's time frame instances.

```javascript
var kc = new KairosCollection([KairosTimeFrame]);

kc.start(); // starts all the frames in the collection
kc.stop(); // stops all the frames in the collection
kc.mute(); // stops publishing tick events for all the frames
kc.unmute(); // restarts publishing tick events for all the frames
kc.subscribe(String, Function); // subscribes to a collection event
kc.unsubscribe([String, Function]); // unsubscribes from a collection event using a handle
kc.pushTimeFrame(KairosTimeFrame); // pushes a time frame into the collection
```

### Events

Subscribing and unsubscribing to events is how you will interact with your time
frame. Several events are fired by each frame.

- "began" - published at the beginsAt time, or as soon as the frame is started
if the beginsAt time already occurred
- "ended" - published at the endsAt time, as long as the frame is running
- "ticked" - published at the interval specified in the frame's options
- "muted" - published when a frame's tick events are muted with mute()
- "unmuted" - published when a frame's tick events are resumed with unmute()

In addition, a KairosCollection fires events whenever its frames do.

- "timeFrameBegan" - published when any time frame in the collection begins
- "timeFrameEnded" - published when any time frame in the collection ends
- "timeFrameTicked" - published when any time frame in the collection ticks
- "timeFrameMuted" - published when any time frame in the collection is muted
- "timeFrameUnmuted" - published when any time frame in the collection is
unmuted

In addition, frames that have names have individual pubsub channels:

- "{frameName}/began" - published when the named frame begins, or when it is started if
the began time is in the past when start() is called
- "{frameName}/ended" - published when the named frame ends
- "{frameName}/ticked" - published when the named frame ticks
- "{frameName}/muted" - published when the named frame's ticks are muted
- "{frameName}/unmuted" - published when the named frame's ticks are unmuted

## More

See the wiki for the full API documentation.

## Contributing

We use grunt for running tests and such. If you want to contribute, you
should install the grunt cli and install dependencies.

    sudo npm install -g grunt-cli
    npm install

Once you have done so, you can run any of our grunt tasks.

    grunt
    grunt test
    grunt build
    grunt release:(major or minor or patch)

## Appendix

[Kairos](http://en.wikipedia.org/wiki/Kairos) (καιρός) /kī¦räs/ is an ancient
Greek word meaning the right, opportune, or supreme moment. The ancient Greeks
had two words for time, "chronos" and "kairos". While the former refers to
chronological or sequential time, the latter signifies a time between, a moment
of indeterminate time in which something special happens. What the special
something is depends on who is using the word. While chronos is quantitative,
kairos has a qualitative nature. In rhetoric kairos is "a passing instant when
an opening appears which must be driven through with force if success is to
be achieved."

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
