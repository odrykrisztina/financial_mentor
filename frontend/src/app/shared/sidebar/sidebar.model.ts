import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export type SidebarPosition = 'left' | 'right';
export type SidebarMode     = 'fixed' | 'overlay';

type GenericCallback = (...args: any[]) => void | any;
type Attacment = {
  title         : string;
  type          : string;
  file_path?    : string;
  url?          : string;
  isPortrait?   : boolean;
}
type Task = {
  title         : string;
  type          : string;
  description?  : string;
  is_required?  : boolean;
  min_length?   : number | null;
}

export interface SidebarItem {
  id?               : string;
  title             : string;
  labelKey?         : string;
  subTitle?         : string;
  subLabelKey?      : string;
  icon?             : IconDefinition;
  emoji?            : string;
  img?              : string;
  attachments?      : Attacment[];
  tasks?            : Task[];
  disabled?         : boolean;
  visible?          : boolean | (() => boolean);
  separatorBefore?  : boolean;
  isRouteOutlet?    : boolean;
  isReset?          : boolean;
  callback?         : GenericCallback;
  routeNavigate?    : any;
  children?         : SidebarItem[];
}
