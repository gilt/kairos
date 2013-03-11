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