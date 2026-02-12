class KanbanBoard {
    constructor() {
        this.columns = [];
        this.currentCardModalColumn = null;
        this.currentCardModalCard = null;
        this.initializeEventListeners();
        this.loadFromLocalStorage();
        this.render();
    }

    initializeEventListeners() {
        // Add column button
        document.getElementById('add-column-btn').addEventListener('click', () => {
            this.addColumn();
        });

        // Card modal form
        document.getElementById('card-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCardFormSubmit();
        });

        // Cancel card button
        document.getElementById('cancel-card-btn').addEventListener('click', () => {
            this.hideCardModal();
        });
    }

    addColumn() {
        const columnName = prompt('Enter column name:');
        if (columnName) {
            const column = {
                id: Date.now().toString(),
                title: columnName,
                cards: []
            };
            this.columns.push(column);
            this.saveToLocalStorage();
            this.render();
        }
    }

    addCard(columnId, cardData) {
        const column = this.columns.find(col => col.id === columnId);
        if (column) {
            const card = {
                id: Date.now().toString(),
                title: cardData.title,
                description: cardData.description || '',
                label: cardData.label || '',
                timestamp: new Date().toISOString()
            };
            column.cards.push(card);
            this.saveToLocalStorage();
            this.render();
        }
    }

    updateCard(columnId, cardId, updatedData) {
        const column = this.columns.find(col => col.id === columnId);
        if (column) {
            const card = column.cards.find(c => c.id === cardId);
            if (card) {
                Object.assign(card, updatedData);
                this.saveToLocalStorage();
                this.render();
            }
        }
    }

    deleteCard(columnId, cardId) {
        const column = this.columns.find(col => col.id === columnId);
        if (column) {
            column.cards = column.cards.filter(c => c.id !== cardId);
            this.saveToLocalStorage();
            this.render();
        }
    }

    deleteColumn(columnId) {
        this.columns = this.columns.filter(col => col.id !== columnId);
        this.saveToLocalStorage();
        this.render();
    }

    moveCard(cardId, fromColumnId, toColumnId) {
        const fromColumn = this.columns.find(col => col.id === fromColumnId);
        const toColumn = this.columns.find(col => col.id === toColumnId);
        
        if (fromColumn && toColumn) {
            const card = fromColumn.cards.find(c => c.id === cardId);
            if (card) {
                fromColumn.cards = fromColumn.cards.filter(c => c.id !== cardId);
                toColumn.cards.push(card);
                this.saveToLocalStorage();
                this.render();
            }
        }
    }

    showCardModal(columnId = null, cardId = null) {
        const modal = document.getElementById('card-modal');
        const form = document.getElementById('card-form');
        
        // Reset form
        form.reset();
        
        if (cardId) {
            // Edit existing card
            const column = this.columns.find(col => col.id === columnId);
            const card = column.cards.find(c => c.id === cardId);
            
            if (card) {
                form.title.value = card.title;
                form.description.value = card.description;
                form.label.value = card.label;
                
                this.currentCardModalColumn = columnId;
                this.currentCardModalCard = cardId;
            }
        } else {
            // New card
            this.currentCardModalColumn = columnId;
            this.currentCardModalCard = null;
        }
        
        modal.classList.remove('hidden');
    }

    hideCardModal() {
        const modal = document.getElementById('card-modal');
        modal.classList.add('hidden');
        this.currentCardModalColumn = null;
        this.currentCardModalCard = null;
    }

    handleCardFormSubmit() {
        const form = document.getElementById('card-form');
        const cardData = {
            title: form.title.value,
            description: form.description.value,
            label: form.label.value
        };

        if (this.currentCardModalCard) {
            // Update existing card
            this.updateCard(this.currentCardModalColumn, this.currentCardModalCard, cardData);
        } else {
            // Add new card
            if (this.currentCardModalColumn) {
                this.addCard(this.currentCardModalColumn, cardData);
            } else {
                // Add to first column if no column specified
                if (this.columns.length > 0) {
                    this.addCard(this.columns[0].id, cardData);
                }
            }
        }
        
        this.hideCardModal();
    }

    render() {
        const columnsContainer = document.getElementById('columns-container');
        columnsContainer.innerHTML = '';

        this.columns.forEach(column => {
            const columnElement = this.createColumnElement(column);
            columnsContainer.appendChild(columnElement);
        });
    }

    createColumnElement(column) {
        const template = document.getElementById('column-template');
        const columnElement = template.content.cloneNode(true);
        
        // Set column title
        const titleElement = columnElement.querySelector('h3');
        titleElement.textContent = column.title;
        titleElement.setAttribute('data-column-id', column.id);
        
        // Add card button
        const addCardBtn = columnElement.querySelector('button:last-of-type');
        addCardBtn.addEventListener('click', () => {
            this.showCardModal(column.id);
        });
        
        // Cards container
        const cardsContainer = columnElement.querySelector('.cards-container');
        cardsContainer.innerHTML = '';
        
        column.cards.forEach(card => {
            const cardElement = this.createCardElement(card, column.id);
            cardsContainer.appendChild(cardElement);
        });
        
        // Column actions
        const actions = columnElement.querySelectorAll('button:first-of-type, button:nth-of-type(2)');
        
        // Edit column
        actions[0].addEventListener('click', () => {
            const newTitle = prompt('Edit column name:', column.title);
            if (newTitle && newTitle !== column.title) {
                column.title = newTitle;
                this.saveToLocalStorage();
                this.render();
            }
        });
        
        // Delete column
        actions[1].addEventListener('click', () => {
            if (confirm(`Delete column "${column.title}"?`)) {
                this.deleteColumn(column.id);
            }
        });
        
        // Set column id for data
        columnElement.querySelector('.column').dataset.columnId = column.id;
        
        return columnElement;
    }

    createCardElement(card, columnId) {
        const template = document.getElementById('card-template');
        const cardElement = template.content.cloneNode(true);
        
        // Set card title
        const titleElement = cardElement.querySelector('h4');
        titleElement.textContent = card.title;
        
        // Set card description
        const descriptionElement = cardElement.querySelector('p');
        descriptionElement.textContent = card.description;
        
        // Set card label
        const labelElement = cardElement.querySelector('span:first-of-type');
        if (card.label) {
            labelElement.textContent = card.label.charAt(0).toUpperCase() + card.label.slice(1);
            labelElement.className = `px-2 py-1 text-xs font-medium bg-${this.getLabelColor(card.label)}-100 text-${this.getLabelColor(card.label)}-800 rounded-full label`;
            labelElement.style.display = 'inline-block';
        } else {
            labelElement.style.display = 'none';
        }
        
        // Set card timestamp
        const timestampElement = cardElement.querySelector('span:nth-of-type(2)');
        const date = new Date(card.timestamp);
        timestampElement.textContent = date.toLocaleDateString();
        
        // Card actions
        const actions = cardElement.querySelectorAll('button');
        
        // Edit card
        actions[0].addEventListener('click', () => {
            this.showCardModal(columnId, card.id);
        });
        
        // Delete card
        actions[1].addEventListener('click', () => {
            if (confirm(`Delete card "${card.title}"?`)) {
                this.deleteCard(columnId, card.id);
            }
        });
        
        // Make card draggable
        const cardDiv = cardElement.querySelector('.card');
        cardDiv.draggable = true;
        cardDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('cardId', card.id);
            e.dataTransfer.setData('fromColumnId', columnId);
            cardDiv.classList.add('dragging');
            
            // Add slide-in animation to cards
            const cards = cardDiv.parentElement.children;
            for (let i = 0; i < cards.length; i++) {
                cards[i].classList.add('slide-in');
            }
        });
        
        cardDiv.addEventListener('dragend', () => {
            cardDiv.classList.remove('dragging');
            
            // Remove animations after drag
            const cards = cardDiv.parentElement.children;
            for (let i = 0; i < cards.length; i++) {
                cards[i].classList.remove('slide-in');
            }
        });
        
        return cardElement;
    }

    getLabelColor(label) {
        const colors = {
            'task': 'blue',
            'bug': 'red',
            'feature': 'purple',
            'enhancement': 'green'
        };
        return colors[label] || 'gray';
    }

    setupDragAndDrop() {
        const columns = document.querySelectorAll('.column');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drop-target');
                
                // Add hover effect to cards
                const cards = column.querySelectorAll('.card');
                cards.forEach(card => {
                    card.classList.add('pulse');
                });
            });
            
            column.addEventListener('dragleave', () => {
                column.classList.remove('drop-target');
                
                // Remove hover effect
                const cards = column.querySelectorAll('.card');
                cards.forEach(card => {
                    card.classList.remove('pulse');
                });
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drop-target');
                
                // Remove hover effect
                const cards = column.querySelectorAll('.card');
                cards.forEach(card => {
                    card.classList.remove('pulse');
                });
                
                const cardId = e.dataTransfer.getData('cardId');
                const fromColumnId = e.dataTransfer.getData('fromColumnId');
                const toColumnId = column.dataset.columnId;
                
                if (fromColumnId !== toColumnId) {
                    this.moveCard(cardId, fromColumnId, toColumnId);
                }
            });
        });
    }

    saveToLocalStorage() {
        const data = {
            columns: this.columns,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('kanban-board-data', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('kanban-board-data');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.columns = data.columns || [];
            } catch (error) {
                console.error('Error loading from localStorage:', error);
            }
        }
    }
}

// Initialize the board when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanBoard = new KanbanBoard();
    
    // Set up theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        themeToggle.classList.toggle('active');
        
        localStorage.setItem('theme', newTheme);
    });
    
    // Set up drag and drop after initial render
    setTimeout(() => {
        window.kanbanBoard.setupDragAndDrop();
    }, 100);
});

// Add CSS for drop target
const style = document.createElement('style');
style.textContent = `
    .drop-target {
        border: 2px dashed #3b82f6;
        background-color: #eff6ff;
    }
`;
document.head.appendChild(style);