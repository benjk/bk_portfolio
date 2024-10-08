
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
    handleThumbSize()
    checkOverflow()
} );

window.addEventListener('resize', handleThumbSize);
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

function handleThumbSize() {    
    const mainCarousels = document.querySelectorAll('.main-carousel .is-active img');
    
    mainCarousels.forEach(mainCarousel => {
        
        const mainWidth = mainCarousel.clientWidth;
        
        
        const thumbnailCarousel = mainCarousel.closest('.splide-container').querySelector('.thumbnail-carousel');
        
        if (thumbnailCarousel) {
            thumbnailCarousel.style.setProperty('width', `${mainWidth}px`, 'important');
        }
    });
}
