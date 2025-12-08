import { 
  Component, 
  AfterViewInit, 
  signal, 
  inject,
  ViewChild, 
  ElementRef,
  ViewChildren,
  QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../shared/nav/navigation.service';            
import { LangService, UserName } from '../../core/lang.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faGraduationCap, faArrowsToEye, faDatabase,
  faUsers, faGear, faGears, faDoorOpen,
  faArrowUpRightFromSquare, faAngleDown,
  faTriangleExclamation, faStar, faCommentDots,
  faXmark, faCheck, faPaperPlane, faCircleXmark,
  faSquarePollHorizontal, faPenToSquare
} from '@fortawesome/free-solid-svg-icons';
import { SidebarService } from '../../shared/sidebar/sidebar.service';
import { SidebarItem, SidebarPosition } from '../../shared/sidebar/sidebar.model';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ModalService } from '../../shared/modal/modal.service';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { 
  FormUtilsService
} from '../../shared/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

type FormControls = {
  solution: FormControl<string>;
};

type TaskKey = string;

@Component({
  selector: 'app-elearning',
  standalone: true,                                          
  imports: [
    CommonModule,                                            
    FontAwesomeModule,
    SidebarComponent,
    ReactiveFormsModule, 
  ],
  host: { class: 'block w-full' },
  templateUrl: './elearning.html',
  styleUrl: './elearning.css'
})
export class Elearning implements AfterViewInit {

  icon = {  faGraduationCap, faArrowsToEye, faAngleDown,
            faDatabase, faUsers, faGear, faGears,
            faArrowUpRightFromSquare, faDoorOpen, 
            faTriangleExclamation, faStar, faCommentDots,
            faXmark, faCheck, faPaperPlane, faCircleXmark,
            faSquarePollHorizontal, faPenToSquare };

  headerHeight = 68;

  private auth  = inject(AuthService);
  private modal   = inject(ModalService);
  private sidebar = inject(SidebarService);
  private currentVideo: HTMLVideoElement | null = null;
  private readonly isResetVideo: boolean = true;

  mounted = signal(false);
  openTaskIndex = signal<number | null>(null);
  private taskSolutions = signal<Record<TaskKey, string>>({});

  selectedItem  = signal<SidebarItem | null>(null);
  isEditMode = signal<boolean>(false);
  isFormGroupInvalid = signal<boolean>(true);
  error = signal<string | null>(null);
  
  @ViewChild('reactiveForm', { static: false })
  formElement!: ElementRef<HTMLFormElement>;
  formGroup!: FormGroup<FormControls>;

  constructor(
    private fb: NonNullableFormBuilder,
    public  langSvc: LangService,
    private forms: FormUtilsService,
    private nav: NavigationService,
    private http: HttpClient,
    private router: Router
  ) {
    this.formGroup = this.fb.group({
      solution:  this.fb.control<string>({ value: '', disabled: true }, {
        validators: [Validators.required, Validators.minLength(200) ],
      })
    });
  }
    
  get lang() { return this.langSvc.state; }
  get f() { return this.formGroup.controls; }

  ngOnInit() {

    const financeMenu = this.attachItemCallbacks(
      this.getTemporaryFinanceCourses(),
      'finance'
    );
    this.sidebar.setMenu('left', financeMenu, {
      mode: 'overlay',
      open: false,
    });
  }

  ngAfterViewInit() {
    queueMicrotask(() => {
      setTimeout(() => this.mounted.set(true), 100);
    });
  }

  toggle(position: SidebarPosition) {
    this.sidebar.toggle(position);
  }

  openItem(
    source: 'finance' | 'software',
    item: SidebarItem
  ) {
    this.selectedItem.set(item);
    this.openTaskIndex.set(null);
    
    this.formGroup.reset({ solution: '' });
    this.formGroup.disable();
    this.isEditMode.set(false);
    setTimeout(() => {
      window.scrollTo({top:0, left:0, behavior:'smooth'});
    }, 300);
  }

  toggleTask(index: number) {
    if (this.isEditMode()) return;
    const current = this.openTaskIndex();
    this.openTaskIndex.set(current === index ? null : index);
    this.formGroup.reset({ solution: '' });
    this.formGroup.disable();
    this.isEditMode.set(false);
  }

  clear(field: keyof FormControls, value: string = ''): void {
    const controlName: keyof FormControls & string = (field as any);
    this.forms.clearControl(this.formGroup, controlName, this.formElement, value);
  }

