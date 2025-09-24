const readline = require('readline');

const employees = [];

function printMenu() {
    console.log('\nEmployee Management System');
    console.log('1. Add Employee');
    console.log('2. List Employees');
    console.log('3. Remove Employee by ID');
    console.log('4. Exit');
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function promptMenu() {
    printMenu();
    rl.question('\nChoose an option (1-4): ', (answer) => {
        switch (answer.trim()) {
            case '1':
                addEmployee();
                break;
            case '2':
                listEmployees();
                promptMenu();
                break;
            case '3':
                removeEmployee();
                break;
            case '4':
                console.log('Goodbye!');
                rl.close();
                break;
            default:
                console.log('Invalid choice. Please select 1-4.');
                promptMenu();
        }
    });
}

function addEmployee() {
    rl.question('Enter employee name: ', (name) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            console.log('Name cannot be empty.');
            return promptMenu();
        }
        rl.question('Enter employee ID: ', (id) => {
            const trimmedId = id.trim();
            if (!trimmedId) {
                console.log('ID cannot be empty.');
                return promptMenu();
            }
            const exists = employees.some((emp) => emp.id === trimmedId);
            if (exists) {
                console.log('An employee with this ID already exists.');
                return promptMenu();
            }
            employees.push({ id: trimmedId, name: trimmedName });
            console.log(`Added employee: ${trimmedName} (ID: ${trimmedId})`);
            promptMenu();
        });
    });
}

function listEmployees() {
    if (employees.length === 0) {
        console.log('No employees found.');
        return;
    }
    console.log('\nEmployees:');
    employees.forEach((emp, idx) => {
        console.log(`${idx + 1}. ${emp.name} (ID: ${emp.id})`);
    });
}

function removeEmployee() {
    rl.question('Enter ID to remove: ', (id) => {
        const trimmedId = id.trim();
        if (!trimmedId) {
            console.log('ID cannot be empty.');
            return promptMenu();
        }
        const index = employees.findIndex((emp) => emp.id === trimmedId);
        if (index === -1) {
            console.log('No employee found with that ID.');
        } else {
            const [removed] = employees.splice(index, 1);
            console.log(`Removed employee: ${removed.name} (ID: ${removed.id})`);
        }
        promptMenu();
    });
}

console.log('CLI Employee Management System Using Node.js and Arrays');
promptMenu();