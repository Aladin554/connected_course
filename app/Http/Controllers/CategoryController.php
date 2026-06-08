<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    protected function canAdministerCategories(): bool
    {
        $roleName = Auth::user()?->role?->name;
        return in_array($roleName, ['admin', 'superadmin'], true);
    }

    public function index(): JsonResponse
    {
        if (!$this->canAdministerCategories()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $categories = Category::orderBy('sort_order')
            ->orderBy('title')
            ->get();

        return response()->json($categories);
    }

    public function active(): JsonResponse
    {
        if (!$this->canAdministerCategories()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $categories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        return response()->json($categories);
    }

    public function myCategories(): JsonResponse
    {
        $categories = Auth::user()
            ->categories()
            ->where('categories.is_active', true)
            ->orderBy('categories.sort_order')
            ->orderBy('categories.title')
            ->get();

        return response()->json($categories);
    }

    public function welcomeSlides(Category $category): JsonResponse
    {
        $user = Auth::user();
        $canView = $this->canAdministerCategories()
            || $user->categories()->where('categories.id', $category->id)->exists();

        if (!$canView || !$category->is_active) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(
            $category->welcomeSlides()->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->canAdministerCategories()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $this->validatedData($request);
        $slides = $data['welcome_slides'] ?? [];
        unset($data['welcome_slides']);
        $data['thumbnail_image'] = $this->storeThumbnail($request);

        $category = Category::create($data);
        $this->syncWelcomeSlides($category, $slides);

        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category->load('allWelcomeSlides'),
        ], 201);
    }

    public function show(Category $category): JsonResponse
    {
        if (!$this->canAdministerCategories()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($category->load('allWelcomeSlides'));
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        if (!$this->canAdministerCategories()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $this->validatedData($request);
        $slides = $data['welcome_slides'] ?? [];
        unset($data['welcome_slides']);
        $thumbnail = $this->storeThumbnail($request, $category);

        if ($thumbnail !== null) {
            $data['thumbnail_image'] = $thumbnail;
        }

        $category->update($data);
        if ($request->has('welcome_slides')) {
            $this->syncWelcomeSlides($category, $slides);
        }

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => $category->fresh()->load('allWelcomeSlides'),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if (!$this->canAdministerCategories()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($category->thumbnail_image) {
            Storage::disk('public')->delete($category->thumbnail_image);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }

    protected function validatedData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'flag_emoji' => ['nullable', 'string', 'max:32'],
            'description' => ['nullable', 'string'],
            'thumbnail_image' => ['nullable', 'image', 'max:2048'],
            'background_color' => ['nullable', 'string', 'max:32'],
            'is_active' => ['sometimes', Rule::in([0, 1, true, false, '0', '1'])],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'welcome_slides' => ['sometimes', 'array'],
            'welcome_slides.*.id' => ['nullable', 'integer', 'exists:welcome_slides,id'],
            'welcome_slides.*.title' => ['required_with:welcome_slides', 'string', 'max:255'],
            'welcome_slides.*.body_content' => ['required_with:welcome_slides', 'string'],
            'welcome_slides.*.slide_order' => ['nullable', 'integer', 'min:0'],
            'welcome_slides.*.is_active' => ['sometimes', Rule::in([0, 1, true, false, '0', '1'])],
        ]);
    }

    protected function storeThumbnail(Request $request, ?Category $category = null): ?string
    {
        if (!$request->hasFile('thumbnail_image')) {
            return null;
        }

        if ($category?->thumbnail_image) {
            Storage::disk('public')->delete($category->thumbnail_image);
        }

        return $request->file('thumbnail_image')->store('categories', 'public');
    }

    protected function syncWelcomeSlides(Category $category, array $slides): void
    {
        $keptIds = [];

        foreach ($slides as $index => $slide) {
            $payload = [
                'title' => $slide['title'] ?? '',
                'body_content' => $slide['body_content'] ?? '',
                'slide_order' => $slide['slide_order'] ?? $index,
                'is_active' => array_key_exists('is_active', $slide)
                    ? filter_var($slide['is_active'], FILTER_VALIDATE_BOOLEAN)
                    : true,
            ];

            if (!empty($slide['id'])) {
                $welcomeSlide = $category->allWelcomeSlides()->whereKey($slide['id'])->first();
                if ($welcomeSlide) {
                    $welcomeSlide->update($payload);
                    $keptIds[] = $welcomeSlide->id;
                }
                continue;
            }

            $welcomeSlide = $category->allWelcomeSlides()->create($payload);
            $keptIds[] = $welcomeSlide->id;
        }

        $category->allWelcomeSlides()
            ->when($keptIds !== [], fn ($query) => $query->whereNotIn('id', $keptIds))
            ->delete();
    }
}
