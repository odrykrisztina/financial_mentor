<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Worker extends Model
{
    protected $fillable = [
        'user_id',
        'rank',
        'identifier',
        'ranking',
        'id_card',
        'superior',
        'valid',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rankType(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'rank', 'id')
            ->where('types.type', 'RANK');
    }

    public static function getTreeIds(int $rootId): array
    {
        $ids = [$rootId];
        $queue = [$rootId];

        while (!empty($queue)) {
            $current = array_shift($queue);

            $children = self::where('superior', $current)
                ->pluck('id')
                ->all();

            foreach ($children as $childId) {
                if (!in_array($childId, $ids, true)) {
                    $ids[]   = $childId;
                    $queue[] = $childId;
                }
            }
        }

        return $ids;
    }
}
