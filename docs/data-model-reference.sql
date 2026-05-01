-- Este arquivo é um exemplo de como a estrutura de dados do Firestore
-- seria representada em um banco de dados SQL relacional.
-- Ele serve apenas para fins de documentação e não é executado pelo aplicativo.

-- Tabela para armazenar os perfis dos barbeiros
CREATE TABLE Barbers (
    id VARCHAR(255) PRIMARY KEY, -- UID do Firebase Auth
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255),
    experience_years INT,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    profile_picture_url VARCHAR(255)
);

-- Tabela para armazenar os perfis dos clientes
CREATE TABLE Customers (
    id VARCHAR(255) PRIMARY KEY, -- UID do Firebase Auth
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20)
);

-- Tabela para armazenar os serviços oferecidos por cada barbeiro
CREATE TABLE Services (
    id VARCHAR(255) PRIMARY KEY,
    barber_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    FOREIGN KEY (barber_id) REFERENCES Barbers(id) ON DELETE CASCADE
);

-- Tabela para armazenar os agendamentos
CREATE TABLE Appointments (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    barber_id VARCHAR(255) NOT NULL,
    service_id VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL CHECK(status IN ('booked', 'completed', 'cancelled')), -- booked, completed, cancelled
    price_at_time_of_booking DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customers(id),
    FOREIGN KEY (barber_id) REFERENCES Barbers(id),
    FOREIGN KEY (service_id) REFERENCES Services(id)
);

-- Tabela para armazenar as avaliações dos barbeiros
CREATE TABLE Reviews (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    barber_id VARCHAR(255) NOT NULL,
    appointment_id VARCHAR(255), -- Opcional, para vincular a avaliação a um agendamento específico
    rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id),
    FOREIGN KEY (barber_id) REFERENCES Barbers(id),
    FOREIGN KEY (appointment_id) REFERENCES Appointments(id)
);

-- Tabela para especialidades, demonstrando uma relação Muitos-para-Muitos
CREATE TABLE Specialties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Barber_Specialties (
    barber_id VARCHAR(255) NOT NULL,
    specialty_id INT NOT NULL,
    PRIMARY KEY (barber_id, specialty_id),
    FOREIGN KEY (barber_id) REFERENCES Barbers(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES Specialties(id) ON DELETE CASCADE
);
