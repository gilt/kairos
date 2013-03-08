var
  kairos = require('../dist/kairos');

  now = (new Date()).getTime(),
  day = (24 * 60 * 60 * 1000),
  noon = (now + day - ((now + day) % day) + (day / 2)),

  scheduler = new kairos.KairosScheduler({
    times: {
      'noon': noon
    },
    frames: [{
      end: {
        starting: 'PT1H',
        after: 'noon'
      },
      name: 'sample',
      interval: '5s',
      relatedTo: 'noon'
    }]
  });

scheduler.subscribe('frameEnded/sample', function () {
  console.log('We\'re shutting down for lunch around here. Go eat already!');
});

scheduler.subscribe('frameTicked/sample', function (duration) {
  var
    hours = Math.floor(duration / (60 * 60 * 1000)),
    minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000)),
    seconds = Math.round((duration % (60 * 1000)) / 1000);
  if (0 > duration) {
    console.log('Good Afternoon');
    console.log('It has been ' + minutes + ' minutes and ' + seconds + ' seconds since noon GMT');
  } else {
    console.log('There are ' + hours + ' hours, ' + minutes + ' minutes, ' + seconds + ' seconds remaining until noon GMT');
  }
});