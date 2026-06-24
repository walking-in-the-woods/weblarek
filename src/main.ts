/**
 * Точка входа приложения Web-ларёк.
 * Реализует слой презентера: связывает модели, представления и API.
 */

import './scss/styles.scss';

// Базовые классы и утилиты
import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';

// Слой коммуникации
import { WebLarekAPI } from './components/WebLarekAPI';

// Модели данных
import { ProductsModel } from './components/models/ProductsModel';
import { BasketModel } from './components/models/BasketModel';
import { OrderModel } from './components/models/OrderModel';

// Компоненты представления (View)
import { Modal } from './components/view/Modal';
import { Page } from './components/view/Page';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { Basket } from './components/view/Basket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';

// Типы и константы
import { IBuyer } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { apiProducts } from './utils/data';

// ============================================================================
// Инициализация
// ============================================================================

const events = new EventEmitter();
const api = new Api(API_URL);
const webLarekApi = new WebLarekAPI(api);

// ============================================================================
// Модели
// ============================================================================

const productsModel = new ProductsModel(events);
const basketModel = new BasketModel(events);
const orderModel = new OrderModel(events);

// ============================================================================
// Корневые компоненты
// ============================================================================

const page = new Page(document.body, events);
const modal = new Modal(ensureElement('#modal-container'), events);

// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// ============================================================================
// Типы событий
// ============================================================================

type FormChangeEvent = { field: keyof IBuyer; value: string };

// ============================================================================
// Состояние корзины и форм
// ============================================================================

let currentBasket: Basket | null = null;
let isBasketOpen = false;
let currentOrderForm: OrderForm | null = null;
let currentContactsForm: ContactsForm | null = null;

// ============================================================================
// Обработчики событий
// ============================================================================

// ----------------------------------------------------------------------------
// Загрузка товаров
// ----------------------------------------------------------------------------

webLarekApi.getProducts()
  .then(({ items }) => productsModel.setItems(items))
  .catch(err => {
    console.warn('Используются локальные данные:', err);
    productsModel.setItems(apiProducts.items);
  });

// ----------------------------------------------------------------------------
// Отображение каталога
// ----------------------------------------------------------------------------

events.on('products:changed', () => {
  const items = productsModel.getItems();
  const cards = items.map(product => {
    const container = cloneTemplate(cardCatalogTemplate);
    const card = new CardCatalog(container, events);
    card.id = product.id;
    card.title = product.title;
    card.image = CDN_URL + product.image;
    card.category = product.category;
    card.price = product.price;
    return card.render();
  });
  page.renderGallery(cards);
});

// ----------------------------------------------------------------------------
// Выбор товара (предпросмотр)
// ----------------------------------------------------------------------------

events.on('card:select', (data: { id: string }) => {
  const product = productsModel.getItemById(data.id);
  if (product) productsModel.setSelectedProduct(product);
});

events.on('products:selected', () => {
  const product = productsModel.getSelectedProduct();
  if (!product) return;

  const container = cloneTemplate(cardPreviewTemplate);
  const card = new CardPreview(container, events);
  card.id = product.id;
  card.title = product.title;
  card.image = CDN_URL + product.image;
  card.category = product.category;
  card.price = product.price;
  card.description = product.description;

  const inBasket = basketModel.hasItem(product.id);
  const isAvailable = product.price !== null && product.price > 0;
  card.buttonState = {
    text: inBasket ? 'Удалить из корзины' : (isAvailable ? 'Купить' : 'Недоступно'),
    disabled: !isAvailable,
  };
  modal.open(card.render());
});

// ----------------------------------------------------------------------------
// Действия с корзиной (добавление/удаление)
// ----------------------------------------------------------------------------

events.on('card:action', (data: { id: string; action: 'add' | 'remove' }) => {
  const product = productsModel.getItemById(data.id);
  if (!product) return;
  data.action === 'add' ? basketModel.addItem(product) : basketModel.removeItem(product.id);
  modal.close();
});

// ----------------------------------------------------------------------------
// Обновление счётчика и содержимого корзины
// ----------------------------------------------------------------------------

events.on('basket:changed', () => {
  page.setCounter(basketModel.getCount());
  if (isBasketOpen && currentBasket) {
    const items = basketModel.getItems();
    const total = basketModel.getTotalPrice();
    const cards = items.map((product, index) => {
      const container = cloneTemplate(cardBasketTemplate);
      const card = new CardBasket(container, events);
      card.id = product.id;
      card.title = product.title;
      card.price = product.price;
      card.index = index + 1;
      return card.render();
    });
    currentBasket.setItems(cards);
    currentBasket.setTotal(total);
  }
});

// ----------------------------------------------------------------------------
// Открытие корзины
// ----------------------------------------------------------------------------