  async onSubmit() {
  
    if (this.formGroup.invalid) {
      this.forms.setFocus(this.formGroup, this.formElement);
      return;
    }
    
    const currentUser = this.auth.getUser();
    if (!currentUser || !currentUser.id) {
      this.error.set('user_not_authenticated');
      this.modal.error('user_not_authenticated');
      return;
    }
    
    const startTime = new Date().getTime();
    this.modal.loading('data_authentication');
    this.error.set(null);
    
    setTimeout(() => {
      this.modal.close();
      this.modal.info('under_development');
    }, 1000);
  }

  confirm() { 
    this.modal.confirm('solution_send_confirm', { 
      onYes: () => this.onSubmit() 
    });
  }

  toggleEdit(type: string) {
    const isNowEdit = !this.isEditMode();
    this.isFormGroupInvalid.set(this.formGroup.invalid);
    switch(type) {
      case 'start-modify':
        this.formGroup.enable();
        this.isEditMode.set(isNowEdit);
        this.forms.setFocus(this.formGroup, this.formElement)
        break;
      case 'completed':
        this.formGroup.disable();
        this.isEditMode.set(isNowEdit);
        break;
      case 'interrupt':
        this.modal.confirm('solution_interrupt', { 
          onYes: () => {
            this.formGroup.disable();
            this.isEditMode.set(isNowEdit);
          },
          onNo: () => { this.forms.setFocus(this.formGroup, this.formElement) }
        });
    }
  }

  private attachItemCallbacks(
    items: SidebarItem[],
    source: 'finance' | 'software'
  ): SidebarItem[] {
    return items.map((item) => {

      const clone: SidebarItem = { ...item };

      if (clone.children && clone.children.length) {
        clone.children = this.attachItemCallbacks(clone.children, source);
      }

      const hasChildren    = !!clone.children && clone.children.length > 0;
      const hasAttachments = !!clone.attachments && clone.attachments.length > 0;
      const hasTasks       = !!clone.tasks && clone.tasks.length > 0;
      const isSetItem      = !hasChildren && (hasAttachments || hasTasks);
      const isRouteOutlet  = clone.isRouteOutlet;

      if (isSetItem || isRouteOutlet) {
        if (!clone.id) {
          clone.id = crypto.randomUUID();
        }
        clone.callback = () => this.openItem(source, clone);
      }
      return clone;
    });
  }

  getAuthorOfQuote(): string {
    const name: UserName = {
      first_name: "Sarah",
      last_name: "Caldwell"
    };
    return this.langSvc.getName(name);
  }

  onVideoPlay(video: HTMLVideoElement) {
    if (this.currentVideo && this.currentVideo !== video) {
      this.currentVideo.pause();
      if (this.isResetVideo)
        this.currentVideo.currentTime = 0;
    }
    this.currentVideo = video;
  }

