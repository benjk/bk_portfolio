
document.addEventListener( 'DOMContentLoaded', function () {
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
            }
            
            let mainImagesHTML = '';
            images.forEach(image => {
                mainImagesHTML += `
                    <li class="splide__slide">
                        <img src="${image}" alt="">
                    </li>`;
            });
            
            // On vire les grosses images des thumbs pour oyo et chapzy
            let thumbHTML = ''
            if (project.id == 3 || project.id == 4) {
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
            initializeAnimations();
            initCardScrolling();
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
        const startIndex = (data[index].images.length) - 1
        
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
    initMobileSwipe()
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
        const activeImg = mainCarousel.querySelector('.splide__slide:last-child img');
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

function initializeAnimations() {
    const carouselArrows = document.querySelectorAll(".car-arrow")
    
    if (!isMobile()) {        
        document.addEventListener('mousemove', (event) => {
            isHovered(carouselArrows[0]);
            isHovered(carouselArrows[1]);
        });
    }
    
    const contactLinks = document.querySelectorAll(".contact-link");
    contactLinks.forEach( link => {
        let duration = parseFloat(link.getAttribute('data-duration'))  || 0.5; 
        
        link.addEventListener("click", () => {
            const headerHeight = document.querySelector('header').clientHeight;
            gsap.to(window, {duration: duration, scrollTo:{y:"#third-section", offsetY: headerHeight}});
        });
    })
    
    const projectsLinks = document.querySelectorAll(".projects-link");
    projectsLinks.forEach( link => {
        let duration = parseFloat(link.getAttribute('data-duration'))  || 0.5; 
        
        link.addEventListener("click", () => {
            const headerHeight = document.querySelector('header').clientHeight;
            gsap.to(window, {duration: duration, scrollTo:{y:".projects-container-global", offsetY: headerHeight}});
        });
    })
}

function initMobileSwipe() {
    // Idée: si swipe pas opti ajouter la durée du swipe à croiser avec la distance, le swipe doit être court
    // ou/et ajouter le Y pour annuler le swipe si trong grande diffY
    if (isMobile()) {
        let startX = 0;
        let currentSlide = 1;
        
        const totalSlides = 4;
        
        const handleTouchStart = (e) => {
            if (!e.target.closest('.thumbnail-carousel')) {
                startX = e.touches[0].clientX;
            } else {
                startX = null;
            }
        };
        
        const handleTouchEnd = (e) => {
            if (startX === null) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 150) {
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
            document.getElementById(`item-${currentSlide}`).checked = true;
        };
        
        const previousSlide = () => {
            if (currentSlide > 1) {
                currentSlide--;
            } else {
                currentSlide = totalSlides;
            }
            document.getElementById(`item-${currentSlide}`).checked = true;
        };
        
        const swipeContainer = document.querySelector('.projects-container-global');
        swipeContainer.addEventListener('touchstart', handleTouchStart);
        swipeContainer.addEventListener('touchend', handleTouchEnd);        
    }
}

// function initCardScrolling() {
//     if (isMobile()) {
//         const cards = document.querySelectorAll('.card');
//         cards.forEach(card => {
    //             document.addEventListener('scroll', (e) => {
        //                 const cardRect = card.getBoundingClientRect();
//                 const isCardVisible = cardRect.top <= window.innerHeight && cardRect.bottom >= 0;

//                 if (isCardVisible) {
//                     const cardScrollHeight = card.scrollHeight;
//                     const cardClientHeight = card.clientHeight;

//                     if (cardRect.bottom <= window.innerHeight && window.scrollY + window.innerHeight >= cardRect.bottom) {
//                         if (card.scrollTop < cardScrollHeight - cardClientHeight) {
//                             // Bloquer le scroll sur la page et scroller la carte
//                             e.preventDefault();
//                             card.scrollTop += 20;  // Incrément du scroll sur la carte
//                         }
//                     }

//                     // Si on remonte et qu'on atteint le haut de la carte
//                     if (cardRect.top >= 0 && window.scrollY <= cardRect.top) {
//                         if (card.scrollTop > 0) {
//                             // Bloquer le scroll sur la page et remonter dans la carte
//                             e.preventDefault();
//                             card.scrollTop -= 20;  // Décrément du scroll sur la carte
//                         }
//                     }
//                 }

//                 if (cardRect.bottom <= window.innerHeight) {
//                     card.classList.add('scrollY');
//                 } else {
//                     card.classList.remove('scrollY');
//                 }
//             });
//         })
//     }
// }

function initCardScrolling() {
    
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) * parseFloat(getComputedStyle(document.documentElement).fontSize);

    let activeCard = document.querySelector('.card');
    // Apply class is-active on cards
    const radios = document.querySelectorAll('.radio-carousel');
    radios.forEach(radio => {
        if (radio.id == "item-1") {
            document.querySelector(`label[for="${radio.id}"]`).classList.add('is-active');
        }
        radio.addEventListener('change', (event) => {
            document.querySelectorAll('.card').forEach(label => {
                label.classList.remove('is-active');
            });
            
            if (radio.checked) {
                const correspondingCard = document.querySelector(`label[for="${radio.id}"]`);
                
                if (correspondingCard) {
                    correspondingCard.classList.add('is-active');
                    activeCard = correspondingCard;
                }
            }
        });
    });

    if (isMobile()) {
        
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
        });
        let lastScrollTop = 0;
        let scrollVelocity = 0;
        
        window.onscroll = function(e) {
            const currentScrollTop = this.scrollY;
            const isScrollingDown = currentScrollTop > lastScrollTop;
            scrollVelocity = currentScrollTop - lastScrollTop;
            lastScrollTop = currentScrollTop;
            
            const cardRect = activeCard.getBoundingClientRect();
            if (isScrollingDown) {
                const cardBottomReached = cardRect.bottom <= window.innerHeight;
                
                if (cardBottomReached) {
                   
                    const hasMoreContentToScroll = activeCard.scrollTop < activeCard.scrollHeight - activeCard.clientHeight;
                    
                    if (hasMoreContentToScroll) {
                        e.preventDefault();
                        smoothScrollInsideCard(activeCard, scrollVelocity);
                    } else {
                        // console.log("nomore down");
                    }
                }
            } else {
                const cardTopReached = cardRect.top > 0 + headerHeight;              
                
                if (cardTopReached) {
                    const hasMoreContentToScroll = activeCard.scrollTop > 0;                    
                    
                    if (hasMoreContentToScroll) {
                        e.preventDefault();
                        smoothScrollInsideCard(activeCard, scrollVelocity);
                    } else {
                        // console.log("nomore top");
                    }
                } else {
                    // console.log("not reached");    
                }
            }
        };
        
        
        
        function smoothScrollInsideCard(card, velocity) {             
            const friction = 0.45;  // Facteur de friction pour réduire la vitesse du scroll progressivement
            
            function applyInertia() {
                if (velocity >= 1 || velocity <= -1) {
                    console.log("scrollTop");
                    console.log(card.scrollTop);
                    
                    card.scrollTop += velocity;
                    velocity *= friction;
                    
                    requestAnimationFrame(applyInertia);
                }
            }
            
            applyInertia();
        }
    }
}

