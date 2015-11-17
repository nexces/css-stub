/**
 * Created by adrianp on 02.07.15.
 */
interface SliderData extends DOMStringMap {
    delay: string;
}
interface SlideData extends DOMStringMap {
    num: string;
}
interface DotData extends DOMStringMap {
    num: string;
}
interface ImgData extends DOMStringMap {
    ready: string;
}
class Slider {
    private nextSlideDelay = 5000;
    private nextSlideTimeout;

    private transition = 'fading';

    private $slider: HTMLElement;
    private $slidesContainer: HTMLElement;
    private $$slides: NodeList;
    private $dotsContainer: HTMLElement;

    private autoProgress = true;
    private allReady = false;

    constructor(sliderSelector: string)
    {
        console.log('Slider::constructor()');
        this.$slider = <HTMLElement> document.querySelector(sliderSelector);
        if (!this.$slider) {
            console.warn('Slider::constructor() => no slider found via "%s"', sliderSelector);
            return;
        }

        if (this.$slider.classList.contains('sliding')) {
            this.transition = 'sliding';
        }

        var sliderData = <SliderData> this.$slider.dataset;
        if (sliderData.delay) {
            this.nextSlideDelay = parseInt(sliderData.delay);
        }

        this.$slidesContainer = <HTMLElement> this.$slider.querySelector('.slides');
        if (!this.$slidesContainer) {
            console.error('Slider::constructor() => Slides should be placed in ".slides" container');
            return;
        }
        this.$$slides = this.$slidesContainer.querySelectorAll('.slide');

        if (this.$$slides.length == 0) {
            console.log('Slider::constructor() => nothing to rotate');
            return;
        }

        this.$dotsContainer = <HTMLElement> this.$slider.querySelector('.dots');

        if (this.$$slides.length > 1) {
            this.$slider.classList.add('controllable');
        }

        this.$slider.addEventListener('mouseover', this.handleHover, false);
        this.$slider.addEventListener('mouseout', this.handleHover, false);

        if (this.$slider.querySelector('.prev')) {
            this.$slider.querySelector('.prev').addEventListener('click', this.arrowClick, false);
        }
        if (this.$slider.querySelector('.next')) {
            this.$slider.querySelector('.next').addEventListener('click', this.arrowClick, false);
        }

        if (this.transition == 'sliding') {
            this.$slidesContainer.style.width = (this.$$slides.length * 100) + '%';
        }

        for (var i = 0; i< this.$$slides.length; i++) {
            var $slide = <HTMLElement> this.$$slides[i];
            var slideData = <SlideData> $slide.dataset;
            slideData.num = (i+1).toString();
            $slide.classList.add('slide-' + slideData.num);

            if (this.$dotsContainer) {
                var $currentDot = <HTMLSpanElement> document.createElement('span');
                var currentDotData = <DotData> $currentDot.dataset;
                $currentDot.className = 'dot';
                currentDotData.num = (i+1).toString();
                $currentDot.classList.add('slide-' + currentDotData.num);

                $currentDot.addEventListener('click', this.dotClick, false);
                this.$dotsContainer.appendChild($currentDot);
            }

            var $$imgs = $slide.querySelectorAll('img');
            for (var i2 = 0; i2 < $$imgs.length; i2++) {
                var $img = <HTMLImageElement> $$imgs[i2];
                var imgData = <ImgData> $img.dataset;
                imgData.ready = $img.complete ? 'true' : 'false';
                $img.addEventListener('load', this.imgReadyNotification);
            }
            var $imgSrc = <HTMLImageElement> $slide.querySelector('.src');
            if ($imgSrc) {
                $slide.style.backgroundImage = 'url(' + $imgSrc.src + ')';
            }
        }

        this.heightGuard();
        window.addEventListener('resize', this.heightGuard, false);

        this.imgReadyWait();
    }

    private heightGuard = () => {
        this.$slidesContainer.style.height = null;
        this.$slidesContainer.style.height = this.$slidesContainer.clientHeight + 'px';
    };

