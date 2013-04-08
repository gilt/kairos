//noinspection JSValidateTypes
var
  kairos = require('../lib/kairos'),
  collection = new kairos.KairosCollection([
    new kairos.KairosTimeFrame('oneTimeJob')
      .beginsAt('60s after now')
      .setData({
        foo: 'bar'
      }),
    new kairos.KairosTimeFrame('periodicJob')
      .ticksEvery('5 seconds')
      .setData({
        x: 1337,
        y: 11
      })
  ]).subscribe('periodicJob/ticked', function (frame) {
    console.info('DOING SOMETHING REPEATEDLY', frame.getData().x, frame.getData().y);
    frame.getData().x += 1;
    frame.getData().y = frame.getData().x % 13;
  }).subscribe('oneTimeJob/began', function (frame) {
    console.info('DOING A ONE TIME JOB: foo=', frame.getData().foo);
  }).subscribe('newJob/began', function () {
    console.info('DOING SOMETHING ELSE');
  });

collection.pushTimeFrame(
  new kairos.KairosTimeFrame('newJob')
    .beginsAt('PT15S from now')
);

collection.start();