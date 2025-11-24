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

/* For favicons */

// Generate all favicon sizes (16, 32, 48, 120, 152, 167, 180, 192, 512)
declare module '*?favicons' {
  const out: ImageSource;
  export default out;
}

// Generate Apple touch icon sizes (120, 152, 167, 180)
declare module '*?apple-touch-icons' {
  const out: ImageSource;
  export default out;
}
