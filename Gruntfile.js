module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      development: {
        options: {
          compress: false
        },
        files: {
          "css/style.css": "css/style.less"
        }
      },
      production: {
        options: {
          compress: true,
          cleancss: true
        },
        files: {
          "css/style.min.css": ["css/fonts.css", "css/style.less"]
        }
      }
    },
    uglify: {
      options: {
        banner: '/*\n\n    AIME\n\n*/\n'
      },
      production: {
        files: {
          'js/poltergeist.min.js': [
            'js/vendor/handlebars-1.1.2.js',
            'js/vendor/jquery.scrolltofixed.js',
            '/js/vendor/jquery.color.min.js',
            'js/vendor/jquery.stickem.js',
            'js/vendor/storyjs.embed.js',
            'js/general.js'
          ]
        }
      }
    }, 
  });

  console.log("\n                      *     .--.\n                           / /  `\n          +               | |\n                 '         \\ \\__,\n             *          +   '--'  *\n                 +   /\\\n    +              .'  '.   *\n           *      /======\\      +\n                 ;:.  _   ;\n                 |:. (_)  |\n                 |:.  _   |\n       +         |:. (_)  |          *\n                 ;:.      ;\n               .' \:.    /  `.\n              / .-'':._.'`-. \\\n              |/    /||\\    \\|\n        jgs _..--\"\"\"````\"\"\"--.._\n      _.-'``                    ``'-._\n    -'                                '-\n\n");

  console.log(grunt.cli.tasks.join(''));

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.registerTask('default', ['less:production', 'uglify:production']);
  grunt.registerTask('development', ['less:development']);
};
