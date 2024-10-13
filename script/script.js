
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
            images.push(firstImage);
            
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
                    console.log(image);
                    
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
                        <span>${capitalize(key)}:</span> ${value}
                    </li>`;
            });
            
            console.log("thumbHTML");
            console.log(thumbHTML);
            
            
            const cardHTML = template
            .replace(new RegExp('{{id}}', 'g'), project.id)
            .replace(new RegExp('{{title}}', 'g'), project.title)
            .replace('{{description}}', project.description)
            .replace('{{thumbnails}}', thumbHTML)
            .replace('{{mainImages}}', mainImagesHTML)
            .replace(new RegExp('{{infosProject}}', 'g'), infosProjectHTML)
            projectsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
        
        waitForAllImages().then(() => {
            initializeSplideAndResize(data);
            initializeAnimations();
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
        
        console.log("startIndex");
        console.log(data[index].images.length);
        
        
        thumbnails.on('mounted', function () {
            document.querySelector(`#thumbnail-carousel${index + 1} .splide__arrow--prev`).style.setProperty('background-color', data[index].primaryColor)
            document.querySelector(`#thumbnail-carousel${index + 1} .splide__arrow--next`).style.setProperty('background-color', data[index].primaryColor)
        });
        
        main.sync(thumbnails);
        main.mount();
        thumbnails.mount();
        
    });
    
    
    // GESTION DES THUMBNAILS 
    adjustCarouselSize()
    checkOverflow()
    
    window.addEventListener('resize', adjustCarouselSize);
    window.addEventListener('resize', checkOverflow);
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
        
        console.log("activeImg");
        console.log(activeImg);
        
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
    const contactLinks = document.querySelectorAll(".contact-link");
    contactLinks.forEach( link => {
        let duration = parseFloat(link.getAttribute('data-duration'))  || 0.5; 

        link.addEventListener("click", () => {
            const headerHeight = document.querySelector('header').clientHeight;
            gsap.to(window, {duration: duration, scrollTo:{y:"#third-section", offsetY: headerHeight}});
          });
    })
}
