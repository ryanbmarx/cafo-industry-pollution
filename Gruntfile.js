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

  var vendorPackages = [
    'd3', 
    'leaflet',
    'jquery'
  ];

  config.minifyify = {
    vendor:{
      minifyifyOptions:{
        map: 'vendor.min.js.map'
      },
      browserifyOptions:{
        require: vendorPackages
      },
      dest: {
        buildFile: './js/vendor.min.js',
        mapFile: './js/vendor.min.js.map'
      }

    },
    app: {
      browserifyOptions:{
        external: vendorPackages
      },
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