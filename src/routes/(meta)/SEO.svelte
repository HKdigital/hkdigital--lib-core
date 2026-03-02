<script>
  import {
    name as defaultTitle,
    description as defaultDescription,
    SeoImageLandscape,
    SeoImageSquare,
    defaultLocale,
    languages
  } from './config.js';

  // Use the landscape image as default (best for most platforms)
  const defaultSeoImage = SeoImageLandscape || undefined;

  /**
   * SEO component props
   *
   * @typedef {Object} SEOProps
   *
   * @property {string} [title]
   *   Page title (defaults to config name)
   *
   * @property {string} [description]
   *   Page description (defaults to config description)
   *
   * @property {string} [url]
   *   Canonical URL for this page
   *
   * @property {string} [image]
   *   Social media preview image URL (defaults to landscape SEO image)
   *
   * @property {string} [imageAlt]
   *   Alt text for social media image
   *
   * @property {string} [type]
   *   Open Graph type (default: 'website')
   *
   * @property {string} [locale]
   *   Content locale (auto-detected from URL or defaults to config)
   *
   * @property {string} [siteName]
   *   Site name for Open Graph (defaults to config name)
   *
   * @property {object} [data]
   *   Page data from load function (contains auto-detected locale)
   *
   * @property {Record<string, string>} [alternateUrls]
   *   Alternate language URLs for hreflang tags
   *
   * @property {string} [robots]
   *   Robots meta directives (e.g., 'noindex, nofollow')
   *
   * @property {boolean} [noAiTraining]
   *   Prevent AI training on this page content
   */

  /** @type {SEOProps} */
  let {
    title = defaultTitle,
    description = defaultDescription,
    url = undefined,
    image = defaultSeoImage,
    imageAlt = title,
    type = 'website',
    locale = undefined,
    siteName = defaultTitle,
    data = undefined,
    alternateUrls = undefined,
    robots = undefined,
    noAiTraining = false
  } = $props();

  // Use locale from: 1) data (hooks), 2) prop, 3) config default
  const finalLocale = data?.locale || locale || defaultLocale;
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
