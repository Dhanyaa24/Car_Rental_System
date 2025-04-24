require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'dhanya24',
  database: process.env.DB_NAME || 'car_rental_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test DB connection
app.post('/api/bookings', async (req, res) => {
  const connection = await pool.getConnection();
  try {
      await connection.beginTransaction();

      const { customer, car_id, pickup_date, return_date, payment_id, payment_amount, payment_method } = req.body;

      // 1. Insert/Update Customer
      const [customerResult] = await connection.query(
          `INSERT INTO customers 
           (name, email, phone, address, license_number) 
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           phone = VALUES(phone),
           address = VALUES(address)`,
          [customer.name, customer.email, customer.phone, customer.address, customer.license]
      );

      const customerId = customerResult.insertId || 
                       (await connection.query('SELECT customer_id FROM customers WHERE email = ?', [customer.email]))[0][0].customer_id;

      // 2. Create Payment Record
      const [paymentResult] = await connection.query(
          `INSERT INTO payments 
           (payment_id, amount, payment_method, status) 
           VALUES (?, ?, ?, 'completed')`,
          [payment_id, payment_amount, payment_method]
      );

      // 3. Create Booking
      const [bookingResult] = await connection.query(
          `INSERT INTO rentals 
           (customer_id, car_id, payment_id, borrow_date, return_date, total_amount) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [customerId, car_id, payment_id, pickup_date, return_date, payment_amount]
      );

      // 4. Update Car Status
      await connection.query(
          `UPDATE cars SET status = 'rented' WHERE car_id = ?`,
          [car_id]
      );

      await connection.commit();

      res.status(201).json({
          booking_id: bookingResult.insertId,
          customer_id: customerId,
          payment_id: payment_id
      });

  } catch (error) {
      await connection.rollback();
      console.error('Booking error:', error);
      res.status(500).json({ error: error.message });
  } finally {
      connection.release();
  }
});
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database!');
    connection.release();
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
  }
}

testConnection();

// ========== CARS ==========
// Get all cars
app.get('/api/cars', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cars');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get car by ID
app.get('/api/cars/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cars WHERE car_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new car
app.post('/api/cars', async (req, res) => {
  const { model, make, year, price_per_day, status } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO cars (model, make, year, price_per_day, status) 
      VALUES (?, ?, ?, ?, ?)`,
      [model, make, year, price_per_day, status]
    );
    res.status(201).json({
      car_id: result.insertId,
      message: 'Car created successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update car status
app.put('/api/cars/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE cars SET status = ? WHERE car_id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json({ message: 'Car status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a car
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM cars WHERE car_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ========== CUSTOMERS ==========
// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new customer
app.post('/api/customers', async (req, res) => {
  const { name, email, phone, address, license_number } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO customers (name, email, phone, address, license_number) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, address, license_number]
    );
    res.status(201).json({
      customer_id: result.insertId,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get customer by ID
app.get('/api/customers/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM customers WHERE customer_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ========== RENTALS ==========
// Create new rental
app.post('/api/rentals', async (req, res) => {
  const { customer_id, car_id, borrow_date, return_date, total_amount, employee_id } = req.body;
  
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const [rentalResult] = await connection.query(
        `INSERT INTO rentals 
        (customer_id, car_id, borrow_date, return_date, total_amount, status, employees_employee_id) 
        VALUES (?, ?, ?, ?, ?, 'active', ?)`,
        [customer_id, car_id, borrow_date, return_date, total_amount, employee_id]
      );
      
      await connection.query(
        'UPDATE cars SET status = "rented" WHERE car_id = ?',
        [car_id]
      );
      
      const [paymentResult] = await connection.query(
        `INSERT INTO payments 
        (rental_id, amount, payment_method) 
        VALUES (?, ?, ?)`,
        [rentalResult.insertId, total_amount, req.body.payment_method || 'card']
      );
      
      await connection.query(
        'UPDATE rentals SET payments_payment_id = ? WHERE rental_id = ?',
        [paymentResult.insertId, rentalResult.insertId]
      );
      
      await connection.commit();
      connection.release();
      
      res.status(201).json({ 
        rental_id: rentalResult.insertId,
        payment_id: paymentResult.insertId,
        message: 'Rental created successfully'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Complete rental
app.put('/api/rentals/:id/complete', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const [rental] = await connection.query(
        'SELECT car_id FROM rentals WHERE rental_id = ?',
        [req.params.id]
      );
      
      if (rental.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Rental not found' });
      }
      
      await connection.query(
        `UPDATE rentals SET status = 'completed' WHERE rental_id = ?`,
        [req.params.id]
      );
      
      await connection.query(
        `UPDATE cars SET status = 'available' WHERE car_id = ?`,
        [rental[0].car_id]
      );
      
      await connection.commit();
      connection.release();
      
      res.json({ message: 'Rental completed successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a rental
app.delete('/api/rentals/:id', async (req, res) => {
  try {
    const [rental] = await pool.query('SELECT car_id FROM rentals WHERE rental_id = ?', [req.params.id]);

    if (rental.length === 0) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    await pool.query('UPDATE cars SET status = "available" WHERE car_id = ?', [rental[0].car_id]);

    const [result] = await pool.query('DELETE FROM rentals WHERE rental_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    res.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ========== RESERVATIONS ==========
// Delete a reservation
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM reservations WHERE reservation_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ========== REVIEWS ==========
// Delete a review
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM review_and_rating WHERE review_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
