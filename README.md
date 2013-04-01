# Kairos (TODO: BUILD STATUS ICON)

Kairos is a time frame scheduler. A KairosTimeFrame instance has both beginning
and ending times, and can optionally tick at a given interval. Notifications
will be published when frames start, end, and tick.

A KairosContainer object can roll up several frames, allowing them to be
stopped, started, and modified simulatenously.

Kairos can be used for many purposes: a clock or countdown, a calendar, a job
runner, or even part of a game engine. One of our use cases at Gilt is the
messaging a user sees around a sale time. We want to increase urgency as a sale
nears its start time, notify the user how much time remains once the sale
begins, and indicate the sale has ended after it's over. A KairosContainer with
multiple KairosTimeFrame instances helps us to do this.

## Features

- Concurrent frame execution
- Notifications for frame start, end, and tick events
- Natural language scheduling syntax
- Scheduling relative to named times
- Calculates durations relative to named times
- Mute and unmute ticks
- Exhaustively tested

## Usage

A frame has a begin time and an end time. These are the bounds of the frame.
Starting and stopping the frame can be done at any time.

### A Note About Begin, End, Start, and Stop

A time frame has a begin time and an end time, occupying a unique period in
history. Starting and stopping the frame can be done anytime.

If you start the frame before its beginning and let it run, it will publish
events when it begins and ends. If you start the frame between its beginning
and ending bounds and let it run, it will publish a begin event immediately
and an end event when it ends. If you start the frame after its beginning
bound and stop it before its ending bound, it will fire a begin event
immediately and no end event. If you start the frame after it is "over", it
will not fire any events.

### Simple Trivial Example

Here's a simple example, using the chaining API and counting down the time till
lunch:

    // This frame begins when the page loads, and ends two minutes before a
    // named time 'lunch', which must either be provided to the frame or to
    // the container that holds the frame. The 'now' named time is provided
    // by default to all frames, along with 'never' and 'epoch'.
    var beforeLunchFrame = new KairosTimeFrame('beforeLunch')
      .setBeginsAt('now')
      .setEndsAt('2 minutes before lunch')
      .setTicksEvery('1 minute')
      .setRelativeTo('lunch');

    // This frame begins two minutes before the named time 'lunch', and also
    // will publish tick events, every second, while it is running. The tick
    // events will make the frame available, and its getRelativeDuration()
    // method will provide the time countdown relative to the 'lunch' event.
    var almostLunchFrame = new KairosTimeFrame('almostLunch')
      .setBeginsAt('2 minutes before lunch')
      .setEndsAt('lunch')
      .setTicksEvery('1 second')
      .setRelativeTo('lunch');

    // This frame begins at the named time 'lunch', and will be active for an
    // infinite time after that.
    var lunchtimeFrame = new KairosTimeFrame('lunchtime')
      .setBeginsAt('lunch');

    // This is a container to hold all three frames. It allows named times to
    // be provided to all frames at once, and allows subscribers to be attached
    // in one place. The start method will propagate down to all three frames.
    var frameContainer = new KairosContainer([beforeLunchFrame, almostLunchFrame, lunchtimeFrame])
      .addNamedTimes({ 'lunch' : '2012-01-01' })
      .subscribe('beforeLunch/ticked', function (frame) {
        console.log('Time till lunch: ' + (frame.getRelativeDuration() * 1000 * 60) + ' minutes');
      })
      .subscribe('almostLunch/ticked', function (frame) {
        console.log('Time till lunch: ' + (frame.getRelativeDuration() * 1000) + ' seconds');
      })
      .subscribe('lunchtime/began', function () {
        alert('You should be at lunch now!');
      })
      .start();

    $('.stop-reminding-me-already').toggle(
      function () {
        frameContainer.mute();
      },
      function () {
        frameContainer.unmute();
      }
    );

### Real-Life Use Case Example

