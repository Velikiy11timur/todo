const ADD_BUTTON_ELEMENT = document.querySelector('.addButton'); 
const INPUT_TEXT_ELEMENT = document.querySelector('.todoText'); 
const CHECK_ALL_ELEMENT = document.querySelector('.selectAll');
const DELETE_SELECTED_BUTTON = document.querySelector('.deleteSelectedButton');

const PAGINATION_CONTAINER = document.querySelector('.paginationContainer');

const FILTERS_WRAPPER = document.querySelector('.filters');

const CONTENT_ELEMENT = document.querySelector('.content');

let todos = [];
let activeFilterId = 'allFilter';
let actualPage = 1;

const TODOS_ON_PAGE = 5; //указали количество тудух на странице*

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
	`
}; // эта функция взаимодействует с элементом массива todos уже созданным функцией createTodo.

const renderFilterButtons = () => {
	const countAllTasks = todos.length; //считает длину массива
	const countCompletedTasks = todos.filter(elem => elem.checked === true).length;
	const countActiveTasks = countAllTasks-countCompletedTasks;

  const isAllFilterOn = activeFilterId === 'allFilter';
  const isCompletedFilterOn = activeFilterId === 'completedFilter';
  const isActiveFilterOn = !isAllFilterOn && !isCompletedFilterOn;

  const buttonTemplate = `
    <button class="showAllTasks ${isAllFilterOn ? 'activeFilter' : ''}" data-id="allFilter">All Tasks(${countAllTasks})</button>
    <button class="showCompletedTasks ${isCompletedFilterOn ? 'activeFilter' : ''}" data-id="completedFilter">Completed Tasks(${countCompletedTasks})</button>
    <button class="showActiveTasks ${isActiveFilterOn ? 'activeFilter' : ''}" data-id="activeFilter">Active Tasks(${countActiveTasks})</button>
  `;

  FILTERS_WRAPPER.innerHTML = buttonTemplate;
};

const renderPaginationButtons = (lengthMassive) => {
  PAGINATION_CONTAINER.innerHTML = ''; // очистить контент внутри div
  
  for (let i = 1; Math.ceil(lengthMassive/TODOS_ON_PAGE) >= i; i++) {
    PAGINATION_CONTAINER.innerHTML += `<button class="btn1 ${actualPage === i ? 'activeFilter' : ''}" data-id="${i}">${i}</button>`;
  }
};

const render = (todoData) => {
	CONTENT_ELEMENT.innerHTML = ''; // очистить контент внутри тега

	if (todos.length === 0) {
    CHECK_ALL_ELEMENT.checked = false;
	}; //проверка чекбокса

	for(let elem of todoData) {
    CONTENT_ELEMENT.innerHTML = CONTENT_ELEMENT.innerHTML + createTodoTemplate(elem); // "к старому добавь новое и закинь все это назад"
	}
};

const renderWithFilters = () => {
	let filteredTodos = todos; //если 2 условия не сработали, остаётся как было

	if (activeFilterId === 'completedFilter') {
		filteredTodos = todos.filter(elem => elem.checked);
	} else if (activeFilterId === 'activeFilter') {
		filteredTodos = todos.filter(elem => !elem.checked);
	}

  const start = (actualPage - 1) * TODOS_ON_PAGE;
  let pagedTodos = filteredTodos.slice(start, start + TODOS_ON_PAGE)

  if (pagedTodos.length === 0 && actualPage !== 1) {
    actualPage -= 1;
    const newStart = (actualPage - 1) * TODOS_ON_PAGE;
    pagedTodos = filteredTodos.slice(newStart, newStart + TODOS_ON_PAGE);
  }

	render(pagedTodos);
  renderFilterButtons(); //отрисовать и счетчики на кнопках
  renderPaginationButtons(filteredTodos.length);
};

const onPageButtonHandler = (event) => {
  const buttonPage = event.target;

  if (buttonPage.dataset.id) {
    actualPage = Number(buttonPage.dataset.id);
  }

  renderWithFilters();
};

const onAddButtonClickHandler = (event) => {
  const inputValue = INPUT_TEXT_ELEMENT.value; //получаем значение из поля ввода
    
  if(inputValue) {
    todos.push(createTodo(inputValue)); // Добавляем новую задачу (если значение пустое то if отрабатывает false)
    INPUT_TEXT_ELEMENT.value = ''; // Очищаем поле ввода
    CHECK_ALL_ELEMENT.checked = false;
    activeFilterId = 'allFilter';
    actualPage = Math.ceil(todos.length / TODOS_ON_PAGE);
    renderWithFilters();
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
    renderWithFilters();
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
      renderWithFilters();
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

  todos = todos.map(elem => ({ ...elem, checked: checkAllButton.checked }));
  renderWithFilters();
};

const onDeleteSelectedHandler = (event) => {
  const deleteSelectedButton = event.target;

  todos = todos.filter(item => item.checked !== true); // выполняем проверку чекбокса
  /* todos = todos.filter(item => !item.checked); */ // эквивалентно (чем меньше букав чем лучше)
  renderWithFilters();
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
			renderWithFilters();
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
      renderWithFilters();
      const INPUT_EDITING_TODO_TEXT = document.querySelector('.inputEditingTodoText'); // находим появившийся input
      INPUT_EDITING_TODO_TEXT.focus(); // взять фокус на появившийся input (можно сразу печатать)
	    INPUT_EDITING_TODO_TEXT.addEventListener('blur', onBlurTextTodo);
    }
  }
};

const onFiltersButtonClickHandler = (event) => {
	const filterButton = event.target.dataset.id;

	if (filterButton) {
		activeFilterId = filterButton;
    actualPage = 1;
    renderWithFilters();
	}
};

CONTENT_ELEMENT.addEventListener('click', onDeleteTodoHandler); //работает туду удаляются
CONTENT_ELEMENT.addEventListener('click', onCheckBoxOnHandler); //работает меняет значение checked на противоположное
CONTENT_ELEMENT.addEventListener('dblclick', onEditTextTodo); //работает туду редактируются
ADD_BUTTON_ELEMENT.addEventListener('click', onAddButtonClickHandler); //работает туду добавляются с кнопки
INPUT_TEXT_ELEMENT.addEventListener('keydown', onEnterKeyHandler); //работает туду добавляются с клавиши Enter
CHECK_ALL_ELEMENT.addEventListener('click', onCheckAllHandler); // работает, все выделяется/выделения снимаются
DELETE_SELECTED_BUTTON.addEventListener('click', onDeleteSelectedHandler); // работает, выделенные туду удаляются
FILTERS_WRAPPER.addEventListener('click', onFiltersButtonClickHandler); // работает фильтрация туду
PAGINATION_CONTAINER.addEventListener('click', onPageButtonHandler); // работает пагинация вместе с фильтрацией