  getTemporaryFinanceCourses(): SidebarItem[] {
    
    const courses: SidebarItem[] = [
      { title: "Reset",
        labelKey: "reset", 
        icon: this.icon.faArrowUpRightFromSquare,
        isReset: true,
        callback: () => {
          if (this.selectedItem()) {
            this.modal.confirm('reset_confirm', { 
              onYes: () => {
                this.selectedItem.set(null);
                this.sidebar.clearSelectedItem();
              } 
            });
          }
        }
      },
      { title: "Igényfelmérés",
        children: [
          { title: "Cégbemutaó",
            attachments: [
              { title     : 'Négy korszak',
                type      : 'video/mp4',
                file_path : 'assets/media/video/odry_tamas_2800_short_02.mp4'
              },
              { title     : 'Gyermekkor',
                type      : 'video/mp4',
                file_path : 'assets/media/video/odry_tamas_2800_short_03.mp4'
              }
            ],
            tasks: [
              { title       :  'Feladat',
                type        :  'input-text',
                description :  `Fogalmazz meg egy személyre szabott, hiteles és egyedi hangvételű
                                bemutatkozást, amely a saját stílusodat tükrözi, és természetes, önazonos
                                módon mutat be téged.`,
                is_required : true,
                min_length  : 200
              },
              { title       :  'Feladat',
                type        :  'input-text',
                description :  `Számold ki az ügyfelek maximális hitelezhetőségét a JTM-szabályok alapján.
                                Az adós nettó jövedelme 300 000 Ft, határozatlan idejű munkaviszonnyal az
                                OTP-nél, öt hónapja. Az adóstárs 350 000 Ft nettó jövedelemmel bír, szintén
                                határozatlan idejű munkaviszonnyal, az UCB-nél, három hónapja. A meglévő
                                terheik közé tartozik egy 110 000 Ft havi törlesztésű lakáshitel, egy 600 000
                                Ft-os hitelkártyakeret, valamint egy 1 000 000 Ft-os folyószámla-hitelkeret.`,
                is_required : true,
                min_length  : 200
              },
              { title       :  'Feladat',
                type        :  'input-text',
                description :  `A videók alapján milyen konkrét előnyöket és megoldásokat kínál a cég az
                                ügyfelek számára, és melyik munkamódszerünk az, amit szerinted a legjobban
                                érdemes hangsúlyozni egy ügyféltárgyaláson?`,
                is_required : true,
                min_length  : 200
              }
            ]
          },
          { title: "Munkamódszer",
            attachments: [
              { title     : 'Jéghegy',
                type      : 'video/mp4',
                file_path : 'assets/media/video/jeghegy.mp4'
              },
              { title     : '28000 Presentaion',
                type      : 'video/mp4',
                file_path : 'assets/media/video/odry_tamas_2800_short_04.mp4'
              }
            ],
            tasks: [
              { title       :  'Feladat',
                type        :  'input-text',
                description :  `A videók alapján milyen konkrét előnyöket és megoldásokat kínál a cég az
                                ügyfelek számára, és melyik munkamódszerünk az, amit szerinted a legjobban
                                érdemes hangsúlyozni egy ügyféltárgyaláson?`,
                is_required : true,
                min_length  : 200
              }
            ] 
          },
          { title: "Hitelezési alapoktatás",
            attachments: [
              { title     : 'Hitelezési alapoktatás',
                type      : 'video/mp4',
                file_path : 'assets/media/video/szeremy_dani.mp4',
                isPortrait: true,
              }
            ],
            tasks: [
              { title       :  'Feladat',
                type        :  'input-text',
                description :  `Számold ki az ügyfelek maximális hitelezhetőségét a JTM-szabályok alapján.
                                Az adós nettó jövedelme 300 000 Ft, határozatlan idejű munkaviszonnyal az
                                OTP-nél, öt hónapja. Az adóstárs 350 000 Ft nettó jövedelemmel bír, szintén
                                határozatlan idejű munkaviszonnyal, az UCB-nél, három hónapja. A meglévő
                                terheik közé tartozik egy 110 000 Ft havi törlesztésű lakáshitel, egy 600 000
                                Ft-os hitelkártyakeret, valamint egy 1 000 000 Ft-os folyószámla-hitelkeret.`,
                is_required : true,
                min_length  : 200
              }
            ] 
          },
          { title: "Nyugdíjtervezés",
            attachments: [
              { title     : 'Nyugdíjtervezés',
                type      : 'video/mp4',
                file_path : 'assets/media/video/kiss_bence_befektetes.mp4',
                isPortrait: true,
              }
            ],
            tasks: [
              { title       :  'Feladat',
                type        :  'input-text',
                description :  `Milyen képlet alapján számol a nyugdíjtanulmány?`,
                is_required : true,
                min_length  : 200
              }
            ]
          }
        ]
      },
      { title: "Tanácsadás",
        separatorBefore: true,
        children: [
          { title: "Kötési folyamatok", disabled: true },
          { title: "Kötés utáni teendők", disabled: true },
        ]
      },
      { title: "Önnáló munka",
        separatorBefore: true,
        children: [
          { title: "Hasznos anyagok", disabled: true },
          { title: "LEAD",  
            attachments: [
              { title     : 'LEAD feldolgozása 1',
                type      : 'video/mp4',
                file_path : 'assets/media/video/odry_kriszti_vizilabda.mp4',
                isPortrait: true,
              },
              { title     : 'LEAD feldolgozása 2',
                type      : 'video/mp4',
                file_path : 'assets/media/video/imre_adam.mp4',
                isPortrait: true,
              }
            ],
            tasks: [
              { title       :  'Feladat',
                type        :  'input-text',
                description :  `Foglalj össze három olyan tanulságot a videóból, 
                                amelyek segítenek abban, hogy egy új leadből 
                                magasabb eséllyel legyen sikeres kapcsolatfelvétel vagy későbbi ügyfél.`,
                is_required : true,
                min_length  : 200
              }
            ]
          },
          { title: "Karriertervezés", disabled: true },
        ]
      },
      { title: "Exit",
        labelKey: "exit", 
        icon: this.icon.faDoorOpen,
        separatorBefore: true,
        callback: () => { 
          this.modal.confirm('exit_confirm', { 
            onYes: () => this.nav.goBack() 
          }) 
        }
      }
    ];
    return courses;
  }
}
