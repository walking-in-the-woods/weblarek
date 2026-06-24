import { Form } from './Form';
import { IEvents } from '../base/Events';
import { TPayment } from '../../types';

/**
 * Первая форма оформления заказа (способ оплаты и адрес).
 * Отслеживает выбор способа оплаты (кнопки) и ввод адреса.
 * Генерирует события 'order:change' и 'order:submit'.
 */
export class OrderForm extends Form<{ payment: TPayment; address: string }> {
  private _paymentButtons: NodeListOf<HTMLButtonElement>;
  private _addressInput: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this._paymentButtons = container.querySelectorAll('.order__buttons .button');
    this._addressInput = container.querySelector('[name="address"]')!;

    // При клике на кнопку оплаты переключаем активный класс и генерируем событие
    this._paymentButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Снимаем активный класс со всех кнопок
        this._paymentButtons.forEach(b => b.classList.remove('button_alt-active'));
        btn.classList.add('button_alt-active');
        this.onInputChange('payment', btn.name);
      });
    });
  }

  protected getFormName(): string {
    return 'order';
  }

  /** При изменении поля генерируем событие 'order:change' с именем поля и значением. */
  protected onInputChange(field: string, value: string): void {
    this.events.emit('order:change', { field, value });
  }

  /** Возвращает выбранный способ оплаты или null. */
  get payment(): TPayment | null {
    const active = Array.from(this._paymentButtons).find(b => b.classList.contains('button_alt-active'));
    return active ? active.name as TPayment : null;
  }

  /** Возвращает введённый адрес. */
  get address(): string {
    return this._addressInput.value;
  }
}