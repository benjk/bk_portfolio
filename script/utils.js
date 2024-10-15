function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function isMobile() {
    return window.innerWidth <= 1024
}

function isHovered(element) {
    document.addEventListener('mousemove', (event) => {
        const rect = element.getBoundingClientRect();
    
        const isHovering = (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
    
        if (isHovering) {
            element.classList.add('hovered');
        } else {
            element.classList.remove('hovered');
        }
      });
}