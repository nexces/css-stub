/**
 * Created by adrianp on 30.06.15.
 */
document.addEventListener('DOMContentLoaded', function () {
    var $container = <HTMLElement> document.querySelector('.siteHeader');
    var $menuSwitch = <HTMLElement> document.querySelector('#nav-toggle');
    console.log('menu-collapse :: init');
    $menuSwitch.addEventListener('click', function (e) {
        console.log('menu-collapse :: handling event on #nav-toggle');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        $container.classList.toggle('nav-active');
    }, false);
    document.body.addEventListener('click', function () {
        console.log('menu-collapse :: handling event on body');
        $container.classList.remove('nav-active');
    }, false);
}, false);
