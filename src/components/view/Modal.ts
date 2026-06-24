import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

/**
 * Компонент модального окна.
 * Управляет отображением модального окна и его содержимого.
 * Закрывается по клику на крестик или на фон.
 * Генерирует события 'modal:open' и 'modal:close'.
 */
export class Modal extends Component<{ content: HTMLElement }> {
  private _closeButton: HTMLElement;
  private _content: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    // Сохраняем элементы управления
    this._closeButton = container.querySelector('.modal__close')!;
    this._content = container.querySelector('.modal__content')!;

    // Назначаем обработчики закрытия
    this._closeButton.addEventListener('click', this.close.bind(this));
    this.container.addEventListener('click', this._onContainerClick.bind(this));
  }

  /**
   * Закрывает модальное окно при клике на фон (сам контейнер).
   */
  private _onContainerClick(event: MouseEvent) {
    if (event.target === this.container) {
      this.close();
    }
  }

  /**
   * Открывает модальное окно с переданным содержимым.
   * @param content - DOM-элемент, который будет показан внутри модалки
   */
  open(content: HTMLElement) {
    this._content.innerHTML = '';
    this._content.append(content);
    this.container.classList.add('modal_active');
    this.events.emit('modal:open');
  }

  /** Закрывает модальное окно и очищает содержимое. */
  close() {
    this.container.classList.remove('modal_active');
    this._content.innerHTML = '';
    this.events.emit('modal:close');
  }

  /**
   * Метод render для совместимости с базовым Component.
   * Если передан data.content, открывает модалку с этим содержимым.
   */
  render(data?: { content: HTMLElement }): HTMLElement {
    if (data?.content) {
      this.open(data.content);
    }
    return this.container;
  }
}