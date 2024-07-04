varying vec2 v_uv;

void main() {
vec4 mvPos = modelViewMatrix * vec4(position.xyz, 1.0);
gl_Position = vec4(position.xyz, 1.0);
v_uv = uv;
}
