import { Card } from './Card';
import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

/**
 * Карточка товара для каталога.
 * При клике на карточку генерирует событие 'card:select' с id товара.
 */
export class CardCatalog extends Card<IProduct> {
  // Храним id товара для генерации события
  private _id: string = '';

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    // Вешаем обработчик клика на всю карточку
    container.addEventListener('click', () => {
      this.events.emit('card:select', { id: this._id });
    });
  }

  // Сеттеры, вызываемые через Object.assign в render
  set id(value: string) { this._id = value; }
  set title(value: string) { this._title.textContent = value; }
  set image(value: string) { this.setImage(value); }
  set category(value: string) { this.setCategory(value); }
  set price(value: number | null) { this.setPrice(value); }
}