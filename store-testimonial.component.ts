import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { BaseStoreComponent } from "../store-component/base-store-component.component";
import { StoreTestimonialComponentData } from "../../shared/entities/store-components/StoreTestimonialComponentData";
import { LoDashStatic } from 'lodash';
import { IuiCarouselComponent, IuiSlideComponent } from "@inksoft/iui";
import { StoreEditorService } from "../../+store-editor/store-editor.service";
import { Testimonial } from '../../shared/entities/Store/Testimonial';
import { StoreAdminService } from '../../+store-admin';
import { Slide } from "../../shared/entities/Store/Slide";
import { StoreService } from "../store.service";
import { TranslateService } from "@ngx-translate/core";

declare const _: LoDashStatic;

@Component({
  selector: 'store-testimonial',
  templateUrl: './store-testimonial-1.component.html',
  styleUrls: ['./store-testimonial.component.scss']
})
export class StoreTestimonialComponent extends BaseStoreComponent<StoreTestimonialComponentData> implements OnInit, AfterViewInit {
  @ViewChild('carousel') carousel: IuiCarouselComponent;
  @ViewChild('slideshowContainer') slideshowContainer: ElementRef;
  @Output() slideIndexChange: EventEmitter<number> = new EventEmitter(true);
  removeInterval: boolean = true;
  protected autoHeight: boolean = true;
  slides: Slide[] = [];
  columns: number;

  slideShowTimer: any;

  @HostListener('window:resize', ['$event']) onResize() {
    this.checkColumns();
    if (this.autoHeight) {
      this.setSlideHeight(this.slideIndex);
    }
  }

  constructor(protected adminService: StoreAdminService,
              protected storeEditorService: StoreEditorService,
              protected storeService: StoreService,
              private translateService: TranslateService,
              private changeDetector: ChangeDetectorRef) {
    super();
  }

  private _slideIndex: number = 0;

  @Input()
  get slideIndex(): number {
    return this._slideIndex;
  }

  set slideIndex(val: number) {
    this._slideIndex = val;
    this.slideIndexChange.emit(this._slideIndex);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setTestimonials();
    });
  }

  ngOnInit() {
    // This gets hit when we are working in the store-testimonial-settings,
    // it is used to change slides and force update of the slides.
    // slideIndex: number, componentInfo: {}, needRefresh: boolean
    this.subscribe(this.adminService.testimonialEditing, (slideInfo) => {
      if (!_.isEqual(slideInfo.componentInfo, this.componentInfo)) return;
      // If this.columns is null then this comes back as NaN, so we set it to 0 in that case.
      const activeSlide: number = Math.floor(slideInfo.slideIndex / this.columns) || 0;
      if (slideInfo.needRefresh) {
        this.checkColumns();
        this.updateSlides(activeSlide);
      } else {
        // Only set the slideIndex if it is different.
        if (this.slideIndex != activeSlide) {
          this.slideIndex = activeSlide;
        }
      }
    });

    // only add this default data the first time the user adds a component
    this.subscribe(this.storeService.componentAdded, (componentAddedInfo) => {
      // only set it for the component being added.
      if (componentAddedInfo.fromScratch && _.isEqual(componentAddedInfo.componentInfo, this.componentInfo)) {
        this.data.title = this.translateService.instant('component_settings.testimonials');
        this.data.subHeader = this.translateService.instant('component_settings.this_is_the_subheader_testimonials');
      }

      this.data.backgroundImgOpacity = this.data.backgroundImgOpacity ? this.data.backgroundImgOpacity : 100;
    });

  }

  setSlideHeight(slideIndex: number) {
    const slideHeight: number = $("#testimonialBox" + this.componentInfo.ComponentId +  '-' +this.componentInfo.LayoutId + '-' + slideIndex).outerHeight();
    $(this.slideshowContainer.nativeElement).height(slideHeight);
  }

  setTestimonials() {
    const testimonial: Testimonial = {
      name: 'Person Name',
      company: 'Company Name',
      quote: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.'
    };
    this.data.testimonials = this.data.testimonials ? this.data.testimonials : [testimonial];
    this.checkColumns();
  }

  checkColumns() {
    const containerWidth: number = $(this.slideshowContainer.nativeElement).innerWidth();
    const widthForBreakpoint: number = 768;
    if ((containerWidth < widthForBreakpoint && this.columns === 1) || (containerWidth >= widthForBreakpoint && this.columns === this.data.columns)) {
      return;
    }
    this.columns = containerWidth < widthForBreakpoint ? 1 : this.data.columns;
    this.updateSlides();
  }

  updateSlides(activeSlide: number = 0) {

    // Break the testimonials up into groups based on the number of columns, empty out the slide array,
    // insert slides by group of testimonials, then set the active slide
    const testimonials: Testimonial[][] = _.chunk(this.data.testimonials, this.columns);
    let slides = [];
    _.each(testimonials, (testimonial: Testimonial[]) => {
      slides.push({ active: false, childs: testimonial });
    });
    this.slides = slides;

    // Only attempt to set a slide to active and set slideIndex if we actually
    // have slides and the requested slide actually exists.
    if (_.size(this.slides)) {
      if (this.slides[activeSlide]) {
        this.slides[activeSlide].active = true;
      } else {
        _.first(this.slides).active = true;
      }
      this.changeDetector.detectChanges();
      this.slideIndex = activeSlide;
    }
  }

   slideUpdated(slideIndex: number) {
    if (this.autoHeight) {
      setTimeout(() => {
        this.setSlideHeight(slideIndex);
      });
    }
  }

  resetActiveSlide() {
    if (this.componentInfo.Data && this.componentInfo.Data.slides) {
      _.each(this.componentInfo.Data.slides, (slide: IuiSlideComponent) => {
        slide.active = false;
      });
      this.componentInfo.Data.slides[0].active = true;
    }
  }

  ensureLinkProtocol(link: string): string {
    if (!link) {
      return '';
    }
    if (link.indexOf('http') !== 0 && link.indexOf('//') !== 0) {
      link = 'http://' + link;
    }
    return link;
  }

  setSlideshowActive(active: boolean) {
    this.removeInterval = !active;
  }
}

@Component({
  templateUrl:'./store-testimonial-2.component.html',
  styleUrls: ['./store-testimonial.component.scss']
})

export class StoreTestimonialComponent2 extends StoreTestimonialComponent {
  protected autoHeight: boolean = true;
}

@Component({
  templateUrl:'./store-testimonial-3.component.html',
  styleUrls: ['./store-testimonial.component.scss']
})

export class StoreTestimonialComponent3 extends StoreTestimonialComponent {
  protected autoHeight: boolean = true;
}

@Component({
  templateUrl:'./store-testimonial-4.component.html',
  styleUrls: ['./store-testimonial.component.scss']
})

export class StoreTestimonialComponent4 extends StoreTestimonialComponent {
  protected autoHeight: boolean = true;
}
