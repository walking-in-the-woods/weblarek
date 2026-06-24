import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

/**
 * Абстрактный базовый класс для форм.
 * Управляет отправкой формы, обработкой ввода и отображением ошибок.
 * Генерирует события при изменении полей и при отправке формы.
 * @template T - тип данных формы
 */
export abstract class Form<T> extends Component<T> {
  protected _form: HTMLFormElement;
  protected _errors: HTMLElement;
  protected _submitButton: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    this._form = container as HTMLFormElement;
    this._errors = container.querySelector('.form__errors')!;
    this._submitButton = container.querySelector('.button[type="submit"]')!;

    // Отслеживаем ввод в любом поле
    this._form.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.onInputChange(target.name, target.value);
    });

    // Отслеживаем отправку формы
    this._form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit(`${this.getFormName()}:submit`);
    });
  }

  /** Должен возвращать имя формы для генерации событий (например, 'order' или 'contacts'). */
  protected abstract getFormName(): string;

  /** Обработчик изменения поля. Генерирует событие с именем формы и данными поля. */
  protected abstract onInputChange(field: string, value: string): void;

  /** Устанавливает текст ошибок (через точку с запятой). */
  setErrors(errors: string[]) {
    this._errors.textContent = errors.join('; ');
  }

  /** Включает/выключает кнопку отправки. */
  setSubmitDisabled(disabled: boolean) {
    this._submitButton.disabled = disabled;
  }

  render(data?: Partial<T>): HTMLElement {
    Object.assign(this as any, data);
    return this.container;
  }
}