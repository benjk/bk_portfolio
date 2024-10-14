function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function isMobile() {
    return window.innerWidth <= 1024
}