// --- Imports ---
import { default as gulls } from '../../gulls.js'
import { default as Video    } from '../../helpers/video.js'
import { default as Mouse    } from '../../helpers/mouse.js'
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';

// --- init ---
const sg     = await gulls.init()
Mouse.init()
await Video.init()

const frag   = await gulls.import( './frag.wgsl' )
const shader = gulls.constants.vertex + frag

// --- Feedback Buffer ---
const back = new Float32Array( gulls.width * gulls.height * 4 )
const feedback_t = sg.texture( back )

// --- Uniforms ---
const mouse = sg.uniform(Mouse.values)

let t = 0;
const timeUniform = sg.uniform([0]);

// --- Tweakpane ---
const params = {
    noiseScale: 20,
    noiseStrength: 0.5,
    warpAmount: 0.2,
    speed: 1.0,
    mouseDistortion: true,
};

const paramsUniform = sg.uniform([
    params.noiseScale,
    params.noiseStrength,
    params.warpAmount,
    params.speed,
    params.mouseDistortion ? 1.0 : 0.0,
]);

const pane = new Pane();

pane.addBinding(params, 'noiseScale', {min: 1, max: 200});
pane.addBinding(params, 'noiseStrength', {min: 0, max: 1});
pane.addBinding(params, 'warpAmount', {min: 0, max: 1});
pane.addBinding(params, 'speed', {min: 0, max: 5});
pane.addBinding(params, 'mouseDistortion', {label: 'mouse distortion'});

// --- Render ---
const render = await sg.render({
    shader,
    data: [
        sg.uniform([sg.width, sg.height]),     // resolution
        sg.sampler(),                                 // videoSampler
        feedback_t,                                   // backBuffer
        mouse,                                        // mouse
        paramsUniform,                                // params
        timeUniform,                                  // time
        sg.video(Video.element),                      // videoBuffer
    ],
    onframe(){
        t += params.speed * 0.5

        mouse.value = Mouse.values
        timeUniform.value = [t]
        paramsUniform.value = [
            params.noiseScale,
            params.noiseStrength,
            params.warpAmount,
            params.speed,
            params.mouseDistortion ? 1.0 : 0.0,
        ]
    },
    copy: feedback_t
})

sg.run(render)
