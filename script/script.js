
document.addEventListener( 'DOMContentLoaded', function () {
    var main = new Splide( '#main-carousel1', {
        autoHeight: true,
        type      : 'fade',
        rewind    : true,
        pagination: false,
        arrows    : false,
    } );
    
    var thumbnails = new Splide( '#thumbnail-carousel1', {
        autoHeight: true,
        autoWidth: true,
        gap       : 2,
        rewind    : true,
        pagination: false,
        isNavigation: true,
    } );
    
    main.sync(thumbnails);
    main.mount();
    thumbnails.mount();
    
    // GESTION DES THUMBNAILS 
    handleCarouselSize()
    checkOverflow()
} );

window.addEventListener('resize', handleCarouselSize);
window.addEventListener('resize', checkOverflow);

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

function handleCarouselSize() {    
    const mainCarousels = document.querySelectorAll('.main-carousel');
    
    mainCarousels.forEach(mainCarousel => {    
        const activeImg = mainCarousel.querySelector('.is-active img');
        
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
            console.log(`RESIZE ME`);
            mainCarousel.style.setProperty('height', `${Math.round(realHeight)}px`, 'important');
            
        }

        const container =  mainCarousel.closest('.splide-container');
        const containerHeight = container.clientHeight;
        const containerDiff = Math.abs(realHeight - containerHeight*0.76);
        console.log(containerDiff);
        
        const newContainerHeight = containerHeight - containerDiff;
        container.style.setProperty('height', `${Math.round(newContainerHeight)}px`, 'important');
        
    });
}
