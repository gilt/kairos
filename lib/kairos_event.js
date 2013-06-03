/*global _: false, define: false, require: false, exports: false */
(function (exports) {

  function create (_) {
    function KairosEvent (name, timeFrame) {
      this.eventTime = (new Date()).getTime();
      this.eventName = name;
      this.timeFrameName = timeFrame.getName();
      this.userData = timeFrame.getData();
      this.getDurationRelativeTo = _.bind(timeFrame.getDurationRelativeTo, timeFrame);
    }

    return KairosEvent;
  }

  if ('function' === typeof define && define.amd) {
    define('kairos_event', ['underscore'], create);
  } else {
    exports.KairosEvent = create(
      ('function' === typeof require && require('underscore')) || exports._ || _
    );
  }

}('object' === typeof exports && exports || this));