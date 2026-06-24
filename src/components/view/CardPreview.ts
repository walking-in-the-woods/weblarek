import { Card } from './Card';
import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

/**
 * Карточка товара для модального окна предпросмотра.
 * Содержит описание и кнопку, состояние которой зависит от наличия товара в корзине и цены.
 * Генерирует событие 'card:action' с id товара и действием ('add' или 'remove').
 */
export class CardPreview extends Card<IProduct> {
  private _description: HTMLElement;
  private _button: HTMLButtonElement;
  private _id: string = '';

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    this._description = container.querySelector('.card__text')!;
    this._button = container.querySelector('.card__button')!;

    // При клике на кнопку генерируем событие действия
    this._button.addEventListener('click', () => {
      if (this._button.disabled) return;
      // Определяем действие по тексту кнопки (можно было бы использовать data-атрибут)
      const action = this._button.textContent === 'Купить' ? 'add' : 'remove';
      this.events.emit('card:action', { id: this._id, action });
    });
  }

  // Сеттеры для всех полей карточки
  set id(value: string) { this._id = value; }
  set title(value: string) { this._title.textContent = value; }
  set image(value: string) { this.setCardImage(value); } // исправлено
  set category(value: string) { this.setCategory(value); }
  set price(value: number | null) { this.setPrice(value); }
  set description(value: string) { this._description.textContent = value; }

  /**
   * Устанавливает состояние кнопки: текст и доступность.
   * @param state - объект с полями text и disabled
   */
  set buttonState(state: { text: string; disabled: boolean }) {
    this._button.textContent = state.text;
    this._button.disabled = state.disabled;
  }
}