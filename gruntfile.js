module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['assets/js/vendor/*.js'],
        dest: 'assets/build/main.js'
      }
    },
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: [{ // C'est ici que l'on définit le dossier que l'on souhaite importer
          "expand": true,
          "cwd": "assets/sass/",
          "src": ["*.sass"],
          "dest": "assets/build/",
          "ext": ".css"
        }]
      }
    }, 
    watch: {
      scripts: {
        files: ['assets/js/*.js', ],
        tasks: ['jshint'],
        options: {
          spawn: false,
        },
      },
      css: {
        files: 'assets/sass/*.sass',
        tasks: ['sass']
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'sass']);

};