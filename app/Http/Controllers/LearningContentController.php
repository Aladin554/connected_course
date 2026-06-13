<?php

namespace App\Http\Controllers;

use App\Http\Concerns\ChecksAdminCategoryAccess;
use App\Models\Category;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\UserLessonProgress;
use App\Models\UserModuleProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LearningContentController extends Controller
{
    use ChecksAdminCategoryAccess;

    public function categoryModules(Category $category): JsonResponse
    {
        $canAdminister = $this->canAdministerCategory($category);
        $canViewFrontend = $this->canViewFrontendCategory($category);

        if (!$canAdminister && !$canViewFrontend) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $modules = ($canAdminister ? $category->allCourseModules() : $category->courseModules())
            ->withCount($canAdminister ? 'allLessons' : 'lessons')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        return response()->json($modules);
    }

    public function storeModule(Request $request, Category $category): JsonResponse
    {
        if (!$this->canAdministerCategory($category)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate($this->moduleRules());
        $module = $category->allCourseModules()->create($data);

        return response()->json([
            'message' => 'Module created successfully',
            'module' => $module,
        ], 201);
    }

    public function updateModule(Request $request, CourseModule $module): JsonResponse
    {
        $module->load('category');

        if (!$this->canAdministerCategory($module->category)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $module->update($request->validate($this->moduleRules()));

        return response()->json([
            'message' => 'Module updated successfully',
            'module' => $module->fresh(),
        ]);
    }

    public function destroyModule(CourseModule $module): JsonResponse
    {
        $module->load('category');

        if (!$this->canAdministerCategory($module->category)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $module->delete();

        return response()->json(['message' => 'Module deleted successfully']);
    }

    public function moduleLessons(CourseModule $module): JsonResponse
    {
        $module->load('category');

        $canAdminister = $this->canAdministerCategory($module->category);
        $canViewFrontend = $this->canViewFrontendCategory($module->category);

        if (!$canAdminister && !$canViewFrontend) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $lessons = ($canAdminister ? $module->allLessons() : $module->lessons())
            ->with(['strategies', 'lessonModelAnswer', 'commonMistakes'])
            ->get();

        return response()->json($lessons);
    }

    public function lessonDetail(Lesson $lesson): JsonResponse
    {
        $lesson->load(['module.category', 'strategies', 'lessonModelAnswer', 'commonMistakes']);

        $canAdminister = $this->canAdministerCategory($lesson->module->category);

        if (!$canAdminister && !$this->canViewFrontendCategory($lesson->module->category)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!$canAdminister
            && (!$lesson->is_active || !$lesson->module->is_active || !$lesson->module->category->is_active)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($lesson);
    }

    public function categoryProgress(Category $category): JsonResponse
    {
        if (!$this->canViewFrontendCategory($category)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $lessonIds = $category->courseModules()
            ->with('lessons:id,module_id')
            ->get()
            ->flatMap(fn (CourseModule $module) => $module->lessons->pluck('id'))
            ->values();

        $completedLessonIds = UserLessonProgress::query()
            ->where('user_id', Auth::id())
            ->whereIn('lesson_id', $lessonIds)
            ->where('status', 'completed')
            ->pluck('lesson_id')
            ->map(fn ($id) => (int) $id)
            ->values();

        return response()->json([
            'completed_lesson_ids' => $completedLessonIds,
        ]);
    }

    public function completeLesson(Lesson $lesson): JsonResponse
    {
        $lesson->load('module.category');

        if (!$this->canViewFrontendCategory($lesson->module->category)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!$lesson->is_active || !$lesson->module->is_active || !$lesson->module->category->is_active) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        UserLessonProgress::query()->updateOrCreate(
            ['user_id' => Auth::id(), 'lesson_id' => $lesson->id],
            ['status' => 'completed', 'completed_at' => now()]
        );

        $moduleLessonIds = $lesson->module->lessons()->pluck('id');
        $completedCount = UserLessonProgress::query()
            ->where('user_id', Auth::id())
            ->whereIn('lesson_id', $moduleLessonIds)
            ->where('status', 'completed')
            ->count();

        UserModuleProgress::query()->updateOrCreate(
            ['user_id' => Auth::id(), 'module_id' => $lesson->module_id],
            ['status' => $moduleLessonIds->isNotEmpty() && $completedCount >= $moduleLessonIds->count() ? 'completed' : 'in_progress']
        );

        return response()->json([
            'message' => 'Lesson marked complete',
            'completed_lesson_id' => $lesson->id,
        ]);
    }

    public function storeLesson(Request $request, CourseModule $module): JsonResponse
    {
        $module->load('category');

        if (!$this->canAdministerCategory($module->category)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate($this->lessonRules());
        $children = $this->extractLessonChildren($data);
        $lesson = $module->allLessons()->create($data);
        $this->syncLessonChildren($lesson, $children);

        return response()->json([
            'message' => 'Lesson created successfully',
            'lesson' => $lesson->load(['strategies', 'lessonModelAnswer', 'commonMistakes']),
        ], 201);
    }

    public function updateLesson(Request $request, Lesson $lesson): JsonResponse
    {
        $lesson->load('module.category');

        if (!$this->canAdministerCategory($lesson->module->category)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate($this->lessonRules());
        $children = $this->extractLessonChildren($data);
        $lesson->update($data);
        $this->syncLessonChildren($lesson, $children);

        return response()->json([
            'message' => 'Lesson updated successfully',
            'lesson' => $lesson->fresh()->load(['strategies', 'lessonModelAnswer', 'commonMistakes']),
        ]);
    }

    public function destroyLesson(Lesson $lesson): JsonResponse
    {
        $lesson->load('module.category');

        if (!$this->canAdministerCategory($lesson->module->category)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $lesson->delete();

        return response()->json(['message' => 'Lesson deleted successfully']);
    }

    public function uploadStrategyFile(Request $request): JsonResponse
    {
        if (!$this->canAdministerCategories()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $file = $request->file('file');
        $path = $file->store('strategy-files', 'public');

        return response()->json([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
        ]);
    }

    protected function moduleRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'warning' => ['nullable', 'string'],
            'icon_emoji' => ['nullable', 'string', 'max:32'],
            'is_active' => ['sometimes', Rule::in([0, 1, true, false, '0', '1'])],
        ];
    }

    protected function lessonRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'warning' => ['nullable', 'string'],
            'duration_mins' => ['nullable', 'integer', 'min:0'],
            'duration_unit' => ['sometimes', Rule::in(['minutes', 'seconds'])],
            'video_type' => ['required', Rule::in(['youtube'])],
            'video_value' => ['required', 'string', 'max:2048'],
            'video_thumbnail' => ['nullable', 'string', 'max:2048'],
            'is_active' => ['sometimes', Rule::in([0, 1, true, false, '0', '1'])],
            'strategies' => ['sometimes', 'array'],
            'strategies.*.id' => ['nullable', 'integer', 'exists:lesson_strategies,id'],
            'strategies.*.step_number' => ['required_with:strategies', 'integer', 'min:1'],
            'strategies.*.content' => ['required_with:strategies', 'string'],
            'strategies.*.file_path' => ['nullable', 'string', 'max:2048'],
            'strategies.*.file_name' => ['nullable', 'string', 'max:255'],
            'model_answer' => ['nullable', 'string'],
            'common_mistakes' => ['sometimes', 'array'],
            'common_mistakes.*.id' => ['nullable', 'integer', 'exists:lesson_common_mistakes,id'],
            'common_mistakes.*.content' => ['required_with:common_mistakes', 'string'],
        ];
    }

    protected function extractLessonChildren(array &$data): array
    {
        $children = [
            'strategies' => $data['strategies'] ?? [],
            'model_answer' => $data['model_answer'] ?? null,
            'common_mistakes' => $data['common_mistakes'] ?? [],
        ];

        unset($data['strategies'], $data['model_answer'], $data['common_mistakes']);

        return $children;
    }

    protected function syncLessonChildren(Lesson $lesson, array $children): void
    {
        $strategyIds = [];
        foreach ($children['strategies'] as $index => $strategy) {
            $payload = [
                'step_number' => $strategy['step_number'] ?? $index + 1,
                'content' => $strategy['content'] ?? '',
                'file_path' => $strategy['file_path'] ?? null,
                'file_name' => $strategy['file_name'] ?? null,
            ];

            if (!empty($strategy['id'])) {
                $row = $lesson->strategies()->whereKey($strategy['id'])->first();
                if ($row) {
                    if ($row->file_path && $row->file_path !== $payload['file_path']) {
                        Storage::disk('public')->delete($row->file_path);
                    }
                    $row->update($payload);
                    $strategyIds[] = $row->id;
                }
                continue;
            }

            $row = $lesson->strategies()->create($payload);
            $strategyIds[] = $row->id;
        }

        $removedStrategies = $lesson->strategies()
            ->when($strategyIds !== [], fn ($query) => $query->whereNotIn('id', $strategyIds))
            ->get();

        foreach ($removedStrategies as $removed) {
            if ($removed->file_path) {
                Storage::disk('public')->delete($removed->file_path);
            }
        }

        $lesson->strategies()
            ->when($strategyIds !== [], fn ($query) => $query->whereNotIn('id', $strategyIds))
            ->delete();

        if ($children['model_answer'] !== null) {
            $lesson->lessonModelAnswer()->updateOrCreate([], ['content' => $children['model_answer']]);
        }

        $mistakeIds = [];
        foreach ($children['common_mistakes'] as $index => $mistake) {
            $payload = [
                'content' => $mistake['content'] ?? '',
                'sort_order' => $index,
            ];

            if (!empty($mistake['id'])) {
                $row = $lesson->commonMistakes()->whereKey($mistake['id'])->first();
                if ($row) {
                    $row->update($payload);
                    $mistakeIds[] = $row->id;
                }
                continue;
            }

            $row = $lesson->commonMistakes()->create($payload);
            $mistakeIds[] = $row->id;
        }
        $lesson->commonMistakes()->when($mistakeIds !== [], fn ($query) => $query->whereNotIn('id', $mistakeIds))->delete();
    }
}
