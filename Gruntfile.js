'use strict';
module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        // clean
        clean: {
            build: ['public/css/style.css']
        },
        
        // compile less
        less: {
            development: {
                options: {
                    report: 'gzip',
                    rootpath: '../',
                    compress: false
                },
                files: {
                    'public/css/style.css': 'sources/less/style.less'
                }
            },
            production: {
                options: {
                    report: 'gzip',
                    rootpath: '../',
                    compress: true
                },
                files: {
                    'public/css/style.css': 'sources/less/style.less'
                }
            }
        },

        // development watch
        watch: {
            less: {
                files: ['sources/less/*.less'],
                tasks: ['less:development']
            }
        }
    });
    
    grunt.registerTask('default', [
        'clean',
        'less:production'
    ]);

    grunt.registerTask('development', [
        'watch'
    ]);
};