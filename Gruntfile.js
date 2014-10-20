'use strict';
module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    var path = require('path');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        // clean
        clean: {
            styles: ['public/css/style.css'],
            scripts: [
                'public/js/main.js',
                'public/js/main.js.map'
            ]
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

        // validate JS
        jshint: {
            sources: {
                files: {
                    src: ['sources/js/*.js']
                }
            }
        },

        // build sources
        uglify: {
            development: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'public/js/main.js.map',
                    sourceMapIncludeSources: true,
                    mangle: true,
                    compress: true
                },
                files: {
                    'public/js/main.js': ['sources/js/*.js']
                }
            },
            production: {
                options: {
                    sourceMap: false,
                    mangle: true,
                    compress: {
                        drop_console: true
                    }
                },
                files: {
                    'public/js/main.js': ['sources/js/*.js']
                }
            }
        },

        // development watch
        watch: {
            less: {
                files: ['sources/less/*.less'],
                tasks: ['clean:styles', 'less:development']
            },
            javascript: {
                files: ['sources/js/*.js'],
                tasks: ['jshint:sources', 'clean:scripts', 'uglify:development']
            }
        },

        //build package
        zip: {
            package: {
                src: [
                    'public/**',
                    'sources/**',
                    'Gruntfile.js',
                    'package.json',
                    'README.md',
                    'Vagrantfile'
                ],
                dest: path.relative('..','.') + '.zip',
                compression: 'DEFLATE',
                base64: true,
                dot: true
            }
        }
    });
    
    grunt.registerTask('default', [
        'clean:styles',
        'less:production',
        'jshint:sources',
        'clean:scripts',
        'uglify:production',
        'zip'
    ]);

    grunt.registerTask('development', [
        'clean:styles',
        'less:development',
        'jshint:sources',
        'clean:scripts',
        'uglify:development'
    ]);

    grunt.registerTask('development-watch', [
        'development',
        'watch'
    ]);
};