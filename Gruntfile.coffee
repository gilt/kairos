module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    meta:
      src:   'lib/**/*.js'
      specs: 'spec/**/*.spec.js'
    jshint:
      src: ['<%= meta.src %>', '<%= meta.specs %>']
      options:
        curly:     true
        expr:      true
        newcap:    true
        quotmark:  'single'
        regexdash: true
        trailing:  true
        undef:     true
        unused:    false
        maxerr:    100
        eqnull:    true
        sub:       false
        browser:   true
        node:      true
    karma:
      options:
        configFile: 'karma.conf.js'
        preprocessors:
          '**/lib/kairos*.js': 'coverage'
        browsers: [
          'Firefox'
        ]
        reporters: ['progress', 'coverage']
        # files: [] # Can't do this here, due to lack of JASMINE and JASMINE_ADAPTER global constants
        # if you add a dependency, it needs to be added to the files list in karma.conf.js
      specs: {}
      once:
        singleRun: true
    clean:
      build: ['dist', 'coverage', 'test-results.xml']
    concat:
      options:
        separator: '\n\n'
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      build:
        src: [
          'lib/kairos_errors.js'
          'lib/kairos_time_frame.js'
          'lib/kairos_collection.js'
        ]
        dest: 'dist/<%= pkg.name %>.js'
    uglify:
      options:
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      build:
        src:  'dist/<%= pkg.name %>.js'
        dest: 'dist/<%= pkg.name %>.min.js'
    release:
      options:
        bump:     true,  # bump the version in your package.json file.
        add:      false, # stage the package.json file's change.
        commit:   false, # commit that change with a message like "release 0.6.22".
        tag:      false, # create a new git tag for the release.
        push:     false, # push the changes out to github.
        pushTags: false, # also push the new tag out to github.
        npm:      false  # publish the new version to npm.

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-jasmine'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-karma'
  grunt.loadNpmTasks 'grunt-release'

  grunt.registerTask 'default', ['karma:specs']
  grunt.registerTask 'build', ['test', 'clean:build', 'concat', 'uglify']
  grunt.registerTask 'test', ['jshint', 'karma:once']
