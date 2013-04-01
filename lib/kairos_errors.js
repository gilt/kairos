/* global _: false */
(function (exports) {

  /**
   * @public
   * @constructor AccessDenied
   *
   * @param {String} [message]
   */
  function AccessDenied (message) {
    this.name = 'AccessDenied';
    this.message = message || 'Access is denied';
  }
  AccessDenied.prototype = new Error();
  AccessDenied.prototype.constructor = AccessDenied;
  exports.AccessDenied = AccessDenied;

  /**
   * @public
   * @constructor DuplicateError
   *
   * @param {String} [message]
   */
  function DuplicateError (message) {
    this.name = 'DuplicateError';
    this.message = message || 'Duplicate values found';
  }
  DuplicateError.prototype = new Error();
  DuplicateError.prototype.constructor = DuplicateError;
  exports.DuplicateError = DuplicateError;

  /**
   * @public
   * @constructor ImmutableError
   *
   * @param {String} [message]
   */
  function ImmutableError (message) {
    this.name = 'ImmutableError';
    this.message = message || 'This object is immutable';
  }
  ImmutableError.prototype = new Error();
  ImmutableError.prototype.constructor = ImmutableError;
  exports.ImmutableError = ImmutableError;

  /**
   * @public
   * @constructor MissingParameter
   *
   * @param {String} [message]
   */
  function MissingParameter (message) {
    this.name = 'MissingParameter';
    this.message = message || 'No value was provided';
  }
  MissingParameter.prototype = new Error();
  MissingParameter.prototype.constructor = MissingParameter;
  exports.MissingParameter = MissingParameter;

}(
  'object' === typeof exports && exports || this
));