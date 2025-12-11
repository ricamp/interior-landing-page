// script.js - Main application logic
// Note: All GSAP animations are in animations.js
// This file handles: form validation, Supabase integration, security features

/* --- SUPABASE INTEGRATION --- */
// Load Supabase config (make sure supabase-config.js is loaded first)
let supabase = null;

// Initialize Supabase client when config is available
try {
    if (typeof SUPABASE_CONFIG !== 'undefined' && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        console.log('✅ Supabase initialized');
    } else {
        console.error('❌ Supabase config not found');
    }
} catch (e) {
    console.error('❌ Supabase init error:', e);
}

/* --- INPUT VALIDATION FUNCTIONS --- */
function validateName(name) {
    const trimmed = name.trim();

    // Block HTML/JS injection
    if (/<|>|script|javascript|on\w+=/i.test(trimmed)) {
        return null;
    }

    // Accept letters (with accents), spaces, hyphens, apostrophes
    const regex = /^[a-zA-ZÀ-ÿ\s'\-]{2,100}$/;
    return regex.test(trimmed) ? trimmed : null;
}

function validateEmail(email) {
    const trimmed = email.trim().toLowerCase();

    // Block HTML/JS injection
    if (/<|>|script|javascript/i.test(trimmed)) {
        return null;
    }

    // Standard email regex
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(trimmed) ? trimmed : null;
}

function validatePhone(phone) {
    const trimmed = phone.trim();

    // Block HTML/JS injection
    if (/<|>|script|javascript/i.test(trimmed)) {
        return null;
    }

    // Accept numbers, spaces, +, -, (, )
    const regex = /^[\d\s\+\-\(\)]{8,20}$/;
    return regex.test(trimmed) ? trimmed : null;
}

/* --- FORM SUBMISSION HANDLER WITH SUPABASE --- */
const waitlistForm = document.querySelector('.form-group');

// Rate limiting
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN = 3000; // 3 seconds

// Timestamp validation (bot detection)
let formLoadTime = Date.now();

if (waitlistForm) {
    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. HONEYPOT CHECK (bot detection)
        const honeypot = waitlistForm.querySelector('input[name="website"]').value;
        if (honeypot) {
            // Bot detected - log and reject silently
            console.log('🤖 Bot detected via honeypot');
            if (typeof SecurityLogger !== 'undefined') {
                SecurityLogger.honeypotTriggered();
            }
            return;
        }

        // 2. TIMESTAMP VALIDATION (bot detection)
        const fillTime = Date.now() - formLoadTime;
        if (fillTime < 2000) { // Less than 2 seconds = suspicious
            if (typeof SecurityLogger !== 'undefined') {
                SecurityLogger.timestampViolation(fillTime);
            }
            alert('Por favor, preencha o formulário com calma.');
            return;
        }

        // 3. RATE LIMITING CHECK
        const now = Date.now();
        if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
            if (typeof SecurityLogger !== 'undefined') {
                SecurityLogger.rateLimitExceeded(now - lastSubmitTime);
            }
            alert('Por favor, aguarde alguns segundos antes de enviar novamente.');
            return;
        }

        const submitBtn = waitlistForm.querySelector('.submit-final');
        const originalText = submitBtn.textContent;

        // Collect and validate form data
        const nameInput = waitlistForm.querySelector('input[name="name"]').value;
        const emailInput = waitlistForm.querySelector('input[name="email"]').value;
        const phoneInput = waitlistForm.querySelector('input[name="phone"]').value;

        // Validate inputs
        const validatedName = validateName(nameInput);
        const validatedEmail = validateEmail(emailInput);
        const validatedPhone = validatePhone(phoneInput);

        if (!validatedName) {
            alert('Por favor, insira um nome válido (apenas letras, 2-100 caracteres).');
            return;
        }

        if (!validatedEmail) {
            alert('Por favor, insira um email válido.');
            return;
        }

        if (!validatedPhone) {
            alert('Por favor, insira um telefone válido (8-20 caracteres).');
            return;
        }

        const formData = {
            name: validatedName,
            email: validatedEmail,
            phone: validatedPhone
        };

        // UI Feedback: Loading
        submitBtn.textContent = 'ENVIANDO...';
        submitBtn.disabled = true;
        lastSubmitTime = now; // Update last submit time

        try {
            // Check if Supabase is initialized
            if (!supabase) {
                throw new Error('Erro de configuração. Por favor, recarregue a página.');
            }

            // Execute reCAPTCHA v3 (with safety check)
            let recaptchaToken = null;

            if (typeof grecaptcha !== 'undefined') {
                try {
                    recaptchaToken = await new Promise((resolve, reject) => {
                        grecaptcha.ready(() => {
                            grecaptcha.execute('6Le1zCYsAAAAAJu0EPdQnX4q2K9NsiouhHSJ3_Hq', { action: 'submit' })
                                .then(token => resolve(token))
                                .catch(err => {
                                    console.warn('reCAPTCHA error:', err);
                                    resolve(null); // Continue without reCAPTCHA
                                });
                        });
                    });
                } catch (err) {
                    console.warn('reCAPTCHA failed, continuing without it:', err);
                }
            } else {
                console.warn('reCAPTCHA not loaded, continuing without it');
            }

            // Add reCAPTCHA token to form data (if available)
            if (recaptchaToken) {
                formData.recaptcha_token = recaptchaToken;
            }

            console.log('📝 Form data:', formData);

            // Insert into Supabase
            console.log('🔄 Inserting into Supabase...');
            const { data, error } = await supabase
                .from('waitlist')
                .insert([formData])
                .select();

            console.log('📊 Supabase response:', { data, error });

            if (error) {
                // Handle specific errors
                if (error.code === '23505') {
                    throw new Error('Este email já está cadastrado!');
                }
                if (error.code === 'PGRST116') {
                    throw new Error('Erro de conexão. Verifique sua internet.');
                }
                throw error;
            }

            // Success!
            console.log('✅ Cadastro realizado:', data);

            // Show success message inline
            const formContent = document.querySelector('.form-content');
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `
                <div class="success-icon">✓</div>
                <h3>Cadastro Realizado!</h3>
                <p>Você está na lista. Aguarde novidades em breve.</p>
            `;

            // Hide form and show success message
            waitlistForm.style.display = 'none';
            formContent.querySelector('.final-title').style.display = 'none';
            formContent.appendChild(successMessage);

            // Prevent ScrollTrigger from scrolling to top
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }

            // Ensure we stay at the current scroll position
            const finalSection = document.querySelector('.final-panorama-section');
            if (finalSection) {
                finalSection.scrollIntoView({ behavior: 'instant', block: 'center' });
            }

            // Reset after 5s (in case user wants to register another)
            setTimeout(() => {
                successMessage.remove();
                waitlistForm.style.display = 'flex';
                formContent.querySelector('.final-title').style.display = 'block';
                waitlistForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                // Refresh ScrollTrigger after restoring form
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }, 5000);

        } catch (error) {
            console.error('❌ Erro ao cadastrar:', error);

            // User-friendly error feedback
            submitBtn.textContent = '✗ ERRO';
            submitBtn.style.background = 'rgba(255, 0, 0, 0.8)';
            submitBtn.style.color = 'white';
            submitBtn.style.borderColor = 'red';

            // Show error message
            const errorMessage = error.message || 'Erro ao cadastrar. Tente novamente.';
            alert(errorMessage);

            // Restore button after 2s
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.style.color = '';
                submitBtn.style.borderColor = '';
                submitBtn.disabled = false;
            }, 2000);
        }
    });
}

/* --- BACK TO TOP BUTTON --- */
const backToTopBtn = document.querySelector('.back-to-top');

if (backToTopBtn) {
    // Show button when user scrolls past 50% of the page
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;

        if (scrollPercent > 50) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top on click using Lenis
    backToTopBtn.addEventListener('click', () => {
        if (typeof lenis !== 'undefined') {
            lenis.scrollTo(0, {
                duration: 2,
                easing: (t) => 1 === t ? 1 : 1 - Math.pow(2, -10 * t)
            });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}
