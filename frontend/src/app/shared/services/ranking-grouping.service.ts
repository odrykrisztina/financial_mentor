import { Injectable } from '@angular/core';

export interface RankingRule<TItem> {
  /** Csoport azonosító – pl. 'rank_ceo', 'excellent', stb. */
  key: string;

  /** Konkrét ranking értékek, pl. [10] vagy [9, 8, 7, 6] */
  values?: readonly number[];

  /** Intervallum – pl. min: 1, max: 3 → 1–3 között bármi */
  min?: number;
  max?: number;

  /**
   * Opcionális rendezés a csoporton belül.
   * Ha nincs megadva, az eredeti sorrendet hagyjuk.
   */
  sort?: (a: TItem, b: TItem) => number;

  /**
   * Maradék-csoport (pl. 'missing').
   * Ha true, ebbe kerül minden, ami az előző szabályokra nem illik.
   * Elég EGY ilyen szabály.
   */
  catchAll?: boolean;
}

export interface RankingGroup<TItem> {
  key: string;
  items: TItem[];
}

@Injectable({ providedIn: 'root' })
export class RankingGroupingService {

  group<TItem>(
    items: readonly TItem[],
    rules: readonly RankingRule<TItem>[],
    getOrder: (item: TItem) => number | null | undefined,
  ): RankingGroup<TItem>[] {

    const used = new Array(items.length).fill(false);
    const result: RankingGroup<TItem>[] = [];

    const matchRule = (value: number, rule: RankingRule<TItem>): boolean => {
      if (rule.values && rule.values.length) {
        return rule.values.includes(value);
      }
      if (rule.min != null && rule.max != null) {
        return value >= rule.min && value <= rule.max;
      }
      if (rule.min != null) return value >= rule.min;
      if (rule.max != null) return value <= rule.max;
      return false;
    };

    const normalRules = rules.filter(r => !r.catchAll && (
      (r.values && r.values.length) ||
      r.min != null ||
      r.max != null
    ));

    const catchAllRule = rules.find(r => r.catchAll);

    // 1) Normál szabályok
    for (const rule of normalRules) {
      const group: TItem[] = [];

      items.forEach((item, idx) => {
        if (used[idx]) return;
        const ord = getOrder(item);
        if (ord == null) return;

        if (matchRule(ord, rule)) {
          used[idx] = true;
          group.push(item);
        }
      });

      if (group.length) {
        if (rule.sort) {
          group.sort(rule.sort);
        }
        result.push({ key: rule.key, items: group });
      }
    }

    // 2) Maradék-csoport (catchAll)
    if (catchAllRule) {
      const rest = items.filter((_, idx) => !used[idx]);
      if (rest.length) {
        if (catchAllRule.sort) {
          rest.sort(catchAllRule.sort);
        }
        result.push({ key: catchAllRule.key, items: rest });
      }
    }

    return result;
  }
}
