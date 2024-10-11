
document.addEventListener( 'DOMContentLoaded', function () {
    Promise.all([
        fetch('projects-data.json').then(response => response.json()),
        fetch('project-template.html').then(response => response.text())
    ]).then(([data, template]) => {

        const projectsContainer = document.querySelector('.projects-container-global');
        projectsContainer.innerHTML = '';

        data.forEach(project => {
            let mainImagesHTML = '';
            project.images.forEach(image => {
                mainImagesHTML += `
                    <li class="splide__slide">
                        <img src="${image}" alt="">
                    </li>`;
            });

            const cardHTML = template
                .replace(new RegExp('{{id}}', 'g'), project.id)
                .replace(new RegExp('{{title}}', 'g'), project.title)
                .replace('{{description}}', project.description)
                .replace(new RegExp('{{primaryColor}}', 'g'), project.primaryColor)
                .replace(new RegExp('{{secondaryColor}}', 'g'), project.secondaryColor)
                .replace('{{thumbnails}}', mainImagesHTML)
                .replace('{{mainImages}}', mainImagesHTML)
                .replace(new RegExp('{{year}}', 'g'), project.year)
                .replace(new RegExp('{{client}}', 'g'), project.client)
                .replace(new RegExp('{{technologies}}', 'g'), project.technologies)
                .replace(new RegExp('{{platform}}', 'g'), project.platform);
            
            projectsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

        waitForAllImages().then(() => {
            initializeSplideAndResize(data);
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
        var main = new Splide(`#main-carousel${index + 1}`, {
            autoHeight: true,
            type: 'fade',
            rewind: true,
            pagination: false,
            arrows: false,
            drag: false
        });

        var thumbnails = new Splide(`#thumbnail-carousel${index + 1}`, {
            autoHeight: true,
            autoWidth: true,
            gap: 2,
            rewind: true,
            pagination: false,
            isNavigation: true,
        });

        thumbnails.on('mounted', function () {
            console.log(`${index} mounted`);
            console.log(data);
            console.log('dataindex');

            console.log(data[index]);
            
            // Change background for the previous arrow
            document.querySelector(`#thumbnail-carousel${index + 1} .splide__arrow--prev`).style.setProperty('background-color', data[index].primaryColor)
    
            // Change background for the next arrow
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
        const activeImg = mainCarousel.querySelector('.is-active img');

        if (activeImg) {
            const mainWidth = activeImg.clientWidth;
            
            const thumbnailCarousel = activeImg.closest('.splide-container').querySelector('.thumbnail-carousel');
            
            if (thumbnailCarousel) {
                thumbnailCarousel.style.setProperty('width', `${mainWidth}px`, 'important');
            }
            
            // Ajustement de la hauteur
            const ratio = activeImg.naturalHeight / activeImg.naturalWidth;
            const realHeight = ratio * activeImg.clientWidth;
            
            // Calcul de la différence entre realHeight et renderedH
            const difference = Math.abs(realHeight - activeImg.clientHeight);        
            const tolerance = 0.01 * realHeight; // 1%
            console.log(difference);
            
            if (difference >= tolerance) {
                console.log(`resized carousel`);
                mainCarousel.style.setProperty('height', `${Math.round(realHeight)}px`, 'important');
            }
    
            // const container =  mainCarousel.closest('.card');
            // const containerHeight = container.clientHeight;
            // const containerDiff = Math.abs(realHeight - containerHeight*0.76);
    
            // if (containerDiff >= tolerance) {
            //     const newContainerHeight = containerHeight - containerDiff;
            //     container.style.setProperty('height', `${Math.round(newContainerHeight)}px`, 'important');
            // }
        }
        
    });
}
