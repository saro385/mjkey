# Keyword & Prompt Generator

## Overview

This is a React-based web application that generates creative keywords and prompts using AI services (Gemini and OpenRouter). The app follows a two-step workflow: first generating keywords based on user input, then creating prompts from those keywords for creative projects.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **UI Components**: Comprehensive shadcn/ui component system with Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful endpoints for keyword and prompt generation
- **Development**: Hot module replacement via Vite integration
- **Error Handling**: Centralized error middleware with structured responses

## Key Components

### Core Features
1. **Keyword Generation**: Generate keywords using Gemini or OpenRouter APIs
2. **Prompt Generation**: Create photography or vector prompts from keywords
3. **API Configuration**: Settings panel for OpenRouter API key and model selection
4. **Progress Tracking**: Real-time progress indicators during generation
5. **Step Navigation**: Two-step workflow with progress indicators

### Data Models
- **Keyword Generation**: Input validation with configurable count (1-200) and provider selection
- **Prompt Generation**: Support for photography and vector prompt types
- **OpenRouter Integration**: Dynamic model fetching and configuration management

### UI Architecture
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component Structure**: Modular components with clear separation of concerns
- **State Management**: Custom hooks for API interactions and local storage
- **User Feedback**: Toast notifications and loading states

## Data Flow

1. **User Input**: User enters word/category and selects generation parameters
2. **API Selection**: Choose between Gemini or OpenRouter for keyword generation
3. **Keyword Generation**: Real-time progress tracking with incremental updates
4. **Step Transition**: Move from keywords to prompt generation
5. **Prompt Creation**: Generate creative prompts based on selected keywords
6. **Results Display**: Copy functionality and export options

## External Dependencies

### AI Services
- **Google Gemini API**: Primary keyword generation service
- **OpenRouter API**: Alternative AI service with model selection
- **API Key Management**: Secure storage in environment variables and localStorage

### UI Libraries
- **Radix UI**: Headless component primitives
- **TailwindCSS**: Utility-first styling framework
- **Lucide Icons**: Icon library for UI elements
- **Embla Carousel**: Carousel component for UI

### Development Tools
- **TypeScript**: Type safety and development experience
- **Zod**: Runtime type validation and schema definition
- **TanStack Query**: Server state management and caching
- **Vite**: Fast build tool with HMR support

## Deployment Strategy

### Production Build
- **Frontend**: Static assets built with Vite and served from Express
- **Backend**: Bundled Node.js application with esbuild
- **Environment**: Production optimizations with proper error handling

### Replit Configuration
- **Modules**: Node.js 20, Web, and PostgreSQL 16 support
- **Port Configuration**: Local port 5000 mapped to external port 80
- **Auto-scaling**: Configured for automatic scaling on deployment
- **Development**: Hot reload with npm run dev command

### Database Preparation
- **Drizzle ORM**: Configured for PostgreSQL with migration support
- **Schema**: Prepared for future database integration
- **Connection**: Environment variable-based database URL configuration

## Changelog

Changelog:
- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.