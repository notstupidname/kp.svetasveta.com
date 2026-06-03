(function () {
    "use strict"

    const body = document.querySelector('body');

    // Transition effect
    const anchors = document.querySelectorAll('a');

    for (const anchor of anchors) {
        let href = anchor.getAttribute('href');
        let target = anchor.getAttribute('target');
        if (!href ||
            href.indexOf('#') != -1 ||
            href.indexOf('tel') != -1 ||
            href.indexOf('wa.me') != -1 ||
            href.indexOf('mailto') != -1 ||
            target == '_blank')
            continue;
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            body.classList.add('transition');
            window.setTimeout(function () {
                window.location.href = href;
            }, 20);
        });
    }

    // Remove transition if page loaded from bfcache
    window.addEventListener('pageshow', function (event) {
        if (event.persisted === true) {
            body.classList.remove('transition');
        }
    }, false);

    // Loading animation
    window.addEventListener('load', function () {
        //TEST timeout
        // Android Chrome bugs without this delay
        // window.setTimeout(function () {
        body.classList.remove('is-loading');
        // }, 5);
        body.classList.remove('transition');
    });



    // Close menu on navigational click
    const navAnchors = document.querySelectorAll('nav a');
    const menuToggle = document.querySelector('#menu-toggle');
    for (const anchor of navAnchors) {
        anchor.addEventListener('click', (e) => {
            menuToggle.checked = false;
        });
    }

    // Carousels

    function initCarousels() {
        // Select ALL carousels on the page
        const carousels = document.querySelectorAll(".carousel");

        // Run your logic for each individual carousel
        carousels.forEach((carouselEl) => {
            const slideContainerEl = carouselEl.querySelector(".slider");
            const slideEl = carouselEl.querySelector(".cslide");

            // Safety check to ensure the carousel has slides
            if (!slideContainerEl || !slideEl) return;

            const numberOfSlides = slideContainerEl.children.length;
            let slideWidth = slideEl.offsetWidth;
            const dotsContainerEl = carouselEl.querySelector(".carousel-dots");

            // --- Create Dots ---
            const dots = [];
            if (dotsContainerEl) {
                for (let i = 0; i < numberOfSlides; i++) {
                    const dotEl = document.createElement('button');
                    dotEl.classList.add('dot');
                    if (i === 0) {
                        dotEl.classList.add('active');
                    }
                    dotEl.setAttribute('aria-label', `Slide ${i + 1}`);
                    dotEl.addEventListener('click', () => navigate(i));
                    dotsContainerEl.appendChild(dotEl);
                    dots.push(dotEl);
                }
            }

            // --- Function to update active dot ---
            const updateActiveDot = () => {
                slideWidth = slideEl.offsetWidth;

                // Default to the first slide (0) if width is missing
                let currentSlideIndex = 0;

                // Only calculate if slideWidth is greater than 0
                if (slideWidth > 0) {
                    currentSlideIndex = Math.round(slideContainerEl.scrollLeft / slideWidth);
                }

                dots.forEach((dot, index) => {
                    if (index === currentSlideIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            };

            updateActiveDot();

            // --- Add click handlers ---
            // Find buttons INSIDE this specific carousel using classes, not global IDs
            const backBtn = carouselEl.querySelector(".button_bck");
            const fwdBtn = carouselEl.querySelector(".button_fwd");

            if (backBtn) backBtn.addEventListener("click", () => navigate("backward"));
            if (fwdBtn) fwdBtn.addEventListener("click", () => navigate("forward"));

            // --- Add keyboard handlers ---
            // Attach to the carousel element itself so they don't all scroll at once.
            // NOTE: The carouselEl needs tabindex="0" in HTML for this to work.
            // carouselEl.addEventListener('keydown', (e) => {
            //     if (e.code === 'ArrowLeft') {
            //         navigate("backward");
            //         e.preventDefault(); // Stop page from scrolling horizontally
            //     } else if (e.code === 'ArrowRight') {
            //         navigate("forward");
            //         e.preventDefault();
            //     }
            // });

            // --- Add resize handler ---
            window.addEventListener('resize', () => {
                slideWidth = slideEl.offsetWidth;
            });

            // --- Slide transition ---
            const getNewScrollPosition = (arg) => {
                const maxScrollLeft = slideContainerEl.scrollWidth - slideWidth;
                if (arg === "forward") {
                    const x = slideContainerEl.scrollLeft + slideWidth;
                    return x <= maxScrollLeft ? x : 0;
                } else if (arg === "backward") {
                    if (slideContainerEl.scrollLeft <= 1) {
                        return maxScrollLeft;
                    } else {
                        const x = slideContainerEl.scrollLeft - slideWidth;
                        return x >= 0 ? x : 0;
                    }
                } else if (typeof arg === "number") {
                    return arg * slideWidth;
                }
            }

            const navigate = (arg) => {
                // NEW: Always grab the freshest width right before doing the math!
                slideWidth = slideEl.offsetWidth;

                // Calculate the position and scroll
                slideContainerEl.scrollLeft = getNewScrollPosition(arg);

                // Update active dot after navigation
                updateActiveDot();
            };

            slideContainerEl.addEventListener('scroll', () => {
                updateActiveDot();
            });
        });
    }

    // Initialize when the DOM is fully loaded
    document.addEventListener('load', initCarousels());
})();