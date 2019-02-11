#!/usr/bin/env node
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const buildDir = 'build/CreativeControls-darwin-x64/CreativeControls.app/';
const buildPath = path.join(
  __dirname,
  buildDir,
  'Contents/Resources/app',
  'settings.build.js'
);

const args = {};
args.cwd = process.cwd();
args.url = argv.url || argv.u;
args.clear = argv.c || argv.clear;
args.debug = argv.d || argv.debug;
args.settings = args.debug
  ? path.join(process.cwd(), '.settings.build.js')
  : buildPath;

const argsStr = Object.keys(args)
  .filter(key => args[key])
  .map(key => {
    if (args[key] === true) {
      return `--${key}`;
    }
    return `--${key} ${args[key]}`;
  })
  .join(' ');

// compile settings
async function build() {
  try {
    const config = argv.config || argv.c;
    const configFile = config
      ? `${process.cwd()}/${config}`
      : `${__dirname}/src/default-settings.js`;

    // create a bundle
    const bundle = await rollup.rollup({
      input: configFile,
      external: ['styled-components', 'fs', 'react', 'react-dom', 'react-is'],
      plugins: [
        resolve({
          browser: true,
          customResolveOptions: {
            moduleDirectory: path.join(process.cwd(), 'node_modules'),
          },
        }),
        commonjs(),
      ],
    });

    await bundle.write({
      file: buildPath,
      format: 'cjs',
    });

    // execute
    const cmd = args.debug
      ? 'electron'
      : path.join(__dirname, buildDir, 'Contents/MacOS/CreativeControls');
    const run = exec(`${cmd} src/app.js ${argsStr}`, {
      cwd: __dirname,
    });

    // log
    run.stdout.on('data', data => {
      process.stdout.write(data);
    });
    run.stderr.on('data', data => {
      process.stdout.write(`⚠️  ${data}`);
    });

    // waiting to be done
    run.on('close', () => {
      console.info('👋  closing creative controls');

      // delete sync file again if needed
      if (args.debug) {
        fs.unlinkSync(path.join(process.cwd(), '.settings.build.js'));
      }
    });
  } catch (e) {
    console.error(e);
    process.exit();
  }
}

build();
