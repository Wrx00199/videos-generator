// shade.js — Port puro Three.js (Linux/RX 550, sem Remotion) de claude-animated-shorts/templates/bridge/{shade,cardshade}.ts
import * as THREE from './lib/three.module.js';

export const TONE = {
  uLitCol:    { value: new THREE.Vector3(1.52, 1.46, 1.34) },
  uShadeCol:  { value: new THREE.Vector3(0.42, 0.42, 0.56) },
  uShadeLift: { value: new THREE.Vector3(0.04, 0.05, 0.10) },
  uLambert:   { value: 0.35 },
  uSideK:     { value: 0.84 },
  uTerm:      { value: 0.20 },
  uBounce:    { value: new THREE.Vector3(0, 0, 0) },
  uSat:       { value: 1.08 },
};

export const CHAR = {
  uCharTint:  { value: new THREE.Vector3(1.0, 0.96, 0.94) },
  uCharShade: { value: 0.86 },
  uGrad:      { value: 0.07 },
  uBodyGrad:  { value: 0.20 },
  uSideTint:  { value: new THREE.Vector3(0.92, 0.90, 0.96) },
};

export const CARD_K = {
  uGradK:  { value: 4.5 },
  uGradKB: { value: 1.5 },
  uTintK:  { value: 0.50 },
  uNorm:   { value: 0.70 },
  uGain:   { value: 1.02 },
  uPx:     { value: 1.0 },
};

export const LFB = THREE.ShaderChunk.lights_fragment_begin
  .replace(
    'directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ]',
    'sunVis = ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ]',
  )
  .replace(
    'vDirectionalShadowCoord[ i ] ) : 1.0;',
    'vDirectionalShadowCoord[ i ] ) : 1.0;\n\t\tdirectLight.color *= sunVis;',
  );

const TWO_TONE = /* glsl */ `
#if NUM_DIR_LIGHTS > 0
{
  vec3 sunV = directionalLights[ 0 ].direction;
  vec3 upV = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );
  float ndl = max( dot( geometryNormal, sunV ), 0.0 );
  float sunTerm = sunVis * smoothstep( 0.0, uTerm, ndl );
  float skyK = mix( uSideK, 1.0, 0.5 + 0.5 * dot( geometryNormal, upV ) );
  vec3 lit = uLitCol * mix( 1.0, ndl, uLambert );
  float facing = max( dot( geometryNormal, geometryViewDir ), 0.0 );
  vec3 alb = max( mix( vec3( dot( diffuseColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) ) ), diffuseColor.rgb, uSat ), 0.0 );
  reflectedLight.directDiffuse = alb * ( mix( uShadeCol, lit, sunTerm ) * skyK + uBounce * facing * clamp( 1.0 - dot( geometryNormal, upV ), 0.0, 1.0 ) * ( 1.0 - sunTerm ) )
    + uShadeLift * LIFT_K * ( 1.0 - sunTerm );
  reflectedLight.indirectDiffuse = vec3( 0.0 );
}
#endif
`;

const DECL_TONE = '#include <common>\nuniform vec3 uLitCol; uniform vec3 uShadeCol; uniform vec3 uShadeLift; uniform float uLambert; uniform float uSideK; uniform float uTerm; uniform vec3 uBounce; uniform float uSat;';

export function twoTone(m, liftK = 1) {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, TONE);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', DECL_TONE + `\n#define LIFT_K ${liftK.toFixed(3)}`)
      .replace('#include <lights_fragment_begin>', 'float sunVis = 1.0;\n' + LFB)
      .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n' + TWO_TONE);
  };
  m.customProgramCacheKey = () => 'nexoTwoTone_' + liftK.toFixed(3);
  return m;
}

