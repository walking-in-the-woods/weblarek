import { Component } from '../base/Component';

/**
 * Абстрактный базовый класс для форм.
 * Управляет отправкой формы, обработкой ввода и отображением ошибок.
 * Предоставляет методы для установки ошибок и состояния кнопки.
 */
export abstract class Form<T> extends Component<T> {
  protected _form: HTMLFormElement;
  protected _errors: HTMLElement;
  protected _submitButton: HTMLButtonElement;

  constructor(container: HTMLElement, protected _onInputChange: (field: string, value: string) => void) {
    super(container);
    this._form = container as HTMLFormElement;
    this._errors = container.querySelector('.form__errors')!;
    this._submitButton = container.querySelector('.button[type="submit"]')!;

    this._form.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this._onInputChange(target.name, target.value);
    });

    this._form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._onSubmit();
    });
  }

  /** Должен быть переопределён в наследниках для отправки формы. */
  protected abstract _onSubmit(): void;

  /**
   * Устанавливает текст ошибок (через точку с запятой).
   */
  set errors(value: string[]) {
    this._errors.textContent = value.join('; ');
  }

  /**
   * Включает/выключает кнопку отправки.
   */
  set submitDisabled(value: boolean) {
    this._submitButton.disabled = value;
  }

  render(data?: Partial<T>): HTMLElement {
    Object.assign(this as any, data);
    return this.container;
  }
}