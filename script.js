// script.js - Main application logic
// Note: lenis, GSAP plugins are initialized in animations.js

// 1. ANIMAÇÃO DE ENTRADA DO LOGO (Robust Fix)
// Note: SVG injection handling is required if we switch to an external file.
// For now, these selectors assume the SVG is INLINE or ACCESSIBLE (e.g. via <object>).
// If using <object>, we need to access contentDocument.
// If using <img>, this animation will fail unless we refactor to animate the container.
// Given User Instruction: "Use <img src='logo.svg'>", this animation logic needs update.
// However, the user said "If you need to animate internal colors... use <object>...".
// I will keep the logic generic for now, but I might need to wrap it in a load event listener for the <object>.
// Or, effectively, if I use <img src>, I can only animate the whole block.
// I'll assume for now I will try to use <object> or similar to fetch it.
// Actually, to follow the "clean" instruction of <img src="..."> strictly, I should change the animation to fade in the whole logo.
// But the user *liked* the staggered reveal.
// I will keep the staggered logic but comment that it requires accessible SVG. 
// I will try to use fetch injection in the HTML part later, or just animate the container as fallback.
// Let's write the script to handle *internal* paths if they exist, or the container if not.

/* 
   REFACTOR NOTE: 
   If using <img src="logo.svg">, JS cannot access internal paths directly.
   To preserve the staggered animation, we would need to inject the SVG inline via fetch().
   Below logic attempts to select paths. If it fails, it won't crash, but animation won't happen.
   I will add a fallback to animate the .logo-svg container itself if internals aren't found.
*/

window.addEventListener("load", () => {
    // Attempt to access SVG internals if using object tag
    const logoObject = document.querySelector(".logo-svg-object");
    let logoElements = [];

    if (logoObject && logoObject.contentDocument) {
        // If <object> is used
        const svgDoc = logoObject.contentDocument;
        logoElements = svgDoc.querySelectorAll("path, polygon, rect");
    } else {
        // If inline or fallback
        logoElements = document.querySelectorAll(".logo-svg > *, .logo-svg path");
    }

    const tlHero = gsap.timeline({
        defaults: {
            ease: "power2.out"
        }
    });

    if (logoElements.length > 0) {
        // Staggered Animation with micro delay
        tlHero.to(logoElements, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            stagger: 0.1,
            delay: 0.3 // Delay to prevent flash
        });
    } else {
        // Fallback: Animate the container if it's an <img>
        tlHero.to(".logo-svg, .logo-img", {
            opacity: 1,
            y: 0,
            duration: 1.5
        });
    }

    tlHero.to(".hero-btn", {
        opacity: 1,
        y: -50,
        duration: 0.6
    }, "-=1.2");
});


// 2. GRID PARALLAX
const galleryTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".gallery-container", start: "top bottom", end: "bottom top", scrub: 1
    }
});

galleryTl.to(".pos-1", { yPercent: -20 }, 0);
galleryTl.to(".pos-2", { yPercent: -50 }, 0);
galleryTl.to(".pos-3", { yPercent: -30 }, 0);
galleryTl.to(".pos-4", { yPercent: -40 }, 0);

// 3. EDITORIAL REVEAL
document.querySelectorAll('.editorial-section').forEach(section => {
    ScrollTrigger.create({
        trigger: section,
        start: "top 65%",
        onEnter: () => section.classList.add('active'),
        onEnterBack: () => section.classList.add('active')
    });
});



/* --- 3. CURATION SCROLL TRIGGER (Snap & Flow with Cover) --- */
// Explicitly set z-indices
gsap.set(".img-1", { zIndex: 1, opacity: 1 });
gsap.set(".img-2", { zIndex: 2, opacity: 0 });
gsap.set(".img-3", { zIndex: 3, opacity: 0 });
gsap.set(".img-4", { zIndex: 4, opacity: 0 });

// INITIAL STATES: Cover Visible, Text 1 Hidden
gsap.set(".curation-start-screen", { opacity: 1, y: 0 });
gsap.set([".txt-1", ".txt-2", ".txt-3", ".txt-4"], { opacity: 0, y: 20 });

let curTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".curation-section",
        start: "top top",
        end: "+=500%", // Increased for Cover step
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        snap: {
            snapTo: "labels",
            duration: { min: 0.2, max: 0.6 },
            delay: 0.1,
            ease: "power1.inOut"
        }
    }
});

// DEFINING STEPS & LABELS
curTl.addLabel("start"); // Cover State

// 0 -> 1 (Cover Out -> Text 1 In)
curTl.to(".curation-start-screen", { opacity: 0, y: -20, duration: 1 })
    .to(".txt-1", { opacity: 1, y: 0, duration: 1 }, "-=0.5")
    .addLabel("step1");

// 1 -> 2
curTl.to(".txt-1", { y: -20, opacity: 0, duration: 1 })
    .to(".img-2", { opacity: 1, duration: 1 }, "<")
    .to(".txt-2", { y: 0, opacity: 1, duration: 1 }, "-=0.5")
    .addLabel("step2");

// 2 -> 3
curTl.to(".txt-2", { y: -20, opacity: 0, duration: 1 })
    .to(".img-3", { opacity: 1, duration: 1 }, "<")
    .to(".txt-3", { y: 0, opacity: 1, duration: 1 }, "-=0.5")
    .addLabel("step3");

// 3 -> 4
curTl.to(".txt-3", { y: -20, opacity: 0, duration: 1 })
    .to(".img-4", { opacity: 1, duration: 1 }, "<")
    .to(".txt-4", { y: 0, opacity: 1, duration: 1 }, "-=0.5")
    .addLabel("step4");

// Hold final state
curTl.to({}, { duration: 1 });




/* --- BAR EXPERIENCE (Stacked Cards) --- */
let barTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".bar-stacked-section",
        start: "top top",
        end: "+=250%",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        snap: {
            snapTo: "labels",
            duration: { min: 0.2, max: 0.6 },
            delay: 0.1,
            ease: "power1.inOut"
        }
    }
});

// Initial States
gsap.set(".bar-start-screen", { opacity: 1, y: 0 });
gsap.set(".card-1", { zIndex: 1, yPercent: 100 });
gsap.set(".card-2", { zIndex: 2, yPercent: 100 });
gsap.set(".card-3", { zIndex: 3, yPercent: 100 });

barTl.addLabel("start");

// Cover -> Card 1
barTl.to(".bar-start-screen", { opacity: 0, y: -20, duration: 1 })
    .to(".card-1", { yPercent: 0, duration: 1, ease: "power2.out" }, "-=0.5")
    .addLabel("card1");

// Card 1 -> Card 2
barTl.to(".card-1", { scale: 0.95, filter: "brightness(0.6)", duration: 1 })
    .to(".card-2", { yPercent: 0, duration: 1, ease: "power2.out" }, "<")
    .addLabel("card2");

// Card 2 -> Card 3
barTl.to(".card-2", { scale: 0.95, filter: "brightness(0.6)", duration: 1 })
    .to(".card-3", { yPercent: 0, duration: 1, ease: "power2.out" }, "<")
    .addLabel("card3");

// Hold slightly
barTl.to({}, { duration: 0.5 });

/* --- FORM FOOTER ANIMATION --- */
const formFooter = document.querySelector('.final-panorama-section');

if (formFooter) {
    const formObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                formObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -200px 0px'
    });

    formObserver.observe(formFooter);
}

/* --- SECURITY: DISABLE CONSOLE IN PRODUCTION --- */
const isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168');

if (!isDevelopment) {
    console.log = () => { };
    console.error = () => { };
    console.warn = () => { };
}

/* --- SUPABASE INTEGRATION --- */
// Load Supabase config (make sure supabase-config.js is loaded first)
let supabase;

// Initialize Supabase client when config is available
if (typeof SUPABASE_CONFIG !== 'undefined') {
    supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
    );
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

            // Insert into Supabase
            const { data, error } = await supabase
                .from('waitlist')
                .insert([formData])
                .select();

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
