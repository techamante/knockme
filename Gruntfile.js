


module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            output: ['dist/*']
        },
        ts: {
            options: {

                experimentalDecorators: true
            },

            core: {
                src: ["src/**/*.ts", "!node_modules/**/*.ts", 'typings/**/*.ts'],
                dest: 'dist/knockme.js',
                options: {
                    module: 'amd',
                    declaration: true
                }
            },
            test: {
                src: ["demo/**/*.ts", "dist/**/*.ts", "!node_modules/**/*.ts", 'typings/**/*.ts'],
                options: {
                    module: 'amd'
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: '../',
                    keepalive: true
                }
            }
        },
        watch:{
            core:{
                files:["src/**/*.ts"],
                watch:['clean','ts:core']
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('build', ['clean', 'ts:core','watch']);

    grunt.registerTask('test', ['ts:test']);

    grunt.registerTask("run", ['connect']);

};