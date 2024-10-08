
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
    // Centré ou non
    const container = document.querySelectorAll('.thumbnail-carousel .splide__list');    
    
    container.forEach(cont => {
        checkOverflow(cont)
    });
    
    function checkOverflow(cont) {        
        if (cont.clientWidth < cont.scrollWidth) {
            cont.classList.add('overflow');
        } else {
            cont.classList.remove('overflow');
        }
    }
    
    handleThumbSize()
} );

window.addEventListener('resize', handleThumbSize);

function handleThumbSize() {
    console.log('pwi');
    
    const mainCarousels = document.querySelectorAll('.main-carousel .is-active img');
    
    mainCarousels.forEach(mainCarousel => {
        
        const mainWidth = mainCarousel.clientWidth;
        console.log("kikou" + mainWidth);
        
        const thumbnailCarousel = mainCarousel.closest('.splide-container').querySelector('.thumbnail-carousel');
        console.log(thumbnailCarousel);
        
        if (thumbnailCarousel) {
            thumbnailCarousel.style.setProperty('width', `${mainWidth}px`, 'important');
        }
    });
}
