import { Component } from '../base/Component';

/**
 * Абстрактный базовый класс для всех карточек товара.
 * Содержит только общие для всех карточек поля: заголовок и цену.
 * Наследники добавляют специфические элементы (категорию, изображение, описание, кнопки).
 */
export abstract class Card<T> extends Component<T> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this._title = container.querySelector('.card__title')!;
    this._price = container.querySelector('.card__price')!;
  }

  /**
   * Устанавливает заголовок карточки.
   */
  set title(value: string) {
    this._title.textContent = value;
  }

  /**
   * Устанавливает цену карточки.
   * Если цена null, выводит "Бесценно", иначе добавляет "синапсов".
   */
  set price(value: number | null) {
    this._price.textContent = value !== null ? `${value} синапсов` : 'Бесценно';
  }
}