    public handleHover = (e: Event) => {
        console.debug('Slider::handleHover()');
        if (e.type === 'mouseover') {
            this.autoProgress = false;
            this.blockAutoProgress();
        }
        if (e.type === 'mouseout') {
            this.autoProgress = true;
            this.resumeAutoProgress();
        }
    };

    public blockAutoProgress = () => {
        console.debug('Slider::blockAutoProgress()');
        clearTimeout(this.nextSlideTimeout);
        this.nextSlideTimeout = 0;
    };

    public resumeAutoProgress = () => {
        console.debug('Slider::resumeAutoProgress()');
        if (this.allReady && this.autoProgress && this.nextSlideDelay > 0) {
            this.nextSlideTimeout = setTimeout(this.loadSlide, this.nextSlideDelay);
        }
    };

    public loadSlide = (num?: number) => {
        this.blockAutoProgress();
        if (!this.allReady) {
            return false;
        }
        var $current, currentData, $next, nextData, currentNum, nextNum, $currentDot, $nextDot;
        $current = <HTMLElement> this.$slider.querySelector('.slide.active');

        if (!num) {
            if (!$current) {
                $next = <HTMLElement> this.$slider.querySelector('.slide.initial');
            } else {
                $next = <HTMLElement> this.$slider.querySelector('.slide.active + .slide');
            }
            if (!$next) {
                $next = <HTMLElement> this.$slider.querySelector('.slide:nth-child(1)');
            }
        } else {
            $next = <HTMLElement> this.$slider.querySelector('.slide:nth-child(' + num + ')');
        }
        nextData = <SlideData> $next.dataset;
        if ($current) {
            $current.classList.remove('active');
            currentData = <SlideData> $current.dataset;
            currentNum = currentData.num || $current.className.match(/slide-(\d+)/)[1];
            if (this.$dotsContainer) {
                $currentDot = <HTMLElement> this.$dotsContainer.querySelector('.dot:nth-child(' + currentNum + ')');
                $currentDot.classList.remove('active');
            }
        }
        $next.classList.remove('initial');
        $next.classList.add('active');
        nextNum = nextData.num || $next.className.match(/slide-(\d+)/)[1];
        this.$slider.className = this.$slider.className.replace(/slide-(\d+)-active/, '');
        this.$slider.classList.add('slide-' + nextNum + '-active');
        if (this.$dotsContainer) {
            $nextDot = <HTMLElement> this.$dotsContainer.querySelector('.dot:nth-child(' + nextNum + ')');
            $nextDot.classList.add('active');
        }
        this.resumeAutoProgress();
    };

    public arrowClick = (e) => {
        var $next, nextData, num, $arrow = <HTMLElement> e.target;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if ($arrow.classList.contains('prev')) {
            $next = <HTMLElement> this.$slider.querySelector('.slide + .slide.active');
            if ($next) {
                $next = $next.previousElementSibling;
            } else {
                $next = <HTMLElement> this.$slider.querySelector('.slide:last-of-type');
            }
        }
        if ($arrow.classList.contains('next')) {
            $next = <HTMLElement> (this.$slider.querySelector('.slide.active + .slide') || this.$slider.querySelector('.slide:nth-child(1)'));
        }
        nextData = <SlideData> $next.dataset;
        num = nextData.num || $next.className.match(/slide-(\d+)/)[1];
        this.loadSlide(num);
    };

    public dotClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        var $dot = <HTMLElement> e.target;
        var dotData = <DotData> $dot.dataset;
        var num = parseInt(dotData.num || e.target.className.match(/slide-(\d+)/)[1]);
        this.loadSlide(num);
    };

    public imgReadyNotification = (e) => {
        var $img = <HTMLImageElement> e.target;
        var imgData = <ImgData> $img.dataset;
        imgData.ready = 'true';
        this.heightGuard();
    };

    public imgReadyWait = () => {
        var $$img = this.$slider.querySelectorAll('.slide img[data-ready="false"]');
        if ($$img.length > 0) {
            setTimeout(this.imgReadyWait, 100);
            this.$slider.classList.add('waiting');
            return false;
        }
        this.allReady = true;
        this.$slider.classList.remove('waiting');
        this.$slider.classList.add('ready');
        this.loadSlide();
    };
}

