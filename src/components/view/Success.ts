import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

/**
 * Компонент сообщения об успешном оформлении заказа.
 * Отображает сумму списания и содержит кнопку для закрытия.
 * При клике на кнопку генерирует событие 'success:close'.
 */
export class Success extends Component<{ total: number }> {
  private _description: HTMLElement;
  private _button: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    this._description = container.querySelector('.order-success__description')!;
    this._button = container.querySelector('.order-success__close')!;

    this._button.addEventListener('click', () => {
      this.events.emit('success:close');
    });
  }

  /** Устанавливает сумму списания в описание. */
  set total(value: number) {
    this._description.textContent = `Списано ${value} синапсов`;
  }

  render(data?: Partial<{ total: number }>): HTMLElement {
    if (data?.total !== undefined) this.total = data.total;
    return this.container;
  }
}