const CARD_GLSL = /* glsl */ `
vec3 tintK = mix( vec3( 1.0 ), uCharTint, uTintK );
tintK /= pow( max( dot( tintK, vec3( 0.2126, 0.7152, 0.0722 ) ), 0.2 ), uNorm );
vec3 outgoingLight = diffuseColor.rgb * tintK;
#if NUM_DIR_LIGHTS > 0
{
  vec3 sunV = directionalLights[ 0 ].direction;
  vec3 upV = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );
  float side = sign( sunV.x ) * smoothstep( 0.0, 0.35, abs( sunV.x ) );
  float head = smoothstep( 0.565, 0.60, vMapUv.y );
  float hw = mix( 0.15, 0.20, head );
  float uu = clamp( ( vMapUv.x - 0.5 ) / hw, -1.0, 1.0 ) * sign( dFdx( vMapUv.x ) + 1e-7 );
  float t = uu * side;
  float g = mix( uBodyGrad * uGradKB, min( uGrad * uGradK, 0.38 ), head );
  float dark = smoothstep( -0.15, 0.9, -t );
  vec3 sideK = mix( vec3( 1.0 ), uSideTint, dark * 0.55 );
  float top = 1.0 + 0.05 * clamp( ( vMapUv.y - 0.69 ) / 0.11, -1.0, 1.0 ) * clamp( dot( sunV, upV ) * 2.0, 0.0, 1.0 ) * head;
  float lift = 1.0 + 0.04 * smoothstep( 0.0, 0.9, t );
  outgoingLight *= mix( uCharShade, 1.0, sunVis ) * ( 1.0 - g * dark ) * sideK * top * lift * uGain;
}
#endif
`;

const DECL_CARD = '#include <common>\nuniform vec3 uCharTint; uniform float uCharShade; uniform float uGrad; uniform float uBodyGrad; uniform vec3 uSideTint; uniform float uGradK; uniform float uGradKB; uniform float uTintK; uniform float uNorm; uniform float uGain; uniform float uPx;';

export function cardShade(m) {
  m.emissive.set(0x000000);
  m.emissiveIntensity = 0;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, CHAR, CARD_K);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', DECL_CARD)
      .replace('#include <lights_fragment_begin>', 'float sunVis = 1.0;\n' + LFB)
      .replace('vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;', CARD_GLSL);
  };
  m.customProgramCacheKey = () => 'nexoCardShade1';
  return m;
}

export function blobMaterial(map) {
  return new THREE.MeshBasicMaterial({
    map, transparent: true, depthWrite: false, fog: true,
    blending: THREE.MultiplyBlending,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide,
  });
}

export function syncToneFromLight(L) {
  const isNight = (L.sunI ?? 2) < 0.9;
  const isGolden = !isNight && (L.el ?? 48) < 22;
  if (isNight) {
    TONE.uLitCol.value.set(0.85, 0.92, 1.15);
    TONE.uShadeCol.value.set(0.24, 0.28, 0.44);
    TONE.uShadeLift.value.set(0.03, 0.04, 0.09);
    TONE.uBounce.value.set(0, 0, 0);
    CHAR.uCharTint.value.set(0.84, 0.88, 1.0);
    CHAR.uCharShade.value = 0.84;
  } else if (isGolden) {
    TONE.uLitCol.value.set(1.65, 1.32, 0.98);
    TONE.uShadeCol.value.set(0.36, 0.34, 0.62);
    TONE.uShadeLift.value.set(0.06, 0.05, 0.14);
    TONE.uBounce.value.set(0.22, 0.12, 0.05);
    CHAR.uCharTint.value.set(1.0, 0.90, 0.78);
    CHAR.uCharShade.value = 0.85;
  } else {
    TONE.uLitCol.value.set(1.56, 1.48, 1.33);
    TONE.uShadeCol.value.set(0.42, 0.41, 0.54);
    TONE.uShadeLift.value.set(0.05, 0.06, 0.11);
    TONE.uBounce.value.set(0, 0, 0);
    CHAR.uCharTint.value.set(1.0, 0.97, 0.95);
    CHAR.uCharShade.value = 0.88;
  }
  TONE.uSat.value = L.sat ? Math.max(1.0, Math.min(1.14, L.sat)) : 1.08;
}
