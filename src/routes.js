const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const employeesFilePath = path.join(__dirname, 'employees.json');

// Helper function to read employees
const readEmployees = () => {
  const data = fs.readFileSync(employeesFilePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write employees
const writeEmployees = (employees) => {
  fs.writeFileSync(employeesFilePath, JSON.stringify(employees, null, 2));
};

// GET all employees
router.get('/employees', (req, res) => {
  try {
    const employees = readEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET employee by ID
router.get('/employees/:id', (req, res) => {
  try {
    const employees = readEmployees();
    const employee = employees.find(emp => emp.id === parseInt(req.params.id));
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// POST new employee
router.post('/employees', (req, res) => {
  try {
    const employees = readEmployees();
    const newEmployee = {
      id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1,
      ...req.body
    };
    employees.push(newEmployee);
    writeEmployees(employees);
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

// PUT update employee
router.put('/employees/:id', (req, res) => {
  try {
    const employees = readEmployees();
    const index = employees.findIndex(emp => emp.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    employees[index] = { ...employees[index], ...req.body };
    writeEmployees(employees);
    res.json(employees[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE employee
router.delete('/employees/:id', (req, res) => {
  try {
    const employees = readEmployees();
    const filtered = employees.filter(emp => emp.id !== parseInt(req.params.id));
    if (filtered.length === employees.length) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    writeEmployees(filtered);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;