module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Code minifying
    uglify: {
      options: {
        // banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      buildAll: {
        src: ['js/build/vendor.min.js','js/build/carousel.min.js','js/build/main.min.js',], //input
        dest: 'js/build/all.min.js' //output
      },
      buildVendor: {
        src: ['js/vendor/*.js'],
        dest: 'js/build/vendor.min.js'
      },
      buildCarousel: {
        src:['js/widget/lib/*.js'],
        dest: 'js/build/carousel.min.js'
      },
      buildMain: {
        src: ['js/*.js'],
        dest: 'js/build/main.min.js'
      }
    },

    // Handles LESS compiling
    less: {
      development: {
        options: {
            paths: ["css"],
            yuicompress: true
          }
        },
        src:{
          expand: true,
          cwd: "css",
          src: "main.less",
          dest: "css",
          ext: ".css"
        }
      }, 

    // Recompile on change
    watch: {

      options:{
        spawn: false
      },

      watchCss:{
        files: ['css/*.less'],
        tasks: ['less']
      },

      watchMainJS: {
        files: ['js/controller.js'],
        tasks: ['uglify:buildMain']
      }

    },

    

    // Localhost server
    connect: {
      server: {
        options: {
          port: 9000,
          // keepalive: true
        }
      }
    }


  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task(s).
  grunt.registerTask('buildVendor', ['uglify:buildVendor']);
  grunt.registerTask('buildCarousel', ['uglify:buildCarousel']);
  grunt.registerTask('buildMain', ['uglify:buildMain']);
  grunt.registerTask('buildAll', ['uglify:buildAll']);
  grunt.registerTask('buildJS', ['uglify:buildVendor', 'uglify:buildCarousel', 'uglify:buildMain', 'uglify:buildAll']);
  grunt.registerTask('server', ['connect', 'watch:watchCss']);
  grunt.registerTask('watch-main', ['watch:watchMain']);

};