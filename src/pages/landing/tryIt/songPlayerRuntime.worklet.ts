import {
  type FeedBlock,
  feedBlockFrames,
  type FeedRequest,
  type PlayerCommand,
  type PlayerEvent,
  type StemGains,
  stemKeys,
} from './tryIt.cross.js';

const lookaheadBlocks = 3;
const positionEveryQuanta = 16;
const smoothing = 0.002;
const stereo = 2;

export type SongPlayerRuntime = {
  process: (left: Float32Array, right: Float32Array) => void;
};

export const createSongPlayerRuntime = (
  port: MessagePort,
): SongPlayerRuntime => {
  let feed: MessagePort | undefined = undefined;
  let playing = false;
  let frame = 0;
  let end = 0;
  let epoch = 0;
  let requestedUntil = 0;
  let blocks: FeedBlock[] = [];
  let quanta = 0;
  let target: StemGains = { lead: 1, backing: 1, instrumental: 1 };
  const gains: StemGains = { lead: 1, backing: 1, instrumental: 1 };

  const send = (event: PlayerEvent): void => {
    port.postMessage(event);
  };

  port.onmessage = (event: MessageEvent<PlayerCommand>) => {
    const command = event.data;
    if (command.type === 'feed') {
      feed = command.port;
      feed.onmessage = (message: MessageEvent<FeedBlock>) => {
        if (message.data.serial === epoch) {
          blocks.push(message.data);
          blocks.sort((left, right) => left.start - right.start);
        }
      };
    } else if (command.type === 'play') {
      epoch += 1;
      blocks = [];
      frame = command.frame;
      end = command.frames;
      requestedUntil = command.frame;
      playing = true;
    } else if (command.type === 'pause') {
      playing = false;
    } else {
      target = command.gains;
    }
  };

  const request = (): void => {
    if (!feed) {
      return;
    }
    const horizon = Math.min(frame + lookaheadBlocks * feedBlockFrames, end);
    while (requestedUntil < horizon) {
      const message: FeedRequest = {
        type: 'read',
        start: requestedUntil,
        serial: epoch,
      };
      feed.postMessage(message);
      requestedUntil += feedBlockFrames;
    }
  };

  const blockAt = (at: number): FeedBlock | undefined => {
    while (blocks.length > 0 && blocks[0].start + blocks[0].frames <= at) {
      blocks.shift();
    }
    const block = blocks.at(0);
    return block && block.start <= at ? block : undefined;
  };

  const sampleOf = (
    block: FeedBlock,
    offset: number,
    channel: number,
  ): number => {
    if (offset < block.separated) {
      const at = offset * stereo + channel;
      return (
        block.lead[at] * gains.lead +
        block.backing[at] * gains.backing +
        block.instrumental[at] * gains.instrumental
      );
    }
    return block.mixture[(offset - block.separated) * stereo + channel];
  };

  const render = (left: Float32Array, right: Float32Array): void => {
    for (let index = 0; index < left.length; index += 1) {
      if (frame >= end) {
        playing = false;
        send({ type: 'ended', frame });
        return;
      }
      const block = blockAt(frame);
      if (!block) {
        return;
      }
      for (const key of stemKeys) {
        gains[key] += (target[key] - gains[key]) * smoothing;
      }
      const offset = frame - block.start;
      left[index] = sampleOf(block, offset, 0);
      right[index] = sampleOf(block, offset, 1);
      frame += 1;
    }
  };

  return {
    process: (left, right) => {
      left.fill(0);
      right.fill(0);
      if (!playing) {
        return;
      }
      render(left, right);
      request();
      quanta += 1;
      if (quanta % positionEveryQuanta === 0) {
        send({ type: 'position', frame });
      }
    },
  };
};
