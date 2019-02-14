import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';
import { Router } from '@angular/router';
import { LoDashStatic } from 'lodash';
import { StoreAdminService } from '../../../../+store-admin';
import { ComponentInformation } from '../../../../shared/entities/ComponentInfo';
import { StoreTestimonialComponentData } from '../../../../shared/entities/store-components/StoreTestimonialComponentData';
import { Slide } from '../../../../shared/entities/Store/Slide';
import { Testimonial } from '../../../../shared/entities/Store/Testimonial';
import { UserUpload } from '../../../../shared/entities/UserUpload';
import { StoreService } from '../../../../storefront/store.service';
import { StoreEditorService } from '../../../store-editor.service';
import { BaseComponentSettingsComponent } from '../base-component-settings.component';

declare const _: LoDashStatic;

@Component({
  selector: 'store-testimonial-settings',
  templateUrl: './store-testimonial-settings.component.html',
  styleUrls: ['./store-testimonial-settings.component.scss']
})
export class StoreTestimonialSettingsComponent extends BaseComponentSettingsComponent<StoreTestimonialComponentData> implements OnInit {
  @ViewChildren('testimonialShowMatExpansionPanel') testimonialShowMatExpansionPanel: QueryList<MatExpansionPanel>;
  @ViewChild('fundraiserImageUploadButton') fundraiserImageUploadButton: ElementRef;

  componentInfo: ComponentInformation;
  imageIsUploading: boolean = false;
  selectedTemplateLabel: string;
  testimonialImageUploading = false;
  imageUploadTestimonial: Testimonial;
  backgroundOpacity: number;
  animationTypes = ['Fade', 'Slide'];
  intervals = [0, 2, 4, 6, 8, 12];
  sliderProperties = {
    min: 0,
    max: 100,
    value: 0,
  };

  constructor(router: Router,
              storeAdminService: StoreAdminService,
              storeEditorService: StoreEditorService,
              storeService: StoreService) {
    super(router, storeAdminService, storeEditorService, storeService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.data.backgroundImgOpacity = _.isNumber(this.data.backgroundImgOpacity) ? this.data.backgroundImgOpacity : 100;
    if (!this.data.testimonials) {
      this.data.testimonials = [];
      this.addTestimonial();
    } else {
      setTimeout(() => {
        this.testimonialShowMatExpansionPanel.first.open();
      });
    }

  }

  uploadImage(files: any[]) {
    this.imageIsUploading = true;
    if (!files || !files.length) {
      this.imageIsUploading = false;
      return;
    }
    this.setMessages([]);
    this.imageIsUploading = true;

    this.storeService.saveImage(StoreService.storeCreationData.StoreData.StoreId, files)
      .subscribe((image: UserUpload) => {
          this.imageIsUploading = false;
          if (image && image.imageLocation) {
            this.componentInfo.Data.backgroundImg = image.imageLocation;
          }
        },
        (errorResponse) => {
          let data = errorResponse;
          this.imageIsUploading = false;
          this.setMessages(data.Messages);
        });
  }

  deleteImage() {
    this.componentInfo.Data.backgroundImg = null;
    // reset value so the (change) event will get fired again for uploading the same image
    this.fundraiserImageUploadButton.nativeElement.value = '';
  }

  updateColumns() {
    this.storeAdminService.triggerTestimonialEditing(0, this.componentInfo, true);
  }

  componentInfoChange(componentInfo) {
    this.componentInfo = componentInfo;
    this.selectedTemplateLabel = _.get(_.find(this.componentDef.Templates, { Id: componentInfo.LayoutId }), 'Label');
  }

  editTextColor(color) {
    this.storeService.updateComponentStyleSheet(this.componentInfo);
  }

  addTestimonial() {
    const testimonial: Testimonial = {
      name: 'Person Name',
      company: 'Company Name',
      quote: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.'
    };
    this.data.testimonials.push(testimonial);
    this.storeAdminService.triggerTestimonialEditing(this.data.testimonials.length - 1, this.componentInfo, true);
    setTimeout(() => {
      this.testimonialShowMatExpansionPanel.last.open();
    });
  }

  slideOpacityChange(evt) {
    let value: number = evt.value;
    this.backgroundOpacity = this.componentInfo.Data.backgroundImgOpacity = value;
  }

  testimonialPanelOpened(index: number) {
    this.storeAdminService.triggerTestimonialEditing(index, this.componentInfo, false);
  }

  deleteTestimonial(index: number) {
    if (index >= this.data.testimonials.length) {
      return;
    }
    this.data.testimonials.splice(index, 1);
    this.storeAdminService.triggerTestimonialEditing(index, this.componentInfo, true);
    setTimeout(() => {
      if (_.size(this.data.testimonials)) {
        this.testimonialShowMatExpansionPanel.first.open();
        // update active index
        this.storeAdminService.triggerTestimonialEditing(1, this.componentInfo, true);
      }
    });
  }

  setOpacityFromInput() {
    if (this.data.backgroundImgOpacity < this.sliderProperties.min) {
      this.data.backgroundImgOpacity = this.sliderProperties.min;
    }
    else if (this.data.backgroundImgOpacity > this.sliderProperties.max) {
      this.data.backgroundImgOpacity = this.sliderProperties.max;
    }
  }

  uploadTestimonialImage(files: any[]) {
    this.testimonialImageUploading = true;
    if (!files || !files.length) {
      this.testimonialImageUploading = false;
      return;
    }
    this.setMessages([]);
    this.testimonialImageUploading = true;

    this.storeService.saveImage(StoreService.storeCreationData.StoreData.StoreId, files)
      .subscribe((response) => {
          if (response) {
            this.testimonialImageUploading = false;
            if (response['imageLocation']) {
              this.imageUploadTestimonial.imageSrc = response['imageLocation'];
            }
          }
        },
        (errorResponse) => {
          let data = errorResponse;
          this.testimonialImageUploading = false;
          this.setMessages(data.Messages);
        });
  }

  deleteTestimonialImage(testimonial: Testimonial) {
    testimonial.imageSrc = null;
  }

  closeBackgroundImageOpacityDropdown(evt) {
    $('#backgroundImageOpacity').click();
  }
}
