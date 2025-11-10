<script>
  // import testImageSource from './army-green.jpg?responsive';
  import testImageSource from './army-green.jpg?preset=render';

  console.log("***testImageSource", testImageSource);

  const src = testImageSource[0].src;
</script>

<div class="w-full h-full bg-white select-text overflow-auto">

  <br>
  <img src="{src}" style="width: 1920px; height: 200px; object-fit: cover;" alt=""/>

  <pre>{JSON.stringify(testImageSource[0], null, 2)}</pre>

  <br/>
  <a href={src} style="text-decoration: underline;" target="_blank">{src}</a>

</div>
