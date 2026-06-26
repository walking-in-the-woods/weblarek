import { Card } from './Card';
import { IProduct } from '../../types';

/**
 * Карточка товара в списке корзины.
 * Отображает порядковый номер, название, цену и кнопку удаления.
 * При клике на кнопку удаления вызывает переданный колбэк.
 */
export class CardBasket extends Card<IProduct> {
  private _index: HTMLElement;
  private _deleteButton: HTMLButtonElement;

  constructor(container: HTMLElement, private _onDelete: () => void) {
    super(container);
    this._index = container.querySelector('.basket__item-index')!;
    this._deleteButton = container.querySelector('.basket__item-delete')!;

    this._deleteButton.addEventListener('click', () => {
      this._onDelete();
    });
  }

  /**
   * Устанавливает порядковый номер товара в корзине.
   */
  set index(value: number) {
    this._index.textContent = String(value);
  }
}