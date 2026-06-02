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

    // Section colors change on scroll
    window.addEventListener('load', function () {
        const observerOptions = {
            threshold: [0.2]
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // entry.target.classList.add('show');
                    const sectionColor = entry.target.dataset.color;
                    const rootElement = document.documentElement;
                    rootElement.style.setProperty('--back-color', sectionColor);
                    // observer.unobserve(entry.target);
                } else {
                    const rootElement = document.documentElement;
                    rootElement.style.removeProperty('--back-color');
                }
            });
        }, observerOptions);

        const sections = document.querySelectorAll('.colored');
        sections.forEach((el) => observer.observe(el));
    });


    // Design mode for items
    document.addEventListener('keyup', (e) => {
        if (e.ctrlKey && e.key === ',') {
            console.log("design");
            body.classList.add('design');

            const nodesObject = {
                nodeA: null,
                nodeB: null
            }

            function swapNodes(a, b) {
                console.log(`Swapd ${a.innerText} for ${b.innerText}`);
                b.before(a);
            }

            const items = document.querySelectorAll('.items a');
            for (const item of items) {
                item.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (nodesObject.nodeA == null) {
                        nodesObject.nodeA = this;
                        nodesObject.nodeA.classList.add('checked-node');
                    } else if (nodesObject.nodeA == this) {
                        nodesObject.nodeA.classList.remove('checked-node');
                        nodesObject.nodeA = null;
                    } else {
                        nodesObject.nodeA.classList.remove('checked-node');
                        nodesObject.nodeA = this;
                        nodesObject.nodeA.classList.add('checked-node');
                    }
                });
            }

            document.addEventListener('keyup', (e) => {
                if (e.key == 'ArrowLeft') {
                    e.preventDefault();
                    if (nodesObject.nodeA) {
                        console.log('Ready for swap');
                        if (nodesObject.nodeA.previousElementSibling) {
                            nodesObject.nodeA.after(nodesObject.nodeA.previousElementSibling);
                        }
                    }
                }
                if (e.key == 'ArrowRight') {
                    e.preventDefault();
                    if (nodesObject.nodeA) {
                        console.log('Ready for swap');
                        if (nodesObject.nodeA.nextElementSibling) {
                            nodesObject.nodeA.before(nodesObject.nodeA.nextElementSibling);
                        }
                    }
                }
            });
        }
    }, { once: true });

    // Close menu on navigational click
    const navAnchors = document.querySelectorAll('nav a');
    const menuToggle = document.querySelector('#menu-toggle');
    for (const anchor of navAnchors) {
        anchor.addEventListener('click', (e) => {
            menuToggle.checked = false;
        });
    }
})();