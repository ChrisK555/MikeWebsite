
let galleryImages = [];
let currentIndex = 0;
let autoRotateTimer;
let restartTimer;

// Swipe Support
let touchStartX = 0;
let currentTouchX = 0;
let isDragging = false;
const carousel = document.getElementById('carousel-container');

if (carousel) {
    carousel.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        currentTouchX = touchStartX;
        isDragging = true;
        stopAutoRotate();
        
        // Remove transition for direct 1:1 movement
        const img = document.getElementById('carousel-img');
        img.style.transition = 'none';
    }, {passive: true});

    carousel.addEventListener('touchmove', e => {
        if (!isDragging) return;
        currentTouchX = e.touches[0].clientX;
        const diff = currentTouchX - touchStartX;
        const img = document.getElementById('carousel-img');
        img.style.transform = `translateX(${diff}px)`;
    }, {passive: true});

    carousel.addEventListener('touchend', e => {
        if (!isDragging) return;
        isDragging = false;
        const diff = currentTouchX - touchStartX;
        const img = document.getElementById('carousel-img');
        
        // Restore transition for smooth snap/change
        img.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-in-out';
        
        if (Math.abs(diff) > 50) {
            // Swipe threshold met - move off screen then change
            const direction = diff > 0 ? -1 : 1; // Right swipe (pos) -> Prev, Left swipe (neg) -> Next
            img.style.transform = `translateX(${diff > 0 ? '100%' : '-100%'})`;
            img.style.opacity = '0';
            setTimeout(() => changeSlide(direction), 300);
        } else {
            // Snap back
            img.style.transform = 'translateX(0)';
            img.style.opacity = '1';
        }
    }, {passive: true});
}

// Gallery Loader
fetch('gallery.json')
    .then(response => {
        if (!response.ok) throw new Error("Gallery index not found");
        return response.json();
    })
    .then(images => {
        // Expecting simple array of filenames: ["image1.jpg", "image2.jpg"]
        galleryImages = images.map(img => ({ 
            image: `images/gallery/${img}`
        }));

        const loadingDiv = document.getElementById('gallery-loading');
        const carouselDiv = document.getElementById('carousel-container');

        if (galleryImages.length > 0) {
            if(loadingDiv) loadingDiv.classList.add('hidden');
            if(carouselDiv) carouselDiv.classList.remove('hidden');
            
            // Initialize Carousel
            showSlide(0);
            startAutoRotate();

            // Setup Lightbox Trigger
            const carouselImage = document.getElementById('carousel-img');
            if(carouselImage) {
                carouselImage.addEventListener('click', () => {
                    const lightbox = document.getElementById('lightbox');
                    const lightboxImg = document.getElementById('lightbox-img');
                    lightboxImg.src = galleryImages[currentIndex].image;
                    lightbox.classList.remove('hidden');
                    stopAutoRotate();
                });
            }
        } else {
            if(loadingDiv) loadingDiv.innerHTML = 'No images found in gallery.';
        }
    })
    .catch(err => {
        console.log('Gallery load error:', err);
        const loadingDiv = document.getElementById('gallery-loading');
        if(loadingDiv) {
            loadingDiv.innerHTML = `
                <div class="text-center text-slate-500 py-8">
                    <p class="font-bold text-red-500 mb-2">Gallery could not load locally</p>
                    <p class="text-sm">Browsers block reading local files (CORS). To view the gallery:</p>
                    <ul class="text-sm mt-2 list-disc list-inside">
                        <li>Run <code>node build-gallery.js</code> to generate the index</li>
                        <li>Open this file using a local server (like VS Code Live Server)</li>
                    </ul>
                </div>
            `;
        }
    });

function showSlide(index) {
    if (index >= galleryImages.length) currentIndex = 0;
    else if (index < 0) currentIndex = galleryImages.length - 1;
    else currentIndex = index;

    const item = galleryImages[currentIndex];
    const img = document.getElementById('carousel-img');
    const bg = document.getElementById('carousel-bg');
    
    // Fade out, swap, fade in
    if(img) img.style.opacity = '0';
    if (bg) bg.style.opacity = '0';

    setTimeout(() => {
        if(img) img.src = item.image;
        if (bg) bg.src = item.image;
        
        // Reset transform and transition for the new image
        if(img) {
            img.style.transition = 'none';
            img.style.transform = 'translateX(0)';
            void img.offsetWidth; // Force reflow
            img.style.transition = 'opacity 0.3s ease-in-out';
            img.style.opacity = '1';
        }


        if (bg) {
            bg.style.transition = 'opacity 0.3s ease-in-out';
            bg.style.opacity = '0.3';
        }
    }, 300);
}

function changeSlide(direction) {
    stopAutoRotate();
    showSlide(currentIndex + direction);
    // Restart auto rotate after 5 seconds of inactivity
    clearTimeout(restartTimer);
    restartTimer = setTimeout(startAutoRotate, 5000);
}

function startAutoRotate() {
    stopAutoRotate();
    resetProgressBar();
    autoRotateTimer = setInterval(() => {
        showSlide(currentIndex + 1);
        resetProgressBar();
    }, 6000);
}

