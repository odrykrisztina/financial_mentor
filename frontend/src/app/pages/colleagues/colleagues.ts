import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faUsersGear, faXmark, faEnvelope, 
  faMobileScreenButton, faCity 
} from '@fortawesome/free-solid-svg-icons';
import { firstValueFrom } from 'rxjs';
import { LangService, UserName } from '../../core/lang.service';
import { env } from '../../core/env';
import { RankingGroupingService, RankingRule } 
  from '../../shared/services/ranking-grouping.service';
import { ModalService } from '../../shared/modal/modal.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

export interface Colleague {
  id: number;
  worker_id: number;
  worker_identifier: string | null;

  type: string | null;

  prefix_name: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  postfix_name: string | null;

  gender: 'M' | 'F' | null;
  email: string | null;
  phone: string | null;
  residence: string | null;
  postal_code: string | null;
  address: string | null;

  img: string | null;    
  img_type: string | null;

  rank: number | null;
  rank_name_id: string | null;
  ranking: number;
  superior_id: number | null;

  id_card: string | null;
}

interface ColleaguesResponse {
  data: Colleague[];
}

@Component({
  selector: 'app-colleagues',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
  ],
  host: { class: 'block w-full' },
  templateUrl: './colleagues.html',
  styleUrl: './colleagues.css'
})
export class Colleagues implements OnInit {

  icon = {  faUsersGear, faXmark, faEnvelope, 
            faMobileScreenButton, faCity };

  private http = inject(HttpClient);
  public  langSvc = inject(LangService);
  private modal = inject(ModalService);
  private rankingSvc = inject(RankingGroupingService);
  private readonly maxRanking: number = 4;

  loading = signal(false);
  showWorkerProperties = signal(false);
  error   = signal<string | null>(null);
  mounted = signal(false);
  private colleagues = signal<Colleague[]>([]);
  private sanitizer = inject(DomSanitizer);

  constructor(private router: Router) {}

  get lang() { return this.langSvc.state; }
  
  selected = signal<Colleague | null>(null);

  idCardSafeUrl = computed<SafeResourceUrl | null>(() => {
    const c = this.selected();
    if (!c?.id_card) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(c.id_card);
  });

  openDetails(c: Colleague) {
    if (c.id_card) {
            this.selected.set(c);
            setTimeout(() => {
              this.mounted.set(true);
            }, 300);
    } else  this.modal.info('employee_not_have_id_card');
  }

  closeDetails() {
    this.mounted.set(false);
    this.selected.set(null);
  }

  private readonly rankingRules: RankingRule<Colleague>[] = [
    { 
      key: 'management', 
      values: [5, 4],
      sort: (a, b) => this.sortByRankingDescThenName(a, b),
    },
    { 
      key: 'leaders', 
      values: [3, 2, 1],
      sort: (a, b) => this.sortByRankingDescThenName(a, b),
    },
    { key: 'rest', catchAll: true, sort: (a, b) => this.sortByName(a, b) },
  ];

  groups = computed(() => {
    
    const _ = this.langSvc.nameOrderVersion();

    return this.rankingSvc.group<Colleague>(
      this.colleagues(),
      this.rankingRules,
      c => c.ranking ?? 0
    );
  });

  async ngOnInit() {
    
    this.modal.loading('loading_data');
    this.loading.set(true);
    this.error.set(null);

    try {
      const res = await firstValueFrom(
        this.http.get<ColleaguesResponse>(`${env.apiBase}/workers`)
      );

      const list = res?.data ?? [];
      this.colleagues.set(list);
    } catch (e) {
      console.error(e);
      this.error.set('workers_load_failed');
      this.colleagues.set([]);
    } finally {
      this.loading.set(false);
      this.modal.close();
    }
  }

  getDefaultAvatar(gender: 'M' | 'F' | null): string {
    const g = gender === 'F' ? 'fe' : '';
    return `assets/media/image/blank/${g}male-blank.webp`;
  }

  private sortByRankingDescThenName(a: Colleague, b: Colleague): number {
    const ra = a.ranking ?? 0;
    const rb = b.ranking ?? 0;
    const diff = rb - ra;    // DESC
    if (diff !== 0) return diff;

    return  this.getDisplayName(a)
                .localeCompare(this.getDisplayName(b), 'hu');
  }

  private sortByName(a: Colleague, b: Colleague): number {
    const langId = this.langSvc.state.id;
    return this.getDisplayName(a)
              .localeCompare(this.getDisplayName(b), langId);
  }

  getDisplayName(c: Colleague): string {
    const name: UserName = {
      prefix_name:  c.prefix_name  ?? undefined,
      first_name:   c.first_name   ?? undefined,
      middle_name:  c.middle_name  ?? undefined,
      last_name:    c.last_name    ?? undefined,
      postfix_name: c.postfix_name ?? undefined,
    };
    return this.langSvc.getName(name);
  }

  applyForPersonalCounseling(c: Colleague) {
    const worker = {
      worker_id: c.worker_id,
      prefix_name: c.prefix_name,
      first_name: c.first_name,
      middle_name: c.middle_name,
      last_name: c.last_name,
      postfix_name: c.postfix_name
    }
    const subject = {
      "subject_id": "PERSONAL_COUNSELING",
      "name_id": "personal_counseling"
    }
    this.router.navigate(['/contact'], {
      state: { worker: worker, subject: subject }
    });
  }

  isEnablePersonalCounseling(c: Colleague): boolean {
    return c.ranking > this.maxRanking;
  }
}
