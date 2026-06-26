import { Component } from '../base/Component';

/**
 * Компонент сообщения об успешном оформлении заказа.
 * Отображает сумму списания и содержит кнопку для закрытия.
 */
export class Success extends Component<{ total: number }> {
  private _description: HTMLElement;
  private _button: HTMLButtonElement;

  constructor(container: HTMLElement, private _onClose: () => void) {
    super(container);
    this._description = container.querySelector('.order-success__description')!;
    this._button = container.querySelector('.order-success__close')!;

    this._button.addEventListener('click', () => {
      this._onClose();
    });
  }

  /**
   * Устанавливает сумму списания в описание.
   */
  set total(value: number) {
    this._description.textContent = `Списано ${value} синапсов`;
  }

  render(data?: Partial<{ total: number }>): HTMLElement {
    if (data?.total !== undefined) this.total = data.total;
    return this.container;
  }
}