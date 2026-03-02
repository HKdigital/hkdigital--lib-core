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
   * @property {MetaConfig} config - Configuration object
   * @property {string} [title] - Page title (defaults to config name)
   * @property {string} [description]
   *   Page description (defaults to config description)
   * @property {string} [url] - Canonical URL for this page
   * @property {string} [image]
   *   Social media preview image URL (defaults to landscape SEO image)
   * @property {string} [imageAlt] - Alt text for social media image
   * @property {string} [type] - Open Graph type (default: 'website')
   * @property {string} [locale]
   *   Content locale (auto-detected from URL or defaults to config)
   * @property {string} [siteName]
   *   Site name for Open Graph (defaults to config name)
   * @property {Record<string, string>} [alternateUrls]
   *   Alternate language URLs for hreflang tags
   * @property {string} [robots]
   *   Robots meta directives (e.g., 'noindex, nofollow')
   * @property {boolean} [noAiTraining]
   *   Prevent AI training on this page content
   */

  /** @type {SEOProps} */
  let {
    config,
    title,
    description,
    url = undefined,
    image,
    imageAlt,
    type = 'website',
    locale = undefined,
    siteName,
    alternateUrls = undefined,
    robots = undefined,
    noAiTraining = false
  } = $props();

  // Extract config values
  const {
    name: defaultTitle,
    description: defaultDescription,
    SeoImageLandscape,
    SeoImageSquare,
    defaultLocale,
    languages
  } = config;

  // Use the landscape image as default (best for most platforms)
  const defaultSeoImage = SeoImageLandscape || undefined;

  // Apply defaults from config
  title = title ?? defaultTitle;
  description = description ?? defaultDescription;
  image = image ?? defaultSeoImage;
  imageAlt = imageAlt ?? title;
  siteName = siteName ?? defaultTitle;

  // Use locale from prop or fall back to config default
  const finalLocale = locale || defaultLocale;
</script>

<svelte:head>
  <!-- Page title (overrides %title% from app.html) -->
  <title>{title}</title>

  <!-- Basic SEO -->
  <meta name="description" content={description}>

  <!-- Robots directives -->
  {#if robots}
    <meta name="robots" content={robots}>
  {/if}

  <!-- AI training and reading restrictions -->
  {#if noAiTraining}
    <!-- Google AI -->
    <meta name="google-extended" content="noindex, nofollow">
    <!-- OpenAI (ChatGPT) -->
    <meta name="OAI-SearchBot" content="noindex, nofollow">
    <!-- Common Crawl -->
    <meta name="CCBot" content="noindex, nofollow">
    <!-- Anthropic Claude -->
    <meta name="anthropic-ai" content="noindex, nofollow">
    <!-- General AI crawlers -->
    <meta name="robots" content="noai, noimageai">
  {/if}

  <!-- Open Graph / Facebook / LinkedIn / Discord -->
  <meta property="og:type" content={type}>
  <meta property="og:title" content={title}>
  <meta property="og:description" content={description}>
  <meta property="og:site_name" content={siteName}>
  <meta property="og:locale" content={finalLocale}>

  {#if url}
    <meta property="og:url" content={url}>
    <link rel="canonical" href={url}>
  {/if}

  {#if image}
    <meta property="og:image" content={image}>
    <meta property="og:image:alt" content={imageAlt}>
    <!-- Image metadata (dimensions from preprocessor) -->
    {#if image === SeoImageLandscape}
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:image:type" content="image/jpeg">
    {/if}
  {/if}

  <!-- Additional square image for platforms that prefer it -->
  {#if SeoImageSquare && SeoImageSquare !== image}
    <meta property="og:image" content={SeoImageSquare}>
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="1200">
    <meta property="og:image:type" content="image/jpeg">
  {/if}

  <!-- Alternate locales for Open Graph -->
  {#each Object.entries(languages) as [code, config]}
    {#if config.locale !== finalLocale}
      <meta property="og:locale:alternate" content={config.locale}>
    {/if}
  {/each}

  <!-- Alternate language URLs (hreflang) -->
  {#if alternateUrls}
    {#each Object.entries(alternateUrls) as [lang, href]}
      <link rel="alternate" hreflang={lang} href={href}>
    {/each}
  {/if}

</svelte:head>
