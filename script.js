"use strict"

const ADD_BUTTON_ELEMENT = document.querySelector('.addButton'); // берет из файла html
const INPUT_TEXT_ELEMENT = document.querySelector('.todoText'); // берет из файла html
const CHECK_ALL_ELEMENT = document.querySelector('.select-all'); // берет из файла html

const CONTENT_ELEMENT = document.querySelector('.content');

let todos = [];

/* const createTodo = (text) => ({
  id: Date.now(),
  text,
  checked: false,
}); */

function createTodo(text) {
  return {
    id: Date.now(),
    text: text, // можно использовать сокращенную запись
    checked: false,
  }
};

/* const createTodoTemplate = (todo) => `
  <div class="todo">
    <input class="checkTodo" type="checkbox">
    <p>${todo.text}</p>
    <button data-id='${todo.id}' class="delete">X</button>
  </div>
`; // '${todo.id}' кавычки нужны чтобы преобразовать number в string формат */

function createTodoTemplate (todo) {
    return `
  <div class="todo">
    <input 
      class="checkTodo" 
      type="checkbox" 
      data-id='${todo.id}'
      ${todo.checked ? 'checked' : ''} 
    >
    <p>${todo.text}</p>
    <button data-id='${todo.id}' class="delete">X</button>
  </div>
`};

const render = (todoData) => {
  CONTENT_ELEMENT.innerHTML = ''; // очистить контент внутри тега

/*   todoData.forEach((todo) => {
    const template = createTodoTemplate(todo); // callback функция
    CONTENT_ELEMENT.innerHTML += template;
  }); */
  for(let elem of todoData) {
     const template = createTodoTemplate(elem);
     CONTENT_ELEMENT.innerHTML = CONTENT_ELEMENT.innerHTML + template; // "к старому добавь новое и закинь все это назад"
    }
}
/* const forEach = (func) => {
    for(let elem of array) { // где array массив, на котором вызван метод forEach
        func(elem)
    }
} */

const onAddButtonClickHandler = (event) => {
  const inputValue = INPUT_TEXT_ELEMENT.value;

  if (inputValue) {
    todos.push(createTodo(inputValue));
  } // если пустое значение, то не добавляет

  INPUT_TEXT_ELEMENT.value = '';
  render(todos); // todoData = массиву todos и переменная todoData нужна для пагинации
};

const onDeleteTodoHandler = (event) => {
    const deleteButton = event.target

    if (deleteButton.className == 'delete') {
        todos = todos.filter((todo) => {
            if (todo.id !== Number(deleteButton.dataset.id)) {
                return true;
            } else {
                return false;
            }
        })
        render(todos);
    }
}

const onCheckBoxOnHandler = (event) => {
  const checkboxButton = event.target;

  if (checkboxButton.classList.contains('checkTodo')) { 
    const todoId = checkboxButton.dataset.id; // Получаем ID 
    const findTodo = (currentTodo) => currentTodo.id === Number(todoId);
    const todoIndex = todos.findIndex(findTodo); //Ищем задачу в массиве по ID

    if (todoIndex !== -1) { // если задача найдена
      todos[todoIndex].checked = checkboxButton.checked;  // 
      render(todos); // перерисовываем список
    }
  }
}

const onEnterKeyHandler = (event) => {
  if(event.key === 'Enter') {
    const inputValue = INPUT_TEXT_ELEMENT.value; //получаем значение из поля ввода
    
    if(inputValue) {
      todos.push(createTodo(inputValue)); // Добавляем новую задачу (если значение пустое то if отрабатывает false)
      INPUT_TEXT_ELEMENT.value = ''; // Очищаем поле ввода
      render(todos);  // Обновляем отображение
    }
  }
}

CONTENT_ELEMENT.addEventListener('click', onDeleteTodoHandler); //работает туду удаляются
CONTENT_ELEMENT.addEventListener('click', onCheckBoxOnHandler); //работает меняет значение checked на противоположное 
ADD_BUTTON_ELEMENT.addEventListener('click', onAddButtonClickHandler); //работает туду добавляются с кнопки
INPUT_TEXT_ELEMENT.addEventListener('keydown', onEnterKeyHandler); //работает туду добавляются с клавиши Enter
