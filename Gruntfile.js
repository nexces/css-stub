//'use strict';
module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    var fs = require('fs'),
        path = require('path'),
        Zip = require('jszip');
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

        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({browsers: ['last 2 versions']})
                ]
            },
            styles: {
                src: 'public/css/style.css',
                dest: 'public/css/style.css'
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
            options: {
                spawn: false // Important, don't remove this!
            },
            less: {
                files: ['sources/less/*.less', 'sources/less/**/*.less'],
                tasks: ['development-styles', 'bsReload:css']
            },
            javascript: {
                files: ['sources/js/*.js'],
                tasks: ['jshint:sources', 'clean:scripts', 'uglify:development', 'bsReload:all']
            },
            typescript: {
                files: ['sources/ts/*.ts'],
                tasks: ['development-scripts', 'bsReload:all']
            },
            jade: {
                files: ['sources/jade/*.jade', 'sources/jade/**/*.jade'],
                tasks: ['jade:production', 'bsReload:all']
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
                options: {
                    router: function (filename) {
                        return filename.replace(/fontello-[a-z0-9]+[/]/, '');
                    }
                },
                src: ['fontello-*.zip'],
                dest: 'public/res/symbols/'
            }
        },

        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        'public/*.html',
                        'public/**/*.html',
                        'public/*.css',
                        'public/**/*.css',
                        'public/*.js',
                        'public/**/*.js'
                    ]
                },
                options: {
                    watchTask: true,
                    server: {
                        baseDir: './public',
                        directory: true,
                        index: 'index.html'
                    },
                    startPath: 'index.html',
                    background: true
                }
            }
        },
        bsReload: {
            css: {
                reload: 'public/css/style.css'
            },
            all: {
                reload: true
            }
        }
    });

    grunt.registerTask('production-build', [
        'clean:styles',
        'less:production',
        'postcss:styles',
        'clean:scripts',
        'ts:production',
        'uglify:production',
        'jade:production',
        'zip'
    ]);
    grunt.registerTask('development-styles', [
        'clean:styles',
        'less:development',
        'postcss:styles'
    ]);
    grunt.registerTask('development-scripts', [
        'clean:scripts',
        'ts:development'
    ]);
    grunt.registerTask('development', [
        'development-styles',
        'development-scripts',
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

    grunt.registerMultiTask('zip', 'Zip files together', function () {
        grunt.log.debug('Task started');
        // Localize variables
        var options = this.options({
            base64: false,
            router: function (path) {
                return path;
            },
            compression: 'DEFLATE'
        });
        grunt.verbose.debug('Options: ', options);
        this.files.forEach(function (target) {
            grunt.log.subhead('Creating: %s', target.dest);
            target.cwd && grunt.verbose.debug('CWD: %s', target.cwd);
            var zip = new Zip();
            target.src.forEach(function (input) {
                if (input == '') return; // skips empty path - probably related to using CWD
                var routedPath = options.router(input);
                var inputPath = path.join((target.cwd || '.'), input);
                if (grunt.file.isDir(inputPath)) {
                    grunt.verbose.writeln('Adding folder: "' + input + '" -> "' + routedPath + '"');
                    zip.folder(routedPath);
                } else {
                    var fileContent = fs.readFileSync(inputPath);

                    // If it has a path, add it (allows for skipping)
                    if (routedPath) {
                        grunt.verbose.writeln('Adding file: "' + input + '" -> "' + routedPath + '"');
                        zip.file(routedPath, fileContent);
                    }
                }
            });
            // ensure target directory exists
            var destDir = path.dirname(target.dest);
            grunt.file.mkdir(destDir);

            // Write out the content
            var output = zip.generate({type: 'nodebuffer', compression: options.compression});
            fs.writeFileSync(target.dest, output);
        });
    });

    grunt.registerMultiTask('unzip', 'Unzip files into a folder', function () {
        grunt.log.debug('Task started');
        // Localize variables
        var options = this.options({
            router: function (path) {
                return path;
            },
            base64: false,
            checkCRC32: true
        });
        grunt.verbose.debug('Options: ', options);
        this.files.forEach(function (target) {

            target.src.forEach(function (archive) {
                grunt.log.subhead('Unpacking %s', archive);
                // Read in the contents
                var input = fs.readFileSync(archive);
                // Unzip it
                var zip = new Zip(input, {checkCRC32: options.checkCRC32});
                //grunt.verbose.debug('archive content: ', zip.files);
                var archiveContents = Object.getOwnPropertyNames(zip.files);
                //grunt.verbose.debug('Archive content: ', archiveContents);
                archiveContents.forEach(function (key) {
                    var archiveEntry = zip.files[key];
                    var routedPath = options.router(archiveEntry.name);
                    if (!routedPath) {
                        // skip on empty name
                        return true;
                    }
                    routedPath = path.join(target.dest, routedPath);
                    if (archiveEntry.dir) {
                        // create dir unconditionally
                        grunt.verbose.writeln('Creating dir: %s -> %s', archiveEntry.name, routedPath);
                        grunt.file.mkdir(routedPath);
                    } else {
                        // ensure that directory in routedPath exists
                        grunt.verbose.writeln('Writing file: %s -> %s', archiveEntry.name, routedPath);
                        grunt.file.mkdir(path.dirname(routedPath));
                        fs.writeFileSync(
                            routedPath,
                            archiveEntry.asNodeBuffer(),
                            {
                                mode: archiveEntry.unixPermissions
                            }
                        );
                    }
                });
            });
        });
    });
};
