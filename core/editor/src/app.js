const { app, BrowserWindow, powerSaveBlocker } = require('electron');
const settings = require('electron-settings');
const url = require('url');
const path = require('path');
const dotProp = require('dot-prop');

const argv = require('./arguments')();
const logger = require('./logger.js');
const inject = require('./inject.js');
const eventSystem = require('./events.js');
const resizeHandler = require('./resize.js');
const loadFiles = require('./load-files.js');
const menu = require('./menu.js');

class App {
  constructor() {
    this.windows = {
      frame: null,
      editor: null,
    };

    const local = argv.url.indexOf('http') === -1;
    this.cwd = argv.cwd;
    this.url = local
      ? url.format({
          pathname: path.join(argv.cwd, argv.url || 'index.html'),
          protocol: 'file:',
          slashes: true,
        })
      : argv.url;
    this.debug = argv.debug;
    this.standalone = argv.standalone;

    // clear settings if needed
    if (argv.clear) {
      console.info('🗑  cleared app settings');
      settings.deleteAll();
    }

    // eslint-disable-next-line
    this.settingsFile = argv.settings;
    this.settings = require(argv.settings) || {};
    const screen = Object.assign(
      {
        size: false,
        enableResize: true,
        enableLargerThanScreen: false,
        preventSleep: false,
        saveSize: true,
        hideEditor: false,
      },
      this.settings.screen || {}
    );

    const defaultSize = { width: 1400, height: 768 };
    const initialSize = screen.saveSize
      ? screen.size || (settings.get('size') || defaultSize)
      : screen.size || defaultSize;

    const editor = this.openWindow('editor', {
      width: initialSize.width,
      height: initialSize.height,
      resizable: screen.enableResize,
      enableLargerThanScreen: screen.enableLargerThanScreen,
      useContentSize: true,
      titleBarStyle: 'hiddenInset',
    });
    const frame = this.openWindow('frame', {
      parent: editor,
      width: 800,
      height: 768,
      enableLargerThanScreen: screen.enableLargerThanScreen,
      useContentSize: true,
      frame: false,
      hasShadow: false,
      resizable: false,
      movable: false,
    });

    // Power sleep
    if (screen.preventSleep) {
      powerSaveBlocker.start('prevent-display-sleep');
    }

    // Load a URL in the window to the local index.html path
    editor.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );

    // Load url for frame
    frame.loadURL(this.url);

    editor.once('ready-to-show', () => {
      // Show window when page is ready
      if (!screen.hideEditor) {
        window.show();
      }
      frame.show();
    });

    if (argv.inspect) {
      editor.webContents.openDevTools();
      frame.webContents.openDevTools();
    }

    // load modules
    [logger, inject, eventSystem, resizeHandler, loadFiles, menu].forEach(fn =>
      fn(this)
    );

    if (argv.CI) {
      console.info('CI run succesfully');
      app.quit();
    }
  }

  window(name) {
    return this.windows[name];
  }

  openWindow(name, settings) {
    this.windows[name] = new BrowserWindow(settings);
    return this.window(name);
  }

  setting(path, d) {
    return dotProp.get(this.settings, path, d);
  }

  path(ci, standalone) {
    return this.standalone
      ? path.join(app.getPath('userData'), 'files', standalone)
      : ci;
  }
}

app.once('ready', () => {
  new App();
});
