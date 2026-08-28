#!/bin/bash

# ERP System - Database Setup Script
# This script creates the PostgreSQL database and initial configuration

set -e

echo "=========================================="
echo "Company ERP System - Database Setup"
echo "=========================================="

# Variables
DB_NAME="erp_system"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
if ! psql -h $DB_HOST -U $DB_USER -d postgres -c "SELECT 1" &> /dev/null; then
    echo "ERROR: Cannot connect to PostgreSQL on $DB_HOST:$DB_PORT"
    echo "Make sure PostgreSQL is installed and running."
    exit 1
fi

echo "✓ PostgreSQL is running"

# Create database
echo ""
echo "Creating database '$DB_NAME'..."
if ! psql -h $DB_HOST -U $DB_USER -d postgres -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep 1 &> /dev/null; then
    psql -h $DB_HOST -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    echo "✓ Database '$DB_NAME' created successfully"
else
    echo "✓ Database '$DB_NAME' already exists"
fi

# Set connection settings
echo ""
echo "=========================================="
echo "Database Setup Complete!"
echo "=========================================="
echo ""
echo "Database Configuration:"
echo "  Database Name: $DB_NAME"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo ""
echo "Update application.yml with:"
echo ""
echo "spring:"
echo "  datasource:"
echo "    url: jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME"
echo "    username: $DB_USER"
echo "    password: <your-postgres-password>"
echo ""
echo "Then run: mvn spring-boot:run"
echo ""
