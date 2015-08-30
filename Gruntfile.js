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
                'build/js/main.js',
                'public/js/main.js',
                'public/js/main.js.map'
            ],
            symbolsRes: ['public/res/symbols'],
            symbolsSparse: [
                'public/res/symbols/demo.html',
                'public/res/symbols/css/symbols-codes.css',
                'public/res/symbols/css/symbols-embedded.css',
                'public/res/symbols/css/symbols-ie7.css',
                'public/res/symbols/css/symbols-ie7-codes.css'
            ],
            symbolsZip: ['fontello-*.zip']
        },

        replace: {
            fontelloSymbolsCSSFix: {
                options: {
                    patterns: [
                        {
                            match: /font-family:.*"symbols";/,
                            replacement: '/*noinspection CssNoGenericFontName*/\n  font-family: "symbols";'
                        },
                        {
                            match: /speak: none/,
                            replacement: '/*noinspection CssUnknownProperty*/\n  speak: none'
                        },
                        {
                            match: /-moz-osx-font-smoothing: grayscale/,
                            replacement: '/*noinspection CssUnknownProperty*/\n  -moz-osx-font-smoothing: grayscale'
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['public/res/symbols/css/*.css'],
                        dest: 'public/res/symbols/css/'
                    }
                ]
            }
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

        jade: {
            production: {
                options: {
                    pretty: true
                },
                files: [
                    {
                        cwd: "sources/jade",
                        src: "*.jade",
                        dest: "public",
                        expand: true,
                        ext: ".html"
                    }
                ]
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
            production: {
                options: {
                    sourceMap: false,
                    mangle: true,
                    compress: {
                        drop_console: true
                    }
                },
                files: {
                    'public/js/main.js': ['build/js/*.js']
                }
            }
        },
        // build TS sources
        'ts': {
            'development': {
                src: ['sources/ts/*.ts'],
                out: 'public/js/main.js',
                options: {
                    sourceMap: true,
                    inlineSourceMap: true,
                    inlineSources: true
                }
            },
            'production': {
                src: ['sources/ts/*.ts'],
                out: 'build/js/main.js',
                options: {
                    sourceMap: false
                }
            },
            options: {
                target: 'es5'
            }
        },

        // development watch
        watch: {
            less: {
                files: ['sources/less/*.less', 'sources/less/**/*.less'],
                tasks: ['clean:styles', 'less:development']
            },
            javascript: {
                files: ['sources/js/*.js'],
                tasks: ['jshint:sources', 'clean:scripts', 'uglify:development']
            },
            typescript: {
                files: ['sources/ts/*.ts'],
                tasks: ['clean:scripts', 'ts:development']
            },
            jade: {
                files: ['sources/jade/*.jade', 'sources/jade/**/*.jade'],
                tasks: ['jade:production']
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
        },

        unzip: {
            fontelloSymbols: {
                router: function (filename) {
                    return filename.replace(/fontello-[a-z0-9]+[/]/, '');
                },
                src: ['fontello-*.zip'],
                dest: 'public/res/symbols/'
            }
        },

        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        'public/**'
                    ]
                },
                options: {
                    watchTask: true,
                    server: {
                        baseDir: './public',
                        directory: true,
                        index: 'index.html'
                    },
                    startPath: 'index.html'
                }
            }
        }
    });

    grunt.registerTask('production-build', [
        'clean:styles',
        'less:production',
        'clean:scripts',
        'ts:production',
        'uglify:production',
        'jade:production',
        'zip'
    ]);

    grunt.registerTask('development', [
        'clean:styles',
        'less:development',
        'clean:scripts',
        'ts:development',
        'jade:production'
    ]);

    grunt.registerTask('development-watch', [
        'browserSync',
        'development',
        'watch'
    ]);

    grunt.registerTask('fontelloSymbols', 'Unpack fontello ZIP package', function () {
        var packages = grunt.file.expand('fontello-*.zip');
        if (packages.length === 0) {
            grunt.fail.warn('No packages to process');
        }
        if (packages.length > 1) {
            grunt.fail.warn('More than one fontello package found!');
        }
        grunt.task.run('clean:symbolsRes');
        grunt.task.run('unzip:fontelloSymbols');
        grunt.task.run('clean:symbolsSparse');
        grunt.task.run('replace:fontelloSymbolsCSSFix');
        grunt.task.run('clean:symbolsZip');
    });
    grunt.registerTask('default', [
        'development-watch'
    ]);
};
