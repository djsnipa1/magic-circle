import dotProp from 'dot-prop';

import defaultSettings from './default-settings';
import Store from './store';
import addPluginMenu from './plugin-menu';
import * as icons from './icons';

const { ipcRenderer } = require('electron');

/* eslint-disable class-methods-use-this */

export class Client {
  constructor(settings, cwd) {
    console.log('loading client');

    if (settings.plugins) {
      // eslint-disable-next-line
      settings.plugins =
        typeof settings.plugins === 'function'
          ? settings.plugins(defaultSettings.plugins)
          : settings.plugins;
    }

    this.isElectron = true;
    this.settings = Object.assign(defaultSettings, settings);
    this.cwd = cwd;

    this.buttons = new Store();
    this.buttons.collection = this.getButtons.bind(this);
    this.icons = icons;

    console.log('client created', this.settings);

    // add plugins
    this.plugins = this.settings.plugins
      .filter(
        Plugin =>
          (this.isElectron && Plugin.electronOnly) || !Plugin.electronOnly
      )
      .map(Plugin => {
        try {
          const initialData = Plugin.initStore
            ? Plugin.initStore(this.settings)
            : {};
          const store = new Store(initialData);
          const plugin = new Plugin(this, store, this.settings);
          plugin._name = Plugin.name; //eslint-disable-line

          // button collections
          if (plugin.buttons) {
            plugin.buttons(this.buttons);
          }

          // load electron plugins?
          if (this.isElectron && plugin.electron) {
            let files = plugin.electron();
            files = Array.isArray(files) ? files : [files];
            this.sendAction('electron-load', {
              files,
              settings: this.settings,
            });
          }

          // menu for this plugin?
          if (this.isElectron && plugin.applicationMenu) {
            addPluginMenu(
              Plugin.name.charAt(0).toUpperCase() + Plugin.name.slice(1),
              plugin.applicationMenu()
            );
          }

          return plugin;
        } catch (e) {
          ipcRenderer.send(
            'log',
            'error',
            `error during initialization of plugin: ${Plugin.name}`
          );
          ipcRenderer.send('log', 'error', e);
        }
      });

    // send message to front-end
    this.sendMessage('editor-loaded', true);

    // render on finish loading
    this.settings.render(this);

    // listen to refreshes
    this.addListener('setup', () => this.setup());
  }

  async setup() {
    let actions = [];
    await this.plugins.forEach(async s => {
      if (s.setup) {
        const action = await s.setup(this);

        // added to list of actions
        if (Array.isArray(action)) {
          actions = actions.concat(action);
        } else {
          actions.push(action);
        }
      }
    });

    // send message to front-end
    this.sendMessage('setup-response', {
      batch: actions,
    });
  }

  addListener(channel, fn) {
    ipcRenderer.on(channel, fn);
  }

  removeListener(channel, fn) {
    ipcRenderer.removeListener(channel, fn);
  }

  sendMessage(channel, payload) {
    ipcRenderer.send('intercom', { channel, payload, to: 'frame' });
  }

  sendAction(action, payload) {
    ipcRenderer.send(action, payload);
  }

  refresh() {
    ipcRenderer.send('refresh');
  }

  getPlugin(name) {
    return this.plugins.find(p => p._name === name); //eslint-disable-line
  }

  getSetting(path, d) {
    return dotProp.get(this.settings, path, d);
  }

  getButtons() {
    const buttons = {
      play: [],
      frame: [],
      debug: [],
    };

    // group
    Object.values(this.buttons.get()).forEach(b => {
      buttons[b.collection] = buttons[b.collection] || [];
      buttons[b.collection].push(b);
    });

    return buttons;
  }

  mapToJSON(map) {
    const list = [];

    map.forEach((value, key) => {
      list.push({ key, value });
    });

    return list;
  }

  JSONToMap(list) {
    const map = new Map();
    list.forEach(i => {
      map.set(i.key, i.value);
    });
    return map;
  }

  resize(window, width, height) {
    ipcRenderer.send(`resize-${window}`, { width, height });
  }
}
