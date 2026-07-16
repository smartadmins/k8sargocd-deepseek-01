const API_URL = '/api/employees';
let employees = [];
let currentEditId = null;

// Fetch all employees
async function fetchEmployees() {
    try {
        const response = await fetch(API_URL);
        employees = await response.json();
        renderEmployees(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        showError('Failed to load employees');
    }
}

// Render employees
function renderEmployees(employeeList) {
    const grid = document.getElementById('employeeGrid');
    
    if (employeeList.length === 0) {
        grid.innerHTML = '<div class="no-results">No employees found</div>';
        return;
    }
    
    grid.innerHTML = employeeList.map(emp => `
        <div class="employee-card" data-id="${emp.id}">
            <img src="${emp.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(emp.name) + '&background=random'}" 
                 alt="${emp.name}" class="avatar">
            <h3>${emp.name}</h3>
            <div class="position">${emp.position}</div>
            <div style="text-align: center;">
                <span class="department">${emp.department}</span>
            </div>
            <div class="contact"><i class="fas fa-envelope"></i> ${emp.email}</div>
            <div class="contact"><i class="fas fa-phone"></i> ${emp.phone}</div>
            <div class="actions">
                <button class="btn btn-success" onclick="editEmployee(${emp.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteEmployee(${emp.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Search and filter
function filterEmployees() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const department = document.getElementById('departmentFilter').value;
    
    const filtered = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm) ||
                             emp.position.toLowerCase().includes(searchTerm) ||
                             emp.department.toLowerCase().includes(searchTerm);
        const matchesDepartment = !department || emp.department === department;
        return matchesSearch && matchesDepartment;
    });
    
    renderEmployees(filtered);
}

// Add employee
document.getElementById('addEmployeeBtn').addEventListener('click', () => {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('employeeModal').style.display = 'block';
});

// Edit employee
async function editEmployee(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const emp = await response.json();
        currentEditId = id;
        document.getElementById('modalTitle').textContent = 'Edit Employee';
        document.getElementById('employeeId').value = id;
        document.getElementById('name').value = emp.name;
        document.getElementById('position').value = emp.position;
        document.getElementById('department').value = emp.department;
        document.getElementById('email').value = emp.email;
        document.getElementById('phone').value = emp.phone;
        document.getElementById('employeeModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching employee:', error);
        showError('Failed to load employee data');
    }
}

// Delete employee
async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchEmployees();
            showSuccess('Employee deleted successfully');
        } else {
            throw new Error('Failed to delete employee');
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        showError('Failed to delete employee');
    }
}

// Submit form (Add/Edit)
document.getElementById('employeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const employeeData = {
        name: document.getElementById('name').value,
        position: document.getElementById('position').value,
        department: document.getElementById('department').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    try {
        let response;
        const id = document.getElementById('employeeId').value;
        
        if (id) {
            // Edit existing
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employeeData)
            });
            showSuccess('Employee updated successfully');
        } else {
            // Add new
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employeeData)
            });
            showSuccess('Employee added successfully');
        }
        
        if (response.ok) {
            document.getElementById('employeeModal').style.display = 'none';
            fetchEmployees();
        } else {
            throw new Error('Failed to save employee');
        }
    } catch (error) {
        console.error('Error saving employee:', error);
        showError('Failed to save employee');
    }
});

// Close modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('employeeModal').style.display = 'none';
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('employeeModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('employeeModal')) {
        document.getElementById('employeeModal').style.display = 'none';
    }
});

// Event listeners for search and filter
document.getElementById('searchInput').addEventListener('input', filterEmployees);
document.getElementById('departmentFilter').addEventListener('change', filterEmployees);

// Toast notifications
function showSuccess(message) {
    showToast(message, '#2ecc71');
}

function showError(message) {
    showToast(message, '#e74c3c');
}

function showToast(message, color) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${color};
        color: white;
        border-radius: 5px;
        z-index: 2000;
        animation: slideDown 0.3s;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize
fetchEmployees();