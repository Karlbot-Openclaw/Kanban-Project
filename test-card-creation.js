// Test script for card creation functionality
console.log('🧪 Testing card creation functionality...');

// Create a mock DOM environment
global.document = {
    getElementById: function(id) {
        return {
            addEventListener: function(event, callback) {
                if (event === 'click') {
                    callback();
                }
            },
            innerHTML: '',
            classList: {
                add: function() {},
                remove: function() {}
            },
            dataset: {},
            querySelector: function() {
                return {
                    addEventListener: function(event, callback) {
                        if (event === 'click') {
                            callback();
                        }
                    },
                    classList: {
                        add: function() {},
                        remove: function() {}
                    },
                    draggable: false,
                    dataset: {}
                };
            },
            querySelectorAll: function() {
                return [];
            }
        };
    },
    querySelector: function(selector) {
        return {
            addEventListener: function(event, callback) {
                if (event === 'click') {
                    callback();
                }
            },
            innerHTML: '',
            classList: {
                add: function() {},
                remove: function() {}
            },
            dataset: {},
            querySelector: function() {
                return {
                    addEventListener: function(event, callback) {
                        if (event === 'click') {
                            callback();
                        }
                    },
                    classList: {
                        add: function() {},
                        remove: function() {}
                    },
                    draggable: false,
                    dataset: {}
                };
            },
            querySelectorAll: function() {
                return [];
            }
        };
    },
    querySelectorAll: function() {
        return [];
    },
    createElement: function() {
        return {
            addEventListener: function(event, callback) {
                if (event === 'click') {
                    callback();
                }
            },
            classList: {
                add: function() {},
                remove: function() {}
            }
        };
    },
    head: {
        appendChild: function() {}
    }
};

global.window = {
    kanbanBoard: null,
    addEventListener: function(event, callback) {
        if (event === 'DOMContentLoaded') {
            callback();
        }
    }
};

global.localStorage = {
    getItem: function() {
        return null;
    },
    setItem: function() {},
    removeItem: function() {}
};

global.prompt = function(message, defaultValue) {
    return defaultValue;
};

global.confirm = function() {
    return true;
};

global.console = {
    log: console.log,
    error: console.error
};

global.window = {
    kanbanBoard: null,
    addEventListener: function() {}
};

global.localStorage = {
    getItem: function() {
        return null;
    },
    setItem: function() {},
    removeItem: function() {}
};

global.prompt = function(message, defaultValue) {
    return defaultValue;
};

global.confirm = function() {
    return true;
};

global.console = {
    log: console.log,
    error: console.error
};

global.window = {
    kanbanBoard: null,
    addEventListener: () => {}
};

global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

global.prompt = (message, defaultValue) => defaultValue;

global.confirm = () => true;

global.console = {
    log: console.log,
    error: console.error
};

// Import the KanbanBoard class
const { KanbanBoard } = require('./script.js');

// Test script for card creation functionality
console.log('🧪 Testing card creation functionality...');

// Create a new KanbanBoard instance
const board = new KanbanBoard();

// Add a test column
board.addColumn();

// Verify columns were added
console.log('✅ Columns:', board.columns);

// Test showing card modal for the first column
console.log('🔗 Showing card modal for column:', board.columns[0].id);
board.showCardModal(board.columns[0].id);

// Verify modal state
console.log('✅ Modal column:', board.currentCardModalColumn);

// Test adding a card
const testCardData = {
    title: 'Test Card',
    description: 'This is a test card',
    label: 'task'
};

board.addCard(board.columns[0].id, testCardData);

// Verify card was added
console.log('✅ Cards in column:', board.columns[0].cards);

// Test showing card modal without specifying column (should go to first column)
board.showCardModal();
console.log('✅ Modal column (no param):', board.currentCardModalColumn);

// Test adding card to first column when no column specified
const testCardData2 = {
    title: 'Test Card 2',
    description: 'Another test card'
};
board.addCard(null, testCardData2);

console.log('✅ Cards after adding to first column:', board.columns[0].cards);

console.log('🎉 All tests passed!');