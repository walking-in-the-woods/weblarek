import { Component } from '../base/Component';

/**
 * Компонент корзины.
 * Отображает список товаров, общую стоимость и кнопку оформления заказа.
 * Управление состоянием кнопки и списком осуществляется через сеттеры.
 */
export class Basket extends Component<{ items: HTMLElement[]; total: number }> {
  private _list: HTMLElement;
  private _total: HTMLElement;
  private _button: HTMLButtonElement;

  constructor(container: HTMLElement, private _onOrder: () => void) {
    super(container);
    this._list = container.querySelector('.basket__list')!;
    this._total = container.querySelector('.basket__price')!;
    this._button = container.querySelector('.basket__button')!;

    this._button.addEventListener('click', () => {
      if (!this._button.disabled) {
        this._onOrder();
      }
    });
  }

  /**
   * Устанавливает список карточек в корзине.
   */
  set items(value: HTMLElement[]) {
    this._list.replaceChildren(...value);
  }

  /**
   * Устанавливает общую стоимость.
   */
  set total(value: number) {
    this._total.textContent = `${value} синапсов`;
    this._button.disabled = value === 0;
  }

  render(data?: Partial<{ items: HTMLElement[]; total: number }>): HTMLElement {
    if (data?.items) this.items = data.items;
    if (data?.total !== undefined) this.total = data.total;
    return this.container;
  }
}