import { Form } from './Form';
import { IEvents } from '../base/Events';

/**
 * Вторая форма оформления заказа (email и телефон).
 * Генерирует события 'contacts:change' и 'contacts:submit'.
 */
export class ContactsForm extends Form<{ email: string; phone: string }> {
  private _emailInput: HTMLInputElement;
  private _phoneInput: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this._emailInput = container.querySelector('[name="email"]')!;
    this._phoneInput = container.querySelector('[name="phone"]')!;
  }

  protected getFormName(): string {
    return 'contacts';
  }

  /** Генерирует событие 'contacts:change' при изменении любого поля. */
  protected onInputChange(field: string, value: string): void {
    this.events.emit('contacts:change', { field, value });
  }

  get email(): string { return this._emailInput.value; }
  get phone(): string { return this._phoneInput.value; }
}