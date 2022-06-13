import type Control from '../control';
import Paths from '../paths';
import Plugin from '../plugin';

export default class PluginLayers extends Plugin {
  cache: Record<string, Control<any>>;

  connect() {
    const { ipc } = this.client;

    // listen to events
    ipc.on('control:set', (...args) => this.set.call(this, args));
    ipc.on('control:reset', (...args) => this.reset.call(this, ...args));
    ipc.on('controls:set', (...args) => this.set.call(this, ...args));
    ipc.on('controls:reset', (...args) => this.resetAll.call(this, ...args));

    this.sync();
  }

  sync() {
    // Create cache of controls
    const controls: typeof this.cache = {};
    this.client.layer.forEachRecursive((child, path) => {
      if ('value' in child) {
        controls[path] = child;
      }
    });

    // save to cache
    this.cache = controls;

    // Send to back-end
    const layers = this.client.layer.toJSON('', new Paths()).children;
    console.log('to send from client', { layers });
    this.client.ipc.send('layers', layers, 'hallo');
  }

  set(path: string, value: any) {
    const control = this.cache[path];

    if (control && 'value' in control) {
      control.value(value);
    }
  }

  reset(path: string) {
    const control = this.cache[path];

    if (control && 'value' in control) {
      control.reset();
    }
  }

  setAll(values: Record<string, any>) {
    Object.keys(values).forEach((key) => {
      this.set(key, values[key]);
    });
  }

  resetAll() {
    const { layer } = this.client;
    layer.forEachRecursive((control) => {
      if (control && 'value' in control) {
        control.reset();
      }
    });
  }
}