function stopAutoRotate() {
    clearInterval(autoRotateTimer);
    const bar = document.getElementById('progress-bar');
    if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
    }
}

function resetProgressBar() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    void bar.offsetWidth; // Force reflow
    bar.style.transition = 'width 6000ms linear';
    bar.style.width = '100%';
}

function closeLightbox() {
    const lightBox = document.getElementById('lightbox');
    if(lightBox) lightBox.classList.add('hidden');
    startAutoRotate();
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateContact()) return;

    const form = event.target;
    const formData = new FormData(form);

    // Security: Sanitize inputs to prevent code injection
    // We iterate through text fields and strip potential HTML tags (< and >)
    for (const [key, value] of Array.from(formData.entries())) {
        if (typeof value === 'string') {
            const sanitized = value.replace(/[<>]/g, ""); 
            formData.set(key, sanitized);
        }
    }

    fetch("/", {
        method: "POST",
        body: formData
    })
    .then(() => {
        const successModal = document.getElementById('success-modal');
        if(successModal) successModal.classList.remove('hidden');
        form.reset();
    })
    .catch(error => alert("Error submitting form: " + error));
}

function closeSuccessModal() {
    const successModal = document.getElementById('success-modal');
    if(successModal) successModal.classList.add('hidden');
}

// Form Validation
function validateContact() {
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;
    const errorMsg = document.getElementById('contact-error');
    
    // Reset error message
    if(errorMsg) errorMsg.classList.add('hidden');

    // 1. Check if both contact methods are provided
    if (!email || !phone) {
        if(errorMsg) {
            errorMsg.textContent = "Please provide both an email and a phone number.";
            errorMsg.classList.remove('hidden');
        }
        return false;
    }

    // 2. Validate Phone Number (must have at least 10 digits if provided)
    if (phone && phone.replace(/\D/g, '').length < 10) {
        if(errorMsg) {
            errorMsg.textContent = "Please enter a valid phone number (at least 10 digits).";
            errorMsg.classList.remove('hidden');
        }
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    // Sticky Nav Animation
    const nav = document.getElementById('main-nav');
    const navContainer = document.getElementById('nav-container');
    const logoContainer = document.getElementById('nav-logo-container');
    const navCta = document.getElementById('nav-cta');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            // Scrolled State
            if(nav) {
                nav.classList.add('shadow-sm', 'bg-white/95');
                nav.classList.remove('bg-transparent');
            }
            
            if(navContainer) {
                navContainer.classList.remove('py-6');
                navContainer.classList.add('py-4');
            }

            if(logoContainer) {
                logoContainer.classList.remove('text-white');
                logoContainer.classList.add('text-neutral-900');
                logoContainer.classList.remove('bg-white/90', 'p-2', 'rounded');
            }

            if(navItems) {
                navItems.forEach(item => {
                    item.classList.remove('text-white');
                    item.classList.add('text-neutral-900');
                });
            }

            if(navCta) {
                navCta.classList.remove('bg-white', 'text-neutral-900', 'hover:bg-neutral-200');
                navCta.classList.add('bg-neutral-900', 'text-white', 'hover:bg-neutral-700');
            }

        } else {
            // Top State
            if(nav) {
                nav.classList.remove('shadow-sm', 'bg-white/95');
                nav.classList.add('bg-transparent');
            }

            if(navContainer) {
                navContainer.classList.add('py-6');
                navContainer.classList.remove('py-4');
            }

            if(logoContainer) {
                logoContainer.classList.add('text-white');
                logoContainer.classList.remove('text-neutral-900');
                logoContainer.classList.add('bg-white/90', 'p-2', 'rounded');
            }

            if(navItems) {
                navItems.forEach(item => {
                    item.classList.add('text-white');
                    item.classList.remove('text-neutral-900');
                });
            }

            if(navCta) {
                navCta.classList.add('bg-white', 'text-neutral-900', 'hover:bg-neutral-200');
                navCta.classList.remove('bg-neutral-900', 'text-white', 'hover:bg-neutral-700');
            }
        }
    });

    const serviceCards = document.querySelectorAll('.group');
    if(serviceCards) {
        serviceCards.forEach(card => {
            card.addEventListener('click', () => {
                void(0);
            });
        });
    }

    const prevButton = document.querySelector('button[aria-label="Previous slide"]');
    if(prevButton) {
        prevButton.addEventListener('click', () => {
            changeSlide(-1);
        });
    }

    const nextButton = document.querySelector('button[aria-label="Next slide"]');
    if(nextButton) {
        nextButton.addEventListener('click', () => {
            changeSlide(1);
        });
    }

    const contactForm = document.querySelector('form[name="quote"]');
    if(contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    const lightbox = document.getElementById('lightbox');
    if(lightbox) {
        lightbox.addEventListener('click', closeLightbox);
    }

    const lightboxImg = document.getElementById('lightbox-img');
    if(lightboxImg) {
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    const successModalButton = document.querySelector('#success-modal button');
    if(successModalButton) {
        successModalButton.addEventListener('click', closeSuccessModal);
    }
});
