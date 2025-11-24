<script>
  // import faviconImages from '../favicon.png?favicons';
  import workingTouchIcons from '../favicon-hkdigital.png?apple-touch-icons';
  import testTouchIcons from '../favicon.png?apple-touch-icons';

  // console.log("***workingTouchIcons", workingTouchIcons);

  const testImageSrc = testTouchIcons[0].src;
  const workingImageSrc = workingTouchIcons[0].src;
</script>

<div class="w-full h-full bg-white select-text overflow-auto">
IOS touch icons should be PNG and have an alpha channel

  <br>
  <img src="{testTouchIcons[0]?.src}" style="width: 100px; height: 100px;" alt=""/>
  <pre>
    {JSON.stringify(testTouchIcons[0], null, 2)}
  </pre>

  <br>
  <img src="{workingImageSrc}" style="width: 100px; height: 100px;" alt=""/>
  <pre>
    {JSON.stringify(workingTouchIcons[0], null, 2)}
  </pre>

</div>
