import { Component } from '../base/Component';

/**
 * Компонент хэдера.
 * Отображает счётчик корзины и кнопку для её открытия.
 * При клике на кнопку вызывает переданный колбэк.
 */
export class Header extends Component<{ counter: number }> {
  private _counter: HTMLElement;
  private _basketButton: HTMLElement;

  constructor(container: HTMLElement, private _onBasketOpen: () => void) {
    super(container);
    this._counter = container.querySelector('.header__basket-counter')!;
    this._basketButton = container.querySelector('.header__basket')!;

    this._basketButton.addEventListener('click', () => {
      this._onBasketOpen();
    });
  }

  /**
   * Устанавливает значение счётчика.
   */
  set counter(value: number) {
    this._counter.textContent = String(value);
  }

  render(data?: Partial<{ counter: number }>): HTMLElement {
    if (data?.counter !== undefined) this.counter = data.counter;
    return this.container;
  }
}