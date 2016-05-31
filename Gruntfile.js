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
    'jquery',
    'lodash/debounce',
    'leaflet.markercluster'
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
        external: vendorPackages,
        standalone: 'CafoMap'
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
      tasks: ['minifyify:app']
    }
  };

  config.concat = {
    options:{
      sourceMap:true
    },
    vendor:{
      src:[ 's3.amazonaws.com/media.apps.chicagotribune.com/graphics-toolbox/skeleton.css',
            'node_modules/leaflet.markercluster/dist/MarkerCluster.css', 
            'node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css',
            'css/leaflet.css'],
      dest:'css/vendor.css'
    }
  }

  config.notify_hooks = {
    options:{
      enabled:true,
      success:true,
      duration:2
    }
  }

  grunt.initConfig(config);
  
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-minifyify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  var defaultTasks = [];
 
  defaultTasks.push('concat');
  defaultTasks.push('sass');
  defaultTasks.push('minifyify');
  
  grunt.registerTask('default', defaultTasks);

  grunt.task.run('notify_hooks');

};