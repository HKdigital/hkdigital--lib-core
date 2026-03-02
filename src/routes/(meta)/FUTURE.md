# Future Plans - SEO & Meta Components

This document outlines planned features and components for the (meta) folder.

## Planned Components

### 1. JsonLD Component

**Purpose:** Generate Schema.org structured data for rich search results.

**Why it's useful:**
- Rich snippets in Google (star ratings, prices, event dates)
- Enhanced search result displays
- Knowledge Graph integration
- Voice assistant compatibility (Alexa, Google Assistant)

**Common Schema Types:**
- **WebPage** - Basic page information
- **Article** - Blog posts, news articles
- **Product** - E-commerce items with pricing, availability, reviews
- **Organization** - Company info, contact details, social profiles
- **Person** - Author bios, team member profiles
- **BreadcrumbList** - Navigation breadcrumbs
- **FAQPage** - Frequently asked questions
- **HowTo** - Step-by-step guides and tutorials
- **Recipe** - Cooking instructions with ingredients
- **Event** - Events with dates, locations, tickets
- **VideoObject** - Video content metadata
- **Review** / **AggregateRating** - Product/service reviews

**Usage example:**
```svelte
<script>
  import { JsonLD } from './(meta)/index.js';
</script>

<JsonLD
  type="Product"
  data={{
    name: "Wireless Headphones",
    image: "https://example.com/headphones.jpg",
    description: "Premium wireless headphones with noise cancellation",
    brand: "AudioPro",
    offers: {
      "@type": "Offer",
      price: "199.99",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "128"
    }
  }}
/>
```

**Implementation approach:**
- Single flexible component that accepts any schema type
- Built-in validation for required fields
- Helper functions for common patterns (Organization, Article, etc.)
- TypeScript definitions for popular schema types

**Resources:**
- https://schema.org/
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- https://search.google.com/test/rich-results

---

### 2. ArticleSEO Component

**Purpose:** Specialized SEO component for blog posts, news articles, and
editorial content.

**Why separate from SEO component:**
- Articles have specific metadata requirements
- Different Open Graph type (`article` vs `website`)
- Additional fields like author, publish date, tags
- Often need both article metadata AND structured data

**Article-specific metadata:**
```html
<!-- Open Graph Article Tags -->
<meta property="og:type" content="article">
<meta property="article:author" content="Jane Smith">
<meta property="article:published_time" content="2024-01-15T10:00:00Z">
<meta property="article:modified_time" content="2024-01-16T14:30:00Z">
<meta property="article:section" content="Technology">
<meta property="article:tag" content="sveltekit">
<meta property="article:tag" content="javascript">
<meta property="article:tag" content="web-development">

<!-- Optional: Expiration date -->
<meta property="article:expiration_time" content="2025-12-31T23:59:59Z">
```

**Usage example:**
```svelte
<script>
  import { ArticleSEO } from './(meta)/index.js';

  export let data;  // From CMS or markdown frontmatter
</script>

<ArticleSEO
  title={data.title}
  description={data.excerpt}
  url={data.canonicalUrl}
  image={data.featuredImage}
  author={data.author}
  publishedTime={data.publishedAt}
  modifiedTime={data.updatedAt}
  section={data.category}
  tags={data.tags}
  jsonLD={true}  <!-- Optionally auto-generate Article schema -->
/>

<article>
  <h1>{data.title}</h1>
  {@html data.content}
</article>
```

**Component features:**
- Extends base SEO component
- Automatically sets `og:type="article"`
- Validates ISO 8601 date formats
- Optional automatic Article schema.org generation
- Reading time calculation (optional)
- Multiple author support

**Integration with CMS:**
- Works with markdown frontmatter
- Compatible with headless CMS (Contentful, Sanity, etc.)
- Supports static site generation

---

## Implementation Priority

1. **JsonLD Component** (High Priority)
   - Most versatile and broadly useful
   - Enables rich search results across many content types
   - Can be used standalone or with ArticleSEO

2. **ArticleSEO Component** (Medium Priority)
   - Useful for blogs and content sites
   - Can build on JsonLD component
   - Nice-to-have but not essential for all sites

---

## Design Decisions

### Flexibility vs Simplicity

**JsonLD:** Keep flexible
- Accept any schema type as data
- Don't try to support every schema field
- Let users reference schema.org docs for specific needs

**ArticleSEO:** Keep opinionated
- Pre-configured for common blog use cases
- Smart defaults (e.g., current date if publishedTime not provided)
- Clear prop names that match CMS terminology

### TypeScript Support

Both components should provide:
- JSDoc type definitions for JavaScript users
- `.d.ts` files for TypeScript users
- Example types for common patterns

### Documentation

Each component needs:
- Clear examples for common use cases
- Links to relevant specs (Schema.org, Open Graph)
- Testing tools (Google Rich Results Test, Facebook Debugger)
- Migration guide from other libraries

---

## Related Resources

- **Open Graph Protocol:** https://ogp.me/
- **Schema.org:** https://schema.org/
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
- **JSON-LD Playground:** https://json-ld.org/playground/
