// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Check for saved theme
    const savedTheme = localStorage.getItem('kanban-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('kanban-theme', newTheme);
    });

    // Button interaction (visual feedback only for demo)
    const addColumnBtn = document.querySelector('.add-column-btn');
    const addCardBtn = document.querySelector('.add-card-btn');

    addColumnBtn.addEventListener('click', () => {
        console.log('Add Column clicked');
        alert('Add Column functionality would open a modal to add a new column');
    });

    addCardBtn.addEventListener('click', () => {
        console.log('Add Card clicked');
        alert('Add Card functionality would allow adding a card to a column');
    });
});