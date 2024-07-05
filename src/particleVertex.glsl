uniform sampler2D u_positions;
uniform sampler2D u_useTextures[2];
uniform float     u_textureFactor;
uniform float     u_time;
uniform float     u_whatImage;
varying float     v_size;
varying vec4      v_color;
varying vec2      v_uv;

void main() {
  vec4 pos  = texture2D(u_positions, uv);
  vec4 img1 = texture2D(u_useTextures[0], uv);
  vec4 img2 = texture2D(u_useTextures[1], uv);
  vec4 img  =  mix(img1, img2, u_textureFactor);

  v_color = img;
  v_size  = 10.5  * img.x;
  v_uv = uv;

  vec4 mvPos = modelViewMatrix * vec4(pos.xyz, 1.0);
  gl_PointSize = v_size / (1. / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}
