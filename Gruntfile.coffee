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
      amd:
        configFile: 'karma.amd.conf.js'
        singleRun: true
      once_travis:
        singleRun: true
        browsers: [
          'PhantomJS'
        ]
      amd_travis:
        configFile: 'karma.amd.conf.js'
        singleRun: true
        browsers: [
          'PhantomJS'
        ]
    clean:
      build: ['dist', 'coverage', 'test-results.xml']
    concat:
      options:
        separator: '\n\n'
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      build:
        src: [
          'lib/kairos_errors.js'
          'lib/kairos_event.js',
          'lib/kairos_time_frame.js'
          'lib/kairos_collection.js'
        ]
        dest: 'dist/<%= pkg.name %>.js'
    replace:
      dist:
        options:
          variables:
            'version': '<%= pkg.version %>'
        files: [
          {
            expand: true,
            flatten: true,
            src: ['dist/*.js'],
            dest: 'dist/'
          }
        ]
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
  grunt.loadNpmTasks 'grunt-replace'

  grunt.registerTask 'doc', 'Generate documentation', ->
    done = this.async()
    grunt.log.writeln('Generating Documentation...')
    require('child_process').spawn('./node_modules/.bin/groc', ['lib/*.js', 'README.md']).on 'exit', ->
      grunt.log.writeln('...done!')
      done()

  grunt.registerTask 'default', ['karma:specs']
  grunt.registerTask 'build', ['test', 'clean:build', 'doc', 'concat', 'replace', 'uglify']
  grunt.registerTask 'test', ['jshint', 'karma:amd', 'karma:once']
  grunt.registerTask 'test_travis', ['jshint', 'karma:amd_travis', 'karma:once_travis']
