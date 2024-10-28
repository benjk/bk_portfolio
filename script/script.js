
document.addEventListener( 'DOMContentLoaded', function () {
    document.addEventListener("orientationchange", function(event){
    switch(window.orientation) 
    {  
        case -180: case 180:
            console.log("landscape");
            
            break; 
            default:
                console.log("portr");
    }
});

    Promise.all([
        fetch('projects-data.json').then(response => response.json()),
        fetch('project-template.html').then(response => response.text())
    ]).then(([data, template]) => {
        
        
        const projectsContainer = document.querySelector('.projects-container-global');
        
        data.forEach(project => {
            // On passe l'image 1 en dernier
            const images = [...project.images];
            const firstImage = images.shift();
            // Sur mobile on vire les logos ils genent l'affichage et n'apportent rien
            if (!isMobile() || project.id != 3 && project.id != 4) {
                images.push(firstImage);
                if (isMobile() && project.id == 2) {
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
            
            let thumbHTML = mainImagesHTML;
            
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
            initializeSplideAndResize(data);
            initCardSwipeAndScroll();
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

function initializeSplideAndResize(data) {
    const mainCarousels = document.querySelectorAll('.main-carousel');
    
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
    
    
    // GESTION DES THUMBNAILS 
    adjustCarouselSize()
    checkOverflow()
}


function checkOverflow() {    
    const container = document.querySelectorAll('.thumbnail-carousel .splide__list');
    
    container.forEach(cont => {
        if (cont.clientWidth < cont.scrollWidth) {
            cont.classList.add('overflow');            
        } else {
            cont.classList.remove('overflow');
        }
    });
    
}

function adjustCarouselSize() {    
    const mainCarousels = document.querySelectorAll('.main-carousel');
    
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
                    console.log("resized");
                    console.log(img);
                    
                    img.style.setProperty('height', `${Math.round(imgRealHeight)}px`, 'important');
                }
            })            
        } else {
            console.log("VTFF");
        }
        
    });
}

function initCardSwipeAndScroll() {    
    let activeCard = document.querySelector('.card');
    // Apply class is-active on cards
    const radios = document.querySelectorAll('.radio-carousel');
    radios.forEach(radio => {
        if (radio.id == "item-1") {
            document.querySelector(`label[for="${radio.id}"]`).classList.add('is-active');
        }
        radio.addEventListener('change', (event) => {
            activateCardForItem(radio)
        });
    });
    
    // Idée: si swipe pas opti ajouter la durée du swipe à croiser avec la distance, le swipe doit être court
    if (isMobile()) {       
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
        
        const swipeContainer = document.querySelector('.projects-container-global');
        swipeContainer.addEventListener('touchstart', handleTouchStart, {passive: true});
        swipeContainer.addEventListener('touchend', handleTouchEnd, {passive: true});   
    } 
    
    let scrollingLinkAnimation = null;
    initializeAnimations();
    
    function initializeAnimations() {
        const carouselArrows = document.querySelectorAll(".car-arrow")
        let hoveredCard = null;
        let hoveredArrow = null;
        
        if (!isMobile()) {
            const cardsContainer = document.querySelector('.projects-container-global');
            
            cardsContainer.addEventListener('mouseover', (event) => {
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
            
            const cards = document.querySelectorAll('.card');
            
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
        }
        
        const contactLinks = document.querySelectorAll(".contact-link");
        contactLinks.forEach( link => {
            let duration = parseFloat(link.getAttribute('data-duration'))  || 0.5; 
            
            link.addEventListener("click", () => {
                const header = document.querySelector('header')
                let headerHeight = 0;
                if (header) headerHeight = header.clientHeight;
                scrollingLinkAnimation = gsap.to(window, {
                    duration: duration,
                    scrollTo: {
                        y:"#third-section", offsetY: headerHeight
                    },
                    onComplete: () => {
                        setTimeout(() => {
                            scrollingLinkAnimation = null;
                        }, 50);
                    }
                });
            });
        })
        
        const projectsLinks = document.querySelectorAll(".projects-link");
        projectsLinks.forEach( link => {
            let duration = parseFloat(link.getAttribute('data-duration'))  || 0.5; 
            
            link.addEventListener("click", () => {
                const header = document.querySelector('header')
                let headerHeight = 0;
                if (header) headerHeight = header.clientHeight;
                scrollingLinkAnimation = gsap.to(window, {
                    duration: duration,
                    scrollTo: {
                        y:".projects-container-global", offsetY: headerHeight
                    },
                    onComplete: () => {
                        setTimeout(() => {
                            scrollingLinkAnimation = null;
                        }, 50);                    }
                });
            });
        })
        
        const secondLinks = document.querySelectorAll(".second-link");
        secondLinks.forEach( link => {
            let duration = parseFloat(link.getAttribute('data-duration'))  || 0.5; 
            
            link.addEventListener("click", () => {
                const header = document.querySelector('header')
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
    
    function activateCardForItem(radioItem) {
        document.querySelectorAll('.card').forEach(label => {
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
    
    async function pauseVideoPlayer() {
        const player = await document.querySelector('lite-youtube').getYTPlayer();
        if (player && player.getPlayerState() == 1) {              
            player.pauseVideo()
        }
        
    }
}
