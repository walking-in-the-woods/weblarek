import { Component } from '../base/Component';
import { IProduct } from '../../types';
import { categoryMap } from '../../utils/constants';

/**
 * Абстрактный базовый класс для всех видов карточек товара.
 * Содержит общие поля: заголовок, цену, категорию, изображение.
 * Предоставляет защищённые методы для установки этих полей.
 */
export abstract class Card<T> extends Component<T> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _category?: HTMLElement;
  protected _image?: HTMLImageElement;

  constructor(container: HTMLElement) {
    super(container);
    // Находим элементы в DOM
    this._title = container.querySelector('.card__title')!;
    this._price = container.querySelector('.card__price')!;
    this._category = container.querySelector('.card__category') ?? undefined;
    this._image = container.querySelector('.card__image') ?? undefined;
  }

  /**
   * Устанавливает категорию товара и применяет соответствующий CSS-класс.
   * Используется объект categoryMap из констант.
   * @param category - строка категории (например, "софт-скил")
   */
  protected setCategory(category: string) {
    if (this._category) {
      const modifier = categoryMap[category as keyof typeof categoryMap] || '';
      this._category.textContent = category;
      this._category.className = `card__category ${modifier}`;
    }
  }

  /**
   * Устанавливает изображение карточки, используя сохранённый DOM-элемент.
   * @param src - путь к изображению (полный URL или относительный)
   * @param alt - альтернативный текст (опционально)
   */
  protected setCardImage(src: string, alt?: string) {
    if (this._image) {
      this._image.src = src;
      if (alt) this._image.alt = alt;
    }
  }

  /**
   * Форматирует цену для отображения.
   * Если цена null, выводит "Бесценно", иначе добавляет "синапсов".
   * @param price - цена или null
   */
  protected setPrice(price: number | null) {
    this._price.textContent = price !== null ? `${price} синапсов` : 'Бесценно';
  }

  /**
   * Базовый метод render, который применяет переданные данные к полям.
   * В дочерних классах сеттеры будут вызваны автоматически через Object.assign.
   */
  render(data?: Partial<T>): HTMLElement {
    Object.assign(this as any, data);
    return this.container;
  }
}