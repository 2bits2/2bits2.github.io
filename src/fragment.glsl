uniform float u_time;
uniform vec2  u_mouse;
varying float v_size;
varying vec2  v_uv;
varying vec4  v_color;

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 d = abs(p - 0.5) * 4.2 - b + vec2(r);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

void main() {
    vec2 mousePos = 0.5 * (u_mouse + vec2(1.0));
    vec2 pixelPos = v_uv;
    vec2  rectSize = vec2(0.8, 0.8);
    float rectRoundness = 1.0;
    float rectBorderSize = 0.0;
    float sdf = sdRoundRect(pixelPos - 0.2 * u_mouse, rectSize, rectRoundness);
    float r = v_uv.x;
    float b = v_uv.y;
    float g = 1.0;
    vec4 color = vec4(r, g, b, 1.0);
    if(v_size < 3.0){
       color = vec4(0.0);
    }
    color = mix(v_color, color, sdf * 0.6);
    gl_FragColor = color;
}
