/* eslint-disable  no-param-reassign */
import {
  PerspectiveCamera,
  Scene,
  BoxBufferGeometry,
  MeshBasicMaterial,
  Mesh,
  WebGLRenderer,
  Color,
} from 'three';

import {
  MagicCircle,
  Layer,
  Folder,
  NumberControl,
  ColorControl,
  ButtonControl,
  BooleanControl,
  TextControl,
} from '@magic-circle/client';

let renderer;
let scene;
let camera;

const boxes = [];
const animation = { x: 0.005, y: 0.01 };

export function setup(gui: MagicCircle) {
  // Create renderer
  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // create camera
  camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 400;

  // Create scene
  scene = new Scene();
  const sceneLayer = new Layer('Scene').addTo(gui.layer);

  let i = 1;
  for (let x = 0; x < 2; x += 1) {
    for (let y = 0; y < 2; y += 1) {
      for (let z = 0; z < 2; z += 1) {
        const geometry = new BoxBufferGeometry(50, 50, 50);
        const material = new MeshBasicMaterial({ color: new Color('#ff0000') });
        const mesh = new Mesh(geometry, material);
        scene.add(mesh);

        mesh.position.x = x * 100;
        mesh.position.y = y * 100;
        mesh.position.z = z * 100;

        const meshLayer = new Layer(`Box ${i}`).addTo(sceneLayer);
        const positionFolder = new Folder('Position').addTo(meshLayer);
        const scaleFolder = new Folder('Scale').addTo(meshLayer);
        const rotationFolder = new Folder('Rotation').addTo(meshLayer);
        const materialFolder = new Folder('Material').addTo(meshLayer);

        positionFolder.add([
          new NumberControl(mesh.position, 'x').range(-200, 200),
          new NumberControl(mesh.position, 'y').range(-200, 200),
          new NumberControl(mesh.position, 'z').range(-200, 200),
        ]);

        scaleFolder.add([
          new NumberControl(mesh.scale, 'x').range(0, 15),
          new NumberControl(mesh.scale, 'y').range(0, 15),
          new NumberControl(mesh.scale, 'z').range(0, 15),
        ]);

        rotationFolder.add([
          new NumberControl(mesh.rotation, 'x').watch(),
          new NumberControl(mesh.rotation, 'y').watch(),
          new NumberControl(mesh.rotation, 'z').watch(),
        ]);

        materialFolder.add([
          new TextControl(material, 'name'),
          new ColorControl(material, 'color').range(1),
          new BooleanControl(material, 'transparent'),
          new NumberControl(material, 'opacity').range(0, 1).stepSize(0.05),
        ]);

        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        i += 1;
        boxes.push(mesh);
      }
    }
  }

  const animationLayer = new Layer('Animation').addTo(gui.layer);
  const animationFolder = new Folder('Rotation').addTo(animationLayer);

  animationFolder.add([
    new NumberControl(animation, 'x').stepSize(0.001),
    new NumberControl(animation, 'y').stepSize(0.001),
    new ButtonControl(gui, 'stop').label('Stop'),
  ]);

  // Save element for screenshots
  return renderer.domElement;
}

export function loop() {
  scene.rotation.x += animation.x;
  scene.rotation.y += animation.y;

  boxes.forEach((mesh) => {
    mesh.rotation.x += animation.x;
    mesh.rotation.y += animation.y;
  });

  renderer.render(scene, camera);
}
