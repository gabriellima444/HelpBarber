import React from 'react';
import { render, screen } from '@testing-library/react';
import BarberCard from '@/components/barbers/barber-card';
import { Barber } from '@/models/types';

const mockBarber: Barber = {
  id: 'barber-123',
  name: 'Barbearia do Gabriel',
  location: 'São Caetano do Sul',
  experience: 10,
  specialties: ['Degradê', 'Barba Terapia', 'Corte Infantil'],
  services: [],
  rating: 4.8,
  profilePictureId: 'avatar-1',
  galleryImageIds: [],
};

describe('BarberCard Component - Integration Test', () => {
  it('should render barber details correctly', () => {
    // Arrange
    const barberData = mockBarber;

    // Act
    render(<BarberCard barber={barberData} />);
    
    // Assert
    expect(screen.getByText('Barbearia do Gabriel')).toBeInTheDocument();
    expect(screen.getByText('São Caetano do Sul')).toBeInTheDocument();
  });

  it('should display specialties as badges', () => {
    // Arrange
    const barberData = mockBarber;

    // Act
    render(<BarberCard barber={barberData} />);
    
    // Assert
    expect(screen.getByText('Degradê')).toBeInTheDocument();
    expect(screen.getByText('Barba Terapia')).toBeInTheDocument();
  });

  it('should render the rating value with precision', () => {
    // Arrange
    const barberData = mockBarber;

    // Act
    render(<BarberCard barber={barberData} />);
    
    // Assert
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('should have a link to the barber profile', () => {
    // Arrange
    const barberData = mockBarber;

    // Act
    render(<BarberCard barber={barberData} />);
    const link = screen.getByRole('link');
    
    // Assert
    expect(link).toHaveAttribute('href', '/barbers/barber-123');
  });
});