At Gilt, we wrap Kairos with our own logic to prevent overlapping time frames
and provide formatting. This example shows what we use Kairos for, but not how
we implement it in our own codebase.

    // Creates several frames, with explicit non-overlapping begin and end
    // times. The ones that tick will be used for countdown clocks.
    var frames = [
      new KairosTimeFrame('beforeStart')
        .setEndsAt('saleStart')
        .setTicksEvery('1 minute')
        .setRelativeTo('saleStart'),
      new KairosTimeFrame('newSale')
        .setBeginsAt('saleStart')
        .setEndsAt('12 hours after saleStart'),
      new KairosTimeFrame('saleRunning')
        .setBeginsAt('12 hours after saleStart'),
        .setEndsAt('24 hours before saleEnd')
        .setTicksEvery('1 hour')
        .relativeTo('saleEnd'),
      new KairosTimeFrame('lastDay')
        .setBeginsAt('24 hours before saleEnd')
        .setEndsAt('1 hour before saleEnd')
        .setTicksEvery('1 hour')
        .relativeTo('saleEnd'),
      new KairosTimeFrame('endingSoon')
        .setBeginsAt('1 hour before saleEnd')
        .setEndsAt('saleEnd')
        .setTicksEvery('1 minute')
        .relativeTo('saleEnd'),
      new KairosTimeFrame('ended')
        .setBeginsAt('saleEnd')
    ];

    // The frame constructor code above refers to named times that are not
    // specified in the frames themselves. This way, the container can be
    // instantiated and given exact start and end times for the currently
    // displayed sales. The subscriber is contrived, since our internal code
    // actually takes the duration provided by the current frame and passes it
    // to a formatter to display the countdown timers.
    var frameContainer = new KairosContainer(frames)
      .addNamedTimes({
        saleStart: '2012-01-01 12:00:00',
        saleEnd: '2012-01-02 18:00:00'
      })
      .subscribe('timeFrameBegan', function (frame) {
        // Display the right message to the customer. Note that this would
        // actually use a data object within each frame that contains a format
        // string.
      });

## Feature Overview

### Basic Construction

Creates a new time frame.

    new KairosTimeFrame('foo')
      .start();

This frame is now chainable with any of the setters. By default it will begin
at the epoch in 1970 and run forever, with no ticks. So it won't really do you
much good at all.

    new KairosTimeFrame('foo')
      .setBeginsAt('2012-01-01 12:00:00')
      .setEndsAt('2012-01-01 18:00:00')
      .start();

Now you have a time frame that will begin at noon and end at 6pm on the first
of January, 2012. It will not tick, but it will publish events when it begins
and when it ends. If start() is called between the begin and end times, a begin
event will be published immediately. If start() is called after the end time,
nothing will happen.

Hash notation can also be used, like this:

    new KairosTimeFrame('foo', {
      beginsAt: '2012-01-01 12:00:00',
      endsAt: '2012-01-01 18:00:00'
    }).start();

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

    var tf = new KairosTimeFrame('foo', {
      beginsAt: 'bar',
      endsAt: 'baz'
    });

    tf.extendNamedTimes({
      bar: '2012-01-01 12:00:00',
      baz: '2012-01-01 18:00:00'
    }).start();

### Natural Language

Using natural language syntax allows for much more readable code. The above
example could also be written:

    var tf = new KairosTimeFrame('foo', {
      beginsAt: 'bar',
      endsAt: '6 hours after bar'
    });

    tf.extendNamedTimes({
      bar: '2012-01-01 12:00:00'
    }).start();

The begin time behaves like another named time, so you can also do this:

    var tf = new KairosTimeFrame('foo', {
      beginsAt: 'bar',
      endsAt: '6 hours after beginTime'
    });

    tf.extendNamedTimes({
      bar: '2012-01-01 12:00:00'
    }).start();

### LDML Syntax

LDML can also be used, combined with natural language.

    var tf = new KairosTimeFrame('foo', {
      beginsAt: 'bar',
      endsAt: 'PT 6H after bar' // or 'pt 6h after bar' or '6h after bar'
    });

    tf.extendNamedTimes({
      bar: '2012-01-01 12:00:00'
    }).start();

Of course, the named time is just a stand-in for an explicit time, so that time
can be used directly instead.

    var tf = new KairosTimeFrame('foo', {
      beginsAt: 1325437200000,
      endsAt: 'PT 6H after 1325437200000'
    }).start();

### Interpolation

Interpolation can be used instead of using exact times.

    var tf = new KairosTimeFrame('foo', {
      beginsAt: 'bar',
      endsAt: '50% between bar and baz' // or '0.5 between bar and baz'
    }).extendNamedTimes({
      bar: '2012-01-01 12:00:00',
      baz: '2012-01-02 00:00:00'
    }).start();

