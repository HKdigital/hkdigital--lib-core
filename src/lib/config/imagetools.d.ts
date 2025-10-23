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

// Classic browser tab icon
declare module '*?w=16' {
  const out: ImageSource;
  export default out;
}

// High-resolution browser support
declare module '*?w=32' {
  const out: ImageSource;
  export default out;
}

// Windows desktop shortcuts
declare module '*?w=48' {
  const out: ImageSource;
  export default out;
}

// iPhone older retina
declare module '*?w=120' {
  const out: ImageSource;
  export default out;
}

// iPad retina, iOS Safari bookmarks
declare module '*?w=152' {
  const out: ImageSource;
  export default out;
}

// iPad Pro
declare module '*?w=167' {
  const out: ImageSource;
  export default out;
}

// iPhone retina, iOS home screen
declare module '*?w=180' {
  const out: ImageSource;
  export default out;
}

// Android home screen, Chrome PWA
declare module '*?w=192' {
  const out: ImageSource;
  export default out;
}

// PWA application icon, Android splash
declare module '*?w=512' {
  const out: ImageSource;
  export default out;
}
