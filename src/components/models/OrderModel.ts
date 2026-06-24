import { IBuyer, TPayment, TValidationErrors } from '../../types';
import { IEvents } from '../base/Events';

/**
 * Модель данных покупателя (заказа).
 * Хранит способ оплаты, адрес, email и телефон.
 * Предоставляет методы для изменения полей, получения данных, очистки и валидации.
 * При изменении любого поля генерируется событие 'order:changed'.
 */
export class OrderModel {
  private _payment: TPayment | null = null;
  private _address: string = '';
  private _email: string = '';
  private _phone: string = '';

  constructor(protected events: IEvents) {}

  /**
   * Устанавливает значение одного из полей.
   * Для поля 'payment' выполняется проверка допустимых значений.
   * @param field - имя поля (keyof IBuyer)
   * @param value - новое значение
   */
  setField(field: keyof IBuyer, value: string): void {
    if (field === 'payment') {
      if (value === 'card' || value === 'cash') {
        this._payment = value;
        this.events.emit('order:changed');
      } else {
        console.warn(`Invalid payment value: ${value}`);
      }
    } else if (field === 'address') {
      this._address = value;
      this.events.emit('order:changed');
    } else if (field === 'email') {
      this._email = value;
      this.events.emit('order:changed');
    } else if (field === 'phone') {
      this._phone = value;
      this.events.emit('order:changed');
    }
  }

  /**
   * Возвращает частичный объект IBuyer, так как payment может быть не выбран.
   * @returns Partial<IBuyer>
   */
  getData(): Partial<IBuyer> {
    return {
      payment: this._payment ?? undefined,
      address: this._address,
      email: this._email,
      phone: this._phone,
    };
  }

  /** Очищает все поля и генерирует событие 'order:changed'. */
  clear(): void {
    this._payment = null;
    this._address = '';
    this._email = '';
    this._phone = '';
    this.events.emit('order:changed');
  }

  /**
   * Проверяет заполненность всех полей.
   * Возвращает объект с текстами ошибок для невалидных полей.
   * Поле считается невалидным, если оно пустое (или payment === null).
   * @returns TValidationErrors - объект с ошибками
   */
  validate(): TValidationErrors {
    const errors: TValidationErrors = {};
    if (!this._payment) errors.payment = 'Не выбран способ оплаты';
    if (!this._address.trim()) errors.address = 'Введите адрес доставки';
    if (!this._email.trim()) errors.email = 'Укажите email';
    if (!this._phone.trim()) errors.phone = 'Укажите телефон';
    return errors;
  }
}