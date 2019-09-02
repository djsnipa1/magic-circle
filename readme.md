# Magic Circle

This is my attempt of creating a tool for my creative development needs. It's a multifunctional editor inspired by tools like dat.GUI, Unity and Framer. With this tool I want to enable and promote playfulness and collaboration in creative technology. You don't need to be a coder to improve a piece of creative tech. In fact collaborating with different disciplines might (will!) improve creative tech projects.

I named this tool **Magic Circle**, which is the place where _play_ takes place. In this place the normal rules and reality that guard normal life are suspended. [Read more here](https://uxdesign.cc/why-play-can-improve-the-interdisciplinary-collaboration-in-your-team-8d7fd1ce32f8)

![screenshot here](https://raw.github.com/dpwoert/magic-circle/develop/docs/assets/screenshot.png)

## Features

- **🎛 Custom controls** Enables users to play around with variables. All controls are configurable and adaptable to match (most) data sources.

- **👁‍🗨 Layers** Layers are used to organise all these controls and can mimic the 'scene graph'.

- **📦 Presets & Seeding** Enables to create the exact same scene by saving the values of controls and a _seeding_ value. When a page is reloaded, the last preset is being reapplied.

- **📸 Screenshots** Take screenshots easily and in high quality. Together with a screenshot, the current preset and seed is saved and can be loaded by loading that screenshot. Will also save the current git state, so you can always reproduce that screenshot, even if code has changed.

- **⏲ Performance measurement** Measures and displays performance metrics like Frames Per Second.

- **👐 Touch Bar** Quick actions are possible in the Touch Bar and the live FPS is displayed.

- **🛠 Custom plugins** Since all projects are unique, all projects need custom plugins that might not exists yet. Therefore it is possible to make your own.

## Roadmap

- **⛓ THREEjs helpers** Automatically create controls based upon the THREE.js scene graph.

- **🎹 MIDI** Use a midi controller to play around with variables.

- **🎛 More advanced custom controls** More controls types like images for textures and easing controls.

- **⏰ Animation timeline** Create an animation timeline where controls can be key-framed.

## Requirements

- Mac OSX (Windows and Linux versions might come later)
- NodeJS
- Npm or Yarn

## Install

Install the packages needed locally by using npm or yarn.

```sh
$ npm install @magic-circle/client --save
$ npm install @magic-circle/editor --save-dev
```

If you're not using a package manager for your project it is also possible to install the shell to run the editor globally.

```sh
$ npm install @magic-circle/editor -g
```

## Load front-end

```js
// ES5
// <script type="text/javascript" src="controls.min.js"></script>
var controls = window.controls;

// CommonJS:
const { Controls, Layer, NumberControl } = require('@magic-circle/client');

// ES6:
import { Controls, Layer, NumberControl } from '@magic-circle/client';

// Create instance of Magic Circle client
const controls = new Controls();

controls
  .setup(gui => {
    // Create layer
    const layer = new Layer('Main');

    // Add folder with controls
    layer3.folder(
      'Position',
      new NumberControl(obj3d, 'x').range(-100, 100),
      new NumberControl(obj3d, 'y').range(-100, 100),
      new NumberControl(obj3d, 'z').range(-100, 100)
    );

    // Add layer to UI
    gui.addLayer(layer);
  })
  .loop(delta => {
    // this code will run every frame
  });
```

## Run

```sh
# run with default config, loading index.html as page
$ controls

# run with default config, loading a custom local file path
$ controls --url dist/index.html

# run with custom config, and loading a custom local file path
$ controls --config controls.config.js --url dist/index.html

# run with custom config, and loading a custom url path
$ controls --config controls.config.js --url http://localhost:3000
```

## Settings file

```js
export default {
  // Load list of plugins, first argument is the default list of plugins
  // This list can be filtered and extended with custom plugins.
  plugins: defaultPlugins => [...defaultPlugins],

  // Load custom controls
  controls: defaultControls => [...defaultControls],

  // In case you need to overwrite the standard render function.
  // On default this will render the editor in React
  render: client => { ... },

  // Theming settings
  theme: {
    dark: true,
    accent: 'rgb(136, 74, 255)',
  },

  screen: {
    // Size of screen on load, on default will load with saved size of window
    size: {
      width: 1400,
      height: 768,
    },

    // Enables resizing of window
    enableResize: true,

    // Enables resizing of window to be larger than the size of the screen
    enableLargerThanScreen: false,

    // When enabled prevents sleeping of display
    preventSleep: false,
  },

  // Look at plugin folders for settings of individual plugins
  ...
}
```

## Examples

To run examples:

```sh
# copy repo and open
git clone https://github.com/dpwoert/magic-circle.git && cd magic-circle

# install dependencies
npm run setup:dev

# run examples
npm run example [name]
npm run example simple
npm run example custom-plugin
```

## Core plugins

- **magic-circle/controls** (github / npm)
- **magic-circle/debug** (github / npm)
- **magic-circle/fullscreen** (github / npm)
- **magic-circle/layers** (github / npm)
- **magic-circle/page-information** (github / npm)
- **magic-circle/performance** (github / npm)
- **magic-circle/play-controls** (github / npm)
- **magic-circle/screenshots** (github / npm)
- **magic-circle/seed** (github / npm)
- **magic-circle/touchbar** (github / npm)

## Creating custom plugins

See `docs/creating-plugin.md`
