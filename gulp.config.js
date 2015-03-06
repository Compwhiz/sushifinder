module.exports = function() {
    var client = './client/';
    var server = './src/server/';
    var clientApp = client + 'app/';
    var wiredep = require('wiredep');
    var root = './';
    var report = root + 'report/';
    var temp = './.tmp/';
    var bower = {
        json: require('./bower.json'),
        directory: root + 'libs',
        ignorePath: '../..'
    };
    var bowerFiles = wiredep({
        devDependencies: true
    })['js'];

    var config = {
        alljs: [
            './**/*.js',
            // './*.js',
            '!./node_modules/**/*.js',
            '!./libs/**/*.js',
            '!./public/js/lib/*.js',
            '!./report/**/*.js',
            '!./test/**/*.js'
        ],
        bower: bower,
        build: './build/',
        browserReloadDelay:1000,
        css: temp + 'site.css',
        client: client,
        defaultPort: '8080',
        fonts: bower.directory + 'font-awesome/fonts/**/*.*',
        htmltemplates: clientApp + '**/*.html',
        index: client + 'index.html',
        images: client + 'images/**/*.*',
        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],
        jsOrder: [
            '**/app.module.js',
            '**/*.module.js',
            '**/*.js'
        ],
        nodeServer:'./server/app.js',
        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        },
        packages: [
            './packages.json',
            './bower.json'
        ],
        plato: {
            js: clientApp + '**/*.js'
        },
        root: root,
        report: report,
        server:server,
        source:'./',
        scss: client + 'styles/site.scss',
        stubsjs: [
            bower.directory + 'angular-mocks/angular-mocks.js',
            client + 'stubs/**/*.js'
        ],
        temp: temp,
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                root: 'app/',
                standAlone: false
            }
        }
    };

    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };

    return config;
};
