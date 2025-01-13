// export interface ImageMeta {
//   src: string;
//   width: number;
//   height: number;
// }

type ImageMeta = import('./typedef.js').ImageMeta;

declare module '*?responsive' {
  const out: ImageMeta[];
  export default out;
}

declare module '*&responsive' {
  const out: ImageMeta[];
  export default out;
}

declare module '*?preset=photo' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*&preset=photo' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*?preset=render' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*&preset=render' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*?preset=gradient' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*&preset=gradient' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*?preset=drawing' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*&preset=drawing' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*?preset=savedata' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*&preset=savedata' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*?preset=blur' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}

declare module '*&preset=blur' {
  const out: ImageMeta | ImageMeta[];
  export default out;
}
