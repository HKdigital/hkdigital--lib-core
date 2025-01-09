
interface ImageVariant {
  src: string;
  width?: number;
  height?: number;

}

declare module '*?responsive' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*&responsive' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*?preset=gradient' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*&preset=gradient' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*?preset=photo' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*&preset=photo' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*?preset=drawing' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*&preset=drawing' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*?preset=savedata' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*&preset=savedata' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*?preset=blur' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

declare module '*&preset=blur' {
  const out: Promise<ImageVariant[]|string[]|string>;
  export default out;
}

// declare module '*&w=sm' {
//   const src: string;
//   export default src;
// }

// declare module '*&w=md' {
//   const src: string;
//   export default src;
// }

// declare module '*&w=lg' {
//   const src: string;
//   export default src;
// }

// declare module '*&w=hd' {
//   const src: string;
//   export default src;
// }