(() => {
  const { _ } = window;

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

  async function getTodos() {
    //адрес запроса на получение в формате json todo объектов
    const url = 'http://localhost:5000/todos/getTodos';

    try {
      // await приостанавливает выполнение операции, пока не выполниться Promise fetch(url)
      const response = await fetch(url);
      if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      }

      const result = await response.json();
      //деструктурировал массив туду, переименовываем ключ
      const { todos: todosFromDB } = result;
      todos = todosFromDB;
      renderWithFilters();
      //проверка чекбокса selectAll
      CHECK_ALL_ELEMENT.checked = todos.every((elem) => elem.checked !== false);
    } catch (error) {
      console.error(error.message);
    }
  }

  getTodos();
  
  const TODOS_ON_PAGE = 7; // указали количество todo на странице*

  function createTodoTemplate(todo) {
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
    `;
  }

  const renderFilterButtons = () => {
    const countAllTasks = todos.length; // считает длину массива
    const countCompletedTasks = todos.filter((elem) => elem.checked === true).length;
    const countActiveTasks = countAllTasks - countCompletedTasks;

    const isAllFilterOn = activeFilterId === 'allFilter';
    const isCompletedFilterOn = activeFilterId === 'completedFilter';
    const isActiveFilterOn = !isAllFilterOn && !isCompletedFilterOn;

    const buttonTemplate = `
    <button class="showAllTasks buttonType1 ${isAllFilterOn ? 'activeFilter' : ''}" data-id="allFilter">All Tasks(${countAllTasks})</button>
    <button class="showCompletedTasks buttonType1 ${isCompletedFilterOn ? 'activeFilter' : ''}" data-id="completedFilter">Completed Tasks(${countCompletedTasks})</button>
    <button class="showActiveTasks buttonType1 ${isActiveFilterOn ? 'activeFilter' : ''}" data-id="activeFilter">Active Tasks(${countActiveTasks})</button>
  `;

    FILTERS_WRAPPER.innerHTML = buttonTemplate;
  };

  const renderPaginationButtons = (lengthMassive) => {
    PAGINATION_CONTAINER.innerHTML = ''; // очистить контент внутри div

    for (let i = 1; Math.ceil(lengthMassive / TODOS_ON_PAGE) >= i; i++) {
      PAGINATION_CONTAINER.innerHTML += `<button class="btn1 ${actualPage === i ? 'activeFilter' : ''}" data-id="${i}">${i}</button>`;
    }
  };

  const render = (todoData) => {
    CONTENT_ELEMENT.innerHTML = ''; // очистить контент внутри тега

    // проверка чекбокса
    if (todos.length === 0) {
      CHECK_ALL_ELEMENT.checked = false;
    } 

    todoData.forEach((elem) => {
      CONTENT_ELEMENT.innerHTML += createTodoTemplate(elem);
    });
  };

  const renderWithFilters = () => {
    let filteredTodos = todos; // если 2 условия не сработали, остаётся как было

    if (activeFilterId === 'completedFilter') {
      filteredTodos = todos.filter((elem) => elem.checked);
    } else if (activeFilterId === 'activeFilter') {
      filteredTodos = todos.filter((elem) => !elem.checked);
    }

    const start = (actualPage - 1) * TODOS_ON_PAGE;
    let pagedTodos = filteredTodos.slice(start, start + TODOS_ON_PAGE);

    if (pagedTodos.length === 0 && actualPage !== 1) {
      actualPage -= 1;
      const newStart = (actualPage - 1) * TODOS_ON_PAGE;
      pagedTodos = filteredTodos.slice(newStart, newStart + TODOS_ON_PAGE);
    }
    render(pagedTodos);
    renderFilterButtons(); // отрисовать и счетчики на кнопках
    renderPaginationButtons(filteredTodos.length);
  };

  const onPageButtonHandler = (event) => {
    const buttonPage = event.target;

    if (buttonPage.dataset.id) {
      actualPage = Number(buttonPage.dataset.id);
    }

    renderWithFilters();
  };

  const onAddButtonClickHandler = async () => {
    // получаем значение из поля ввода
    const inputValue = _.escape(INPUT_TEXT_ELEMENT.value);
    const objectTodoModel = {
      text: inputValue,
      checked: false,
      isEditing: false,
    }
    // запрос который создает туду, принимая в теле запроса в формате json строку с параметрами
    const url = 'http://localhost:5000/todo/create';

    if (inputValue) {
      try {
      const response = await fetch(url, {
        //сообщаем что метод будет POST, а не по умолчанию GET
        method: 'POST',
        //заголовок запроса сообщающий что тело запроса будет в формате json
        headers: {
          'Content-type': 'application/json' 
        },
        body: JSON.stringify(objectTodoModel)
      });
      if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      }
      //конечный рендер
      getTodos();
      
      // Очищаем поле ввода
      INPUT_TEXT_ELEMENT.value = '';
      
      // сброс чекбокса "все выполнено"
      CHECK_ALL_ELEMENT.checked = false;

      //обновляем фильтр (при добавлении начальный экран)
      activeFilterId = 'allFilter';

      // обновляем пагинацию
      actualPage = Math.ceil(todos.length / TODOS_ON_PAGE);

      } catch (error) {
        console.error('Не удалось создать задачу:', error.message);
      }
    }
  };

  const onDeleteTodoHandler = async (event) => {
    const deleteButton = event.target;
    
    //проверяем по классу кнопки, нужная ли кнопка нажата
    if (deleteButton.className === 'delete') {
      try {
      //находим dataset.id (которая является id todo)
      const url = `http://localhost:5000/todo/deleteTodo/${event.target.dataset.id}`;
      const response = await fetch(url, {
        method:'DELETE',
      });
      if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      }
      } catch (error) {
        console.error(error.message);
      }
      getTodos();
    }
  };

  const onCheckBoxOnHandler = async (event) => {
    const checkboxButton = event.target;

    //проверяем по классу что нажат чекбокс на самой todo
    if (checkboxButton.classList.contains('checkTodo')) {
      try {
        // Получаем ID нажатого чекбокса
        const todoId = checkboxButton.dataset.id;

        //url на PATCH, принимает тело запроса
        const url = `http://localhost:5000/todo/update/${todoId}`;

        //находим индекс нажатой todo в массиве
        const todoIndex = todos.findIndex(elem => elem.id === Number(todoId))

        // находим состояние поля checked у найденной todo (true/false)
        const todoStatus = () => {
          return todos[todoIndex].checked;
        }

        //если todoStatus = true, то при нажатии на чекбокс меняется на false
        const responseBody = todoStatus() ? false : true;
        try {
          const response = await fetch(url, {
            method: 'PATCH',
            //заголовок запроса сообщающий что тело запроса будет в формате json
            headers: {
              'Content-type': 'application/json' 
            },
            body: JSON.stringify({"checked":responseBody})
          })
          if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
          }
        } catch (error) {
          console.error(error.message);
        }
        //берем данные с БД + рендер
        getTodos();
      } catch (error) {
        console.error(error.message);
      }
    }
  };

  const onEnterKeyHandler = (event) => {
    if (event.key === 'Enter') {
      onAddButtonClickHandler(event);
    }
  };

  const onCheckAllHandler = (event) => {
    const checkAllButton = event.target;

    todos = todos.map((elem) => ({ ...elem, checked: checkAllButton.checked }));
    renderWithFilters();
  };

  const onDeleteSelectedHandler = async () => {
    const url = 'http://localhost:5000/todos/deleteChecked';
    try {
      const response = await fetch(url, {
        method:'DELETE',
      });
      if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      }
      getTodos();
    } catch (error) {
      console.error(error.message);
    }
  };

  const onBlurTextTodo = (event) => {
    const textToBlur = event.target;

    if (textToBlur.className === 'inputEditingTodoText') {
      const todoId = textToBlur.dataset.id; // получаем id
      const findTodo = (currentTodo) => currentTodo.id === Number(todoId);
      const todoIndex = todos.findIndex(findTodo); // Ищем задачу в массиве по ID
      const textTern = textToBlur.value.trim() ? _.escape(textToBlur.value) : todos[todoIndex].text;

      if (todoIndex !== -1) {
        todos[todoIndex].isEditing = false;
        todos[todoIndex].text = textTern;
        renderWithFilters();
      }
    }
  };

  const onEditTextTodo = (event) => {
    const textToEdit = event.target;

    if (textToEdit.className === 'descriptionTodo') {
      const todoId = textToEdit.dataset.id; // получаем id
      const findTodo = (currentTodo) => currentTodo.id === Number(todoId);
      const todoIndex = todos.findIndex(findTodo); // Ищем задачу в массиве по ID

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

  CONTENT_ELEMENT.addEventListener('click', onDeleteTodoHandler); // работает туду удаляются
  CONTENT_ELEMENT.addEventListener('click', onCheckBoxOnHandler); // работает меняет значение checked на противоположное
  CONTENT_ELEMENT.addEventListener('dblclick', onEditTextTodo); // работает туду редактируются
  ADD_BUTTON_ELEMENT.addEventListener('click', onAddButtonClickHandler); // работает туду добавляются с кнопки
  INPUT_TEXT_ELEMENT.addEventListener('keydown', onEnterKeyHandler); // работает туду добавляются с клавиши Enter
  CHECK_ALL_ELEMENT.addEventListener('click', onCheckAllHandler); // работает, все выделяется/выделения снимаются
  DELETE_SELECTED_BUTTON.addEventListener('click', onDeleteSelectedHandler); // работает, выделенные туду удаляются
  FILTERS_WRAPPER.addEventListener('click', onFiltersButtonClickHandler); // работает фильтрация туду
  PAGINATION_CONTAINER.addEventListener('click', onPageButtonHandler); // работает пагинация вместе с фильтрацией
})();
