import { ServiceBase } from '$lib/services/service-base/ServiceBase.js';

/**
 * Countdown service that counts down to a specific target time
 * 
 * Demonstrates:
 * - ServiceBase inheritance and lifecycle management
 * - Configuration handling with live updates
 * - State management and health monitoring
 */
export default class CountdownService extends ServiceBase {
  /** @type {number} */
  #countdown = 0;
  
  /** @type {Date|null} */
  #targetTime = null;
  
  /** @type {number|NodeJS.Timeout|null} */
  #intervalId = null;

  /**
   * Configure the countdown target time
   * 
   * @param {Object} newConfig - Service configuration
   * @param {string} newConfig.targetTime - ISO date string for countdown target
   * @param {Object} [oldConfig] - Previous configuration (for reconfiguration)
   */
  async _configure(newConfig, oldConfig = null) {
    // console.log('_configure called with:', newConfig, 'oldConfig:', oldConfig);
    // this.logger.info(`_configure called with: ${JSON.stringify(newConfig)}`);
    
    const newTarget = new Date(newConfig.targetTime);
    
    this.logger.info(`Configuring countdown target: ${newTarget.toLocaleString()}`);
    // console.log(`Configuring countdown target: ${newTarget.toLocaleString()}`);
    
    // Handle live reconfiguration
    if (!oldConfig || oldConfig.targetTime !== newConfig.targetTime) {
      this.#targetTime = newTarget;
      this.#updateCountdown();
      
      if (oldConfig) {
        this.logger.info('Target time updated via live reconfiguration');
        // console.log('Target time updated via live reconfiguration');
      }
    }
  }

  /**
   * Start the countdown timer
   */
  async _start() {
    // console.log('_start called');
    this.logger.info('Starting countdown timer');
    // console.log('Starting countdown timer');
    
    this.#intervalId = setInterval(() => this.#updateCountdown(), 1000);
    this.#updateCountdown(); // Initial update
    
    // console.log('Interval set up, intervalId:', this.#intervalId);
  }

  /**
   * Stop the countdown timer
   */
  async _stop() {
    this.logger.info('Stopping countdown timer');
    
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }

  /**
   * Update the countdown value
   */
  #updateCountdown() {
    if (!this.#targetTime) {
      this.#countdown = 0;
      return;
    }

    const now = new Date();
    const diff = Math.max(0, this.#targetTime.getTime() - now.getTime());
    const newCountdown = Math.floor(diff / 1000);
    
    if (newCountdown !== this.#countdown) {
      this.#countdown = newCountdown;
      
      // Emit an event for UI reactivity since we can't use $state in a service
      this.emit('countdownUpdated', { countdown: this.#countdown });
      
      // this.logger.info(`Countdown [${this.#countdown}]`);
      // console.log(`Countdown [${this.#countdown}]`);
    }
  }

  /**
   * Health check - verify countdown is functioning
   * 
   * @returns {Promise<Object>} Health status with countdown info
   */
  async _healthCheck() {
    const isValid = this.#targetTime && !isNaN(this.#targetTime.getTime());
    const isActive = this.#intervalId !== null;
    
    return {
      targetTime: this.#targetTime?.toISOString(),
      countdown: this.#countdown,
      timerActive: isActive,
      targetValid: isValid
    };
  }

  // Public getters for Svelte reactivity
  
  /**
   * Get current countdown value (reactive)
   * @returns {number} Seconds remaining
   */
  get countdown() { 
    return this.#countdown; 
  }
  
  /**
   * Get target time
   * @returns {Date|null} Target date
   */
  get targetTime() { 
    return this.#targetTime; 
  }
  
  /**
   * Check if countdown is active
   * @returns {boolean} True if service is running
   */
  get isActive() { 
    return this.state === 'running'; 
  }
  
  /**
   * Format countdown as human readable string
   * @returns {string} Formatted time remaining
   */
  get formattedTime() {
    const seconds = this.#countdown;
    
    if (seconds <= 0) {
      return 'COUNTDOWN COMPLETE';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}
