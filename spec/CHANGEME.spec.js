describe("CHANGEME", function () {
  it("should do something", function () {
    var foo = new CHANGEME();
    foo.subscribe("foo", function () { console.log("THING 1"); });
    foo.subscribe("foo", function () { console.log("THING 2"); });
    foo.publish("foo");
  })
});