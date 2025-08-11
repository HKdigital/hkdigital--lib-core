type ImageMeta = import('$lib/config/typedef.js').ImageMeta;
type ImageSource = import('$lib/config/typedef.js').ImageSource;

declare module '*?responsive' {
  const out: ImageSource;
  export default out;
}

declare module '*&responsive' {
  const out: ImageSource;
  export default out;
}

declare module '*?preset=photo' {
  const out: ImageSource;
  export default out;
}

declare module '*&preset=photo' {
  const out: ImageSource;
  export default out;
}

declare module '*?preset=render' {
  const out: ImageSource;
  export default out;
}

declare module '*&preset=render' {
  const out: ImageSource;
  export default out;
}

declare module '*?preset=gradient' {
  const out: ImageSource;
  export default out;
}

declare module '*&preset=gradient' {
  const out: ImageSource;
  export default out;
}

declare module '*?preset=drawing' {
  const out: ImageSource;
  export default out;
}

declare module '*&preset=drawing' {
  const out: ImageSource;
  export default out;
}

declare module '*?preset=savedata' {
  const out: ImageSource;
  export default out;
}

declare module '*&preset=savedata' {
  const out: ImageSource;
  export default out;
}

declare module '*?preset=blur' {
  const out: ImageSource;
  export default out;
}

declare module '*&preset=blur' {
  const out: ImageSource;
  export default out;
}