Interpolation can be a percentage string, or a floating point number ('0.4
between bar and baz').

### Ticking

Frames can send tick events at a specified interval. This is useful for a clock
or a countdown application. The tick event contains the reference to the frame,
which has a getRelativeDuration() method that will retrieve the milliseconds
relative to the relativeTo time.

    var tf = new KairosTimeFrame('foo', {
      beginsAt: '2012-01-01 12:00:00',
      endsAt: '2012-01-01 18:00:00',
      ticksEvery: '1 minute',
      relativeTo: 'endsAt'
    }).start();

Then you can then subscribe to the events:

    tf.subscribe('ticked', function (frame) {
      console.log(frame.getRelativeDuration() * 60 * 60 + ' minutes left!');
    });

The ticksEvery field can be in milliseconds, LDML, or natural language syntax,
and the relativeTo field can be a named time, the beginsAt or endsAt times, or
a Date, Unix timestamp, or Date-constructable string.

### Muting

The frame can be muted or unmuted, which toggles whether tick events are
published. If muted, the start and end events for the timeframe will be
published, but ticks will not.

    tf = new KairosTimeFrame('foo', {
      beginsAt: '2012-01-01 12:00:00',
      endsAt: '2012-01-01 18:00:00',
      ticksEvery: '1 second',
      relativeTo: 'endsAt'
    }).start();

If start() occurs before the frame beginsAt time, a start event will be
published. Tick events will begin firing immediately also, once per second.

    tf.mute();

Tick events will not be published anymore. If the endsAt time is reached, the
ended event will be published, and the frame will be history. If the endsAt
time has not been reached,

    tf.unmute();

will resume the publishing of tick events until the endsAt time is reached.

### Syncing

By default, time frames will be as accurate as possible. If a frame that ticks
every half hour begins at 3:15, the next tick will occur at 3:45, within the
general margin of error that setTimeout requires of us.

    var tf = new KairosTimeFrame({
      beginsAt: '2012-01-01 15:15:00',
      endsAt: '2012-01-01 14:15:00',
      ticksEvery: '30 minutes',
      relativeTo: 'endsAt' // TODO: What if we don't care about this, can it be left off?
    }).start();

This will publish tick events at 3:15pm, 3:45pm, and 4:15pm.

You might want to sync to the nearest full-value unit on the user's machine,
however.

    var tf = new KairosTimeFrame({
      beginsAt: '2012-01-01 15:15:00',
      endsAt: '2012-01-01 14:15:00',
      ticksEvery: '30 minutes',
      relativeTo: 'endsAt',
      syncsTo: '30 minutes'
    }).start();

This will publish tick events at 3:30pm, 4:00pm, and 4:30pm.

Let's look at this with milliseconds instead of half hours. Without Kairos,
setTimeout gets further and further off over time, so a one-second timer
might tick at

    0, 1015, 2035, 3205, 4310, 5425, 6445

Kairos by default syncs times to the correct interval, so that:

    var tf = new KairosTimeFrame({
      ticksEvery: '1 second'
    }).start();

will tick at

    0, 1005, 2010, 3006, 4011, 5001, 6009

We've compensated for the setTimeout drift! We should always be within a few
milliseconds of the interval specified. If we started the timer 500ms after
the epoch (and had a time machine):

    var tf = new KairosTimeFrame({
      beginsAt: 500,
      ticksEvery: '1 second'
    }).start();

the timer might tick at

    563, 1552, 2501, 3509, 4511, 5514, 6502

Note that the interval of 1 second is maintained, relative to the start time
of 500ms after the epoch.

However, we might want to sync to the user's clock, and tick exactly on the
second. In this case, syncing can be turned on.

    var tf = new KairosFrame({
      beginsAt: 500,
      ticksEvery: '1 second',
      syncsTo: '1 second'
    }).start();

This will cause the ticks to occur perhaps at

    1002, 2011, 3009, 4013, 5000, 6002

To summarize, ticks will always occur at the correct interval; the syncsTo
option gives you the ability to coordinate the first tick, and thus the
subsequent ticks, with the user's clock.

### Data

Frames can include a data object which will be passed to all of the published
events.

    var tf = new KairosTimeFrame('foo')
      .setData({
        bar: 1,
        baz: 2
      });

    tf.subscribe('ended', function (frame) {
      console.log(frame.getData());
    });

This is useful for passing along format strings or other relevant information.

## KairosCollection

The KairosCollection constructor takes an array of time frames, and allows you
to interact with all of them simultaneously. The API is detailed below, but
here are the main methods available. Most of the methods simply proxy through
to the same methods in the collection's time frames.

    var kc = new KairosCollection([KairosTimeFrame]);

    kc.start(); // starts all the frames in the collection
    kc.stop(); // stops all the frames in the collection
    kc.mute(); // stops publishing tick events for all the frames
    kc.unmute(); // restarts publishing tick events for all the frames
    kc.subscribe(String, Function); // subscribes to a collection event
    kc.unsubscribe([String, Function]); // unsubscribes from a collection event using a handle
    kc.pushTimeFrame(KairosTimeFrame); // pushes a time frame into the collection

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

## Full API

### new KairosTimeFrame(String, Object)

The API can use either chaining or an object, or a combination of the two.

    myKairosTimeFrame = new KairosTimeFrame(String)
      .setBeginsAt(String|Date|Number)
      .setEndsAt(String|Date|Number)
      .extendNamedTimes(Object)
      .setTicksEvery(String|Number)
      .setRelatedTo(String|Number)
      .setSyncsTo(String|Number)
      .setData(Object),
      .getBeginsAt()
      .getEndsAt()
      .getNamedTimes()
      .getTicksEvery()
      .getRelatedTo()
      .getSyncsTo()
      .getData()
      .getRelativeDuration()
      .start()
      .stop()
      .mute()
      .unmute()
      .subscribe()
      .unsubscribe()

    myKairosTimeFrame = new KairosTimeFrame(String, {
      beginsAt: String|Date|Number,
      endsAt: String|Date|Number,
      namedTimes: {
        String: String|Date|Number
      },
      data: {},
      ticksEvery: String|Number,
      relatedTo: String|Number,
      syncTo: String|Number
    })
      .getBeginsAt()
      .getEndsAt()
      .getNamedTimes()
      .getTicksEvery()
      .getRelatedTo()
      .getSyncsTo()
      .getData()
      .getRelativeDuration()
      .start()
      .stop()
      .mute()
      .unmute()
      .subscribe()
      .unsubscribe()

### KairosTimeFrame::setBeginsAt(String|Number|Date)

Sets the begin time for the frame.

    myKairosTimeFrame.setBeginsAt('2 minutes after now');
    myKairosTimeFrame.setBeginsAt('PT 3H after 102030405060');
    myKairosTimeFrame.setBeginsAt(102030405060);
    myKairosTimeFrame.setBeginsAt(new Date('2012-01-01 12:00:00'));

### KairosTimeFrame::getBeginsAt()

Gets the begin time for the frame. Pass the originalValue flag to get the value
of the user input before conversion to a timestamp.

    myKairosTimeFrame.getBeginsAt(); // 102030405060
    myKairosTimeFrame.getBeginsAt({ originalValue: true }); // 'PT 2M after foo'

### KairosTimeFrame::setEndsAt(String|Number|Date)

Sets the end time for the frame.

    myKairosTimeFrame.setEndsAt('2 minutes after beginsAt');
    myKairosTimeFrame.setEndsAt('PT 3H after 102030405060');
    myKairosTimeFrame.setEndsAt(102030405060);
    myKairosTimeFrame.setEndsAt(new Date('2012-01-01 12:00:00'));

### KairosTimeFrame::getEndsAt()

Gets the end time for the frame. Pass the originalValue flag to get the value
of the user input before conversion to a timestamp.

    myKairosTimeFrame.getEndsAt(); // 102030405060
    myKairosTimeFrame.getEndsAt({ originalValue: true }); // 'PT 2M after foo'

### KairosTimeFrame::extendNamedTimes({String|Number|Date})

Extends the hash of times, with keys being strings for reference, and values
being anything that Kairos can construct into a Unix timestamp.

    myKairosTimeFrame = new KairosTimeFrame({
      namedTimes: { foo: 102030405060 }
    });

    myKairosTimeFrame.extendNamedTimes({
      foo: new Date('2012-01-01 12:00:00'),
      bar: '2 minutes after foo',
      baz: 102030405060
    });

The named time 'foo' has been replaced with the new value, and 'bar' and 'baz'
have been added.

### KairosTimeFrame::getNamedTimes()

Gets the hash of named times, with keys being strings for reference, and values
being the unix timestamp millisecond values. Pass the originalValue flag to get
the original input values from the end user, and pass the includeDefaults flag
to include the built-in values in the returned object.

    myKairosTimeFrame.getNamedTimes(); // { foo: 102030405060, bar: 203040506070 }

    myKairosTimeFrame.getNamedTimes({
      originalValue: true
    }); // { foo: 'PT 2M after 102030405060', bar: <Date> }

    myKairosTimeFrame.getNamedTimes({
      includeDefaults: true
    }); // { foo: 102030405060, bar: 203040506070, epoch: 0, never: Infinity, now: 200000000000 }

### KairosTimeFrame::setTicksEvery(String|Number)

Sets the interval the frame should publish tick events at.

    myKairosTimeFrame.setTicksEvery('PT 2M');
    myKairosTimeFrame.setTicksEvery('2 minutes');
    myKairosTimeFrame.setTicksEvery(2 * 1000 * 60);

### KairosTimeFrame::getTicksEvery()

Gets the interval the frame will publish tick events at. Pass the originalValue
flag to get the original user input.

    myKairosTimeFrame.getTicksEvery(); // 120000
    myKairosTimeFrame.getTicksEvery({ originalValue: true }); // 'PT 2M'

### KairosTimeFrame::setRelatedTo(String|Number|Date)

Sets the timestamp to which or from which the interval is ticking. If it is
after the frame, you are counting down to this time. If it is before the
frame, you are counting up to this time.

    myKairosTimeFrame.setRelatedTo('foo');
    myKairosTimeFrame.setRelatedTo('beginsAt');
    myKairosTimeFrame.setRelatedTo(102030405060);
    myKairosTimeFrame.setRelatedTo(new Date(102030405060));

### KairosTimeFrame::getRelatedTo()

Gets the timestamp to which the interval is ticking. By default, this is the
beginsAt time. Pass the originalValue flag to get the original user input.

    myKairosTimeFrame.getRelatedTo(); // 102030405060
    myKairosTimeFrame.getRelatedTo({ originalValue: true }); // 'PT 2H after foo'

### KairosTimeFrame::setSyncsTo(String|Number)

This is the interval of the user's clock to which to sync times. It must be
equal to or less than the interval, otherwise the timing is not guaranteed to
be accurate to the user's clock. For example, you could tick every 15 minutes,
and sync to 15 minutes, to ensure that events fire at n:00, n:15, n:30, and
n:45 on the user's clock.

    myKairosTimeFrame.setSyncsTo('2 minutes');
    myKairosTimeFrame.setSyncsTo('PT 2M');
    myKairosTimeFrame.setSyncsTo(2 * 1000 * 60);

### KairosTimeFrame::getSyncsTo()

Gets the syncsTo value, if provided, otherwise the default will be the ms
portion of the time the frame started. Pass the originalValue flag to get the
original user input.

    myKairosTimeFrame.getSyncsTo(); // 120000
    myKairosTimeFrame.getSyncsTo({ originalValue: true }); // 'PT 2M'

### KairosTimeFrame::setData(Mixed)

Accepts an arbitrary piece of data which will be passed along when events are
published. One use for this is to hold format strings.

    myKairosTimeFrame.setData({
      foo: 1,
      bar: 2,
      baz: 3
    });

### KairosTimeFrame::getData()

    myKairosTimeFrame.getData(); // { foo: 1, bar: 2, baz: 3 }

### KairosTimeFrame::getRelativeDuration()

Returns a number of milliseconds relative to the timestamp specified in
the relatedTo property. If that timestamp is after the frame, this will be a
countdown to that time. If that timestamp is in the past, this will be a
countup to that time.

    myKairosTimeFrame.getRelativeDuration(); // 120000 (counting down)
    myKairosTimeFrame.getRelativeDuration(); // -120000 (counting up)

### KairosTimeFrame::start()

Starts running the frame. Before start() is called, no events will be
published, even if the frame is "happening" already.

    myKairosTimeFrame.start();

### KairosTimeFrame::stop()

Stops running the frame. After stop() is called, no events will be published,
even if the frame is still "happening".

    myKairosTimeFrame.stop();

### KairosTimeFrame::mute()

Mutes the publishing of tick events. Will not mute the publishing of start and
stop events, since they should correspond to the frame's beginning and end.

    myKairosTimeFrame.mute();

### KairosTimeFrame::unmute()

Starts publishing tick events again.

    myKairosTimeFrame.unmute();

### KairosTimeFrame::publish()

Publishes a notification. Intended for internal use only.

### KairosTimeFrame::subscribe()

Subscribes to a published notification. Several types of notifications are
published, and the frame instance is passed to all the subscribers.

    myKairosTimeFrame.subscribe('ticked', function (frame) {
      // do something on tick
    });

Because of chainability, subscribe does not return a handle, so if you want to
unsubscribe, you will need to pass a function reference and construct the
handle yourself.

    var fn = function () {};
    myKairosTimeFrame.subscribe('ticked', fn);
    myKairosTimeFrame.unsubscribe(['ticked', fn]);

### KairosTimeFrame::unsubscribe()

Unsubscribes from a published notification. The handle is an array containing
the channel string and the function reference.

    myKairosTimeFrame.unsubscribe(handle);

### new KairosCollection([KairosTimeFrame|Object])

Creates a new collection of time frames. The constructor takes an array of
either KairosTimeFrame instances or objects which are constructable to
KairosTimeFrame instances.

    var myKairosCollection = new KairosCollection([
      {
        beginsAt: 'now',
        endsAt: 'PT 3H after now'
      },
      new KairosTimeFrame('foo', {
        beginsAt: 'PT 3H after now',
        endsAt: 'PT 6H after now'
      })
    ]);

### KairosCollection::start()

Starts the collection by proxying through to every frame's start() method.

    myKairosCollection.start(); // calls start() on all frames in the collection

### KairosCollection::stop()

Stops the collection by proxying through to every frame's stop() method.

    myKairosCollection.stop(); // calls stop() on all frames in the collection

### KairosCollection::mute()

Pauses tick notifications for all frames in the collection. Start and end
notifications are not affected.

    myKairosCollection.mute();

### KairosCollection::unmute()

Resumes paused tick notifications for all frames in the collection. Start and
end notifications are not affected.

    myKairosCollection.unmute();

### KairosCollection::subscribe()

Subscribes to a published notification. Several types of notifications are
published. All subscribers receive their respective frame instances.

    myKairosCollection.subscribe('timeFrameTicked', function (frame) {
      // frame is the instance that had the event
    });

    myKairosCollection.subscribe('foo/ticked', function (frame) {
      // frame is the instance with the name 'foo'
    });

### KairosCollection::unsubscribe(Array)

Unsubscribes from a published notification. Because of chainability, you are
responsible for constructing your own handle to unsubscribe. The handle is an
array containing the channel string and function reference.

    var fn = function () {};
    myKairosCollection.subscribe('timeFrameBegan', fn);
    myKairosCollection.unsubscribe(['timeFrameBegan', fn]);

### KairosCollection::extendNamedTimes(Object)

Extends the named times accessible to all the frames in the collection. This
proxies through to the extendNamedTimes methods on each frame.

    kc = new KairosCollection([frame1, frame2]);
    frame1.extendNamedTimes({ foo: 102030405060 });

    kc.extendNamedTimes({ bar: 203040506070 });

Now, both frame1 and frame2 have time 'bar', but 'foo' is found only on frame1.

    kc.extendNamedTimes({ foo: 304050607080 });

Now, both frame1 and frame2 have time 'foo' with its new value.

### KairosCollection::pushTimeFrame(KairosTimeFrame)

Pushes a new time frame into the collection. Also accepts a hash that is
constructable to a new time frame.

    myKairosCollection.pushTimeFrame(
      new KairosTimeFrame({
        beginsAt: 'now',
        endsAt: 'PT 2M after now'
      });
    );

### KairosCollection::getTimeFrames()

Returns an array of the time frames in the collection.

    myKairosCollection.getTimeFrames(); // [KairosTimeFrame]

### KairosCollection::getNamedTimeFrame()

Returns a particular named time frame, if a frame with the given name exists.

    myKairosCollection.getNamedTimeFrame('foo'); // KairosTimeFrame

## Contributing

We use grunt for running tests and such, so, if you want to contribute, you
should to install grunts cli `sudo npm install -g grunt-cli`. Once you have
done so, you can run any of our grunt tasks: `grunt watch`, `grunt test`,
`grunt build`, `grunt release:(major or minor or patch)`

## Appendix

[Kairos](http://en.wikipedia.org/wiki/Kairos) (καιρός) /kī¦räs/ is an ancient
Greek word meaning the right or opportune moment (the supreme moment). The
ancient Greeks had two words for time, chronos and kairos. While the former
refers to chronological or sequential time, the latter signifies a time
between, a moment of indeterminate time in which something special happens.
What the special something is depends on who is using the word. While chronos
is quantitative, kairos has a qualitative nature. In rhetoric kairos is "a
passing instant when an opening appears which must be driven through with force
if success is to be achieved."

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
