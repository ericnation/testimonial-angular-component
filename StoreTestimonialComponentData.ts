import { BaseComponentData } from './BaseComponentData';
import { Slide } from '../Store/Slide';
import { Testimonial } from '../Store/Testimonial';

export interface StoreTestimonialComponentData extends BaseComponentData {
  animationType: string;
  interval: number;
  title: string;
  subHeader: string;
  testimonials: Testimonial[];
  fullWidth?: boolean;
  columns: number;
  height: number;
  backgroundImg: string;
  increaseContrast: boolean;
  backgroundImgOpacity: number;
}
