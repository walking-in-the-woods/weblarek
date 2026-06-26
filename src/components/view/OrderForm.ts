import { Form } from './Form';
import { TPayment } from '../../types';

/**
 * Первая форма оформления заказа (способ оплаты и адрес).
 * Содержит сеттеры для полей и ошибок.
 * При изменении полей вызывает колбэк, переданный в конструктор.
 */
export class OrderForm extends Form<{ payment: TPayment; address: string }> {
  private _paymentButtons: NodeListOf<HTMLButtonElement>;
  private _addressInput: HTMLInputElement;

  constructor(container: HTMLElement, onInputChange: (field: string, value: string) => void, private _onSubmitCallback: () => void) {
    super(container, onInputChange);
    this._paymentButtons = container.querySelectorAll('.order__buttons .button');
    this._addressInput = container.querySelector('[name="address"]')!;

    // Клики по кнопкам оплаты вызывают колбэк с именем кнопки
    this._paymentButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this._onInputChange('payment', btn.name);
      });
    });
  }

  protected _onSubmit(): void {
    this._onSubmitCallback();
  }

  /**
   * Устанавливает выбранный способ оплаты, активируя соответствующую кнопку.
   */
  set payment(value: TPayment | null) {
    this._paymentButtons.forEach(btn => {
      btn.classList.toggle('button_alt-active', btn.name === value);
    });
  }

  /**
   * Устанавливает значение поля адреса.
   */
  set address(value: string) {
    this._addressInput.value = value;
  }
}