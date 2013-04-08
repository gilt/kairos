/* global _: false, define: false */
(function (exports) {

  function create () {

    var
      errors = {};

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
    errors.AccessDenied = AccessDenied;

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
    errors.DuplicateError = DuplicateError;

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
    errors.ImmutableError = ImmutableError;

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
    errors.MissingParameter = MissingParameter;

    return errors;
  }

  if ('function' === typeof define && define.amd) {
    define('kairos_errors', [], create);
  } else {
    exports.KairosErrors = create();
  }

}('object' === typeof exports && exports || this));