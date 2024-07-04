varying vec2 v_uv;
uniform sampler2D u_positions;
uniform sampler2D u_images[6];

uniform float u_time;
uniform float u_whatImage;

attribute vec2 mysize;

varying float v_size;
varying vec4 v_color;

void main() {
  vec4 pos = texture2D(u_positions, uv);

  // u_whatImage determines which
  // image to draw
  float index1 = floor(u_whatImage);
  float index2 = mod(ceil(u_whatImage), 6.0);
  float factor = u_whatImage - index1;

  vec4 imageValues[6];
  imageValues[0] =  texture2D(u_images[0], uv);
  imageValues[1] =  texture2D(u_images[1], uv);
  imageValues[2] =  texture2D(u_images[2], uv);
  imageValues[3] =  texture2D(u_images[3], uv);
  imageValues[4] =  texture2D(u_images[4], uv);
  imageValues[5] =  texture2D(u_images[5], uv);

  vec4 img1 = imageValues[int(index1)];
  vec4 img2 = imageValues[int(index2)];
  vec4 img =  mix(img1, img2, factor);

  v_color = img;
  v_size  = 10.5  * img.x;
  v_uv = uv;

  vec4 mvPos = modelViewMatrix * vec4(pos.xyz, 1.0);
  gl_PointSize = v_size / (1. / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}
