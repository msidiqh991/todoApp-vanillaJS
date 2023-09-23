const todos = [];
const RENDER_EVENT = 'render-todo';

const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO'

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('form');

    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addTodo();
    })

    function addTodo(){
        const textTodo = document.getElementById('title').value;
        const timeStamp = document.getElementById('date').value
    
        const generatedID = generateId();
        const todoObject = generateTodoObject(generatedID, textTodo, timeStamp, false);
        todos.push(todoObject);

        // Auto removing inputed text
        document.getElementById('title').value = '';
        document.getElementById('date').value = '';

        updateTaskCount();
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function generateId(){
        return +new Date();
    }

    function generateTodoObject(id, task, timestamp, isCompleted){
        return {
            id,
            task,
            timestamp,
            isCompleted
        }
    }

    document.addEventListener(RENDER_EVENT, function () {
        const uncompletedTODOList = document.getElementById('todos');
        uncompletedTODOList.innerHTML = '';
       
        const completedTODOList = document.getElementById('completed-todos');
        completedTODOList.innerHTML = '';

        for (const todoItem of todos) {
            const todoElement = makeTodo(todoItem);
            if (!todoItem.isCompleted)
                uncompletedTODOList.append(todoElement);
            else
                completedTODOList.append(todoElement);
        }
    });

    // Update jumlah list todo pada local storage
    function updateTaskCount() {
        const uncompletedCount = todos.filter(todo => !todo.isCompleted).length;
        localStorage.setItem('uncompletedCount', uncompletedCount);

        const taskValue = document.getElementById('taskValue');
        taskValue.innerText = uncompletedCount;
    }

    function addTaskToCompleted(todoId){
        const todoTarget = findTodo(todoId);

        if(todoTarget == null) return;

        todoTarget.isCompleted = true;
        updateTaskCount()
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function findTodo(todoId){
        for(const todoItem of todos){
            if(todoItem.id === todoId){
                return todoItem;
            }
        }
        return null;
    }

    function removeTaskFromCompleted(todoId) {
        const todoTarget = findTodoIndex(todoId);
       
        if (todoTarget === -1) return;
       
        todos.splice(todoTarget, 1);
        updateTaskCount()
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function findTodoIndex(todoId){
        for(const index in todos) {
            if(todos[index].id === todoId) {
              return index;
            }
        }  
        return -1;
    }
       
    function undoTaskFromCompleted(todoId) {
        const todoTarget = findTodo(todoId);
       
        if (todoTarget == null) return;
       
        todoTarget.isCompleted = false;
        updateTaskCount()
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function makeTodo(todoObject) {
        const textTitle = document.createElement('h2');
        textTitle.innerText = todoObject.task;
       
        const textTimestamp = document.createElement('p');
        textTimestamp.innerText = todoObject.timestamp;
       
        const textContainer = document.createElement('div');
        textContainer.classList.add('inner');
        textContainer.append(textTitle, textTimestamp);
       
        const container = document.createElement('div');
        container.classList.add('item', 'shadow');
        container.append(textContainer);
        container.setAttribute('id', `todo-${todoObject.id}`);

        // Validasi option
        if(todoObject.isCompleted) {
            const undoButton = document.createElement('button');
            undoButton.classList.add('undo-button');
         
            undoButton.addEventListener('click', function () {
              undoTaskFromCompleted(todoObject.id);
            });

            const trashButton = document.createElement('button');
            trashButton.classList.add('trash-button');
         
            trashButton.addEventListener('click', function () {
              removeTaskFromCompleted(todoObject.id);
            });
         
            container.append(undoButton, trashButton);
        } else {
            const checkButton = document.createElement('button');
            checkButton.classList.add('check-button');
            
            checkButton.addEventListener('click', function () {
              addTaskToCompleted(todoObject.id);
            });
            
            container.append(checkButton);
        }    
        return container;
    }

    // Menyimpan data pada local Storage
    function saveData(){
        if(isStorageExist()){
            const parsed = JSON.stringify(todos);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(SAVED_EVENT));
        }
    }

    // Validasi apakah browser mendukung local storage?
    function isStorageExist() {
        if(typeof(Storage) === undefined){
            alert('Browser kamu tidak mendukung local storage');
            return false;
        }
        return true;
    }

    // Mencari data pada local storage
    function loadDataFromStorage(){
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if(data !== null){
            for(const todo of data){
                todos.push(todo);
            }
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    // Validasi pencarian data pada local storage
    if(isStorageExist) {
        loadDataFromStorage();
    }

    /* Memperbarui data pada storage secara langsung,
    dan mengambil data dari local storage */
    document.addEventListener(SAVED_EVENT, function() {
        console.log(localStorage.getItem(STORAGE_KEY));
    });
});