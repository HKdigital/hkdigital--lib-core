<script>
  /**
   * SEO component
   *
   * Generates SEO meta tags, Open Graph tags, and hreflang links.
   *
   * @typedef {import('../typedef.js').MetaConfig} MetaConfig
   */

  /**
   * SEO component props
   *
   * @typedef {Object} SEOProps
   *
   * @property {MetaConfig} config - Configuration object
   *
   * @property {string} [title] - Page title (defaults to config name)
   *
   * @property {string} [description]
   *   Page description (defaults to config description)
   *
   * @property {string} [canonicalUrl]
   *   Canonical URL for this content to prevent duplicate content penalties
   *
   * @property {import('$lib/config/typedef.js').ImageSource}
   *   [previewImageLandscape] - Landscape preview image (1200×630)
   *
   * @property {import('$lib/config/typedef.js').ImageSource}
   *   [previewImageSquare] - Square preview image (1200×1200)
   *
   * @property {string} [previewImageAltText] - Alt text for preview images
   *
   * @property {string} [type] - Open Graph type (default: 'website')
   *
   * @property {string} [locale] - Content locale (defaults to config locale)
   *
   * @property {Record<string, string>} [alternateUrls]
   *   Alternate language URLs for hreflang tags
   *
   * @property {string} [robots] - Robots meta directives
   *
   * @property {boolean} [noAiTraining] - Block AI training on this page
   */

  /** @type {SEOProps} */
  let {
    config,
    title,
    description,
    canonicalUrl = undefined,

    previewImageLandscape,
    previewImageSquare,
    previewImageAltText,

    type = 'website',
    locale = undefined,
    alternateUrls = undefined,
    robots = undefined,
    noAiTraining = false
  } = $props();

  // Extract config values
  let defaultLocale = $derived(config.defaultLocale);
  let languages = $derived(config.languages);

  /**
   * Get first image source from imageSource array
   *
   * @param {ImageSource|undefined|null} imageSource
   *
   * @returns {string|null} image source url
   *
   * @throws {Error} invalid parameter
   */
  function imageSourceToSrc( imageSource ) {
    if( !imageSource ) {
      return null;
    }

    if( !Array.isArray( imageSource ) || !imageSource[0] || !imageSource[0].src ) {
      throw new Error('Invalid [imageSource]');
    }

    return imageSource[0].src ?? null;
  }

  let imageLandscape = $derived.by( () => {
    let image = previewImageLandscape ?? config.previewImageLandscape;

    // console.log("image", image);

    return imageSourceToSrc(image);
  } );

  // console.log("imageLandscape", imageLandscape);

  let imageSquare = $derived.by( () => {
    let image = previewImageSquare ?? config.previewImageSquare;

    return imageSourceToSrc(image);
  } );

  let imageAltText = $derived(previewImageAltText ?? config.name);

  let pageTitle = $derived(title ?? config.name);
  let pageDescription = $derived(description ?? config.description);

  let currentLocale = $derived(locale ?? defaultLocale);
</script>

<svelte:head>
  <!-- Basic SEO: Page title (overrides %title% from app.html) -->
  <title>{pageTitle}</title>

  <!-- Basic SEO: Page title (overrides %title% from app.html) -->
  {#if pageDescription}
    <meta name="description" content={pageDescription} />
  {/if}

  {#if canonicalUrl}
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:url" content={canonicalUrl} />
  {/if}

  <!-- Robots directives -->
  {#if robots}
    <meta name="robots" content={robots} />
  {/if}

  <!-- AI training and reading restrictions -->
  {#if noAiTraining}
    <!-- Google AI -->
    <meta name="google-extended" content="noindex, nofollow" />
    <!-- OpenAI (ChatGPT) -->
    <meta name="OAI-SearchBot" content="noindex, nofollow" />
    <!-- Common Crawl -->
    <meta name="CCBot" content="noindex, nofollow" />
    <!-- Anthropic Claude -->
    <meta name="anthropic-ai" content="noindex, nofollow" />
    <!-- General AI crawlers -->
    <meta name="robots" content="noai, noimageai" />
  {/if}

  <!-- Open Graph / Facebook / LinkedIn / Discord -->
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={config.name} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:locale" content={currentLocale} />

  <!-- Default seo/social image (landscape) -->
  {#if imageLandscape}
    <meta property="og:image" content={imageLandscape} />
    <meta property="og:image:alt" content={imageAltText} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
  {/if}

  <!-- Additional image for platforms that prefer square images -->
  {#if imageSquare}
    <meta property="og:image" content={imageSquare} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="1200" />
    <meta property="og:image:type" content="image/jpeg" />
  {/if}

  <!-- Alternate locales for Open Graph -->
  {#each Object.entries(languages) as [code, config]}
    {#if config.locale !== currentLocale}
      <meta property="og:locale:alternate" content={config.locale} />
    {/if}
  {/each}

  <!-- Alternate language URLs (hreflang) -->
  {#if alternateUrls}
    {#each Object.entries(alternateUrls) as [lang, href]}
      <link rel="alternate" hreflang={lang} {href} />
    {/each}
  {/if}
</svelte:head>
