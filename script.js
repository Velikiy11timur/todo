"use strict"

const ADD_BUTTON_ELEMENT = document.querySelector('.addButton'); // берет из файла html
const INPUT_TEXT_ELEMENT = document.querySelector('.todoText'); // берет из файла html
const CHECK_ALL_ELEMENT = document.querySelector('.selectAll'); // берет из файла html
const DELETE_SELECTED_BUTTON = document.querySelector('.deleteSelectedButton')

const CONTENT_ELEMENT = document.querySelector('.content');

let todos = [];

function createTodo(text) {
  return {
    id: Date.now(),
    text: text, // можно использовать сокращенную запись
    checked: false
  }
};

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
`}; // '${todo.id}' кавычки нужны чтобы преобразовать number в string формат

const render = (todoData) => {
  CONTENT_ELEMENT.innerHTML = ''; // очистить контент внутри тега

  if (todos.length === 0) {
    CHECK_ALL_ELEMENT.checked = false;
  }

  for(let elem of todoData) {
     const template = createTodoTemplate(elem);
     CONTENT_ELEMENT.innerHTML = CONTENT_ELEMENT.innerHTML + template; // "к старому добавь новое и закинь все это назад"
    }
};

const onAddButtonClickHandler = (event) => {
  const inputValue = INPUT_TEXT_ELEMENT.value; //получаем значение из поля ввода
    
  if(inputValue) {
    todos.push(createTodo(inputValue)); // Добавляем новую задачу (если значение пустое то if отрабатывает false)
    INPUT_TEXT_ELEMENT.value = ''; // Очищаем поле ввода
    CHECK_ALL_ELEMENT.checked = false;
    render(todos);  // Обновляем отображение
  }
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
        CHECK_ALL_ELEMENT.checked = todos.every(elem => elem.checked !== false); //работает как надо
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
      todos[todoIndex].checked = checkboxButton.checked; 
      CHECK_ALL_ELEMENT.checked = todos.every(elem => elem.checked !== false); //работает как надо
      render(todos); // перерисовываем список
    }
  }
}

const onEnterKeyHandler = (event) => {
  if(event.key === 'Enter') {
    onAddButtonClickHandler(event);
  }
}

const onCheckAllHandler = (event) => {
  const checkAllButton = event.target;

  /* todos = todos.map(elem => {
    return {
      id: elem.id,
      text: elem.text,
      checked: checkAllButton.checked,
    }
  }); */

  /* todos = todos.map(elem => ({ id: elem.id, text: elem.text, checked: checkAllButton.checked })); */

  /* todos = todos.map(elem => ({ id: elem.id, text: elem.text, checked: elem.checked, checked: checkAllButton.checked })); */

  todos = todos.map(elem => ({ ...elem, checked: checkAllButton.checked }));
  render(todos);
};

const onDeleteSelectedHandler = (event) => {
  const deleteSelectedButton = event.target;

  todos = todos.filter(item => item.checked !== true); // выполняем проверку чекбокса
  /* todos = todos.filter(item => !item.checked); */ // эквивалентно (чем меньше букав чем лучше)
  render(todos);
}

CONTENT_ELEMENT.addEventListener('click', onDeleteTodoHandler); //работает туду удаляются
CONTENT_ELEMENT.addEventListener('click', onCheckBoxOnHandler); //работает меняет значение checked на противоположное 
ADD_BUTTON_ELEMENT.addEventListener('click', onAddButtonClickHandler); //работает туду добавляются с кнопки
INPUT_TEXT_ELEMENT.addEventListener('keydown', onEnterKeyHandler); //работает туду добавляются с клавиши Enter
CHECK_ALL_ELEMENT.addEventListener('click', onCheckAllHandler); // работает, все выделяется/выделения снимаются
DELETE_SELECTED_BUTTON.addEventListener('click', onDeleteSelectedHandler); // работает, выделенные туду удаляются