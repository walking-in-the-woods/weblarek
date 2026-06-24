import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

/**
 * Компонент корзины.
 * Отображает список товаров, общую стоимость и кнопку оформления заказа.
 * Кнопка оформления деактивируется, если корзина пуста.
 * Генерирует событие 'basket:order' при клике на кнопку "Оформить".
 */
export class Basket extends Component<{ items: HTMLElement[]; total: number }> {
  private _list: HTMLElement;
  private _total: HTMLElement;
  private _button: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    this._list = container.querySelector('.basket__list')!;
    this._total = container.querySelector('.basket__price')!;
    this._button = container.querySelector('.basket__button')!;

    this._button.addEventListener('click', () => {
      if (!this._button.disabled) {
        this.events.emit('basket:order');
      }
    });
  }

  /** Устанавливает список карточек в корзине. */
  setItems(items: HTMLElement[]) {
    this._list.replaceChildren(...items);
  }

  /** Обновляет отображение общей стоимости. */
  setTotal(total: number) {
    this._total.textContent = `${total} синапсов`;
  }

  /** Включает/выключает кнопку оформления. */
  setDisabled(disabled: boolean) {
    this._button.disabled = disabled;
  }

  /**
   * Рендерит корзину с переданными элементами и итоговой суммой.
   * Автоматически управляет доступностью кнопки.
   */
  render(data?: Partial<{ items: HTMLElement[]; total: number }>): HTMLElement {
    if (data?.items) this.setItems(data.items);
    if (data?.total !== undefined) {
      this.setTotal(data.total);
      this.setDisabled(data.total === 0);
    }
    return this.container;
  }
}