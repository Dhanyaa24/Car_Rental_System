drop database car_rental_system;
create database car_rental_system;
use car_rental_system;

CREATE TABLE cars (
    car_id INT PRIMARY KEY AUTO_INCREMENT,
    model VARCHAR(45),
    brand VARCHAR(45),
    year INT,
    license_plate VARCHAR(45),
    status ENUM('available', 'rented', 'maintenance', 'reserved'),
    price_per_day DECIMAL(10,2)
);
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(45),
    email VARCHAR(45),
    phone VARCHAR(45),
    address TEXT,
    license_number VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(45),
    email VARCHAR(45),
    phone VARCHAR(45),
    role ENUM('manager', 'mechanic', 'support'),
    hire_date DATE
   );
   CREATE TABLE maintenance (
    maintenance_id INT PRIMARY KEY AUTO_INCREMENT,
    car_id INT,
    service_date DATE,
    description TEXT,
    cost DECIMAL(10,2),
    cars_car_id INT,
    employees_employee_id INT,
    FOREIGN KEY (car_id) REFERENCES cars(car_id),
    FOREIGN KEY (employees_employee_id) REFERENCES employees(employee_id)
);
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    rental_id INT,
    amount DECIMAL(10,2),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('cash', 'card', 'upi', 'wallet')
);
CREATE TABLE rentals (
    rental_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    car_id INT,
    borrow_date DATE,
    return_date DATE,
    total_amount DECIMAL(10,2),
    status ENUM('active', 'completed', 'cancelled'),
    payments_payment_id INT,
    employees_employee_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (car_id) REFERENCES cars(car_id),
    FOREIGN KEY (payments_payment_id) REFERENCES payments(payment_id),
    FOREIGN KEY (employees_employee_id) REFERENCES employees(employee_id)
);
CREATE TABLE reservations (
    reservation_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    car_id INT,
    start_date DATE,
    end_date DATE,
    status ENUM('pending', 'confirmed', 'cancelled'),
    created_id TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (car_id) REFERENCES cars(car_id)
);
CREATE TABLE insurance (
    insurance_id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT,
    insurance_type ENUM('comprehensive', 'third_party'),
    coverage_details TEXT,
    insurance_provider VARCHAR(45),
    insurance_cost DECIMAL(10,2),
    claim_status ENUM('none', 'pending', 'approved', 'rejected'),
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id)
);
CREATE TABLE review_and_rating (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    car_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    customers_customer_id INT,
    cars_car_id INT,
    FOREIGN KEY (customers_customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (cars_car_id) REFERENCES cars(car_id)
);
SELECT USER(), 
       @@hostname AS Host_Name, 
       VERSION() AS MySQL_Version, 
       NOW() AS Current_Date_Time;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'dhanya24';
FLUSH PRIVILEGES;
INSERT INTO cars (model, brand, year, license_plate, status, price_per_day) VALUES
 ('Camry', 'Toyota', 2021, 'MH12AB1234', 'available', 3500.00),
 ('CR-V', 'Honda', 2022, 'DL09XY5678', 'available', 4500.00),
 ('S-Class', 'Mercedes', 2021, 'KA05LM9988', 'available', 12000.00),
 ('M4', 'BMW', 2023, 'TN22RT4567', 'available', 15000.00),
 ('Nexon EV', 'Tata', 2022, 'GJ01ZX7890', 'available', 5000.00),
 ('Creta', 'Hyundai', 2022, 'MH14GH1234', 'available', 4000.00),
 ('Swift', 'Maruti Suzuki', 2023, 'UP32CV4455', 'available', 2000.00),
 ('Seltos', 'Kia', 2023, 'DL04YU5566', 'available', 4200.00),
 ('Thar', 'Mahindra', 2023, 'RJ18TH9898', 'available', 5500.00),
 ('Fortuner', 'Toyota', 2022, 'KL10FT7834', 'available', 7000.00),
 ('Verna', 'Hyundai', 2021, 'PB11VE5555', 'available', 3800.00),
 ('Kwid', 'Renault', 2023, 'CH01KD2345', 'available', 1800.00),
 ('Safari', 'Tata', 2022, 'BR06TS6790', 'available', 5200.00),
 ('Hector', 'MG', 2022, 'HR26MG4321', 'available', 4800.00),
 ('Baleno', 'Maruti Suzuki', 2023, 'WB20BL1029', 'available', 2100.00);

INSERT INTO employees (name, email, phone, role, hire_date)
VALUES ('John Staff', 'staff@example.com', '1234567890', 'support', CURDATE());
SELECT * FROM employees;
ALTER TABLE rentals DROP FOREIGN KEY rentals_ibfk_4;
ALTER TABLE rentals MODIFY employees_employee_id INT NULL;
select * from rentals;
select * from review_and_rating;
select * from rentals;
ALTER TABLE cars
ADD COLUMN image VARCHAR(255);
update cars set image ="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD1Wk9VE-rR_aiDbDdEc6yvx6Kg_qjk07roVSLnvRQOfRXPM9AsIPkZw7GjrAKARzivwM&usqp=CAU" where car_id=1;
update cars set image ="https://images8.alphacoders.com/549/549210.jpg" where car_id=2;


UPDATE cars SET image = 'https://www.hdcarwallpapers.com/walls/mercedes_benz_s_klasse_lang_amg_line_2020_4k-HD.jpg' WHERE car_id = 3;

UPDATE cars SET image = 'https://i.ytimg.com/vi/x9fB-2OOHFo/maxresdefault.jpg' WHERE car_id = 4;

UPDATE cars SET image = 'https://s7ap1.scene7.com/is/image/tatapassenger/City-33?$B-1228-696-S$&fit=crop&fmt=webp' WHERE car_id = 5;

UPDATE cars SET image= "https://w0.peakpx.com/wallpaper/775/571/HD-wallpaper-hyundai-creta-road-2021-cars-crossovers-mx-spec-su2-2021-hyundai-creta-korean-cars-hyundai.jpg" WHERE car_id = 6;

UPDATE cars SET image = 'https://images5.alphacoders.com/136/1365537.jpeg' WHERE car_id = 7;

UPDATE cars SET image = 'https://www.hdcarwallpapers.com/walls/kia_seltos_2023_4k-HD.jpg' WHERE car_id = 8;

UPDATE cars SET image = 'https://w0.peakpx.com/wallpaper/684/51/HD-wallpaper-black-thar.jpg' WHERE car_id = 9;

UPDATE cars SET image = 'https://wallpapercave.com/wp/wp5345258.jpg' WHERE car_id = 10;

UPDATE cars SET image = 'https://cdn.wallpapersafari.com/88/26/Wyt3su.jpg' WHERE car_id = 11;

UPDATE cars SET image = 'https://w0.peakpx.com/wallpaper/94/401/HD-wallpaper-renault-kwid-ultra-crossovers-2021-cars-za-spec-2021-renault-kwid-french-cars-renault.jpg' WHERE car_id = 12;

UPDATE cars SET image = 'https://wallpapercave.com/wp/wp4537772.jpg' WHERE car_id = 13;

UPDATE cars SET image = 'https://assets.gqindia.com/photos/5cdc04a7306c1c61f76e2b86/16:9/w_2560%2Cc_limit/top-image103.jpg' WHERE car_id = 14;

UPDATE cars SET image = 'https://wallpapercat.com/w/full/f/8/f/1745577-2880x1800-desktop-hd-suzuki-baleno-background-image.jpg' WHERE car_id = 15;

select * from rentals;
desc rentals;
update rentals
set status = 'completed'
where car_id =4;
update cars 
set status = 'available'
where car_id=13;
select * from customers;