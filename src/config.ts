
const api_base_url = 'https://api.doitincloud.com';

const sampleRate = 22050;                          // options 16000, 22050, 24000, 44100, 48000

const apiPath = '/api/v1/inference/stream';

const moduleUrl = 'https://cdn.doitincloud.com/live-inference/worklet/v1.0.0/worklet.js'; //'worklet.js';

const recordingInterval = 3000;                    // milliseconds

export {
    api_base_url,
    sampleRate,
    apiPath,
    moduleUrl,
    recordingInterval
};

export default {
    api_base_url,
    sampleRate,
    apiPath,
    moduleUrl,
    recordingInterval
};
