import gulls from './gulls.js'
import Video from './video.js'

const sg = await gulls.init()
const frag = await gulls.import('./frag.wgsl')
const shader = gulls.constants.vertex + frag

await Video.init()

const render = await sg.render({
    shader,
    data: [
        sg.uniform([sg.width, sg.height]), // resolution
        sg.sampler(),
        sg.video(Video.element)            // webcam texture
    ]
})

sg.run(render)