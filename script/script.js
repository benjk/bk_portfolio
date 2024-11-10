
document.addEventListener( 'DOMContentLoaded', function () {
    const header = document.querySelector('header')
    const projectsContainer = document.querySelector('.projects-container-global');
    const carouselArrows = document.querySelectorAll(".car-arrow");
    const mobileArrows = document.querySelectorAll('.mobile-carrow');
    const radiosCarousel = document.querySelectorAll('.radio-carousel');
    const phoneLink = document.getElementById('phone-info');
    const clientSlideTrack = document.querySelector(".client-slide-track");
    
    let mainCarousels;
    let thumbCarouselImgContainer;
    let cards;
    let contactLinks;
    let projectsLinks;
    let secondLinks;
    
    let activeCard;
    let scrollingLinkAnimation = null;
    
    // Versionning
    const spanVersionning = document.querySelector("span#versionning");
    if (spanVersionning) {
        spanVersionning.textContent = "v1.0.2"
    }
    
    // Call from Phone only
    if (!isPhone()) {
        phoneLink.style.setProperty('pointer-events', 'none');
    }
    
    Promise.all([
        fetch('projects-data.json').then(response => response.json()),
        fetch('project-template.html').then(response => response.text())
    ]).then(([data, template]) => {
        
        data.forEach(project => {
            // On passe l'image 1 en dernier
            const images = [...project.images];
            const firstImage = images.shift();
            // Sur mobile on vire les logos ils genent l'affichage et n'apportent rien
            if (!isSmallScreen() || project.id != 3 && project.id != 4) {
                images.push(firstImage);
                if (isSmallScreen() && project.id == 2) {
                    const firstImage = images.shift();
                    images.push(firstImage);
                }
            }
            
            let mainImagesHTML = '';
            images.forEach(image => {
                mainImagesHTML += `
                    <li class="splide__slide">
                        <img src="${image}" alt="">
                    </li>`;
            });
            
            let thumbHTML = ''
            if ((project.id == 3 || project.id == 4) && !isSmallScreen()) {
                images.pop();
                images.forEach(image => {            
                    thumbHTML += `
                    <li class="splide__slide">
                        <img src="${image}" alt="">
                    </li>`;
                });
            } else {
                thumbHTML = mainImagesHTML;
            }
            
            if (project.video) {
                thumbHTML += `
                    <li class="splide__slide">
                        <img src="${project.video.thumb}" alt="">
                    </li>`;
                
                mainImagesHTML += `
                    <li class="splide__slide">
                        <lite-youtube videoid="${project.video.src}" title="${project.video.title}" playlabel="${project.video.title}" js-api></lite-youtube>
                    </li>`;
            }
            
            let infosProjectHTML = '';
            Object.entries(project.details).forEach(([key, value]) => {
                infosProjectHTML += `
                    <li class="infos-project">
                        <strong>${capitalize(key)}:</strong> ${value}
                    </li>`;
            });            
            
            const cardHTML = template
            .replace(new RegExp('{{id}}', 'g'), project.id)
            .replace(new RegExp('{{title}}', 'g'), project.title.toUpperCase())
            .replace('{{description}}', project.description)
            .replace('{{thumbnails}}', thumbHTML)
            .replace('{{mainImages}}', mainImagesHTML)
            .replace(new RegExp('{{infosProject}}', 'g'), infosProjectHTML)
            projectsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
        
        waitForAllImages().then(() => {
            requestAnimationFrame(() => {
                mainCarousels = document.querySelectorAll('.main-carousel');
                thumbCarouselImgContainer = document.querySelectorAll('.thumbnail-carousel .splide__list');
                cards = document.querySelectorAll('.card');
                contactLinks = document.querySelectorAll(".contact-link");
                projectsLinks = document.querySelectorAll(".projects-link");
                secondLinks = document.querySelectorAll(".second-link");
                activeCard = document.querySelector('.card');
                activeCard.classList.add('is-active');
                initSplide(data);
                
                radiosCarousel.forEach(radio => {
                    radio.addEventListener('change', (event) => {
                        activateCardForItem(radio)
                    });
                });
          
                initScrollAnimation();
                handleScreenSize();
            });
        });
    });
    
    function waitForAllImages() {
        const images = Array.from(document.querySelectorAll('img'));
        
        const promises = images.map(img => {
            return new Promise((resolve, reject) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = reject;
                }
            });
        });   
        return Promise.all(promises);
    }
    
    // INIT FUNCTIONS
    function initScrollAnimation() {    
        contactLinks.forEach( link => {
            let duration = parseFloat(link.getAttribute('data-duration'))  || 0.5; 
            
            link.addEventListener("click", () => {
                let headerHeight = 0;
                if (header) headerHeight = header.clientHeight;
                scrollingLinkAnimation = gsap.to(window, {
                    duration: duration,
                    scrollTo: {
                        y:"#contact-section", offsetY: headerHeight
                    },
                    onComplete: () => {
                        setTimeout(() => {
                            scrollingLinkAnimation = null;
                        }, 50);
                    }
                });
            });
        })
        
        projectsLinks.forEach( link => {
            let duration = parseFloat(link.getAttribute('data-duration'))  || 0.5; 
            
            link.addEventListener("click", () => {
                let seuil = isSmallScreen() ? "#third-section" : ".projects-container-global"
                let headerHeight = 0;
                if (header) headerHeight = header.clientHeight;
                scrollingLinkAnimation = gsap.to(window, {
                    duration: duration,
                    scrollTo: {
                        y: seuil, offsetY: headerHeight
                    },
                    onComplete: () => {
                        setTimeout(() => {
                            scrollingLinkAnimation = null;
                        }, 50);                    }
                    });
                });
            })
            
            secondLinks.forEach( link => {
                let duration = parseFloat(link.getAttribute('data-duration'))  || 0.5; 
                
                link.addEventListener("click", () => {
                    let headerHeight = 0;
                    if (header) headerHeight = header.clientHeight;
                    gsap.to(window, {duration: duration, scrollTo:{y:"#second-section", offsetY: headerHeight}});
                    scrollingLinkAnimation = gsap.to(window, {
                        duration: duration,
                        scrollTo: {
                            y:"#second-section", offsetY: headerHeight
                        },
                        onComplete: () => {
                            setTimeout(() => {
                                scrollingLinkAnimation = null;
                            }, 50);                    }
                        });
                    });
                })
            }
            
            function initSplide(data) {
                mainCarousels.forEach((mainCarousel, index) => {
                    const startIndex = (data[index].images.length)
                    
                    var main = new Splide(`#main-carousel${index + 1}`, {
                        autoHeight: true,
                        type: 'fade',
                        rewind: true,
                        pagination: false,
                        arrows: false,
                        drag: false,
                        start: startIndex
                    });
                    
                    
                    var thumbnails = new Splide(`#thumbnail-carousel${index + 1}`, {
                        autoHeight: true,
                        autoWidth: true,
                        gap: 2,
                        rewind: true,
                        pagination: false,
                        isNavigation: true,
                        rewindByDrag: true,
                        start: startIndex
                    });
                    
                    main.sync(thumbnails);
                    main.mount();
                    thumbnails.mount();
                });
            }
            
            async function pauseVideoPlayer() {
                const player = await document.querySelector('lite-youtube').getYTPlayer();
                if (player && player.getPlayerState() == 1) {              
                    player.pauseVideo()
                }
            }
            
            function handleScreenSize() {  
                let isPortrait = window.innerHeight > window.innerWidth;      
                initClientTrackSize()
                
                // Carousel Size 
                adjustCarouselSize()
                
                // Carousel Arrows
                handleProjectsArrows();

                if (isSmallScreen()) {
                    initCardSwipe();
                }
                
                window.addEventListener('orientationchange', checkOrientationChange);
                window.addEventListener('resize', checkOrientationChange);
                window.addEventListener('resize', checkCarouselArrows);
                
                function checkOrientationChange() {
                    const newIsPortrait = window.innerHeight > window.innerWidth;
                    if (newIsPortrait !== isPortrait) {
                        isPortrait = newIsPortrait;
                        console.log('Orientation changée:', isPortrait ? 'portrait' : 'paysage');
                        
                        handleProjectsArrows();
                        adjustCarouselSize();
                        refreshTrackSize();
                        if (isPortrait) {
                            initCardSwipe();
                        }
                    }
                }

                function checkCarouselArrows() {
                    mainCarousels.forEach(mainCarousel => {    
                        const thumbnailCarousel = mainCarousel.nextElementSibling
                        if (checkCarouselOverflow(thumbnailCarousel)) {
                            console.log("adjusting arrows");
                            adjustCarouselSize();
                        }
                    });                    
                }
            }
            
            
            // SCREEN SIZE DEPENDANT FUNCTIONS
            
            function initClientTrackSize() {
                clientSlideTrack.innerHTML += clientSlideTrack.innerHTML;
                const trackWidth = clientSlideTrack.scrollWidth;
                document.documentElement.style.setProperty("--track-width", `${trackWidth/-2}px`);
            }

            function refreshTrackSize() {
                clientSlideTrack.style.transform = 'translateX(0)';
                const newTrackWidth = clientSlideTrack.scrollWidth;
                document.documentElement.style.setProperty("--track-width", `${newTrackWidth/-2}px`);
            }
            
            function handleProjectsArrows() {
                
                let hoveredCard = null;
                let hoveredArrow = null;
                
                if (!isSmallScreen()) {            
                    projectsContainer.addEventListener('mouseover', (event) => {
                        const card = event.target.closest('.card');
                        
                        if (!card || activeCard == card) return;
                        hoveredCard = card;
                        
                        switch (card.id) {
                            case "project-1":
                            if (activeCard && activeCard.id == "project-2") {
                                hoveredArrow = carouselArrows[0];
                            } else if (activeCard && activeCard.id == "project-4") {
                                hoveredArrow = carouselArrows[1];
                            }
                            break;
                            case "project-2":
                            if (activeCard && activeCard.id == "project-3") {
                                hoveredArrow = carouselArrows[0];
                            } else if (activeCard && activeCard.id == "project-1") {
                                hoveredArrow = carouselArrows[1];
                            }
                            break;
                            case "project-3":
                            if (activeCard && activeCard.id == "project-4") {
                                hoveredArrow = carouselArrows[0];
                            } else if (activeCard && activeCard.id == "project-2") {
                                hoveredArrow = carouselArrows[1];
                            }
                            break;
                            case "project-4":
                            if (activeCard && activeCard.id == "project-1") {
                                hoveredArrow = carouselArrows[0];
                            } else if (activeCard && activeCard.id == "project-3") {
                                hoveredArrow = carouselArrows[1];
                            }
                            break;
                        }
                        if (hoveredArrow) {
                            hoveredArrow.classList.add('hovered');
                            hoveredCard.addEventListener('mouseleave', (event) => {
                                hoveredArrow.classList.remove("hovered");
                            });
                        }
                    });
                    
                    cards.forEach( card => {
                        card.addEventListener('mouseover', (event) => {
                            switch (card.id)   {
                                case "project-1":
                                if (activeCard.id == "project-2") {
                                    carouselArrows[0].classList.add("hovered");
                                } else if (activeCard.id == "project-4"){
                                    carouselArrows[1].classList.add("hovered");
                                }
                            }
                            
                            
                        });
                    })
                    
                    window.removeEventListener('scroll', handleProjectsArrows);
                } else {
                    
                    window.addEventListener('scroll', mobileArrowsDisplay);
                    
                    function mobileArrowsDisplay() {
                        // Mobile Carousel Arrows
                        const topThreshold = window.innerHeight * 0.45;
                        const bottomThreshold = window.innerHeight * 0.55;
                        const sectionPosition = projectsContainer.getBoundingClientRect();
                        if (sectionPosition.top < topThreshold && sectionPosition.bottom > bottomThreshold) {
                            mobileArrows.forEach( arr => {
                                arr.style.opacity = "1"
                            })
                        } else {
                            mobileArrows.forEach( arr => {
                                arr.style.opacity = "0"
                            })
                        }
                    }
                }
            }
            
            function adjustCarouselSize() {    
                // Thumbnails Overflow
                thumbCarouselImgContainer.forEach(cont => {
                    if (cont.clientWidth < cont.scrollWidth) {
                        cont.classList.add('overflow');            
                    } else {
                        cont.classList.remove('overflow');
                    }
                });
                
                mainCarousels.forEach(mainCarousel => {    
                    const activeImg = mainCarousel.querySelector('.splide__slide:last-child img, .splide__slide:last-child lite-youtube');
                    const imgs = mainCarousel.querySelectorAll('.splide__slide img');
                    
                    if (activeImg) {
                        const mainWidth = activeImg.clientWidth;
                        
                        const thumbnailCarousel = activeImg.closest('.splide-container').querySelector('.thumbnail-carousel');
                        
                        if (thumbnailCarousel) {
                            thumbnailCarousel.style.setProperty('width', `${mainWidth}px`, 'important');
                        }
                        
                        imgs.forEach(img => {
                            // Ajustement de la hauteur
                            const imgRatio = img.naturalHeight / img.naturalWidth;
                            const imgRealHeight = imgRatio * img.clientWidth;
                            
                            // Calcul de la différence entre realHeight et renderedH
                            const imgDifference = Math.abs(imgRealHeight - img.clientHeight);   
                            const imgTolerance = 0.01 * imgRealHeight; // 1%
                            
                            
                            if (imgDifference >= imgTolerance) {
                                img.style.setProperty('height', `${Math.round(imgRealHeight)}px`, 'important');
                            }
                        })            
                    }
                });
            }
            
            function initCardSwipe() {    
                // Idée: si swipe pas opti ajouter la durée du swipe à croiser avec la distance, le swipe doit être court
                let startX = 0;
                let startY = 0;
                let currentSlide = 1;
                
                const totalSlides = 4;
                
                const handleTouchStart = (e) => {
                    if (!e.target.closest('.thumbnail-carousel')) {
                        startX = e.touches[0].clientX;
                        startY = e.touches[0].clientY; 
                    } else {
                        startX = null;
                    }
                };
                
                const handleTouchEnd = (e) => {
                    if (startX === null) return;
                    
                    const endX = e.changedTouches[0].clientX;
                    const diffX = startX - endX;
                    
                    const endY = e.changedTouches[0].clientY;
                    const diffY = startY - endY;
                    
                    
                    if (Math.abs(diffX) > 40 && Math.abs(diffY) < 25) {
                        if (diffX > 0) {
                            nextSlide();
                        } else {
                            previousSlide();
                        }
                    }
                };
                
                const nextSlide = () => {
                    if (currentSlide < totalSlides) {
                        currentSlide++;
                    } else {
                        currentSlide = 1
                    }
                    activeItem = document.getElementById(`item-${currentSlide}`);
                    activeItem.checked = true;
                    activateCardForItem(activeItem);
                };
                
                const previousSlide = () => {
                    if (currentSlide > 1) {
                        currentSlide--;
                    } else {
                        currentSlide = totalSlides;
                    }
                    activeItem = document.getElementById(`item-${currentSlide}`);
                    activeItem.checked = true;
                    activateCardForItem(activeItem);
                };
                
                projectsContainer.addEventListener('touchstart', handleTouchStart, {passive: true});
                projectsContainer.addEventListener('touchend', handleTouchEnd, {passive: true});   
            } 
            
            function activateCardForItem(radioItem) {
                cards.forEach(label => {
                    label.classList.remove('is-active');
                });
                
                if (radioItem.checked) {
                    pauseVideoPlayer();
                    const correspondingCard = document.querySelector(`label[for="${radioItem.id}"]`);
                    
                    if (correspondingCard) {
                        correspondingCard.classList.add('is-active');
                        activeCard = correspondingCard;
                    }
                }
            }
        });
        
        
        