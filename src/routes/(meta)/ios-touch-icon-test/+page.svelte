<script>
  // import faviconImages from '../favicon.png?favicons';
  import appleTouchIcons from '../favicon.png?apple-touch-icons';

  // console.log("***appleTouchIcons", appleTouchIcons);
</script>

IOS touch icons should be PNG and have an alpha channel

<br>
<img src="{appleTouchIcons[0].src}" style="width: 100px; height: 100px;" />
<pre>
  {JSON.stringify(appleTouchIcons[0], null, 2)}
</pre>
