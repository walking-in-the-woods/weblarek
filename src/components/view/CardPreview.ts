import { CardWithImage } from './CardWithImage';
import { IProduct } from '../../types';

/**
 * Карточка товара для модального окна предпросмотра.
 * Содержит описание и кнопку, состояние которой управляется извне.
 * При клике на кнопку вызывает переданный колбэк.
 */
export class CardPreview extends CardWithImage<IProduct> {
  private _description: HTMLElement;
  private _button: HTMLButtonElement;

  constructor(container: HTMLElement, private _onButtonClick: () => void) {
    super(container);
    this._description = container.querySelector('.card__text')!;
    this._button = container.querySelector('.card__button')!;

    this._button.addEventListener('click', () => {
      if (!this._button.disabled) {
        this._onButtonClick();
      }
    });
  }

  /**
   * Устанавливает описание товара.
   */
  set description(value: string) {
    this._description.textContent = value;
  }

  /**
   * Устанавливает состояние кнопки: текст и доступность.
   */
  set buttonState(state: { text: string; disabled: boolean }) {
    this._button.textContent = state.text;
    this._button.disabled = state.disabled;
  }
}