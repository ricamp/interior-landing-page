    <script> gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        const lenis = new Lenis({
            duration: 1.5, smooth: true
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // 1. ANIMAÇÃO DE ENTRADA DO LOGO (Robust Fix)
        // Tenta pegar filhos diretos (ex: letras agrupadas)
        let logoElements = document.querySelectorAll(".logo-svg > *");

        // Se houver poucos elementos (ex: tudo num único grupo <g>), busca os paths internos
        if (logoElements.length <= 1) {
            logoElements = document.querySelectorAll(".logo-svg path, .logo-svg polygon, .logo-svg rect");
        }

        const tlHero = gsap.timeline({
            defaults: {
                ease: "power2.out"
            }
        });

        // Como o CSS já define opacity: 0 e translateY(20px), usamos .to() para o estado final
        tlHero.to(logoElements, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            stagger: 0.1

        }).to(".hero-btn", {
            opacity: 1,
            y: -50,
            duration: 0.6
        }, "-=1.2");

        // 2. GRID PARALLAX
        const galleryTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".gallery-container", start: "top bottom", end: "bottom top", scrub: 1
            }
        });

        galleryTl.to(".pos-1", {
            yPercent: -20
        }

            , 0);

        galleryTl.to(".pos-2", {
            yPercent: -50
        }

            , 0);

        galleryTl.to(".pos-3", {
            yPercent: -30
        }

            , 0);

        galleryTl.to(".pos-4", {
            yPercent: -40
        }

            , 0);

        // 3. EDITORIAL REVEAL
        document.querySelectorAll('.editorial-section').forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: "top 65%",
                onEnter: () => section.classList.add('active'),
                onEnterBack: () => section.classList.add('active')
            });
        });

        // 4. BAR REVEAL


        // 5. FINAL SECTION PARALLAX
        // 5. FINAL SECTION PARALLAX & FORM REVEAL
        const finalTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".final-section",
                start: "top bottom", // Start earlier (when top hits bottom of viewport)
                end: "bottom bottom",
                scrub: 1,
            }
        });

        // Configuração inicial do conteudo final
        gsap.set(".final-content", {
            opacity: 0, scale: 0.95, y: 30
        });

        finalTl.fromTo(".final-bg-img",
            { yPercent: -20 }, // Start slightly pulled up
            { yPercent: 0, ease: "none" } // End natural
        );

        // Separate Trigger for Pinning/Form Reveal
        ScrollTrigger.create({
            trigger: ".final-section",
            start: "top top",
            end: "+=150%",
            pin: true,
            onEnter: () => gsap.to(".final-content", { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power2.out" })
        });

        // Scroll do Botão
        // Scroll do Botão - O Pulo do Gato (Scroll to Animation End)
        const heroBtn = document.querySelector('.hero-btn');

        if (heroBtn) {
            heroBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Scroll to the absolute bottom of the page (Form is the last element)
                lenis.scrollTo(document.body.scrollHeight, {
                    duration: 2, // Fast smooth glide
                    easing: (t) => 1 === t ? 1 : 1 - Math.pow(2, -10 * t) // Expo Out for premium feel
                });
            });
        }




        // 6. NEW MARQUEE ANIMATION (DOUBLE LAYER)

        // GROUP 1 (Left Direction - Images + Text Sync)
        // Adjust duration to control speed
        gsap.to(".group-1 .track-images", {
            xPercent: -50,
            ease: "none",
            duration: 80,
            repeat: -1
        });
        gsap.to(".group-1 .track-text", {
            xPercent: -50,
            ease: "none",
            duration: 32, // Slower (was 25)
            repeat: -1
        });

        // GROUP 2 (Right Direction - Images + Text Sync)
        gsap.fromTo(".group-2 .track-images",
            { xPercent: -50 },
            { xPercent: 0, ease: "none", duration: 80, repeat: -1 }
        );
        gsap.fromTo(".group-2 .track-text",
            { xPercent: -50 },
            { xPercent: 0, ease: "none", duration: 32, repeat: -1 }
        );

        /* --- CURATION SCROLL TRIGGER (Snap & Flow with Cover) --- */
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
                end: "+=250%", // Tighter duration to release sooner
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
        gsap.set(".card-1", { zIndex: 1, yPercent: 100 }); // Starts below
        gsap.set(".card-2", { zIndex: 2, yPercent: 100 });
        gsap.set(".card-3", { zIndex: 3, yPercent: 100 });

        barTl.addLabel("start");

        // Cover -> Card 1
        barTl.to(".bar-start-screen", { opacity: 0, y: -20, duration: 1 })
            .to(".card-1", { yPercent: 0, duration: 1, ease: "power2.out" }, "-=0.5")
            .addLabel("card1");

        // Card 1 -> Card 2
        barTl.to(".card-1", { scale: 0.95, filter: "brightness(0.6)", duration: 1 }) // Less scale/dim for smoothness
            .to(".card-2", { yPercent: 0, duration: 1, ease: "power2.out" }, "<")
            .addLabel("card2");

        // Card 2 -> Card 3
        barTl.to(".card-2", { scale: 0.95, filter: "brightness(0.6)", duration: 1 })
            .to(".card-3", { yPercent: 0, duration: 1, ease: "power2.out" }, "<")
            .addLabel("card3");

        // Hold slightly
        barTl.to({}, { duration: 0.5 });


    </script>

    <!-- Supabase Client Library -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

    <!-- Supabase Configuration (loaded before script.js) -->
    <script src="./supabase-config.js"></script>

    <!-- Main Script (loaded after Supabase) -->
    <script src="./script.js"></script>
