module.exports = function(grunt) {
  var config = {};

  
  config.browserify = {
    options: {
      browserifyOptions: {
        debug: true
      }  
    },
    app: {
      src: ['js/src/app.js'],
      dest: 'js/app.js'
    }
  };

  config.minifyify = {
    browserifyOptions: {
      debug: true,
      transform: [
        'browserify-shim'          
      ]
    },
    app: {
      minifyifyOptions: {
        map: 'app.min.js.map'
      },
      add: './js/src/app.js',
      dest: {
        buildFile: './js/app.min.js',
        mapFile: './js/app.min.js.map'
      }
    }
  };
  

  
  config.sass = {
    options: {
      style: 'compressed'
    },
    app: {
      files: {
        'css/styles.css': 'sass/styles.scss'
      }
    }
  };
  

  config.watch = {
    
      sass: {
      files: ['sass/**/*.scss'],
      tasks: ['sass']
    },
    
    js: {
      files: ['js/src/**/*.js'],
      tasks: ['minifyify']
    }
  };

  grunt.initConfig(config);
  
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-minifyify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  var defaultTasks = [];
 
  defaultTasks.push('sass');
  defaultTasks.push('minifyify');
  
  grunt.registerTask('default', defaultTasks);
};