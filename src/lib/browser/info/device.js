
/**
 * Check if the device is Apple mobile (iPhone, iPod, or iPad)
 *
 * @returns {boolean} true if Apple mobile device
 */
export function getIsAppleMobile() {
  if (/iPad|iPhone|iPod/.test(navigator.platform)) {
    return true;
  }

  return getIsIpadOS();
}

/**
 * Check if the device is Android mobile (phone or tablet)
 *
 * @example
 * // Android phone: true
 * // Android tablet: true
 * // Android TV: false
 * // Desktop, iOS: false
 *
 * @returns {boolean} true if Android mobile device
 */
export function getIsAndroidMobile() {
  const ua = navigator.userAgent;

  // Check for Android
  if (!/Android/.test(ua)) {
    return false;
  }

  // Exclude Android TV and other non-mobile Android devices
  if (/TV|SmartTV|BRAVIA/.test(ua)) {
    return false;
  }

  return true;
}

/**
 * Check if the device is running iPadOS
 *
 * @returns {boolean} true if iPadOS device
 */
export function getIsIpadOS() {
  return (
    navigator.maxTouchPoints > 2 &&
    /MacIntel/.test(navigator.platform)
  );
}

/**
 * Check if the device is a tablet
 *
 * @example
 * // iPad, Android tablets: true
 * // iPhone, Android phones, Desktop: false
 *
 * @returns {boolean} true if tablet device
 */
export function getIsTablet() {
  // Must have touch support
  if (!navigator.maxTouchPoints || navigator.maxTouchPoints === 0) {
    return false;
  }

  const ua = navigator.userAgent;

  // iPad or iPadOS
  if (getIsIpadOS()) {
    return true;
  }

  // iPad with older iOS versions
  if (/iPad/.test(navigator.platform)) {
    return true;
  }

  // Android tablets typically don't have "Mobile" in UA
  if (/Android/.test(ua) && !/Mobile/.test(ua)) {
    // Exclude Android TV
    if (/TV|SmartTV|BRAVIA/.test(ua)) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Check if the device is a phone (not tablet)
 *
 * @example
 * // iPhone, Android phones: true
 * // iPad, tablets, Desktop: false
 *
 * @returns {boolean} true if phone device
 */
export function getIsPhone() {
  // Must have touch support
  if (!navigator.maxTouchPoints || navigator.maxTouchPoints === 0) {
    return false;
  }

  const ua = navigator.userAgent;

  // iPhone or iPod (not iPad)
  if (/iPhone|iPod/.test(navigator.platform)) {
    return true;
  }

  // Android with "Mobile" marker (phones have this, tablets don't)
  if (/Android/.test(ua) && /Mobile/.test(ua)) {
    return true;
  }

  return false;
}

/**
 * Check if the device is a mobile phone or tablet
 *
 * @example
 * // iPhone, iPad: true
 * // Android phone, Android tablet: true
 * // Android TV, Desktop: false
 *
 * @returns {boolean} true if mobile device
 */
export function getIsMobile() {
  // @ts-ignore
  if (navigator?.userAgentData?.mobile !== undefined) {
    // Modern API - most reliable
    // @ts-ignore
    return navigator.userAgentData.mobile;
  }

  if (getIsAppleMobile()) {
    return true;
  }

  if (getIsAndroidMobile()) {
    return true;
  }

  return false;
}

/**
 * Get device type
 *
 * @example
 * // iPhone, Android phone: 'phone'
 * // iPad, Android tablet: 'tablet'
 * // Android TV: 'tv'
 * // Desktop/laptop: 'desktop'
 *
 * @returns {'phone'|'tablet'|'tv'|'desktop'} device type
 */
export function getDeviceType() {
  const ua = navigator.userAgent;

  // Check for TV first
  if (/TV|SmartTV|BRAVIA/.test(ua)) {
    return 'tv';
  }

  // Check for tablet (requires touch)
  if (getIsTablet()) {
    return 'tablet';
  }

  // Check for phone (requires touch)
  if (getIsPhone()) {
    return 'phone';
  }

  // Default to desktop
  return 'desktop';
}
