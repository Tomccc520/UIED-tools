/**
 * crypto-js类型声明
 */
declare module 'crypto-js' {
  interface WordArray {
    words: number[];
    sigBytes: number;
    toString(encoder?: any): string;
    concat(wordArray: WordArray): WordArray;
    clamp(): void;
  }

  interface Encoder {
    stringify(wordArray: WordArray): string;
    parse(str: string): WordArray;
  }

  interface Hasher {
    reset(): void;
    update(messageUpdate: string | WordArray): Hasher;
    finalize(messageUpdate?: string | WordArray): WordArray;
  }

  namespace CryptoJS {
    function HmacSHA256(message: string, key: string): WordArray;
    function MD5(message: string): WordArray;

    const enc: {
      Base64: Encoder;
      Hex: Encoder;
      Utf8: Encoder;
      Utf16: Encoder;
      Latin1: Encoder;
    };
  }

  export = CryptoJS;
}
