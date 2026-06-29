import { CardWithImage } from './CardWithImage';
import { IProduct } from '../../types';

/**
 * Карточка товара для каталога.
 * При клике на карточку вызывает переданный колбэк.
 * Колбэк не принимает аргументов – id передаётся через замыкание.
 */
export class CardCatalog extends CardWithImage<IProduct> {
  constructor(container: HTMLElement, private _onClick: () => void) {
    super(container);
    container.addEventListener('click', () => {
      this._onClick();
    });
  }
}