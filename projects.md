
# Project Management Backend API Documentation

## Overview

This document provides comprehensive information about the backend API for the project management system. The frontend service AI agent can use this information to build a corresponding frontend application.

## Base URL

All API endpoints are prefixed with: `/api/v1/project/`

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:


Authentication endpoints are available at `/api/v1/auth/`.

## Data Models

### Status
- Represents the status of initiatives, projects, tasks, and subtasks
- Has predefined types: todo, in_progress, on_hold, done, cancelled
- Includes color coding for visual representation

### Initiative
- High-level organizational unit
- Contains multiple projects
- Has its own status, timeline, and metadata

### Project
- Belongs to an initiative
- Contains multiple tasks
- Has assignees, status, timeline, and can be archived

### Task
- Belongs to a project
- Contains multiple subtasks
- Has assignees, status, timeline, and can be archived

### SubTask
- Belongs to a task
- Has assignees, status, and timeline

## API Endpoints

### Status Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/status/create/` | Create a new status |
| GET | `/status/` | List all statuses |
| GET | `/status/<uuid:pk>/` | Get status details |
| PUT | `/status/<uuid:pk>/update/` | Update a status |
| DELETE | `/status/<uuid:pk>/delete/` | Delete a status |

#### Status Object Structure
{
"id": "uuid",
"name": "In Progress",
"type": "in_progress",
"color": "#FFA500",
"is_active": true,
"created_at": "2023-10-01T10:00:00Z",
"updated_at": "2023-10-01T10:00:00Z",
"metadata": {},
"organization": "uuid",
"owner": "uuid"
}

### Initiative Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/initiative/create/` | Create a new initiative |
| GET | `/initiative/` | List all initiatives |
| GET | `/initiative/<uuid:pk>/` | Get initiative details |
| PUT | `/initiative/<uuid:pk>/update/` | Update an initiative |
| DELETE | `/initiative/<uuid:pk>/delete/` | Delete an initiative |

#### Initiative Object Structure
{
"id": "uuid",
"name": "Q4 Product Launch",
"description": "Launch new product features in Q4",
"status": "uuid",
"status_name": "In Progress",
"is_active": true,
"started_at": "2023-10-01T10:00:00Z",
"created_at": "2023-10-01T10:00:00Z",
"due_at": "2023-12-31T23:59:59Z",
"updated_at": "2023-10-01T10:00:00Z",
"metadata": {},
"organization": "uuid",
"owner": "uuid",
"owner_name": "John Doe"
}

### Project Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/project/create/` | Create a new project |
| GET | `/project/` | List all projects |
| GET | `/project/<uuid:pk>/` | Get project details |
| PUT | `/project/<uuid:pk>/update/` | Update a project |
| DELETE | `/project/<uuid:pk>/delete/` | Delete a project |
| PUT | `/project/<uuid:pk>/archive/` | Archive a project |

#### Project Object Structure
{
"id": "uuid",
"name": "Website Redesign",
"description": "Redesign company website",
"status": "uuid",
"status_name": "In Progress",
"is_active": true,
"started_at": "2023-10-01T10:00:00Z",
"created_at": "2023-10-01T10:00:00Z",
"due_at": "2023-11-30T23:59:59Z",
"updated_at": "2023-10-01T10:00:00Z",
"metadata": {},
"archived": false,
"assigned_to": "uuid",
"assigned_to_name": "Jane Smith",
"owner": "uuid",
"owner_name": "John Doe",
"organization": "uuid",
"initiative": "uuid",
"initiative_name": "Q4 Product Launch"
}

## Data Relationships

- Organization contains all other entities
- Initiative contains Projects
- Project contains Tasks
- Task contains SubTasks
- Status is used by Initiative, Project, Task, and SubTask
- Users can be owners or assignees of various entities

## Frontend Considerations

1. **Hierarchical Navigation**: Implement navigation that reflects the hierarchy (Initiatives → Projects → Tasks → SubTasks)

2. **Status Visualization**: Use the status colors for visual indicators in lists and kanban boards

3. **Timeline Views**: Implement calendar or timeline views using the started_at and due_at fields

4. **User Assignment**: Create interfaces for assigning users to projects, tasks, and subtasks

5. **Archiving**: Implement archive functionality for projects and tasks instead of permanent deletion

6. **Metadata**: The metadata field can be used for custom attributes that might be needed for specific views

7. **Permissions**: All API calls require authentication, so implement proper login and token management

8. **Error Handling**: Implement user-friendly error messages based on the API responses

## Workflow Example

1. Create statuses for your workflow (e.g., To Do, In Progress, Done)
2. Create an initiative for a major company goal
3. Create projects within that initiative
4. Create tasks for each project
5. Create subtasks for complex tasks
6. Update statuses as work progresses
7. Archive completed projects and tasks

This workflow should be reflected in the frontend UI design and user journey.