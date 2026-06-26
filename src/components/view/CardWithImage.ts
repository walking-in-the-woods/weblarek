import { Card } from './Card';
import { categoryMap } from '../../utils/constants';

/**
 * Базовый класс для карточек, которые содержат категорию и изображение.
 * Используется для CardCatalog и CardPreview.
 */
export abstract class CardWithImage<T> extends Card<T> {
  protected _category?: HTMLElement;
  protected _image?: HTMLImageElement;

  constructor(container: HTMLElement) {
    super(container);
    this._category = container.querySelector('.card__category') ?? undefined;
    this._image = container.querySelector('.card__image') ?? undefined;
  }

  /**
   * Устанавливает категорию товара и применяет соответствующий CSS-класс.
   */
  set category(value: string) {
    if (this._category) {
      const modifier = categoryMap[value as keyof typeof categoryMap] || '';
      this._category.textContent = value;
      this._category.className = `card__category ${modifier}`;
    }
  }

  /**
   * Устанавливает изображение карточки.
   */
  set image(value: string) {
    if (this._image) {
      this._image.src = value;
    }
  }
}