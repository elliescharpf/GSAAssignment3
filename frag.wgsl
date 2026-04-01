@group(0) @binding(0) var<uniform> resolution : vec2<f32>;
@group(0) @binding(1) var samp : sampler;
@group(0) @binding(2) var videoTex : texture_external;

@fragment
fn main(@builtin(position) pos : vec4<f32>) -> @location(0) vec4<f32> {
    let uv = pos.xy / resolution;
    let color = textureSampleBaseClampToEdge(videoTex, samp, uv);
    return vec4(color.rgb, 1.0);
}