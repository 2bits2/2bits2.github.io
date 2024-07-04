import './style.css'
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';

import * as fragmentShader from './fragment.glsl?raw';
import * as particleVertexShader from './particleVertex.glsl?raw';
import * as simVertexShader from './simVertex.glsl?raw'
import * as simFragmentShader from './simFragment.glsl?raw'

import TextureSimulation from './textureSimulation';

function workspace1(app:HTMLElement,
                    pictures:[string, string, string, string, string, string]) {

    const scrollPositionUniform = {
        value: 0
    };
    let whatImageUniform = {
        value: 0.01
    };
    let isSwitching = {
        value: 1.0
    };

    const timeStampUniform = { value: 0.0 };

    document.addEventListener('scroll', () => {
        let top = document.documentElement.scrollTop;
        var b = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        scrollPositionUniform.value = top / b;

        const numImages = 6;
        const numTransitions = numImages - 1;
        whatImageUniform.value = scrollPositionUniform.value * numTransitions;
        isSwitching.value = Math.cos(whatImageUniform.value * 2.0 * Math.PI);
    })

    const numDimensionsRGBA = 4;
    // the renderer should fill the window
    // and be seen in the document
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    app.appendChild(renderer.domElement);

    // the scene will contain all
    // the 3d objects
    const scene = new THREE.Scene();

    // now we can set some
    // camera settings
    let aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, -1, 1);
    camera.position.set(0, 0, 0.5);
    camera.lookAt(0, 0, 0);

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        aspectRatio = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // create data textures
    const size = 120;
    const data = new Float32Array(size * size * numDimensionsRGBA);
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let i = (col + row * size) * numDimensionsRGBA;
            let angle = Math.random() * 2 * Math.PI;
            let radius = 1.0 + 0.5 * Math.random();
            data[i + 0] = radius * Math.cos(angle);
            data[i + 1] = radius * Math.sin(angle);
            data[i + 2] = 0.0;
            data[i + 3] = 1.0;
        }
    }

    // create info texture
    const info = new Float32Array(size * size * numDimensionsRGBA);
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let i = (col + row * size) * numDimensionsRGBA;
            info[i + 0] = 0.5 + 0.5 * Math.random();
            info[i + 1] = 0.5 + 0.5 * Math.random();
            info[i + 2] = 1.0;
            info[i + 3] = 1.0;
        }
    }

    const infoTexture = new THREE.DataTexture(info, size, size, THREE.RGBAFormat, THREE.FloatType);
    infoTexture.minFilter = THREE.NearestFilter;
    infoTexture.magFilter = THREE.NearestFilter;
    infoTexture.needsUpdate = true;


    const numParticles = size * size;
    const numPosDimensions = 3;
    const numUvDimensions = 2;
    const numParticleSizeDimensions = 2;

    // creating positions and uvs
    // for the particle geometry buffer
    let positions = new Float32Array(numParticles * numPosDimensions);
    let uvs = new Float32Array(numParticles * numUvDimensions);
    let particleSizes = new Float32Array(numParticles * numParticleSizeDimensions);

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let i = col + row * size;
            let posIndex = i * numPosDimensions;
            let uvIndex = i * numUvDimensions;
            positions[posIndex + 0] = Math.random();
            positions[posIndex + 1] = Math.random();
            positions[posIndex + 2] = 0;
            uvs[uvIndex + 0] = row / size;
            uvs[uvIndex + 1] = col / size;
            particleSizes[i * numParticleSizeDimensions] = 0.6 + Math.random() * 10;
            particleSizes[i * numParticleSizeDimensions + 1] = 0.6 + Math.random() * 3;
        }
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const planeIntersection = new THREE.Vector2();

    // track mouse position
    document.addEventListener('mousemove', (e) => {
        pointer.x = (e.clientX / window.innerWidth) * 2.0 - 1.0;
        pointer.y = -(e.clientY / window.innerHeight) * 2.0 + 1.0;
        raycaster.setFromCamera(pointer.clone(), camera);
        var intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length) {
            planeIntersection.x = intersects[0].point.x;
            planeIntersection.y = intersects[0].point.y;
        }
    });

    // create the buffer
    // with the new attributes
    let bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute("position", new THREE.BufferAttribute(positions, numPosDimensions));
    bufferGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, numUvDimensions));
    bufferGeometry.setAttribute("mysize", new THREE.BufferAttribute(particleSizes, numParticleSizeDimensions));

    const textureLoader = new THREE.TextureLoader();
    const imgTextures = pictures.map(val => textureLoader.load(val));

    const material = new THREE.ShaderMaterial({
        transparent: true,
        vertexShader: particleVertexShader.default,
        fragmentShader: fragmentShader.default,
        uniforms: {
            u_mouse: { value: planeIntersection },
            u_time: timeStampUniform,
            u_positions: { value: null },
            u_images: { value: imgTextures },
            u_whatImage: whatImageUniform
        }
    });

    const points = new THREE.Points(bufferGeometry, material)
    scene.add(points);

    let textureSimulationUniforms = {
        u_mouse: { value: planeIntersection },
        u_info: { value: infoTexture },
        u_time: timeStampUniform,
        u_isSwitching: isSwitching
    };

    let textureSimulation = new TextureSimulation(
        simVertexShader.default,
        simFragmentShader.default,
        data,
        size,
        textureSimulationUniforms
    );

    const animationLoop = (timeStamp:number) => {
        timeStampUniform.value = timeStamp / 1000;
        textureSimulation.update(renderer, material.uniforms.u_positions);
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animationLoop);
}


const app = document.querySelector<HTMLDivElement>('#app')!;

workspace1(app,
    [
        "/vite.svg",
        "/src/typescript.svg",
        "/vite.svg",
        "/src/typescript.svg",
        "/vite.svg",
        "/src/typescript.svg",
]
);
