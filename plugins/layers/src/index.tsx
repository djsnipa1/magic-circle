import {
  Plugin,
  icons,
  App,
  MainLayerExport,
  LayerExport,
  LayoutHook,
  ControlExport,
} from '@magic-circle/schema';
import { Store, StoreFamily } from '@magic-circle/state';
import {
  ArrowRight,
  ChevronDown,
  registerIcon,
  Rows,
} from '@magic-circle/styles';

import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';

registerIcon(Rows);
registerIcon(ChevronDown);
registerIcon(ArrowRight);

type FlatListItem = LayerExport & {
  depth: number;
  hasChildren: boolean;
};

const convert = (main: MainLayerExport) => {
  const flat: FlatListItem[] = [];
  const lookup: Record<string, LayerExport | ControlExport> = {};

  const recursive = (layers: LayerExport['children'] = [], depth = 0) => {
    layers.forEach((child) => {
      lookup[child.path] = child;

      if ('folder' in child && !child.folder) {
        const hasChildren = child.children && child.children.length > 0;
        const childLayers =
          hasChildren && child.children.some((c) => 'folder' in c && !c.folder);

        flat.push({
          ...child,
          depth,
          hasChildren: childLayers,
        });
      }

      if ('children' in child && child.children) {
        recursive(child.children, depth + 1);
      }
    });
  };

  recursive(main);

  return { flat, lookup };
};

export default class Layers implements Plugin {
  ipc: App['ipc'];
  client: App;

  layers: Store<MainLayerExport>;
  flat: Store<FlatListItem[]>;
  lookup: StoreFamily<LayerExport | ControlExport>;
  selected: Store<string>;

  name = 'layers';

  async setup(client: App) {
    this.ipc = client.ipc;
    this.client = client;

    // Create stores
    this.layers = new Store<MainLayerExport>([]);
    this.flat = new Store<FlatListItem[]>([]);
    this.selected = new Store<string>(null);
    this.lookup = new StoreFamily<LayerExport | ControlExport>();

    this.ipc.on('layers', (_, layers: MainLayerExport) => {
      const { flat, lookup } = convert(layers);
      this.layers.set(layers);
      this.flat.set(flat);
      this.lookup.set((id) => lookup[id]);
      this.lookup.keys(Object.keys(lookup));
    });
    this.ipc.on('control:set-value', (_, path: string, value: any) => {
      this.setControl(path, value);
    });

    // Set controls sidebar
    this.client.setLayoutHook(
      LayoutHook.SIDEBAR_RIGHT,
      <SidebarRight app={this.client} layers={this} />
    );
  }

  sidebar() {
    return {
      icon: 'Rows' as icons,
      name: 'layers',
      render: <SidebarLeft layers={this} />,
    };
  }

  async load(data: Record<string, any>) {
    Object.keys(data).forEach((key) => this.setControl(key, data[key]));
  }

  hydrate() {
    const hydrate: Record<string, any> = {};
    this.lookup.export((key, value) => {
      if ('value' in value && !value.blockHydrate) {
        hydrate[key] = value.value;
      }
    });
    return hydrate;
  }

  async save() {
    const toSave = {};

    this.lookup.export((key, value) => {
      if (value && 'value' in value && value.value) {
        toSave[key] = value.value;
      }
    });

    return toSave;
  }

  setControl<T>(path: string, newValue: T) {
    const store = this.lookup.get(path);

    if (!store || !store.value) {
      throw new Error('Trying to update value of non-existent control');
    }

    // Save changes locally
    store.set({
      ...store.value,
      value: newValue,
    });

    // send changes to FE
    this.ipc.send('control:set', path, newValue);
  }

  async reset() {
    this.layers.set([]);
    this.flat.set([]);
    this.selected.set(null);
    this.lookup.reset();
  }

  preConnect() {
    this.reset();
  }

  resetControl(path: string) {
    const store = this.lookup.get(path);

    if (store && 'initialValue' in store.value) {
      this.setControl(path, store.value.initialValue);
    }
  }

  getControlRenderer(type: string) {
    return this.client.controls[type]?.render;
  }
}