events.on('basket:open', () => {
  if (isBasketOpen) {
    events.emit('basket:changed');
    return;
  }

  const items = basketModel.getItems();
  const total = basketModel.getTotalPrice();
  const container = cloneTemplate(basketTemplate);
  const basket = new Basket(container, events);
  currentBasket = basket;

  const cards = items.map((product, index) => {
    const cardContainer = cloneTemplate(cardBasketTemplate);
    const card = new CardBasket(cardContainer, events);
    card.id = product.id;
    card.title = product.title;
    card.price = product.price;
    card.index = index + 1;
    return card.render();
  });

  basket.setItems(cards);
  basket.setTotal(total);
  modal.open(basket.render());
  isBasketOpen = true;
});

events.on('modal:close', () => {
  isBasketOpen = false;
  currentBasket = null;
  currentOrderForm = null;
  currentContactsForm = null;
});

// ----------------------------------------------------------------------------
// Удаление товара из корзины
// ----------------------------------------------------------------------------

events.on('basket:remove', (data: { id: string }) => {
  basketModel.removeItem(data.id);
});

// ----------------------------------------------------------------------------
// Оформление заказа – первый шаг (способ оплаты + адрес)
// ----------------------------------------------------------------------------

events.on('basket:order', () => {
  modal.close(); // закрываем корзину
  const container = cloneTemplate(orderTemplate);
  const orderForm = new OrderForm(container, events);
  currentOrderForm = orderForm;

  const errors = orderModel.validate();
  // На первом шаге проверяем только address и payment
  const hasStep1Errors = !!(errors.address || errors.payment);
  orderForm.setSubmitDisabled(hasStep1Errors);
  modal.open(orderForm.render());
});

// ----------------------------------------------------------------------------
// Изменение полей первой формы
// ----------------------------------------------------------------------------

events.on('order:change', (data: FormChangeEvent) => {
  orderModel.setField(data.field, data.value);
  if (currentOrderForm) {
    const errors = orderModel.validate();
    // Для первого шага проверяем только address и payment
    const hasStep1Errors = !!(errors.address || errors.payment);
    const errorMessages = Object.values(errors).filter(e => e);
    currentOrderForm.setErrors(errorMessages);
    currentOrderForm.setSubmitDisabled(hasStep1Errors);
  }
});

// ----------------------------------------------------------------------------
// Отправка первой формы → переход ко второй
// ----------------------------------------------------------------------------

events.on('order:submit', () => {
  const errors = orderModel.validate();
  if (errors.address || errors.payment) {
    return;
  }

  // Открываем вторую форму
  const container = cloneTemplate(contactsTemplate);
  const contactsForm = new ContactsForm(container, events);
  currentContactsForm = contactsForm;

  const contactsErrors = orderModel.validate();
  const hasStep2Errors = !!(contactsErrors.email || contactsErrors.phone);
  contactsForm.setSubmitDisabled(hasStep2Errors);
  modal.open(contactsForm.render());
});

// ----------------------------------------------------------------------------
// Изменение полей второй формы
// ----------------------------------------------------------------------------

events.on('contacts:change', (data: FormChangeEvent) => {
  orderModel.setField(data.field, data.value);
  if (currentContactsForm) {
    const errors = orderModel.validate();
    const hasStep2Errors = !!(errors.email || errors.phone);
    const errorMessages = Object.values(errors).filter(e => e);
    currentContactsForm.setErrors(errorMessages);
    currentContactsForm.setSubmitDisabled(hasStep2Errors);
  }
});

// ----------------------------------------------------------------------------
// Отправка второй формы → отправка заказа на сервер
// ----------------------------------------------------------------------------

events.on('contacts:submit', () => {
  const orderData = orderModel.getData();
  if (!orderData.payment || !orderData.address || !orderData.email || !orderData.phone) {
    return;
  }

  const items = basketModel.getItems().map(item => item.id);
  const total = basketModel.getTotalPrice();
  const order = {
    payment: orderData.payment,
    address: orderData.address,
    email: orderData.email,
    phone: orderData.phone,
    items,
    total,
  };

  webLarekApi.postOrder(order)
    .then(result => {
      basketModel.clear();
      orderModel.clear();
      const container = cloneTemplate(successTemplate);
      const success = new Success(container, events);
      success.total = result.total;
      modal.open(success.render());
    })
    .catch(err => console.error('Ошибка оформления заказа:', err));
});

// ----------------------------------------------------------------------------
// Закрытие успешного сообщения
// ----------------------------------------------------------------------------

events.on('success:close', () => {
  modal.close();
});

// ============================================================================
// Запуск приложения
// ============================================================================

console.log('Web-ларёк запущен!');