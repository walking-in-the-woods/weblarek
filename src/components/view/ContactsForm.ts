import { Form } from './Form';

/**
 * Вторая форма оформления заказа (email и телефон).
 * Содержит сеттеры для полей и ошибок.
 * При изменении полей вызывает колбэк, переданный в конструктор.
 */
export class ContactsForm extends Form<{ email: string; phone: string }> {
  private _emailInput: HTMLInputElement;
  private _phoneInput: HTMLInputElement;

  constructor(container: HTMLElement, onInputChange: (field: string, value: string) => void, private _onSubmitCallback: () => void) {
    super(container, onInputChange);
    this._emailInput = container.querySelector('[name="email"]')!;
    this._phoneInput = container.querySelector('[name="phone"]')!;
  }

  protected _onSubmit(): void {
    this._onSubmitCallback();
  }

  /**
   * Устанавливает значение поля email.
   */
  set email(value: string) {
    this._emailInput.value = value;
  }

  /**
   * Устанавливает значение поля телефона.
   */
  set phone(value: string) {
    this._phoneInput.value = value;
  }
}