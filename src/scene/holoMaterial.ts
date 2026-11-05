import { AdditiveBlending, Color, DoubleSide, ShaderMaterial, Vector3 } from 'three'

/** Holographic x-ray material: fresnel rim, contour lines, moving scan band, hot-spot glow, focus dimming. */
export function makeHoloMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: -0.1 }, // body-local height revealed from the top down (boot scan)
      uColor: { value: new Color('#5ef6ff') },
      uHotColor: { value: new Color('#f3e600') },
      uHotPos: { value: new Vector3(0, -10, 0) },
      uHot: { value: 0 },
      uFocusPos: { value: new Vector3() },
      uFocus: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vView; varying vec3 vLocal; varying vec3 vWorld;
      void main() {
        vLocal = position;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uReveal, uHot, uFocus;
      uniform vec3 uColor, uHotColor, uHotPos, uFocusPos;
      varying vec3 vN; varying vec3 vView; varying vec3 vLocal; varying vec3 vWorld;
      void main() {
        float top = 1.72 - vLocal.y;
        if (top > uReveal) discard;
        float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 2.4);
        float contour = smoothstep(0.86, 1.0, fract(vLocal.y * 70.0)) * 0.10;
        float band = exp(-pow((fract(vLocal.y * 0.45 - uTime * 0.12) - 0.5) * 22.0, 2.0)) * 0.35;
        float flick = 0.94 + 0.06 * sin(uTime * 37.0 + vLocal.y * 9.0);
        float a = (fres * 0.85 + contour + band * (0.2 + fres) + 0.012) * flick;
        vec3 col = uColor * a;
        float hot = uHot * smoothstep(0.11, 0.0, distance(vWorld, uHotPos));
        col = mix(col, uHotColor * (0.35 + fres * 1.4), hot);
        float dim = mix(1.0, 0.12 + 0.88 * smoothstep(0.45, 0.08, distance(vWorld, uFocusPos)), uFocus);
        float edge = smoothstep(0.03, 0.0, abs(top - uReveal)) * step(uReveal, 1.8);
        col += uHotColor * edge * 1.5;
        gl_FragColor = vec4(col * dim, 1.0);
      }`,
  })
}
