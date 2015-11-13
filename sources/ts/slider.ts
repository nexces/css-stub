/**
 * Created by adrianp on 02.07.15.
 */
interface SliderConfiguration {
    nextSlideDelay?: number;
    setBackground?: boolean;
    transition?: string;
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

    private setBackground = true;
    private transition = 'fade';
    private supportedTransitions = ['fade', 'slide'];

    private $slider: HTMLElement;
    private $slidesContainer: HTMLElement;
    private $$slides: NodeList;
    private $dotsContainer: HTMLElement;

    private autoProgress = true;
    private allReady = false;

    private containerHeight = 0;

    constructor(sliderSelector: string, sliderConfiguration?: SliderConfiguration)
    {
        console.log('Slider::constructor()');
        this.$slider = <HTMLElement> document.querySelector(sliderSelector);
        if (!this.$slider) {
            console.warn('Slider::constructor() => no slider found via "%s"', sliderSelector);
            return this;
        }

        if (sliderConfiguration) {
            if (sliderConfiguration.nextSlideDelay) {
                this.nextSlideDelay = sliderConfiguration.nextSlideDelay;
            }
            if (sliderConfiguration.setBackground) {
                this.setBackground = sliderConfiguration.setBackground;
            }
            if (sliderConfiguration.transition) {
                if (this.supportedTransitions.indexOf(sliderConfiguration.transition) > -1) {
                    this.transition = sliderConfiguration.transition;
                } else {
                    console.warn(
                        'Slider::constructor() => Unsupported transition type "%s"; Falling back to "%s"',
                        sliderConfiguration.transition,
                        this.transition
                    );
                }
            }
        }

        this.$slidesContainer = <HTMLElement> this.$slider.querySelector('.slides');
        this.$$slides = this.$slidesContainer.querySelectorAll('.slide');

        this.$dotsContainer = <HTMLElement> this.$slider.querySelector('.dots');

        if (this.$$slides.length > 1) {
            this.$slider.classList.add('controllable');
            if (this.transition == 'slide') {
                var $slides = <HTMLElement> this.$slider.querySelector('.slides');
                $slides.style.width = (this.$$slides.length * 100) + '%';
            }
        }

        this.$slider.addEventListener('mouseover', this.handleHover, false);
        this.$slider.addEventListener('mouseout', this.handleHover, false);

        if (this.$slider.querySelector('.prev')) {
            this.$slider.querySelector('.prev').addEventListener('click', this.arrowClick, false);
        }
        if (this.$slider.querySelector('.next')) {
            this.$slider.querySelector('.next').addEventListener('click', this.arrowClick, false);
        }

        if (this.transition == 'slide') {
            this.$$slides[0].parentElement.style.width = (this.$$slides.length * 100) + '%';
        }

        for (var i = 0; i< this.$$slides.length; i++) {
            var $slide = <HTMLElement> this.$$slides[i];
            var slideData = <SlideData> $slide.dataset;
            slideData.num = (i+1).toString();
            $slide.classList.add('slide-' + (i+1));

            var $currentDot = <HTMLSpanElement> document.createElement('span');
            var currentDotData = <DotData> $currentDot.dataset;
            $currentDot.className = 'dot';
            currentDotData.num = (i+1).toString();
            $currentDot.classList.add('slide-' + (i+1));

            $currentDot.addEventListener('click', this.dotClick, false);
            if (this.$dotsContainer) {
                this.$dotsContainer.appendChild($currentDot);
            }
            if (this.setBackground) {
                var $img = <HTMLImageElement> $slide.querySelector('.src');
                var imgData = <ImgData> $img.dataset;
                $slide.style.backgroundImage = 'url(' + $img.src + ')';
                imgData.ready = $img.complete ? 'true' : 'false';
                $img.addEventListener('load', this.imgReadyNotification);
            }
        }

        this.heightGuard();
        window.addEventListener('resize', this.heightGuard, false);

        if (this.setBackground) {
            this.imgReadyWait();
        } else {
            this.allReady = true;
            this.$slider.classList.remove('waiting');
            this.$slider.classList.add('ready');
            this.loadSlide();
        }
    }

    private heightGuard = () => {
        var $slide, i;
        // reset minHeight
        for (i = 0; i < this.$$slides.length; i++) {
            $slide = <HTMLElement> this.$$slides[i];
            $slide.style.minHeight = null;
        }
        this.containerHeight = this.$slidesContainer.offsetHeight;
        // set minHeight
        for (i = 0; i < this.$$slides.length; i++) {
            $slide = <HTMLElement> this.$$slides[i];
            $slide.style.minHeight = this.containerHeight + 'px';
        }
    };

    public handleHover = (e: Event) => {
        console.debug('Slider::handleHover()');
        //e.stopPropagation();
        //e.stopImmediatePropagation();
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
        if (this.allReady && this.autoProgress) {
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
    };

    public imgReadyWait = () => {
        var $$img = this.$slider.querySelectorAll('.slide .src[data-ready="false"]');
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
