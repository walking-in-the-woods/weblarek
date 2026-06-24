import { Card } from './Card';
import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

/**
 * Карточка товара в списке корзины.
 * Отображает порядковый номер, название, цену и кнопку удаления.
 * При клике на кнопку удаления генерирует событие 'basket:remove' с id товара.
 */
export class CardBasket extends Card<IProduct> {
  private _index: HTMLElement;
  private _deleteButton: HTMLButtonElement;
  private _id: string = '';

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    this._index = container.querySelector('.basket__item-index')!;
    this._deleteButton = container.querySelector('.basket__item-delete')!;

    // При клике на кнопку удаления генерируем событие
    this._deleteButton.addEventListener('click', () => {
      this.events.emit('basket:remove', { id: this._id });
    });
  }

  // Сеттеры для данных карточки в корзине
  set id(value: string) { this._id = value; }
  set title(value: string) { this._title.textContent = value; }
  set price(value: number | null) { this.setPrice(value); }
  set index(value: number) { this._index.textContent = String(value); }

  // Изображение в корзине не отображается, но сеттер оставлен на случай расширения
  set image(value: string) { this.setCardImage(value); } // исправлено (на всякий случай)
}