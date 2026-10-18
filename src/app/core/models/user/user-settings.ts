// Mirrors the API's Users DTOs.
import { AppLanguage } from '../../constants/language.constants';
import { ProfilePicture } from '../../constants/profile.constants';
import { CurrencyCode, DateFormat } from '../../constants/settings.constants';
import { OverviewWidgetVisibility } from '../../services/overview-preferences-service';
import { AppTheme } from '../../services/theme-service';

/** Everything the user can set in Settings. */
export interface UserSettings {
  theme: AppTheme;
  language: AppLanguage;
  dateFormat: DateFormat;
  currency: CurrencyCode;
  showDecimals: boolean;
  autoTimeZone: boolean;
  /** IANA id, e.g. "Europe/Madrid". */
  timeZone: string;
  profilePicture: ProfilePicture;
  overviewWidgets: OverviewWidgetVisibility;
}

/** The signed-in user. */
export interface CurrentUser {
  id: string;
  userName: string;
  displayName: string | null;
  name: string;
  createdAtUtc: string;
}

export interface UpdateUserRequest {
  /** Null or empty clears it. */
  displayName: string | null;
}
