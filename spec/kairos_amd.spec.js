/* global KairosTimeFrame: false, KairosCollection: false, _: false, define: false, jasmine: false, describe: false, xdescribe: false, it: false, xit: false, expect: false, waitsFor: false, runs: false */
define(

[
  'kairos_time_frame',
  'kairos_collection',
  'kairos_errors'
],

function (KairosTimeFrame, KairosCollection, KairosErrors) {
  describe('Kairos', function () {
    it('should exist in AMD require', function () {
      expect(KairosTimeFrame).toEqual(jasmine.any(Function));
      expect(KairosCollection).toEqual(jasmine.any(Function));
      expect(KairosErrors).toEqual(jasmine.any(Object));
    });
  });
}

);