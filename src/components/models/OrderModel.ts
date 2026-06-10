import { IBuyer, TPayment } from '../../types';

/**
 * Модель данных покупателя (заказа).
 * Хранит способ оплаты, адрес, email, телефон.
 * Предоставляет валидацию и управление полями.
 */
export class OrderModel {
  private _payment: TPayment | null = null;
  private _address: string = '';
  private _email: string = '';
  private _phone: string = '';

  // Установить значение конкретного поля
  setField(field: keyof IBuyer, value: string): void {
    if (field === 'payment') {
      this._payment = value as TPayment;
    } else if (field === 'address') {
      this._address = value;
    } else if (field === 'email') {
      this._email = value;
    } else if (field === 'phone') {
      this._phone = value;
    }
  }

  // Получить все данные покупателя
  getData(): IBuyer {
    return {
      payment: this._payment as TPayment,
      address: this._address,
      email: this._email,
      phone: this._phone,
    };
  }

  // Очистить все поля
  clear(): void {
    this._payment = null;
    this._address = '';
    this._email = '';
    this._phone = '';
  }

  /**
   * Валидация данных.
   * Возвращает объект с ошибками для полей, которые не прошли проверку.
   * Поле считается невалидным, если оно пустое (или payment === null).
   */
  validate(): Partial<Record<keyof IBuyer, string>> {
    const errors: Partial<Record<keyof IBuyer, string>> = {};

    if (!this._payment) {
      errors.payment = 'Не выбран способ оплаты';
    }
    if (!this._address.trim()) {
      errors.address = 'Введите адрес доставки';
    }
    if (!this._email.trim()) {
      errors.email = 'Укажите email';
    }
    if (!this._phone.trim()) {
      errors.phone = 'Укажите телефон';
    }

    return errors;
  }
}