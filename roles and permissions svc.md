











<think>
The user is asking for a comprehensive Markdown file that documents their roles and permissions system, which can be used by their frontend team to build a UI for managing roles and permissions. This should include:

1. Overview of the roles and permissions system
2. Models involved (Role, Permission, RolePermission, UserRole)
3. API endpoints (URLs) for managing roles and permissions
4. Views and serializers
5. Examples of how to use the API

I'll need to create a detailed document that covers all these aspects, assuming some endpoints that would be typical for a roles and permissions management system, since I don't have all the actual endpoints they've implemented.
</think>

# Roles and Permissions System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Models](#models)
3. [API Endpoints](#api-endpoints)
4. [Permission Groups](#permission-groups)
5. [Frontend Implementation Guide](#frontend-implementation-guide)
6. [Example Workflows](#example-workflows)

## Overview

The roles and permissions system provides a flexible way to manage user access within organizations. The system is built around these core concepts:

- **Permissions**: Individual actions a user can perform (e.g., "create_project", "view_user")
- **Roles**: Collections of permissions (e.g., "Admin", "Member", "Viewer")
- **UserRoles**: Assignments of roles to users

Key features:
- Organization-specific roles
- System-wide permissions
- Default roles created automatically for new organizations
- Hierarchical permission structure with permission groups

## Models

### Permission

Represents a single action that can be performed in the system.

```python
class Permission:
    id: UUID
    name: string       # e.g., "project_create", "user_view"
    description: string
    group: string      # e.g., "Projects", "Users"
```

### Role

Represents a collection of permissions specific to an organization.

```python
class Role:
    id: UUID
    name: string       # e.g., "Admin", "Member", "Viewer"
    description: string
    organization: Organization
    users: [User]      # Many-to-many relationship
```

### RolePermission

Links roles to permissions.

```python
class RolePermission:
    id: UUID
    role: Role
    permission: Permission
```

### UserRole

Links users to roles.

```python
class UserRole:
    user: User
    role: Role
    assigned_at: DateTime
```

## API Endpoints

Add these endpoints to your `access/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    # Roles
    path('roles/', views.RoleListCreateView.as_view(), name='role-list-create'),
    path('roles/<uuid:pk>/', views.RoleDetailView.as_view(), name='role-detail'),
    path('roles/<uuid:pk>/permissions/', views.RolePermissionsView.as_view(), name='role-permissions'),
    path('roles/<uuid:pk>/users/', views.RoleUsersView.as_view(), name='role-users'),
    
    # Permissions
    path('permissions/', views.PermissionListView.as_view(), name='permission-list'),
    path('permissions/groups/', views.PermissionGroupsView.as_view(), name='permission-groups'),
    
    # User Roles
    path('users/<uuid:user_id>/roles/', views.UserRolesView.as_view(), name='user-roles'),
    path('users/<uuid:user_id>/permissions/', views.UserPermissionsView.as_view(), name='user-permissions'),
    
    # Assign/Remove
    path('assign-role/', views.AssignRoleView.as_view(), name='assign-role'),
    path('remove-role/', views.RemoveRoleView.as_view(), name='remove-role'),
]
```

## Views Implementation

Create these views in `access/views.py`:

```python
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Role, Permission, RolePermission, UserRole, PERMISSION_GROUPS
from .serializers import (
    RoleSerializer, PermissionSerializer, RolePermissionSerializer,
    UserRoleSerializer, AssignRoleSerializer, RemoveRoleSerializer
)
from django.shortcuts import get_object_or_404
from .decorators import permission_required

class RoleListCreateView(generics.ListCreateAPIView):
    """List all roles or create a new role"""
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return roles for the user's organization
        return Role.objects.filter(organization=self.request.user.organization)
    
    @permission_required('role_create')
    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a role"""
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Role.objects.filter(organization=self.request.user.organization)
    
    @permission_required('role_update')
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @permission_required('role_delete')
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

class RolePermissionsView(APIView):
    """List or update permissions for a role"""
    permission_classes = [IsAuthenticated]
    
    @permission_required('role_view')
    def get(self, request, pk):
        role = get_object_or_404(Role, pk=pk, organization=request.user.organization)
        permissions = Permission.objects.filter(rolepermission__role=role)
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data)
    
    @permission_required('role_update')
    def post(self, request, pk):
        role = get_object_or_404(Role, pk=pk, organization=request.user.organization)
        permission_ids = request.data.get('permissions', [])
        
        # Clear existing permissions
        RolePermission.objects.filter(role=role).delete()
        
        # Add new permissions
        permissions = Permission.objects.filter(id__in=permission_ids)
        for permission in permissions:
            RolePermission.objects.create(role=role, permission=permission)
        
        return Response({"message": "Permissions updated successfully"})

class RoleUsersView(APIView):
    """List or update users for a role"""
    permission_classes = [IsAuthenticated]
    
    @permission_required('role_view')
    def get(self, request, pk):
        role = get_object_or_404(Role, pk=pk, organization=request.user.organization)
        users = role.users.all()
        from authentication.serializers import UserListSerializer
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)

class PermissionListView(generics.ListAPIView):
    """List all permissions"""
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
    queryset = Permission.objects.all()

class PermissionGroupsView(APIView):
    """Get all permission groups"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        groups = {}
        for group, actions in PERMISSION_GROUPS.items():
            permissions = []
            for action in actions:
                perm_name = f"{group.lower()}_{action}"
                try:
                    perm = Permission.objects.get(name=perm_name)
                    permissions.append({
                        'id': perm.id,
                        'name': perm.name,
                        'description': perm.description,
                        'action': action
                    })
                except Permission.DoesNotExist:
                    pass
            
            if permissions:
                groups[group] = permissions
        
        return Response(groups)

class UserRolesView(APIView):
    """Get roles for a specific user"""
    permission_classes = [IsAuthenticated]
    
    @permission_required('user_view')
    def get(self, request, user_id):
        from authentication.models import User
        user = get_object_or_404(User, pk=user_id, organization=request.user.organization)
        roles = Role.objects.filter(role_users__user=user)
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)

class UserPermissionsView(APIView):
    """Get all permissions for a user"""
    permission_classes = [IsAuthenticated]
    
    @permission_required('user_view')
    def get(self, request, user_id):
        from authentication.models import User
        user = get_object_or_404(User, pk=user_id, organization=request.user.organization)
        
        # Get all roles for the user
        roles = Role.objects.filter(role_users__user=user)
        
        # Get all permissions for these roles
        permissions = Permission.objects.filter(rolepermission__role__in=roles).distinct()
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data)

class AssignRoleView(APIView):
    """Assign a role to a user"""
    permission_classes = [IsAuthenticated]
    
    @permission_required('role_assign')
    def post(self, request):
        serializer = AssignRoleSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            role_id = serializer.validated_data['role_id']
            
            from authentication.models import User
            user = get_object_or_404(User, pk=user_id, organization=request.user.organization)
            role = get_object_or_404(Role, pk=role_id, organization=request.user.organization)
            
            UserRole.objects.get_or_create(user=user, role=role)
            return Response({"message": "Role assigned successfully"})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RemoveRoleView(APIView):
    """Remove a role from a user"""
    permission_classes = [IsAuthenticated]
    
    @permission_required('role_assign')
    def post(self, request):
        serializer = RemoveRoleSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            role_id = serializer.validated_data['role_id']
            
            UserRole.objects.filter(
                user_id=user_id,
                role_id=role_id,
                role__organization=request.user.organization
            ).delete()
            
            return Response({"message": "Role removed successfully"})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

## Serializers

Create these serializers in `access/serializers.py`:

```python
from rest_framework import serializers
from .models import Role, Permission, RolePermission, UserRole

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'description', 'group']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']
        read_only_fields = ['organization']

class RolePermissionSerializer(serializers.ModelSerializer):
    permission_details = PermissionSerializer(source='permission', read_only=True)
    
    class Meta:
        model = RolePermission
        fields = ['id', 'role', 'permission', 'permission_details']

class UserRoleSerializer(serializers.ModelSerializer):
    role_details = RoleSerializer(source='role', read_only=True)
    
    class Meta:
        model = UserRole
        fields = ['user', 'role', 'role_details', 'assigned_at']

class AssignRoleSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    role_id = serializers.UUIDField()

class RemoveRoleSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    role_id = serializers.UUIDField()
```

## Permission Groups

The system defines these permission groups:

```python
PERMISSION_GROUPS = {
    'Articles': ['view', 'create', 'edit', 'update', 'delete'],
    'Sites': ['view', 'create', 'edit', 'update', 'delete'],
    'SiteGroups': ['view', 'create', 'edit', 'update', 'delete'],
    'Organization': ['view', 'edit', 'update', 'view users'],
    'User': ['view', 'create', 'edit', 'update', 'delete'],
    'Comment': ['view', 'create', 'edit', 'update', 'delete'],
    'Projects': ['view', 'create', 'edit', 'update', 'delete'],
    'Role': ['view', 'create', 'edit', 'update', 'delete', 'assign'],
}
```

## Frontend Implementation Guide

### Role Management UI

1. **Roles List Page**
   - Endpoint: `GET /api/access/roles/`
   - Display all roles for the organization
   - Include "Create Role" button
   - Each role should have "Edit" and "Delete" buttons

2. **Role Detail Page**
   - Endpoint: `GET /api/access/roles/{role_id}/`
   - Show role details
   - Show assigned permissions (grouped by category)
   - Show users with this role
   - Include "Edit Permissions" button

3. **Edit Role Permissions**
   - Endpoint: `GET /api/access/permissions/groups/` (to get all permissions)
   - Endpoint: `GET /api/access/roles/{role_id}/permissions/` (to get current permissions)
   - Endpoint: `POST /api/access/roles/{role_id}/permissions/` (to update permissions)
   - Display permissions grouped by category with checkboxes
   - Allow bulk selection/deselection by category

4. **Assign Role to User**
   - Endpoint: `POST /api/access/assign-role/`
   - Select user and role from dropdowns
   - Submit to assign role

### User Permissions UI

1. **User Detail Page**
   - Add "Roles & Permissions" tab
   - Endpoint: `GET /api/access/users/{user_id}/roles/`
   - Show assigned roles with option to remove
   - Show effective permissions (all permissions from all roles)

2. **Organization Settings**
   - Add "Roles & Permissions" section
   - Allow admins to manage default roles
   - Show permission matrix (which roles have which permissions)

## Example Workflows

### Creating a Custom Role

1. Navigate to Roles page
2. Click "Create Role"
3. Enter name (e.g., "Project Manager") and description
4. Save the role
5. Navigate to the new role's detail page
6. Click "Edit Permissions"
7. Select appropriate permissions:
   - Projects: view, create, edit, update
   - Users: view
   - Comments: view, create, edit, delete
8. Save permissions

### Assigning a Role to a User

1. Navigate to Users page
2. Select a user
3. Click "Roles & Permissions" tab
4. Click "Assign Role"
5. Select role from dropdown
6. Click "Assign"

### Checking User Permissions

1. Navigate to Users page
2. Select a user
3. Click "Roles & Permissions" tab
4. View all assigned roles
5. View effective permissions (combined from all roles)

## Default Roles

The system automatically creates these default roles for new organizations:

1. **Admin**
   - Full access to all features
   - Organization creator is automatically assigned this role

2. **Member**
   - Can view and create most resources
   - Cannot modify organization settings

3. **Viewer**
   - Read-only access to resources
   - Cannot create or modify anything

---

This documentation should help your frontend team build a comprehensive UI for managing roles and permissions in your application. The API endpoints provide all the necessary functionality for creating, viewing, updating, and deleting roles, as well as assigning roles to users and managing permissions.
