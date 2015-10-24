module.exports = function(grunt) {
  grunt.file.defaultEncoding = 'utf8';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      stages: {
        files: {
          'stage/core.js': ['build/metablock.js', 'src/core/*.js', 'src/common/*.js'],
          'stage/editorBase.js': ['src/editorBase/*.js', 'src/tabs/*.js'],
          'stage/pageScripts.js': ['src/features/*.js', 'src/pageScripts/*.js', 'src/firstAction.js'],
          'stage/NamuFix.css': ['src/*.css', 'src/**/*.css']
        }
      },
      finish: {
        src: ['stage/core_versioned.js', 'stage/editorBase.js', 'stage/pageScripts.js', 'stage/NamuFix.esacped.css.js'],
        dest: 'NamuFix.user.js'
      },
    },
    replace: {
      version: {
        options: {
          patterns: [{
            match: 'VERSION',
            replacement: "<%= pkg.version %>"
          }]
        },
        files: [{
          src: ['stage/core.js'],
          dest: 'stage/core_versioned.js'
        }]
      }
    },
    jsbeautifier: {
      files: ["NamuFix.user.js", "stage/NamuFix.css"]
    },
    jsvalidate: {
      js: {
        files: {
          src: ["NamuFix.user.js"]
        }
      }
    },
    clean: ['stage']
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-jsvalidate');

  grunt.task.registerTask('escapecss', 'Escape CSS and insert', function() {
    var unescaped = grunt.file.read('stage/NamuFix.css', {
      encoding: 'utf8'
    });
    var escaped = "GM_addStyle(".concat(JSON.stringify(unescaped), ");");
    grunt.file.write('stage/NamuFix.esacped.css.js', escaped, {
      encoding: 'utf8'
    });
  })
  grunt.registerTask('default', ['concat:stages', 'replace:version', 'escapecss', 'concat:finish', 'jsbeautifier', 'jsvalidate', 'clean']);
};
