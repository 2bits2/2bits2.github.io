import * as THREE from 'three';
export default class TextureSimulation {
    renderTarget1: THREE.WebGLRenderTarget;
    renderTarget2: THREE.WebGLRenderTarget;
    scene: THREE.Scene;
    camera: THREE.Camera;
    material: THREE.ShaderMaterial;

    constructor(simVertexShader:string,
                simFragmentShader:string,
                data,
                size:number,
                uniforms) {

        // we will have render targets
        // that will not be visible for the user
        // but used to calculate a texture (invisibly)
        // to drive a simulation
        // for this we need double buffering
        this.renderTarget1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType
        });

        this.renderTarget2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType
        });

        // this scene will not be seen
        // but the texture that will be secretly
        // rendered in it, will contain information
        // for the shader that is responsible for the simulation
        this.scene = new THREE.Scene();

        const geometry = new THREE.PlaneGeometry(2, 2);
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
        this.camera.position.set(0, 0, 0.5);
        this.camera.lookAt(0, 0, 0);

        // the texture will be updated
        // very often as it is used for
        // simulation
        const fbo_texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
        fbo_texture.minFilter = THREE.NearestFilter;
        fbo_texture.magFilter = THREE.NearestFilter;
        fbo_texture.needsUpdate = true;

        this.material = new THREE.ShaderMaterial({
            vertexShader: simVertexShader,
            fragmentShader: simFragmentShader,
            uniforms: uniforms
        });
        this.material.uniforms.u_positions = {value: fbo_texture};

        const fbo_mesh = new THREE.Mesh(geometry, this.material);

        this.scene.add(fbo_mesh);
    }

    update(renderer, output_texture_uniform){
        // to update
        renderer.setRenderTarget(this.renderTarget1);
        renderer.render(this.scene, this.camera);

        // calculate the results for the simulation
        this.material.uniforms.u_positions.value = this.renderTarget1.texture;

        // output the results from the previous simulation
        // step for rendering
        output_texture_uniform.value = this.renderTarget2.texture;

        let tmp = this.renderTarget1;
        this.renderTarget1 = this.renderTarget2;
        this.renderTarget2 = tmp;
    }

}
