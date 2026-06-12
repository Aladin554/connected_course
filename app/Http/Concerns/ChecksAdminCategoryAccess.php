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

    protected function canAdministerCategory(Category $category): bool
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
