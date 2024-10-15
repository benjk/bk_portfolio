
document.addEventListener( 'DOMContentLoaded', function () {
    Promise.all([
        fetch('projects-data.json').then(response => response.json()),
        fetch('project-template.html').then(response => response.text())
    ]).then(([data, template]) => {
        
        
        const projectsContainer = document.querySelector('.projects-container-global');
        projectsContainer.innerHTML = '';
        
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
            
            if (isMobile()) {
                const cards = document.querySelectorAll('.card');
                cards.forEach(card => {
                    document.addEventListener('scroll', () => {
                        const cardRect = card.getBoundingClientRect();
                        
                        console.log('scroll');
                        
                        if (cardRect.bottom <= window.innerHeight) {
                            console.log('pwout');
                            card.classList.add('scrollY');
                        } else {
                            card.classList.remove('scrollY');
                        }
                    });
                })
            }
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
}


function checkOverflow() {    
    const container = document.querySelectorAll('.thumbnail-carousel .splide__list');
    
    container.forEach(cont => {
        if (cont.clientWidth < cont.scrollWidth) {
            cont.classList.add('overflow');
            console.log('overflowed');
            
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
                    console.log("resizedImg");
                }
            })            
        }
        
    });
}

function initializeAnimations() {
    const carouselArrows = document.querySelectorAll(".car-arrow")
    document.addEventListener('mousemove', (event) => {
        isHovered(carouselArrows[0]);
        isHovered(carouselArrows[1]);
    });

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
