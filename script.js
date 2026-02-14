// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx8zD40Nf-AMsDWIaZezUsqvpmeNtw6qc",
  authDomain: "kanban-board-karl-openclaw.firebaseapp.com",
  projectId: "kanban-board-karl-openclaw",
  storageBucket: "kanban-board-karl-openclaw.firebasestorage.app",
  messagingSenderId: "464745209478",
  appId: "1:464745209478:web:a3db560b52b0c4af7afb07"
};

// Initialize Firebase (using compat namespace)
let db;
try {
  if (typeof firebase !== 'undefined') {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized');
  } else {
    console.error('Firebase SDK not loaded');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

// Firestore data service
const FirestoreService = {
  async load() {
    if (!db) return { columns: [] };
    try {
      const docRef = db.collection('board').doc('state');
      const doc = await docRef.get();
      return doc.exists ? doc.data() : { columns: [] };
    } catch (error) {
      console.error('Error loading from Firestore:', error);
      return { columns: [] };
    }
  },

  async save(columns) {
    if (!db) return;
    try {
      await db.collection('board').doc('state').set({
        columns: columns,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  }
};

class KanbanBoard {
    constructor() {
        this.columns = [];
        this.currentCardModalColumn = null;
        this.currentCardModalCard = null;
        this.initializeEventListeners();
        this.loadFromFirestore(); // Use Firestore instead of localStorage
        this.initializeTheme();
        this.render();
    }

    initializeTheme() {
        // Apply dark mode from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.classList.add('active');
        }
        
        // Apply colorblind mode from localStorage
        const savedColorblind = localStorage.getItem('colorblind-mode');
        if (savedColorblind === 'true') {
            document.body.classList.add('colorblind-mode');
            const colorblindToggle = document.getElementById('colorblind-toggle');
            if (colorblindToggle) colorblindToggle.classList.add('active');
        }
    }

    async loadFromFirestore() {
        const data = await FirestoreService.load();
        this.columns = data.columns || [];
        this.render(); // Re-render after loading
    }

    save() {
        FirestoreService.save(this.columns);
    }

    initializeEventListeners() {
        // Add column button
        document.getElementById('add-column-btn').addEventListener('click', () => {
            this.addColumn();
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Colorblind toggle
        const colorblindToggle = document.getElementById('colorblind-toggle');
        if (colorblindToggle) {
            colorblindToggle.addEventListener('click', () => {
                this.toggleColorblindMode();
            });
        }

        // Global add card button (adds to first column)
        const globalAddCardBtn = document.getElementById('add-card-btn');
        if (globalAddCardBtn) {
            globalAddCardBtn.addEventListener('click', () => {
                if (this.columns.length === 0) {
                    alert('Please create a column first.');
                    return;
                }
                this.showCardModal(this.columns[0].id);
            });
        }

        // Column move buttons (using event delegation)
        document.addEventListener('click', (e) => {
            const column = e.target.closest('.column');
            if (!column) return;
            
            const columnId = column.dataset.columnId;
            
            if (e.target.closest('.move-left-btn')) {
                this.swapColumn(columnId, 'left');
            } else if (e.target.closest('.move-right-btn')) {
                this.swapColumn(columnId, 'right');
            }
        });

        // Delete column button
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.delete-column-btn');
            if (button) {
                const column = button.closest('.column');
                if (column) {
                    const columnId = column.dataset.columnId;
                    if (confirm(`Delete column "${column.querySelector('.column-title').textContent}"?`)) {
                        this.deleteColumn(columnId);
                    }
                }
            }
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
            this.save();
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
            this.save();
            this.render();
        }
    }

    updateCard(columnId, cardId, updatedData) {
        const column = this.columns.find(col => col.id === columnId);
        if (column) {
            const card = column.cards.find(c => c.id === cardId);
            if (card) {
                Object.assign(card, updatedData);
                this.save();
                this.render();
            }
        }
    }

    deleteCard(columnId, cardId) {
        const column = this.columns.find(col => col.id === columnId);
        if (column) {
            column.cards = column.cards.filter(c => c.id !== cardId);
            this.save();
            this.render();
        }
    }

    deleteColumn(columnId) {
        this.columns = this.columns.filter(col => col.id !== columnId);
        this.save();
        this.render();
    }

    swapColumn(columnId, direction) {
        const index = this.columns.findIndex(col => col.id === columnId);
        if (index === -1) return;
        
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        
        // Check bounds
        if (targetIndex < 0 || targetIndex >= this.columns.length) {
            return; // Can't move beyond first/last column
        }
        
        // Swap columns in array
        [this.columns[index], this.columns[targetIndex]] = [this.columns[targetIndex], this.columns[index]];
        
        this.save();
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
                this.save();
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
        
        // Add card button inside column
        const addCardBtn = columnElement.querySelector('.add-card-btn');
        if (addCardBtn) {
            addCardBtn.addEventListener('click', () => {
                this.showCardModal(column.id);
            });
        }
        
        // Cards container
        const cardsContainer = columnElement.querySelector('.cards-container');
        cardsContainer.innerHTML = '';
        
        column.cards.forEach(card => {
            const cardElement = this.createCardElement(card, column.id);
            cardsContainer.appendChild(cardElement);
        });
        
        // Set dynamic accent color based on first card's label or default
        const columnDiv = columnElement.querySelector('.column');
        const accentColor = this.getColumnAccentColor(column);
        columnDiv.style.setProperty('--column-accent', accentColor);
        
        // Column action buttons - use explicit classes to avoid conflicts
        const editBtn = columnElement.querySelector('.edit-column-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const newTitle = prompt('Edit column name:', column.title);
                if (newTitle && newTitle !== column.title) {
                    column.title = newTitle;
                    this.save();
                    this.render();
                }
            });
        }
        
        const deleteBtn = columnElement.querySelector('.delete-column-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Delete column "${column.title}"?`)) {
                    this.deleteColumn(column.id);
                }
            });
        }
        
        // Set column id for data
        columnDiv.dataset.columnId = column.id;
        
        return columnElement;
    }

    getColumnAccentColor(column) {
        // If column has cards with labels, use the first card's label color
        if (column.cards && column.cards.length > 0 && column.cards[0].label) {
            return this.getLabelColorHex(column.cards[0].label);
        }
        // Default: gray-500
        return '#6b7280';
    }

    getLabelColorHex(label) {
        const colorMap = {
            'task': '#3b82f6',      // blue-600
            'bug': '#ef4444',       // red-500
            'feature': '#8b5cf6',   // violet-500
            'enhancement': '#10b981', // emerald-500
            'default': '#6b7280'    // gray-500
        };
        return colorMap[label] || colorMap['default'];
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
        
        // Set card label with custom color classes
        const labelElement = cardElement.querySelector('span:first-of-type');
        if (card.label) {
            const labelText = card.label.charAt(0).toUpperCase() + card.label.slice(1);
            labelElement.textContent = labelText;
            // Use our custom label classes that work with CSS variables
            labelElement.className = `px-2 py-1 text-xs font-medium rounded-full label label-${this.getLabelColor(card.label)}`;
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

    // Drag and drop using event delegation
    setupDragAndDrop() {
        const container = document.getElementById('columns-container');
        
        // Dragover: highlight drop target
        container.addEventListener('dragover', (e) => {
            const column = e.target.closest('.column');
            if (!column) return;
            
            e.preventDefault();
            column.classList.add('drop-target');
            
            // Add hover effect to cards in this column
            const cards = column.querySelectorAll('.card');
            cards.forEach(card => {
                card.classList.add('pulse');
            });
        });
        
        // Dragleave: remove highlight
        container.addEventListener('dragleave', (e) => {
            const column = e.target.closest('.column');
            if (!column) return;
            
            // Only remove if we're leaving the column entirely
            if (!column.contains(e.relatedTarget)) {
                column.classList.remove('drop-target');
                
                const cards = column.querySelectorAll('.card');
                cards.forEach(card => {
                    card.classList.remove('pulse');
                });
            }
        }, true);
        
        // Drop: move card
        container.addEventListener('drop', (e) => {
            const column = e.target.closest('.column');
            if (!column) return;
            
            e.preventDefault();
            column.classList.remove('drop-target');
            
            // Remove hover effects
            const cards = column.querySelectorAll('.card');
            cards.forEach(card => {
                card.classList.remove('pulse');
            });
            
            const cardId = e.dataTransfer.getData('cardId');
            const fromColumnId = e.dataTransfer.getData('fromColumnId');
            const toColumnId = column.dataset.columnId;
            
            if (fromColumnId && toColumnId && fromColumnId !== toColumnId) {
                this.moveCard(cardId, fromColumnId, toColumnId);
            }
        });
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (newTheme === 'dark') {
            themeToggle.classList.add('active');
        } else {
            themeToggle.classList.remove('active');
        }
    }

    toggleColorblindMode() {
        const body = document.body;
        const current = body.classList.contains('colorblind-mode');
        const colorblindToggle = document.getElementById('colorblind-toggle');
        
        if (current) {
            body.classList.remove('colorblind-mode');
            localStorage.setItem('colorblind-mode', 'false');
            colorblindToggle.classList.remove('active');
        } else {
            body.classList.add('colorblind-mode');
            localStorage.setItem('colorblind-mode', 'true');
            colorblindToggle.classList.add('active');
        }
    }
}

// Initialize the board when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanBoard = new KanbanBoard();
    
    // Set up drag and drop (event delegation works for all columns)
    window.kanbanBoard.setupDragAndDrop();
});

// Add CSS for drop target (backup may already have, but ensure)
const style = document.createElement('style');
style.textContent = `
    .drop-target {
        border: 2px dashed var(--color-primary) !important;
        background-color: var(--color-primary-light) !important;
    }
`;
document.head.appendChild(style);
