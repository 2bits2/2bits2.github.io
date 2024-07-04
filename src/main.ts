import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';

function setupThreeScene(app: HTMLDivElement) {
    // some browsers and devices
    // might not support WebGL2
    if(!WebGL.isWebGL2Available()){
        const warning = WebGL.getWebGL2ErrorMessage();
        app.appendChild(warning);
        return;
    }

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    app.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    let aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, -1, 1);
    camera.lookAt(0, 0, 0);

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0x2277ff });

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    scene.add(pointLight);

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 0);

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        aspectRatio = window.innerWidth / window.innerHeight;
        // camera.aspect = aspectRatio;
        camera.updateProjectionMatrix();
    });

    scene.add(cube);

    const animationLoop = (timeStamp) => {
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
    renderer.setAnimationLoop(animationLoop);
}


const app = document.querySelector<HTMLDivElement>('#app')!;
setupThreeScene(app);
