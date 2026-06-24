"use strict"

const ADD_BUTTON_ELEMENT = document.querySelector('.addButton');
const INPUT_TEXT_ELEMENT = document.querySelector('.todoText');
const CHECK_ALL_ELEMENT = document.querySelector('.selectAll');

const CONTENT_ELEMENT = document.querySelector('.content');

const todos = [];

const createTodo = (text) => ({
  id: Date.now(),
  text,
  checked: false,
});

const createTodoTemplate = (todo) => `
  <div class="todo">
    <input class="checkTodo" type="checkbox">
    <p>${todo.text}</p>
    <button data-id='${todo.id}' class="delete">X</button>
  </div>
`;

const render = (todoData) => {
  CONTENT_ELEMENT.innerHTML = '';

  todoData.forEach((todo) => {
    const template = createTodoTemplate(todo);

    CONTENT_ELEMENT.innerHTML += template;
  });
}

const onAddButtonClickHandler = (event) => {
  const inputValue = INPUT_TEXT_ELEMENT.value;

  if (inputValue) {
    todos.push(createTodo(inputValue));
  }

  INPUT_TEXT_ELEMENT.value = '';
  render(todos);
};

ADD_BUTTON_ELEMENT.addEventListener('click', onAddButtonClickHandler);
