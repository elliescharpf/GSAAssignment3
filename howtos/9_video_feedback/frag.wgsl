// Tweakpane
struct Params {
    noiseScale: f32,
    noiseStrength: f32,
    warpAmount: f32,
    speed: f32,
    mouseDistortion: f32,
};

@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var videoSampler:   sampler;
@group(0) @binding(2) var backBuffer:     texture_2d<f32>;
@group(0) @binding(3) var<uniform> mouse : vec3f;
@group(0) @binding(4) var<uniform> params: Params;
@group(0) @binding(5) var<uniform> time: f32;
@group(1) @binding(0) var videoBuffer:    texture_external;

// --- Noise Functions ---
fn random(st: vec2f) -> f32{
    return fract(sin(dot(st, vec2f(13., 78.))) * 43758.);
}

fn smoothNoise(st: vec2f) -> f32{
    let i = floor(st);
    let f = fract(st);

    let a = random(i);
    let b = random(i + vec2f(1.0, 0.0));
    let c = random(i + vec2f(0.0, 1.0));
    let d = random(i + vec2f(1.0, 1.0));

    let u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x)
    + (c - a) * u.y * (1.0 - u.x)
    + (d - b) * u.x * u.y;
}

// --- Fragment ---
@fragment
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
    let p = pos.xy / resolution;

    // Animated noise
    let mouseInfluence = params.mouseDistortion * mouse.x * 200.0;
    let noiseScale = params.noiseScale + mouseInfluence;
    let animated = p + vec2f(time * 0.01);
    let n = smoothNoise(animated * noiseScale);

    // Warped video
    let warped = p + vec2f(n, n) * params.warpAmount;
    let video = textureSampleBaseClampToEdge(videoBuffer, videoSampler, warped);

    // Blend
    let withNoise = mix(video.rgb, vec3f(n), params.noiseStrength);   // noise
    let grad = vec3f (p.x, p.y, 1.0 - p.x);
    let finalColor = mix(withNoise, grad, 0.5);

    return vec4f(finalColor, 1.0);
}

