<?php

namespace App\Http\Concerns;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait ChecksAdminCategoryAccess
{
    protected function authUser(): User
    {
        return Auth::user();
    }

    protected function isSuperAdmin(): bool
    {
        return $this->authUser()->role?->name === 'superadmin';
    }

    protected function isScopedAdmin(): bool
    {
        return $this->authUser()->role?->name === 'admin';
    }

    protected function canAdministerCategories(): bool
    {
        $roleName = $this->authUser()->role?->name;

        return in_array($roleName, ['admin', 'superadmin'], true);
    }

    protected function canDeleteCourses(): bool
    {
        return $this->isSuperAdmin();
    }

    protected function canViewCourses(): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->isScopedAdmin() && (int) $this->authUser()->can_view_courses === 1;
    }

    protected function canAddCourses(): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->isScopedAdmin() && (int) $this->authUser()->can_add_courses === 1;
    }

    protected function canEditCourses(): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->isScopedAdmin() && (int) $this->authUser()->can_edit_courses === 1;
    }

    protected function canAccessCourseAdminPanel(): bool
    {
        return $this->canViewCourses();
    }

    protected function hasAdminCategoryAssignment(Category $category): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->isScopedAdmin()) {
            return $this->authUser()
                ->adminCategories()
                ->where('categories.id', $category->id)
                ->exists();
        }

        return false;
    }

    protected function canAdministerCategory(Category $category): bool
    {
        return $this->canEditCourses() && $this->hasAdminCategoryAssignment($category);
    }

    protected function canViewAdminCategory(Category $category): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->canViewCourses() && $this->hasAdminCategoryAssignment($category);
    }

    protected function categoriesQueryForAdmin(): Builder
    {
        $query = Category::query();

        if ($this->isScopedAdmin()) {
            $query->whereHas('adminUsers', fn ($q) => $q->where('users.id', $this->authUser()->id));
        }

        return $query;
    }

    protected function canViewFrontendCategory(Category $category): bool
    {
        if ($this->isScopedAdmin()) {
            return $this->authUser()
                ->adminFrontendCategories()
                ->where('categories.id', $category->id)
                ->exists();
        }

        return $this->authUser()
            ->categories()
            ->where('categories.id', $category->id)
            ->exists();
    }
}
