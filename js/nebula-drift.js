/* ── Nebula Drift — lavender fluid background ──
   Vanilla JS port of the Originkit NebulaDrift React component.
   Full-page fixed background: GPU fluid sim + drifting particles. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Lavender palette */
  var COLORS = {
    slow:  '#2e1a47',  // deep violet — low-energy dye / slow particles
    fast:  '#b57edc',  // lavender — high-energy dye / fast particles
    glint: '#e6d6fa'   // pale lavender-white — sparks
  };
  var BACKGROUND = '#0a0a0c';

  var PARTICLES = { count: 6, size: 1, inertia: 0 };
  var DYE = { show: true, fade: 5 };
  var STRENGTH = 5;
  var ITERATIONS = 16;
  var DETAIL = 4.5;

  var CELL_SIZE = 32;
  var DYE_DECAY = [0.9797, 0.9494, 0.9696];
  var VELOCITY_DECAY = 0.999;
  var GLINT_SCALE = 0.1;
  var DYE_HIGH_SCALE = 3.34;
  var DYE_LOW_SCALE = 0.6;
  var PARTICLE_EXP_MIN = 7;
  var PARTICLE_EXP_MAX = 10;
  var FLUID_DIVISOR_MAX = 6;
  var FLUID_DIVISOR_MIN = 2;
  var GRID_MAX = 1024;
  var DPR_CAP = 2;
  var STIR_STROKE = 0.55;
  var STIR_PAUSE_MIN = 0.9;
  var STIR_PAUSE_MAX = 2.2;
  var HOVER_HOLD = 400;

  var STEP = 1 / 60;
  var WARMUP = 240;
  var STILL_WARMUP = 260;

  function nowMs() {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  var parseCtx = undefined;
  function toRGB(css) {
    if (!css) return [0, 0, 0];
    var s = css.trim();
    var hex = /^#([0-9a-f]{3,8})$/i.exec(s);
    if (hex) {
      var h = hex[1];
      if (h.length === 3 || h.length === 4) {
        h = h.split('').map(function (c) { return c + c; }).join('');
      }
      var n = parseInt(h.slice(0, 6), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }
    var fn = /^rgba?\(([^)]+)\)$/i.exec(s);
    if (fn) {
      var parts = fn[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3);
      var v = parts.map(function (x) {
        return x.indexOf('%') >= 0 ? parseFloat(x) * 2.55 : parseFloat(x);
      });
      return [(v[0] || 0) / 255, (v[1] || 0) / 255, (v[2] || 0) / 255];
    }
    if (typeof document !== 'undefined') {
      if (parseCtx === undefined) {
        parseCtx = document.createElement('canvas').getContext('2d');
      }
      if (parseCtx) {
        parseCtx.fillStyle = '#000000';
        parseCtx.fillStyle = s;
        var out = parseCtx.fillStyle;
        if (typeof out === 'string' && out.charAt(0) === '#' && out !== s) {
          return toRGB(out);
        }
      }
    }
    return [0, 0, 0];
  }

  function particleSide(count) {
    var t = Math.min(10, Math.max(0, count)) / 10;
    var exp = PARTICLE_EXP_MIN + t * (PARTICLE_EXP_MAX - PARTICLE_EXP_MIN);
    return Math.max(16, Math.round(Math.pow(2, exp) / 16) * 16);
  }
  function fluidScale(detail) {
    var t = Math.min(10, Math.max(0, detail)) / 10;
    return 1 / (FLUID_DIVISOR_MAX - t * (FLUID_DIVISOR_MAX - FLUID_DIVISOR_MIN));
  }
  function decayFor(perFrame, dt, scale) {
    return Math.pow(perFrame, scale * dt * 60);
  }

  /* ── Shaders ── */
  var FLUID_VERT = [
    'attribute vec2 vertexPosition;',
    'uniform float aspectRatio;',
    'varying vec2 texelCoord;',
    'varying vec2 p;',
    'void main() {',
    '    texelCoord = vertexPosition;',
    '    vec2 clipSpace = 2.0 * texelCoord - 1.0;',
    '    p = vec2(clipSpace.x * aspectRatio, clipSpace.y);',
    '    gl_Position = vec4(clipSpace, 0.0, 1.0);',
    '}'
  ].join('\n');

  var PLANE_VERT = [
    'attribute vec2 vertexPosition;',
    'varying vec2 texelCoord;',
    'void main() {',
    '    texelCoord = vertexPosition;',
    '    gl_Position = vec4(vertexPosition * 2.0 - vec2(1.0, 1.0), 0.0, 1.0);',
    '}'
  ].join('\n');

  var FLUID_BASE = [
    '#define PRESSURE_BOUNDARY',
    '#define VELOCITY_BOUNDARY',
    '',
    'uniform vec2 invresolution;',
    'uniform float aspectRatio;',
    'varying vec2 texelCoord;',
    'varying vec2 p;',
    '',
    'vec2 clipToSimSpace(vec2 clipSpace){',
    '    return vec2(clipSpace.x * aspectRatio, clipSpace.y);',
    '}',
    'vec2 simToTexelSpace(vec2 simSpace){',
    '    return vec2(simSpace.x / aspectRatio + 1.0, simSpace.y + 1.0) * .5;',
    '}',
    'float samplePressue(sampler2D pressure, vec2 coord){',
    '    vec2 cellOffset = vec2(0.0, 0.0);',
    '    #ifdef PRESSURE_BOUNDARY',
    '    if(coord.x < 0.0)      cellOffset.x = 1.0;',
    '    else if(coord.x > 1.0) cellOffset.x = -1.0;',
    '    if(coord.y < 0.0)      cellOffset.y = 1.0;',
    '    else if(coord.y > 1.0) cellOffset.y = -1.0;',
    '    #endif',
    '    return texture2D(pressure, coord + cellOffset * invresolution).x;',
    '}',
    'vec2 sampleVelocity(sampler2D velocity, vec2 coord){',
    '    vec2 cellOffset = vec2(0.0, 0.0);',
    '    vec2 multiplier = vec2(1.0, 1.0);',
    '    #ifdef VELOCITY_BOUNDARY',
    '    if(coord.x < 0.0){',
    '        cellOffset.x = 1.0;',
    '        multiplier.x = -1.0;',
    '    }else if(coord.x > 1.0){',
    '        cellOffset.x = -1.0;',
    '        multiplier.x = -1.0;',
    '    }',
    '    if(coord.y < 0.0){',
    '        cellOffset.y = 1.0;',
    '        multiplier.y = -1.0;',
    '    }else if(coord.y > 1.0){',
    '        cellOffset.y = -1.0;',
    '        multiplier.y = -1.0;',
    '    }',
    '    #endif',
    '    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;',
    '}'
  ].join('\n');

  var GEOM = [
    'float distanceToSegment(vec2 a, vec2 b, vec2 p, out float fp){',
    '    vec2 d = p - a;',
    '    vec2 x = b - a;',
    '    fp = 0.0;',
    '    float lx = length(x);',
    '    if(lx <= 0.0001) return length(d);',
    '    float projection = dot(d, x / lx);',
    '    fp = projection / lx;',
    '    if(projection < 0.0)            return length(d);',
    '    else if(projection > length(x)) return length(p - b);',
    '    return sqrt(abs(dot(d, d) - projection * projection));',
    '}'
  ].join('\n');

  var ADVECT = FLUID_BASE + '\n' + [
    'uniform sampler2D velocity;',
    'uniform sampler2D target;',
    'uniform float dt;',
    'uniform float rdx;',
    '',
    'void main(void){',
    '    vec2 tracedPos = p - dt * rdx * texture2D(velocity, texelCoord).xy;',
    '    tracedPos = simToTexelSpace(tracedPos) / invresolution;',
    '    vec4 st;',
    '    st.xy = floor(tracedPos - .5) + .5;',
    '    st.zw = st.xy + 1.;',
    '    vec2 t = tracedPos - st.xy;',
    '    st *= invresolution.xyxy;',
    '    vec4 tex11 = texture2D(target, st.xy);',
    '    vec4 tex21 = texture2D(target, st.zy);',
    '    vec4 tex12 = texture2D(target, st.xw);',
    '    vec4 tex22 = texture2D(target, st.zw);',
    '    gl_FragColor = mix(mix(tex11, tex21, t.x), mix(tex12, tex22, t.x), t.y);',
    '}'
  ].join('\n');

  var DIVERGENCE = FLUID_BASE + '\n' + [
    'uniform sampler2D velocity;',
    'uniform float halfrdx;',
    '',
    'void main(void){',
    '    vec2 L = sampleVelocity(velocity, texelCoord - vec2(invresolution.x, 0));',
    '    vec2 R = sampleVelocity(velocity, texelCoord + vec2(invresolution.x, 0));',
    '    vec2 B = sampleVelocity(velocity, texelCoord - vec2(0, invresolution.y));',
    '    vec2 T = sampleVelocity(velocity, texelCoord + vec2(0, invresolution.y));',
    '    gl_FragColor = vec4(halfrdx * ((R.x - L.x) + (T.y - B.y)), 0, 0, 1);',
    '}'
  ].join('\n');

  var PRESSURE_SOLVE = FLUID_BASE + '\n' + [
    'uniform sampler2D pressure;',
    'uniform sampler2D divergence;',
    'uniform float alpha;',
    '',
    'void main(void){',
    '    float L = samplePressue(pressure, texelCoord - vec2(invresolution.x, 0));',
    '    float R = samplePressue(pressure, texelCoord + vec2(invresolution.x, 0));',
    '    float B = samplePressue(pressure, texelCoord - vec2(0, invresolution.y));',
    '    float T = samplePressue(pressure, texelCoord + vec2(0, invresolution.y));',
    '    float bC = texture2D(divergence, texelCoord).x;',
    '    gl_FragColor = vec4((L + R + B + T + alpha * bC) * .25, 0, 0, 1);',
    '}'
  ].join('\n');

  var PRESSURE_GRADIENT = FLUID_BASE + '\n' + [
    'uniform sampler2D pressure;',
    'uniform sampler2D velocity;',
    'uniform float halfrdx;',
    '',
    'void main(void){',
    '    float L = samplePressue(pressure, texelCoord - vec2(invresolution.x, 0));',
    '    float R = samplePressue(pressure, texelCoord + vec2(invresolution.x, 0));',
    '    float B = samplePressue(pressure, texelCoord - vec2(0, invresolution.y));',
    '    float T = samplePressue(pressure, texelCoord + vec2(0, invresolution.y));',
    '    vec2 v = texture2D(velocity, texelCoord).xy;',
    '    gl_FragColor = vec4(v - halfrdx * vec2(R - L, T - B), 0, 1);',
    '}'
  ].join('\n');

  var MOUSE_FORCE = FLUID_BASE + '\n' + GEOM + '\n' + [
    'uniform sampler2D velocity;',
    'uniform float dt;',
    'uniform float dx;',
    'uniform float uDecay;',
    'uniform float uStrength;',
    'uniform float isMouseDown;',
    'uniform vec2 mouseClipSpace;',
    'uniform vec2 lastMouseClipSpace;',
    '',
    'void main(){',
    '    vec2 v = texture2D(velocity, texelCoord).xy;',
    '    v.xy *= uDecay;',
    '    if(isMouseDown > 0.5){',
    '        vec2 mouse = clipToSimSpace(mouseClipSpace);',
    '        vec2 lastMouse = clipToSimSpace(lastMouseClipSpace);',
    '        vec2 mouseVelocity = -(lastMouse - mouse) / dt;',
    '        float fp;',
    '        float l = distanceToSegment(mouse, lastMouse, p, fp);',
    '        float taperFactor = 0.6;',
    '        float projectedFraction = 1.0 - clamp(fp, 0.0, 1.0) * taperFactor;',
    '        float R = 0.015;',
    '        float m = exp(-l / R);',
    '        m *= projectedFraction * projectedFraction;',
    '        vec2 targetVelocity = mouseVelocity * dx * uStrength;',
    '        v += (targetVelocity - v) * m;',
    '    }',
    '    gl_FragColor = vec4(v, 0, 1.);',
    '}'
  ].join('\n');

  var MOUSE_DYE = FLUID_BASE + '\n' + GEOM + '\n' + [
    'uniform sampler2D dye;',
    'uniform float dt;',
    'uniform float dx;',
    'uniform vec3 uDecay;',
    'uniform vec3 uLow;',
    'uniform vec3 uHigh;',
    'uniform vec3 uGlint;',
    'uniform float isMouseDown;',
    'uniform vec2 mouseClipSpace;',
    'uniform vec2 lastMouseClipSpace;',
    '',
    'void main(){',
    '    vec4 color = texture2D(dye, texelCoord);',
    '    color.rgb *= uDecay;',
    '    if(isMouseDown > 0.5){',
    '        vec2 mouse = clipToSimSpace(mouseClipSpace);',
    '        vec2 lastMouse = clipToSimSpace(lastMouseClipSpace);',
    '        vec2 mouseVelocity = -(lastMouse - mouse) / dt;',
    '        float fp;',
    '        float l = distanceToSegment(mouse, lastMouse, p, fp);',
    '        float taperFactor = 0.6;',
    '        float projectedFraction = 1.0 - clamp(fp, 0.0, 1.0) * taperFactor;',
    '        float R = 0.025;',
    '        float m = exp(-l / R);',
    '        float speed = length(mouseVelocity);',
    '        float x = clamp((speed * speed * 0.02 - l * 5.0) * projectedFraction, 0., 1.);',
    '        color.rgb += m * (mix(uLow, uHigh, x) + uGlint * pow(x, 9.));',
    '    }',
    '    gl_FragColor = vec4(color.rgb, 1.0);',
    '}'
  ].join('\n');

  var PARTICLE_INIT = [
    'varying vec2 texelCoord;',
    'uniform float cellSize;',
    'float hash21(vec2 p) {',
    '    p = fract(p * vec2(123.34, 456.21));',
    '    p += dot(p, p + 45.32);',
    '    return fract(p.x * p.y);',
    '}',
    'void main(){',
    '    vec2 jitter = vec2(hash21(texelCoord), hash21(texelCoord + 7.31)) * cellSize;',
    '    vec2 ip = vec2((texelCoord.x), (texelCoord.y)) * 2.0 - 1.0 + jitter * 2.0;',
    '    vec2 iv = vec2(0, 0);',
    '    gl_FragColor = vec4(ip, iv);',
    '}'
  ].join('\n');

  var PARTICLE_STEP = [
    'varying vec2 texelCoord;',
    'uniform float dt;',
    'uniform sampler2D particleData;',
    'uniform float dragCoefficient;',
    'uniform vec2 flowScale;',
    'uniform sampler2D flowVelocityField;',
    '',
    'void main(){',
    '    vec2 p = texture2D(particleData, texelCoord).xy;',
    '    vec2 v = texture2D(particleData, texelCoord).zw;',
    '    vec2 vf = texture2D(flowVelocityField, (p + 1.) * .5).xy * flowScale;',
    '    v += (vf - v) * dragCoefficient;',
    '    p += dt * v;',
    '    gl_FragColor = vec4(p, v);',
    '}'
  ].join('\n');

  var GLINT_LITERAL = GLINT_SCALE.toFixed(2);
  var PARTICLE_VERT = [
    'precision highp float;',
    'precision highp sampler2D;',
    'uniform sampler2D particleData;',
    'uniform float uPointSize;',
    'uniform vec3 uSlow;',
    'uniform vec3 uFast;',
    'uniform vec3 uGlint;',
    'attribute vec2 particleUV;',
    'varying vec4 color;',
    'void main(){',
    '    vec2 p = texture2D(particleData, particleUV).xy;',
    '    vec2 v = texture2D(particleData, particleUV).zw;',
    '    gl_PointSize = uPointSize;',
    '    gl_Position = vec4(p, 0.0, 1.0);',
    '    float speed = length(v);',
    '    float x = clamp(speed * 4.0, 0., 1.);',
    '    color.rgb = (mix(uSlow, uFast, x) + uGlint * x * x * x * ' + GLINT_LITERAL + ');',
    '    color.a = 1.0;',
    '}'
  ].join('\n');

  var PARTICLE_FRAG = [
    'varying vec4 color;',
    'void main(){',
    '    gl_FragColor = vec4(color);',
    '}'
  ].join('\n');

  var QUAD_TEXTURE = [
    'uniform sampler2D texture;',
    'varying vec2 texelCoord;',
    '',
    'void main(void){',
    '    gl_FragColor = abs(texture2D(texture, texelCoord));',
    '}'
  ].join('\n');

  /* ── GL helpers ── */
  var RGBA16F = 0x881a;
  var RGBA32F = 0x8814;
  var HALF_FLOAT = 0x140b;

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function makeProgram(gl, vert, frag, prelude, attrib) {
    var vs = compile(gl, gl.VERTEX_SHADER, vert);
    var fs = compile(gl, gl.FRAGMENT_SHADER, prelude + frag);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    if (!prog) return null;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, attrib);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return null;
    }
    var uni = {};
    var n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var info = gl.getActiveUniform(prog, i);
      if (!info) continue;
      var loc = gl.getUniformLocation(prog, info.name);
      uni[info.name] = loc;
      uni[info.name.replace(/\[0\]$/, '')] = loc;
    }
    return { prog: prog, uni: uni };
  }

  function makeFBO(gl, w, h, fmt, linear) {
    var tex = gl.createTexture();
    var fbo = gl.createFramebuffer();
    if (!tex || !fbo) return null;
    var filter = linear && fmt.linear ? gl.LINEAR : gl.NEAREST;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internal, w, h, 0, gl.RGBA, fmt.type, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.deleteTexture(tex);
      gl.deleteFramebuffer(fbo);
      return null;
    }
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex: tex, fbo: fbo, w: w, h: h };
  }

  function pickFormat(gl, gl2) {
    var tries = [];
    if (gl2) {
      var cbf = gl.getExtension('EXT_color_buffer_float');
      var cbh = gl.getExtension('EXT_color_buffer_half_float');
      var fl = gl.getExtension('OES_texture_float_linear');
      if (cbf && fl) tries.push({ internal: RGBA32F, type: gl.FLOAT, linear: true });
      if (cbf) tries.push({ internal: RGBA32F, type: gl.FLOAT, linear: false });
      if (cbf || cbh) tries.push({ internal: RGBA16F, type: HALF_FLOAT, linear: true });
    } else {
      var f = gl.getExtension('OES_texture_float');
      var fl1 = gl.getExtension('OES_texture_float_linear');
      var hf = gl.getExtension('OES_texture_half_float');
      var hfl = gl.getExtension('OES_texture_half_float_linear');
      if (f && fl1) tries.push({ internal: gl.RGBA, type: gl.FLOAT, linear: true });
      if (f) tries.push({ internal: gl.RGBA, type: gl.FLOAT, linear: false });
      if (hf && hfl) tries.push({ internal: gl.RGBA, type: hf.HALF_FLOAT_OES, linear: true });
      if (hf) tries.push({ internal: gl.RGBA, type: hf.HALF_FLOAT_OES, linear: false });
    }
    for (var i = 0; i < tries.length; i++) {
      var probe = makeFBO(gl, 4, 4, tries[i]);
      if (probe) {
        gl.deleteTexture(probe.tex);
        gl.deleteFramebuffer(probe.fbo);
        return tries[i];
      }
    }
    return null;
  }

  /* ── Main init ── */
  function start() {
    var canvas = document.getElementById('nebula-canvas');
    if (!canvas) return;
    if (reduced) {
      // Calm static lavender veil instead of the animated sim
      canvas.style.background =
        'radial-gradient(120% 100% at 50% 50%, rgba(181,126,220,0.10), rgba(46,26,71,0.12), transparent 70%)';
      return;
    }

    var host = canvas.parentElement || document.body;
    var disposed = false;
    var raf = 0;
    var gl = null;
    var fmt = null;

    var progs = {};
    var quad = null;
    var particleUVs = null;

    var velocity = null, pressure = null, dyeRT = null, particleData = null, divergence = null;
    var gridW = 0, gridH = 0, aspect = 1;
    var partSide = 0, partCount = 0, maxPoint = 1, dpr = 1;
    var onScreen = true, pageVisible = true, warmed = false;
    var ptrDrove = false;
    var elapsed = 0, lastNow = 0;

    /* Shared with the window-level pointer tracker so mouse movement stirs the fluid */
    var pointer = window.__nebulaPointer || (window.__nebulaPointer = { x: 0, y: 0, lastX: 0, lastY: 0, over: false, moveAt: 0, known: false });

    var stroke = { fromX: 0, fromY: 0, toX: 0, toY: 0, start: 0, end: 0, next: 0, live: false };

    function use(p) { gl.useProgram(p.prog); }
    function u1f(p, n, v) { var l = p.uni[n]; if (l) gl.uniform1f(l, v); }
    function u2f(p, n, a, b) { var l = p.uni[n]; if (l) gl.uniform2f(l, a, b); }
    function u3f(p, n, v) { var l = p.uni[n]; if (l) gl.uniform3f(l, v[0], v[1], v[2]); }
    function bindTex(p, n, t, unit) {
      var l = p.uni[n];
      if (!l) return;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform1i(l, unit);
    }
    function fluidUniforms(p) {
      u2f(p, 'invresolution', 1 / gridW, 1 / gridH);
      u1f(p, 'aspectRatio', aspect);
    }
    function mouseUniforms(p, down) {
      u1f(p, 'isMouseDown', down ? 1 : 0);
      u2f(p, 'mouseClipSpace', pointer.x, pointer.y);
      u2f(p, 'lastMouseClipSpace', pointer.lastX, pointer.lastY);
    }
    function bindQuad() {
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    }
    function bindParticleUVs() {
      gl.bindBuffer(gl.ARRAY_BUFFER, particleUVs);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    }
    function target(t) {
      if (t) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
        gl.viewport(0, 0, t.w, t.h);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }
    function blit(t) {
      target(t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function swap(p) {
      var t = p.read;
      p.read = p.write;
      p.write = t;
    }
    function dropFBO(f) {
      if (!f || !gl) return;
      gl.deleteTexture(f.tex);
      gl.deleteFramebuffer(f.fbo);
    }
    function dropPair(p) {
      if (!p) return;
      dropFBO(p.read);
      dropFBO(p.write);
    }
    function dropFluid() {
      dropPair(velocity);
      dropPair(pressure);
      dropPair(dyeRT);
      dropFBO(divergence);
      velocity = pressure = dyeRT = null;
      divergence = null;
      gridW = gridH = 0;
    }
    function dropParticles() {
      dropPair(particleData);
      particleData = null;
      if (gl && particleUVs) gl.deleteBuffer(particleUVs);
      particleUVs = null;
      partSide = partCount = 0;
    }

    function init() {
      var opts = {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance'
      };
      var gl2 = true;
      var ctx = canvas.getContext('webgl2', opts);
      if (!ctx) {
        gl2 = false;
        ctx = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl');
      }
      if (!ctx) return false;
      gl = ctx;

      var vtf = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
      if (!vtf || vtf < 1) return false;

      fmt = pickFormat(gl, gl2);
      if (!fmt) return false;

      var range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
      maxPoint = range && range.length > 1 ? range[1] : 1;

      var hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      var prelude = 'precision ' + (hp && hp.precision > 0 ? 'highp' : 'mediump') + ' float;\n';

      var fluidPasses = {
        advect: ADVECT,
        divergence: DIVERGENCE,
        pressureSolve: PRESSURE_SOLVE,
        pressureGradient: PRESSURE_GRADIENT,
        mouseForce: MOUSE_FORCE,
        mouseDye: MOUSE_DYE
      };
      progs = {};
      for (var key in fluidPasses) {
        var p = makeProgram(gl, FLUID_VERT, fluidPasses[key], prelude, 'vertexPosition');
        if (!p) return false;
        progs[key] = p;
      }
      var planePasses = {
        particleInit: PARTICLE_INIT,
        particleStep: PARTICLE_STEP,
        screenTexture: QUAD_TEXTURE
      };
      for (var key2 in planePasses) {
        var p2 = makeProgram(gl, PLANE_VERT, planePasses[key2], prelude, 'vertexPosition');
        if (!p2) return false;
        progs[key2] = p2;
      }
      var pt = makeProgram(gl, PARTICLE_VERT, PARTICLE_FRAG, prelude, 'particleUV');
      if (!pt) return false;
      progs.particleRender = pt;

      quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.disable(gl.DITHER);
      return true;
    }

    function buildFluid(w, h) {
      if (!gl || !fmt) return;
      dropFluid();
      gridW = w;
      gridH = h;
      aspect = w / h;
      var va = makeFBO(gl, w, h, fmt);
      var vb = makeFBO(gl, w, h, fmt);
      var pa = makeFBO(gl, w, h, fmt);
      var pb = makeFBO(gl, w, h, fmt);
      var da = makeFBO(gl, w, h, fmt, true);
      var db = makeFBO(gl, w, h, fmt, true);
      divergence = makeFBO(gl, w, h, fmt);
      if (!va || !vb || !pa || !pb || !da || !db || !divergence) return;
      velocity = { read: va, write: vb };
      pressure = { read: pa, write: pb };
      dyeRT = { read: da, write: db };
      warmed = false;
    }

    function buildParticles(side) {
      if (!gl || !fmt) return;
      dropParticles();
      partSide = side;
      partCount = side * side;
      var pa = makeFBO(gl, side, side, fmt);
      var pb = makeFBO(gl, side, side, fmt);
      if (!pa || !pb) return;
      particleData = { read: pa, write: pb };

      var uvs = new Float32Array(partCount * 2);
      for (var i = 0; i < side; i++) {
        for (var j = 0; j < side; j++) {
          var k = (i * side + j) * 2;
          uvs[k] = i / side;
          uvs[k + 1] = j / side;
        }
      }
      particleUVs = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, particleUVs);
      gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

      bindQuad();
      use(progs.particleInit);
      u1f(progs.particleInit, 'cellSize', 1 / side);
      blit(particleData.write);
      swap(particleData);
      warmed = false;
    }

    function stirPointer() {
      if (!stroke.live && elapsed >= stroke.next) {
        var r = function () { return Math.random() * 1.2 - 0.6; };
        stroke.fromX = r();
        stroke.fromY = r();
        stroke.toX = r();
        stroke.toY = r();
        stroke.start = elapsed;
        stroke.end = elapsed + STIR_STROKE;
        stroke.live = true;
        pointer.x = stroke.fromX;
        pointer.y = stroke.fromY;
        pointer.lastX = pointer.x;
        pointer.lastY = pointer.y;
        return false;
      }
      if (!stroke.live) return false;
      var t = (elapsed - stroke.start) / (stroke.end - stroke.start);
      if (t >= 1) {
        stroke.live = false;
        stroke.next = elapsed + STIR_PAUSE_MIN + Math.random() * (STIR_PAUSE_MAX - STIR_PAUSE_MIN);
        return false;
      }
      var e = t * t * (3 - 2 * t);
      pointer.x = stroke.fromX + (stroke.toX - stroke.fromX) * e;
      pointer.y = stroke.fromY + (stroke.toY - stroke.fromY) * e;
      return true;
    }

    function stepFluid(dt, down) {
      if (!gl || !velocity || !pressure || !dyeRT || !divergence) return;
      bindQuad();
      var rdx = 1 / CELL_SIZE;
      var halfrdx = 0.5 * rdx;

      var ad = progs.advect;
      use(ad);
      fluidUniforms(ad);
      u1f(ad, 'dt', dt);
      u1f(ad, 'rdx', rdx);
      bindTex(ad, 'target', velocity.read.tex, 0);
      bindTex(ad, 'velocity', velocity.read.tex, 1);
      blit(velocity.write);
      swap(velocity);

      var mf = progs.mouseForce;
      use(mf);
      fluidUniforms(mf);
      u1f(mf, 'dt', dt);
      u1f(mf, 'dx', CELL_SIZE);
      u1f(mf, 'uDecay', decayFor(VELOCITY_DECAY, dt, 1));
      u1f(mf, 'uStrength', STRENGTH / 5);
      mouseUniforms(mf, down);
      bindTex(mf, 'velocity', velocity.read.tex, 0);
      blit(velocity.write);
      swap(velocity);

      var dv = progs.divergence;
      use(dv);
      fluidUniforms(dv);
      u1f(dv, 'halfrdx', halfrdx);
      bindTex(dv, 'velocity', velocity.read.tex, 0);
      blit(divergence);

      var ps = progs.pressureSolve;
      use(ps);
      fluidUniforms(ps);
      u1f(ps, 'alpha', -CELL_SIZE * CELL_SIZE);
      bindTex(ps, 'divergence', divergence.tex, 1);
      var iters = Math.max(1, Math.round(ITERATIONS));
      for (var i = 0; i < iters; i++) {
        bindTex(ps, 'pressure', pressure.read.tex, 0);
        blit(pressure.write);
        swap(pressure);
      }

      var pg = progs.pressureGradient;
      use(pg);
      fluidUniforms(pg);
      u1f(pg, 'halfrdx', halfrdx);
      bindTex(pg, 'pressure', pressure.read.tex, 0);
      bindTex(pg, 'velocity', velocity.read.tex, 1);
      blit(velocity.write);
      swap(velocity);

      var low = toRGB(COLORS.slow);
      var high = toRGB(COLORS.fast);
      var glint = toRGB(COLORS.glint);
      var k = DYE.fade / 5;
      var md = progs.mouseDye;
      use(md);
      fluidUniforms(md);
      u1f(md, 'dt', dt);
      u1f(md, 'dx', CELL_SIZE);
      u3f(md, 'uDecay', [
        decayFor(DYE_DECAY[0], dt, k),
        decayFor(DYE_DECAY[1], dt, k),
        decayFor(DYE_DECAY[2], dt, k)
      ]);
      u3f(md, 'uLow', [low[0] * DYE_LOW_SCALE, low[1] * DYE_LOW_SCALE, low[2] * DYE_LOW_SCALE]);
      u3f(md, 'uHigh', [high[0] * DYE_HIGH_SCALE, high[1] * DYE_HIGH_SCALE, high[2] * DYE_HIGH_SCALE]);
      u3f(md, 'uGlint', glint);
      mouseUniforms(md, down);
      bindTex(md, 'dye', dyeRT.read.tex, 0);
      blit(dyeRT.write);
      swap(dyeRT);

      use(ad);
      fluidUniforms(ad);
      u1f(ad, 'dt', dt);
      u1f(ad, 'rdx', rdx);
      bindTex(ad, 'target', dyeRT.read.tex, 0);
      bindTex(ad, 'velocity', velocity.read.tex, 1);
      blit(dyeRT.write);
      swap(dyeRT);
    }

    function stepParticles(dt) {
      if (!gl || !particleData || !velocity) return;
      bindQuad();
      var sp = progs.particleStep;
      use(sp);
      u1f(sp, 'dt', dt);
      var inertia = PARTICLES.inertia;
      u1f(sp, 'dragCoefficient', inertia <= 0 ? 1 : 1 - Math.exp(-dt / (inertia * 0.05)));
      u2f(sp, 'flowScale', 1 / (CELL_SIZE * aspect), 1 / CELL_SIZE);
      bindTex(sp, 'particleData', particleData.read.tex, 0);
      bindTex(sp, 'flowVelocityField', velocity.read.tex, 1);
      blit(particleData.write);
      swap(particleData);
    }

    function render() {
      if (!gl || !particleData || !dyeRT) return;
      var bg = toRGB(BACKGROUND);
      target(null);
      gl.clearColor(bg[0], bg[1], bg[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.SRC_ALPHA);
      gl.blendEquation(gl.FUNC_ADD);

      var pr = progs.particleRender;
      use(pr);
      u1f(pr, 'uPointSize', Math.min(maxPoint, Math.max(1, PARTICLES.size * dpr)));
      u3f(pr, 'uSlow', toRGB(COLORS.slow));
      u3f(pr, 'uFast', toRGB(COLORS.fast));
      u3f(pr, 'uGlint', toRGB(COLORS.glint));
      bindTex(pr, 'particleData', particleData.read.tex, 0);
      bindParticleUVs();
      target(null);
      gl.drawArrays(gl.POINTS, 0, partCount);

      if (DYE.show) {
        var st = progs.screenTexture;
        use(st);
        bindTex(st, 'texture', dyeRT.read.tex, 0);
        bindQuad();
        target(null);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      gl.disable(gl.BLEND);
    }

    function resize() {
      if (!gl) return;
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      var cw = Math.max(1, Math.round(host.clientWidth * dpr));
      var ch = Math.max(1, Math.round(host.clientHeight * dpr));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      var s = fluidScale(DETAIL);
      var w = Math.max(8, Math.min(GRID_MAX, Math.round(host.clientWidth * s)));
      var h = Math.max(8, Math.min(GRID_MAX, Math.round(host.clientHeight * s)));
      if (
        Math.abs(w - gridW) / Math.max(1, gridW) > 0.04 ||
        Math.abs(h - gridH) / Math.max(1, gridH) > 0.04
      ) {
        buildFluid(w, h);
      }
      var side = particleSide(PARTICLES.count);
      if (side !== partSide) buildParticles(side);
    }

    function loop(now) {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      if (!onScreen || !pageVisible) {
        lastNow = now;
        return;
      }
      var dt = lastNow ? Math.min((now - lastNow) / 1000, 0.05) : 0;
      lastNow = now;
      resize();

      if (!warmed && velocity && particleData) {
        var n = reduced ? STILL_WARMUP : WARMUP;
        for (var i = 0; i < n; i++) {
          elapsed += STEP;
          var downW = stirPointer();
          stepFluid(STEP, downW);
          stepParticles(STEP);
          pointer.lastX = pointer.x;
          pointer.lastY = pointer.y;
        }
        warmed = true;
      }

      if (dt > 0) {
        elapsed += dt;
        var hovering = pointer.over && pointer.known && now - pointer.moveAt < HOVER_HOLD;
        if (hovering) {
          if (!ptrDrove) {
            pointer.lastX = pointer.x;
            pointer.lastY = pointer.y;
          }
          if (stroke.live) {
            stroke.live = false;
            stroke.next = elapsed + STIR_PAUSE_MIN;
          }
        }
        ptrDrove = hovering;
        var down = hovering || stirPointer();
        stepFluid(dt, down);
        stepParticles(dt);
        pointer.lastX = pointer.x;
        pointer.lastY = pointer.y;
      }
      render();
    }

    if (!init()) {
      canvas.style.background =
        'radial-gradient(120% 100% at 50% 50%, rgba(181,126,220,0.12), rgba(46,26,71,0.14), transparent 70%)';
      return;
    }

    var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(function () { resize(); }) : null;
    if (ro) ro.observe(host);

    var io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(function (entries) {
          onScreen = entries.some(function (e) { return e.isIntersecting; });
        }, { rootMargin: '128px' })
      : null;
    if (io) io.observe(host);

    var onVisibility = function () {
      pageVisible = document.visibilityState !== 'hidden';
    };
    document.addEventListener('visibilitychange', onVisibility);

    var onLost = function (e) {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    var onRestored = function () {
      if (disposed) return;
      lastNow = 0;
      gridW = gridH = 0;
      partSide = 0;
      if (init()) {
        resize();
        raf = requestAnimationFrame(loop);
      }
    };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    resize();
    raf = requestAnimationFrame(loop);

    window.addEventListener('beforeunload', function () {
      disposed = true;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (gl) {
        dropFluid();
        dropParticles();
        if (quad) gl.deleteBuffer(quad);
        for (var k in progs) gl.deleteProgram(progs[k].prog);
        var lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      }
    });
  }

  /* Pointer drives the fluid (canvas is pointer-events:none, so track on window) */
  function trackPointer(e) {
    var canvas = document.getElementById('nebula-canvas');
    if (!canvas) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    var nx = (e.clientX / w) * 2 - 1;
    var ny = ((h - e.clientY) / h) * 2 - 1;
    var state = window.__nebulaPointer || (window.__nebulaPointer = { x: 0, y: 0, lastX: 0, lastY: 0, over: false, moveAt: 0, known: false });
    if (!state.known) {
      state.lastX = nx;
      state.lastY = ny;
    }
    state.x = nx;
    state.y = ny;
    state.known = true;
    state.over = true;
    state.moveAt = nowMs();
  }

  function boot() {
    start();
    if (!reduced) {
      window.addEventListener('pointermove', trackPointer, { passive: true });
      window.addEventListener('pointerdown', trackPointer, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
