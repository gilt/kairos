describe("Kairos", function () {
  it("should have a pubsub system", function () {
    var
      kairos = new Kairos({}),
      received = false;

    kairos.subscribe("testing", function () {
      received = true;
    });

    kairos.publish("testing");

    expect(received).toBe(true);

    kairos.pause();
  });

  it("should publish once per tick", function () {
    var
      kairos = new Kairos({
        times: {
          "test": (new Date()).getTime() + 60000
        },
        frames: [{
          begin: {
            at: 0
          },
          relatedTo: "test",
          interval: 1000
        }]
      }),
      received = false;

    kairos.subscribe("tick", function () {
      received = true;
    });

    waits(1000);

    runs(function () {
      expect(received).toBe(true);

      kairos.pause();
    });
  });
});