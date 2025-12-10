// security-logger.js - Security Event Logging Module
// Logs security events to Supabase for monitoring

const SecurityLogger = {
    /**
     * Log a security event to Supabase
     * @param {string} eventType - Type of event: 'honeypot_triggered', 'rate_limit_exceeded', 'recaptcha_low_score', 'timestamp_violation'
     * @param {Object} details - Additional details about the event
     */
    async log(eventType, details = {}) {
        // Check if Supabase is available
        if (typeof supabase === 'undefined' || !supabase) {
            console.warn('[SecurityLogger] Supabase not available, skipping log');
            return;
        }

        try {
            const logEntry = {
                event_type: eventType,
                user_agent: navigator.userAgent,
                page_url: window.location.href,
                details: {
                    ...details,
                    timestamp: new Date().toISOString(),
                    referrer: document.referrer || null
                }
            };

            const { error } = await supabase
                .from('security_logs')
                .insert([logEntry]);

            if (error) {
                // Silently fail - don't break user experience
                console.warn('[SecurityLogger] Failed to log event:', error.message);
            }
        } catch (e) {
            // Silently fail - security logging should never break the site
            console.warn('[SecurityLogger] Error:', e.message);
        }
    },

    // Convenience methods for specific event types
    honeypotTriggered() {
        this.log('honeypot_triggered', { description: 'Bot detected via honeypot field' });
    },

    rateLimitExceeded(timeSinceLastSubmit) {
        this.log('rate_limit_exceeded', {
            description: 'Submission attempted too quickly',
            time_since_last_ms: timeSinceLastSubmit
        });
    },

    timestampViolation(fillTime) {
        this.log('timestamp_violation', {
            description: 'Form filled too quickly (less than 2 seconds)',
            fill_time_ms: fillTime
        });
    },

    recaptchaLowScore(score) {
        this.log('recaptcha_low_score', {
            description: 'reCAPTCHA score below threshold',
            score: score
        });
    }
};

// Make it globally available
window.SecurityLogger = SecurityLogger;
