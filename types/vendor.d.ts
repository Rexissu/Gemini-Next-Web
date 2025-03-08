declare module "vendor/contexts/LiveAPIContext" {
  export const useLiveAPIContext: () => any;
}

declare module "vendor/multimodal-live-types" {
  export interface RealtimeInputMessage {}
  export interface ClientContentMessage {}
  export interface ServerContentMessage {}
}

declare module "vendor/lib/utils" {
  export const base64sToArrayBuffer: (base64s: string[]) => ArrayBuffer;
  export const pcmBufferToBlob: (buffer: ArrayBuffer, sampleRate: number) => Blob;
}
