module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/static/js/util.js', 'src/static/js/lightbox.js'],
        dest: 'dist/lightbox.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/lightbox.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    copy: {
      main: {
        expand: true,
        flatten: true,
        src: 'src/static/css/lightbox.css',
        dest: 'dist/',
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['concat', 'uglify', 'copy']);
};
