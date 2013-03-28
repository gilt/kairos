//noinspection JSValidateTypes
var
  kairos = require('../dist/kairos'),

  scheduler = new kairos.KairosScheduler({
    times: {
      'now': (new Date())
    },
    frames: [{
      begin: {
        starting: '60s',
        after: 'now'
      },
      name: 'oneTimeJob',
      data: {
        foo: 'bar'
      }
    }, {
      interval: 5000,
      name: 'periodicJob',
      data: {
        x: 1337,
        y: 11
      }
    }]
  });

scheduler.subscribe('periodicJob/ticked', function (duration, data) {
  console.info('DOING SOMETHING REPEATEDLY', data.x, data.y);
  data.x += 1;
  data.y = data.x % 13;
});

scheduler.subscribe('oneTimeJob/started', function (duration, data) {
  console.info('DOING A ONE TIME JOB: foo=', data.foo);
});

scheduler.subscribe('newJob/started', function () {
  console.info('DOING SOMETHING ELSE');
});

scheduler.addFrame({
  name: 'newJob'
});





var
  times = {
    breakfast: 123498298234,
    lunch: 123123123123,
    dinner: 234234234123
  },
  sampleFrame = new KairosFrame(),
  scheduler = new KairosScheduler([
    sampleFrame,
    new KairosFrame('foo'),

    new KairosFrame('morning', { // WINNER!!!
      beginsAt: times.breakfast,
      endsAt: '1 hour before lunch',
      ticksEvery: '1s',
      relativeTo: 'lunch'
    }).withTimes(times), // each time is immutable, builds up a dictionary

    new KairosFrame('afternoon')

      // jQuery style:
      .beginsAt(times.lunch)
      .beginsAt()
      .endsAt('dinner', times)
      .endsAt()
      .ticksEvery('1s')
      .ticksEvery()
      .relativeTo(times.lunch)
      .relativeTo()

      // get/set style:
      .setBeginsAt(asdf)
      .getBeginsAt()
      .setEndsAt(asdf)
      .getEndsAt()
      .setTicksEvery(asdf)
      .getTicksEvery()
      .setRelativeTo(asdf)
      .getRelativeTo()

      // natural language style:
      .beginAt(asdf)
      .beginsAt()
      .endAt(asdf)
      .endsAt()
      .tickEvery(asdf)
      .ticksEvery()
      .relativeTo(asdf)
      .isRelativeTo() // not sure about this




      .subscribe('started', fn)
      .subscribe('ended', fn)
      .subscribe('ticked', fn)

      .start()
      .pause()
      .resume(),

    new KairosFrame('evening')
      .beginsAt(horo('dinner', times))
      .endsAt(horo('midnight ET after dinner')(times))
      .ticksEvery(horo('every second before lunch and every other second after lunch')),

    new KairosFrame('tea')
      .beginsAt(horo('tres horas antes de lunch', 'es'))
      .endsAt(horo('una hora antes de inicio', 'es'))
      .withTimes(times)
  ]).withTimes(times);

sampleFrame.beginsAt(123123123123);
scheduler.findFrame('foo').whenDoesItEnd();