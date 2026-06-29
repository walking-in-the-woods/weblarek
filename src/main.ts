/**
 * Точка входа приложения Web-ларёк.
 * Реализует слой презентера: связывает модели данных, компоненты представления
 * и API через брокер событий EventEmitter.
 *
 * Все представления, кроме карточек галереи и корзины, создаются однократно.
 * Обновление представлений происходит только при событиях изменения моделей.
 */

import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { WebLarekAPI } from './components/WebLarekAPI';
import { ProductsModel } from './components/models/ProductsModel';
import { BasketModel } from './components/models/BasketModel';
import { OrderModel } from './components/models/OrderModel';

import { Modal } from './components/view/Modal';
import { Header } from './components/view/Header';
import { Gallery } from './components/view/Gallery';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { Basket } from './components/view/Basket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';

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
// Представления (создаются однократно)
// ============================================================================

const modal = new Modal(ensureElement('#modal-container'));

// Хэдер и галерея
const headerContainer = document.querySelector('.header__container') as HTMLElement;
const header = new Header(headerContainer, () => events.emit('basket:open'));
const galleryContainer = document.querySelector('.gallery')!.parentElement!;
const gallery = new Gallery(galleryContainer);

// Корзина
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketContainer = cloneTemplate(basketTemplate);
const basket = new Basket(basketContainer, () => events.emit('basket:order'));

// Формы
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderContainer = cloneTemplate(orderTemplate);
const contactsContainer = cloneTemplate(contactsTemplate);

const orderForm = new OrderForm(
  orderContainer,
  (field, value) => orderModel.setField(field as keyof IBuyer, value),
  () => events.emit('order:submit')
);
const contactsForm = new ContactsForm(
  contactsContainer,
  (field, value) => orderModel.setField(field as keyof IBuyer, value),
  () => events.emit('contacts:submit')
);

// Success
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const successContainer = cloneTemplate(successTemplate);
const success = new Success(successContainer, () => events.emit('success:close'));

// Шаблоны для карточек
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

// ============================================================================
// Представление предпросмотра (создаётся один раз)
// ============================================================================

const previewContainer = cloneTemplate(cardPreviewTemplate);
const cardPreview = new CardPreview(previewContainer, () => {
  // Генерируем событие без данных – все данные берутся из модели
  events.emit('card:action');
});

// ============================================================================
// Обработчики событий (презентер)
// ============================================================================

// ----------------------------------------------------------------------------
// Загрузка товаров с сервера
// ----------------------------------------------------------------------------

webLarekApi.getProducts()
  .then(({ items }) => productsModel.setItems(items))
  .catch(err => {
    console.warn('Используются локальные данные:', err);
    productsModel.setItems(apiProducts.items);
  });

// ----------------------------------------------------------------------------
// Обновление галереи при изменении каталога
// ----------------------------------------------------------------------------

events.on('products:changed', () => {
  const items = productsModel.getItems();
  const cards = items.map(product => {
    const container = cloneTemplate(cardCatalogTemplate);
    // Передаём id через замыкание
    const card = new CardCatalog(container, () => {
      events.emit('card:select', { id: product.id });
    });
    card.title = product.title;
    card.image = CDN_URL + product.image;
    card.category = product.category;
    card.price = product.price;
    return card.render();
  });
  gallery.items = cards;
});

// ----------------------------------------------------------------------------
// Выбор товара – сохраняем в модели и открываем предпросмотр
// ----------------------------------------------------------------------------

events.on('card:select', (data: { id: string }) => {
  const product = productsModel.getItemById(data.id);
  if (product) productsModel.setSelectedProduct(product);
});

events.on('products:selected', () => {
  const product = productsModel.getSelectedProduct();
  if (!product) return;

  // Обновляем существующее представление CardPreview
  cardPreview.title = product.title;
  cardPreview.image = CDN_URL + product.image;
  cardPreview.category = product.category;
  cardPreview.price = product.price;
  cardPreview.description = product.description;

  const inBasket = basketModel.hasItem(product.id);
  const isAvailable = product.price !== null && product.price > 0;
  cardPreview.buttonState = {
    text: inBasket ? 'Удалить из корзины' : (isAvailable ? 'Купить' : 'Недоступно'),
    disabled: !isAvailable,
  };

  modal.open(cardPreview.render());
});

// ----------------------------------------------------------------------------
// Обработка действия с карточкой в предпросмотре
// ----------------------------------------------------------------------------

events.on('card:action', () => {
  const product = productsModel.getSelectedProduct();
  if (!product) return;

  const inBasket = basketModel.hasItem(product.id);
  if (inBasket) {
    basketModel.removeItem(product.id);
  } else {
    basketModel.addItem(product);
  }
  modal.close();
});

// ----------------------------------------------------------------------------
// Обновление корзины и хэдера при изменении корзины
// ----------------------------------------------------------------------------

events.on('basket:changed', () => {
  header.counter = basketModel.getCount();

  const items = basketModel.getItems();
  const total = basketModel.getTotalPrice();

  const cards = items.map((product, index) => {
    const container = cloneTemplate(cardBasketTemplate);
    // Передаём id через замыкание
    const card = new CardBasket(container, () => {
      basketModel.removeItem(product.id);
    });
    card.title = product.title;
    card.price = product.price;
    card.index = index + 1;
    return card.render();
  });

  basket.items = cards;
  basket.total = total;
});

// ----------------------------------------------------------------------------
// Открытие корзины
// ----------------------------------------------------------------------------

events.on('basket:open', () => {
  modal.open(basket.render());
});

// ----------------------------------------------------------------------------
// Оформление заказа – открываем первую форму
// ----------------------------------------------------------------------------

events.on('basket:order', () => {
  modal.close();
  modal.open(orderForm.render());
});

// ----------------------------------------------------------------------------
// Обновление форм при изменении данных заказа
// ----------------------------------------------------------------------------

events.on('order:changed', () => {
  const data = orderModel.getData();
  const errors = orderModel.validate();

  // Первая форма
  orderForm.payment = data.payment ?? null;
  orderForm.address = data.address ?? '';
  const orderErrors = [];
  if (errors.payment) orderErrors.push(errors.payment);
  if (errors.address) orderErrors.push(errors.address);
  orderForm.errors = orderErrors;
  orderForm.submitDisabled = orderErrors.length > 0;

  // Вторая форма
  contactsForm.email = data.email ?? '';
  contactsForm.phone = data.phone ?? '';
  const contactsErrors = [];
  if (errors.email) contactsErrors.push(errors.email);
  if (errors.phone) contactsErrors.push(errors.phone);
  contactsForm.errors = contactsErrors;
  contactsForm.submitDisabled = contactsErrors.length > 0;
});

// ----------------------------------------------------------------------------
// Переход ко второй форме
// ----------------------------------------------------------------------------

events.on('order:submit', () => {
  modal.open(contactsForm.render());
});

// ----------------------------------------------------------------------------
// Отправка заказа
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
      success.total = result.total;
      modal.open(success.render());
    })
    .catch(err => console.error('Ошибка оформления заказа:', err));
});

// ----------------------------------------------------------------------------
// Закрытие модалки и завершение
// ----------------------------------------------------------------------------

events.on('success:close', () => {
  modal.close();
});

// ============================================================================
// Запуск приложения
// ============================================================================

console.log('Web-ларёк запущен!');