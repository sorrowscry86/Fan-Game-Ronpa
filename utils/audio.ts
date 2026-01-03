
// Interface extension for WebKit-prefixed AudioContext
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createAudioContext(sampleRate: number = 24000): AudioContext {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  return new AudioContextClass({ sampleRate });
}
