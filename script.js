"use strict"

const ADD_BUTTON_ELEMENT = document.querySelector('.addButton'); 
const INPUT_TEXT_ELEMENT = document.querySelector('.todoText'); 
const CHECK_ALL_ELEMENT = document.querySelector('.selectAll');
const DELETE_SELECTED_BUTTON = document.querySelector('.deleteSelectedButton');

const SHOW_ALL_TASKS_BUTTON = document.querySelector('.showAllTasks');
const SHOW_COMPLETED_TASKS_BUTTON = document.querySelector('.showCompletedTasks');
const SHOW_ACTIVE_TASKS_BUTTON = document.querySelector('.showActiveTasks');

const CONTENT_ELEMENT = document.querySelector('.content');

let todos = [];

let filterFlags = {
	allTasksFilterActive: true,
	completedTasksFilterActive: false,
	activeTasksFilterActive: false,
};

function createTodo(text) {
  return {
    id: Date.now(),
    text: text, // можно использовать сокращенную запись
    checked: false,
    isEditing: false // флаг отвечающий за редактирование
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
    ${todo.isEditing ? `<input class="inputEditingTodoText" data-id='${todo.id}' type="text" value="${todo.text}">` : `<p data-id='${todo.id}' class="descriptionTodo">${todo.text}</p>`}
    
    <button data-id='${todo.id}' class="delete">X</button>
  </div>
`}; // '${todo.id}' кавычки нужны чтобы преобразовать number в string формат

const renderFilterButtons = () => {
	const countAllTasks = todos.length; //считает длину массива
	const countCompletedTasks = todos.filter(elem => elem.checked === true).length; 
	const countActiveTasks = countAllTasks-countCompletedTasks;

	SHOW_ALL_TASKS_BUTTON.innerText = `All Tasks(${countAllTasks})`;
	SHOW_COMPLETED_TASKS_BUTTON.innerText = `Completed Tasks(${countCompletedTasks})`;
	SHOW_ACTIVE_TASKS_BUTTON.innerText = `Active Tasks(${countActiveTasks})`;
}

const render = (todoData) => {
	CONTENT_ELEMENT.innerHTML = ''; // очистить контент внутри тега

	if (todos.length === 0) {
    	CHECK_ALL_ELEMENT.checked = false;
	}

	for(let elem of todoData) {
    	const template = createTodoTemplate(elem);
    	CONTENT_ELEMENT.innerHTML = CONTENT_ELEMENT.innerHTML + template; // "к старому добавь новое и закинь все это назад"
	}

	renderFilterButtons(); //отрисовать кнопульки и счетчики
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
};

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
};

const onEnterKeyHandler = (event) => {
  if(event.key === 'Enter') {
    onAddButtonClickHandler(event);
  }
};

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
};

const onBlurTextTodo = (event) => {
	const textToBlur = event.target;
	
	if (textToBlur.className === 'inputEditingTodoText') {
		const todoId = textToBlur.dataset.id; // получаем id
    	const findTodo = (currentTodo) => currentTodo.id === Number(todoId);
    	const todoIndex = todos.findIndex(findTodo); //Ищем задачу в массиве по ID

		if (todoIndex !== -1) {
			todos[todoIndex].isEditing = false;
			todos[todoIndex].text = textToBlur.value.trim() ? textToBlur.value : todos[todoIndex].text;
			render(todos);
		}
	}
};

const onEditTextTodo = (event) => {
  const textToEdit = event.target;
  
  if (textToEdit.className === 'descriptionTodo') {
    const todoId = textToEdit.dataset.id; // получаем id
    const findTodo = (currentTodo) => currentTodo.id === Number(todoId);
    const todoIndex = todos.findIndex(findTodo); //Ищем задачу в массиве по ID

    if (todoIndex !== -1) { // если задача найдена
      todos[todoIndex].isEditing = true;
      render(todos);
      const INPUT_EDITING_TODO_TEXT = document.querySelector('.inputEditingTodoText'); // находим появившийся input
      INPUT_EDITING_TODO_TEXT.focus(); // взять фокус на появившийся input (можно сразу печатать)
	  INPUT_EDITING_TODO_TEXT.addEventListener('blur', onBlurTextTodo);
    }
  }
};

const onShowAllTasksFilterHandler = (event) => {
	const showAllTasksButton = event.target;
	
	filterFlags.allTasksFilterActive = true; //меняем флаг
	filterFlags.completedTasksFilterActive = false; //меняем флаг
	filterFlags.activeTasksFilterActive = false; //меняем флаг

	if (filterFlags.allTasksFilterActive === true) {
		SHOW_COMPLETED_TASKS_BUTTON.classList.remove('activeFilter');
		SHOW_ALL_TASKS_BUTTON.classList.add('activeFilter');
		SHOW_ACTIVE_TASKS_BUTTON.classList.remove('activeFilter');
	};

	console.log("эта кнопка показывает ВСЕ туду");
};

const onShowCompletedTasksFilterHandler = (event) => {
	const showCompletedTasksButton = event.target;

	filterFlags.allTasksFilterActive = false; //меняем флаг
	filterFlags.completedTasksFilterActive = true; //меняем флаг
	filterFlags.activeTasksFilterActive = false; //меняем флаг

	if (filterFlags.completedTasksFilterActive === true) {
		SHOW_COMPLETED_TASKS_BUTTON.classList.add('activeFilter');
		SHOW_ALL_TASKS_BUTTON.classList.remove('activeFilter');
		SHOW_ACTIVE_TASKS_BUTTON.classList.remove('activeFilter');
	};
	
	console.log('Эта кнопка показывает ВЫПОЛНЕННЫЕ туду');
	
};

const onShowActiveTasksFilterHandler = (event) => {
	const ShowActiveTasksButton = event.target;

	filterFlags.allTasksFilterActive = false; //меняем флаг
	filterFlags.completedTasksFilterActive = false; //меняем флаг
	filterFlags.activeTasksFilterActive = true; //меняем флаг

	if (filterFlags.activeTasksFilterActive === true) {
		SHOW_COMPLETED_TASKS_BUTTON.classList.remove('activeFilter');
		SHOW_ALL_TASKS_BUTTON.classList.remove('activeFilter');
		SHOW_ACTIVE_TASKS_BUTTON.classList.add('activeFilter');
	};

	console.log('Эта кнопка показывает АКТИВНЫЕ туду');
};

CONTENT_ELEMENT.addEventListener('click', onDeleteTodoHandler); //работает туду удаляются
CONTENT_ELEMENT.addEventListener('click', onCheckBoxOnHandler); //работает меняет значение checked на противоположное
CONTENT_ELEMENT.addEventListener('dblclick', onEditTextTodo); //работает туду редактируются
ADD_BUTTON_ELEMENT.addEventListener('click', onAddButtonClickHandler); //работает туду добавляются с кнопки
INPUT_TEXT_ELEMENT.addEventListener('keydown', onEnterKeyHandler); //работает туду добавляются с клавиши Enter
CHECK_ALL_ELEMENT.addEventListener('click', onCheckAllHandler); // работает, все выделяется/выделения снимаются
DELETE_SELECTED_BUTTON.addEventListener('click', onDeleteSelectedHandler); // работает, выделенные туду удаляются
SHOW_ALL_TASKS_BUTTON.addEventListener('click', onShowAllTasksFilterHandler);//кнопочку нашел, пока НЕ работает
SHOW_COMPLETED_TASKS_BUTTON.addEventListener('click', onShowCompletedTasksFilterHandler);//кнопочку нашел, пока НЕ работает
SHOW_ACTIVE_TASKS_BUTTON.addEventListener('click', onShowActiveTasksFilterHandler);//кнопочку нашел, пока НЕ работает