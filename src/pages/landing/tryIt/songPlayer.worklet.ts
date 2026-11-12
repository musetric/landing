/* eslint-disable musetric/no-classes, musetric/no-this-expression */
import { createSongPlayerRuntime } from './songPlayerRuntime.worklet.js';

export class SongPlayerProcessor
  extends AudioWorkletProcessor
  implements AudioWorkletProcessorImpl
{
  runtime = createSongPlayerRuntime(this.port);

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const [[left, right]] = outputs;
    this.runtime.process(left, right);
    return true;
  }
}

registerProcessor('song-player', SongPlayerProcessor);
