import { CardWithImage } from './CardWithImage';
import { IProduct } from '../../types';

/**
 * Карточка товара для каталога.
 * При клике на карточку вызывает переданный колбэк.
 */
export class CardCatalog extends CardWithImage<IProduct> {
  constructor(container: HTMLElement, private _onClick: (id: string) => void) {
    super(container);
    container.addEventListener('click', () => {
      // id передаётся через data-атрибут, но мы не храним его в классе
      const id = container.dataset.id;
      if (id) this._onClick(id);
    });
  }

  /**
   * Устанавливает ID товара в data-атрибут контейнера для использования в колбэке.
   */
  set id(value: string) {
    this.container.dataset.id = value;
  }
}